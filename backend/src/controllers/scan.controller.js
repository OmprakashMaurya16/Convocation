const Student = require("../models/student.model.js");
const ScanLog = require("../models/scanLog.model.js");
const { getIO, emitToAdmins, emitToStudent } = require("../socket.js");
const {
  findNextAvailableSeat,
  invalidateSeatAllocatorCache,
} = require("../utils/seatAllocator.js");
const statsCache = require("../utils/statsCache.js");
const {
  getActiveEventStartAt,
  buildActiveEventStudentFilter,
} = require("../utils/eventSession.js");

const SCAN_TYPE_LOCATION = {
  ENTRY: "Entry Gate",
  GOWN: "Robe Counter",
  RETURN: "Robe Return Counter",
  CANTEEN: "Canteen Token Desk",
};

const ALLOWED_SCAN_TYPES = ["ENTRY", "GOWN", "RETURN", "CANTEEN"];

const EXPECTED_STATE_FOR_SCAN = {
  ENTRY: "REGISTERED",
  GOWN: "SEAT_ALLOCATED",
  RETURN: "GOWN_ISSUED",
  CANTEEN: "COMPLETED",
};

const isDuplicateSeatError = (error) => {
  if (!error) return false;
  if (error.code === 11000) return true;
  const message = String(error.message || "");
  return (
    message.toLowerCase().includes("duplicate key") && message.includes("seat")
  );
};

const saveSeatAllocationWithRetry = async ({
  student,
  department,
  maxAttempts = 3,
}) => {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      await student.save();
      return { ok: true };
    } catch (error) {
      if (!isDuplicateSeatError(error)) throw error;

      attempt += 1;
      await invalidateSeatAllocatorCache();
      const nextSeat = await findNextAvailableSeat(department, {
        forceRefresh: true,
      });

      if (!nextSeat) {
        return {
          ok: false,
          message: "Seat allocation conflict; no more seats available.",
        };
      }

      student.seat = nextSeat;
    }
  }

  return {
    ok: false,
    message: "Seat allocation conflict; please retry scan.",
  };
};

