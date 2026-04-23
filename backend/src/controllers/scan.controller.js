const Student = require("../models/student.model.js");
const ScanLog = require("../models/scanLog.model.js");
const { getIO, emitToAdmins, emitToStudent } = require("../socket.js");
const { findNextAvailableSeat } = require("../utils/seatAllocator.js");

const SCAN_TYPE_LOCATION = {
  ENTRY: "Entry Gate",
  SEATING: "Seating Station",
  GOWN: "Robe Counter",
  RETURN: "Robe Return Counter",
  CANTEEN: "Canteen Token Desk",
};

const scanQR = async (req, res) => {
  try {
    const { qrToken, scanType } = req.body;
    const staff = req.user;

    if (!qrToken || !scanType) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const student = await Student.findOne({
      $or: [{ qrToken }, { studentId: qrToken }],
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const isAuthorizedForScanType =
      staff.role === "ADMIN" ||
      staff.role === scanType ||
      (scanType === "ENTRY" && staff.role === "SEATING");

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

    if (scanType === "ENTRY" && student.state === "REGISTERED") {
      // Entry gate: mark student as checked-in. Seat is assigned at the seating station.
      student.state = "CHECKED_IN";
      student.timestamps.checkedInAt = new Date();
      valid = true;
      message = "Student checked in at entry gate";
    } else if (scanType === "SEATING" && student.state === "CHECKED_IN") {
      // Seating station: assign a seat and mark student as seated.
      const now = new Date();
      const seat = await findNextAvailableSeat();
      if (!seat) {
        message = "No available seats";
        valid = false;
      } else {
        student.seat = seat;
        student.state = "SEATED";
        student.timestamps.seatedAt = now;
        valid = true;
        message = `Seat assigned: ${seat.section}${seat.number}`;
      }
    } else if (scanType === "GOWN" && student.state === "SEATED") {
      student.state = "GOWN_ISSUED";
      student.gown.issued = true;
      student.timestamps.gownIssuedAt = new Date();
      valid = true;
    } else if (scanType === "RETURN" && student.state === "GOWN_ISSUED") {
      student.state = "COMPLETED";
      student.gown.returned = true;
      student.timestamps.returnedAt = new Date();
      valid = true;
    } else if (scanType === "CANTEEN" && student.state === "COMPLETED") {
      student.state = "CANTEEN_TOKEN_ISSUED";
      student.canteenToken.issued = true;
      student.timestamps.canteenTokenIssuedAt = new Date();
      valid = true;
    } else {
      message = "Invalid stage transition";
    }

    if (valid) await student.save();

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
        time: new Date(scanLog.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        studentId: student.studentId,
        name: student.name,
        department: student.department,
        stage: scanType,
        status: valid ? "SUCCESS" : "REJECTED",
        location: SCAN_TYPE_LOCATION[scanType] || "Scanner",
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
        scanType,
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

      if (valid && nextSeatId && nextSeatId !== previousSeatId) {
        emitToAdmins("seating:seatAssigned", {
          seatId: nextSeatId,
          student: {
            name: student.name,
            studentId: student.studentId,
            department: student.department || null,
            state: student.state,
          },
        });
      }

      if (valid) {
        const [
          total,
          checkedIn,
          seated,
          gownIssued,
          completed,
          canteenTokenIssued,
        ] = await Promise.all([
          Student.countDocuments(),
          Student.countDocuments({
            state: {
              $in: [
                "CHECKED_IN",
                "SEATED",
                "GOWN_ISSUED",
                "COMPLETED",
                "CANTEEN_TOKEN_ISSUED",
              ],
            },
          }),
          Student.countDocuments({
            state: {
              $in: [
                "SEATED",
                "GOWN_ISSUED",
                "COMPLETED",
                "CANTEEN_TOKEN_ISSUED",
              ],
            },
          }),
          Student.countDocuments({
            state: {
              $in: ["GOWN_ISSUED", "COMPLETED", "CANTEEN_TOKEN_ISSUED"],
            },
          }),
          Student.countDocuments({
            state: { $in: ["COMPLETED", "CANTEEN_TOKEN_ISSUED"] },
          }),
          Student.countDocuments({ state: "CANTEEN_TOKEN_ISSUED" }),
        ]);

        console.log("[scanQR] Emitting stats:updated -", {
          total,
          checkedIn,
          seated,
          gownIssued,
          completed,
          canteenTokenIssued,
        });

        emitToAdmins("stats:updated", {
          total,
          checkedIn,
          seated,
          gownIssued,
          completed,
          canteenTokenIssued,
        });

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
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  scanQR,
};