const scanQR = async (req, res) => {
  try {
    const { qrToken, scanType } = req.body;
    const staff = req.user;

    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);
    const displayFilter = { ...activeFilter, isActive: true };

    if (!qrToken || !scanType) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const normalizedScanType = String(scanType).toUpperCase().trim();
    if (!ALLOWED_SCAN_TYPES.includes(normalizedScanType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid scan type" });
    }

    let student = await Student.findOne({
      ...displayFilter,
      $or: [{ qrToken }, { studentId: qrToken }],
    });

    if (!student) {
      const anySessionStudent = await Student.findOne({
        $or: [{ qrToken }, { studentId: qrToken }],
      }).select("_id");

      if (anySessionStudent) {
        return res.status(400).json({
          success: false,
          message:
            "Student is not registered for the current event session. Please login/register first.",
        });
      }

      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const isAuthorizedForScanType =
      staff.role === "ADMIN" || staff.role === normalizedScanType;

    if (!isAuthorizedForScanType) {
      return res.status(403).json({
        message: "Unauthorized scan type for this role",
      });
    }

    const previousSeatId =
      student?.seat?.section && student?.seat?.number
        ? `${student.seat.section}${student.seat.number}`
        : null;

    let valid = false;
    let message = "";

    console.log(
      `[scanQR] Starting ${normalizedScanType} scan for student ${student.studentId}, current state: ${student.state}, previousSeatId: ${previousSeatId}`,
    );

    if (normalizedScanType === "ENTRY" && student.state === "REGISTERED") {
      // Entry gate: check-in + assign seat.
      const now = new Date();
      const seat = await findNextAvailableSeat(student.department);
      if (!seat) {
        message = "No available seats";
        valid = false;
      } else {
        student.seat = seat;
        student.state = "SEAT_ALLOCATED";
        if (!student.timestamps) student.timestamps = {};
        student.timestamps.checkedInAt = now;
        valid = true;
        message = `Checked-in & seat assigned: ${seat.section}${seat.number}`;
      }
    } else if (
      normalizedScanType === "GOWN" &&
      student.state === "SEAT_ALLOCATED"
    ) {
      // Robe counter: issue gown.
      student.state = "GOWN_ISSUED";
      student.set("gown.issued", true);
      student.set("timestamps.gownIssuedAt", new Date());
      valid = true;
      message = "Robe issued successfully";
    } else if (
      normalizedScanType === "RETURN" &&
      student.state === "GOWN_ISSUED"
    ) {
      student.state = "COMPLETED";
      student.set("gown.returned", true);
      student.set("timestamps.returnedAt", new Date());
      valid = true;
      message = "Robe returned successfully";
    } else if (
      normalizedScanType === "CANTEEN" &&
      student.state === "COMPLETED"
    ) {
      student.state = "CANTEEN_TOKEN_ISSUED";
      student.set("canteenToken.issued", true);
      student.set("timestamps.canteenTokenIssuedAt", new Date());
      valid = true;
      message = "Canteen token issued successfully";
    } else {
      const expectedState = EXPECTED_STATE_FOR_SCAN[normalizedScanType];
      message = expectedState
        ? `Invalid stage. Expected student to be ${expectedState}, but current state is ${student.state}.`
        : "Invalid stage transition";
    }

    if (valid) {
      if (normalizedScanType === "ENTRY") {
        const saveResult = await saveSeatAllocationWithRetry({
          student,
          department: student.department,
        });

        if (!saveResult.ok) {
          valid = false;
          message = saveResult.message || "Failed to allocate seat";
        } else {
          const seat = student.seat;
          if (seat?.section && seat?.number) {
            message = `Checked-in & seat assigned: ${seat.section}${seat.number}`;
          }
        }
      } else {
        await student.save();
      }
    }

    const scanLog = await ScanLog.create({
      studentId: student._id,
      scanType,
      status: valid ? "SUCCESS" : "REJECTED",
      message,
      scannedBy: staff.id,
    });

    const io = getIO();
    if (io) {
      const scanPayload = {
        id: scanLog._id,
        time: new Date(scanLog.createdAt).toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        studentId: student.studentId,
        name: student.name,
        department: student.department,
        stage: normalizedScanType,
        status: valid ? "SUCCESS" : "REJECTED",
        location: SCAN_TYPE_LOCATION[normalizedScanType] || "Scanner",
      };

      console.log("Emitting scan created event:", {
        studentId: student.studentId,
        name: student.name,
        studentObjectId: student._id,
      });

      // Admin-only live feed
      emitToAdmins("scan:created", scanPayload);

      // Student-specific feed (keeps StudentDashboard behavior without leaking global scan feed)
      emitToStudent(student.studentId, "scan:created", {
        scanType: normalizedScanType,
        status: valid ? "SUCCESS" : "REJECTED",
      });

      // Student record update
      if (valid) {
        emitToStudent(student.studentId, "student:updated", {
          studentId: student.studentId,
          qrToken: student.qrToken,
          state: student.state,
          gown: student.gown,
          canteenToken: student.canteenToken,
          seat: student.seat,
        });
      }

      const nextSeatId =
        student.seat?.section && student.seat?.number
          ? `${student.seat.section}${student.seat.number}`
          : null;

      console.log(
        `[scanQR] After ${normalizedScanType} processing - previousSeatId: ${previousSeatId}, nextSeatId: ${nextSeatId}, valid: ${valid}`,
      );

      if (valid && nextSeatId && nextSeatId !== previousSeatId) {
        console.log(
          `[scanQR] Emitting seating:seatAssigned for ${nextSeatId} (NEW seat)`,
        );
        emitToAdmins("seating:seatAssigned", {
          seatId: nextSeatId,
          seatStatus: "reserved",
          student: {
            name: student.name,
            studentId: student.studentId,
            department: student.department || null,
            state: student.state,
          },
        });
      }

      // Confirm seat is occupied (green) for ALL valid scans once seat is allocated
      if (valid && (previousSeatId || nextSeatId)) {
        const seatIdToConfirm = previousSeatId || nextSeatId;
        console.log(
          `[scanQR] Emitting seating:seatConfirmed for ${seatIdToConfirm} - status: occupied (scanType: ${normalizedScanType}, previousSeatId: ${previousSeatId}, nextSeatId: ${nextSeatId})`,
        );

        emitToAdmins("seating:seatConfirmed", {
          seatId: seatIdToConfirm,
          seatStatus: "occupied",
          student: {
            name: student.name,
            studentId: student.studentId,
            department: student.department || null,
            state: student.state,
          },
        });
      }

      if (valid) {
        // Check cache first (5s TTL for performance)
        const cacheKey = `stats_${activeSince}`;
        let cachedStats = statsCache.get(cacheKey);

        if (!cachedStats) {
          // Only query DB if cache miss
          const [total, checkedIn, gownIssued, completed, canteenTokenIssued] =
            await Promise.all([
              Student.countDocuments(activeFilter),
              Student.countDocuments({
                ...activeFilter,
                state: {
                  $in: [
                    "SEAT_ALLOCATED",
                    "GOWN_ISSUED",
                    "COMPLETED",
                    "CANTEEN_TOKEN_ISSUED",
                  ],
                },
              }),
              Student.countDocuments({
                ...activeFilter,
                state: {
                  $in: ["GOWN_ISSUED", "COMPLETED", "CANTEEN_TOKEN_ISSUED"],
                },
              }),
              Student.countDocuments({
                ...activeFilter,
                state: { $in: ["COMPLETED", "CANTEEN_TOKEN_ISSUED"] },
              }),
              Student.countDocuments({
                ...activeFilter,
                state: "CANTEEN_TOKEN_ISSUED",
              }),
            ]);

          cachedStats = {
            total,
            checkedIn,
            gownIssued,
            completed,
            canteenTokenIssued,
          };
          statsCache.set(cacheKey, cachedStats);
        }

        console.log("[scanQR] Emitting stats:updated -", cachedStats);

        emitToAdmins("stats:updated", cachedStats);

        // Department chart depends on "present" counts, so refresh it on any valid scan.
        console.log("[scanQR] Emitting department-stats:refresh for student:", {
          studentId: student.studentId,
          department: student.department,
          state: student.state,
        });
        emitToAdmins("department-stats:refresh", { ok: true });
      }
    }

    const seatId =
      student.seat?.section && student.seat?.number
        ? `${student.seat.section}${student.seat.number}`
        : null;

    res.json({
      success: valid,
      message: valid ? message || "Scan successful" : message,
      state: student.state,
      seat: seatId,
    });
  } catch (error) {
    console.error("Scan Error:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

module.exports = {
  scanQR,
};
