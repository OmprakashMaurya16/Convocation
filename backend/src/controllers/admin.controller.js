const Student = require("../models/student.model.js");
const ScanLog = require("../models/scanLog.model.js");
const SeatOverride = require("../models/seatOverride.model.js");
const DepartmentConfig = require("../models/departmentConfig.model.js");
const statsCache = require("../utils/statsCache.js");
const { ALL_SEAT_IDS } = require("../utils/seatAllocator.js");
const { getIO, emitToAdmins } = require("../socket.js");
const {
  getActiveEventStartAt,
  setActiveEventStartAt,
  buildActiveEventStudentFilter,
  buildActiveEventLogFilter,
  getActiveEventLabel,
  setActiveEventSession,
} = require("../utils/eventSession.js");

const SCAN_TYPE_LOCATION = {
  ENTRY: "Entry Gate",
  GOWN: "Robe Counter",
  RETURN: "Return Counter",
  CANTEEN: "Canteen Token Desk",
};

const getStats = async (req, res) => {
  try {
    const activeSince = await getActiveEventStartAt();
    const sessionLabel = await getActiveEventLabel();
    const activeFilter = buildActiveEventStudentFilter(activeSince);

    const total = await Student.countDocuments(activeFilter);

    // Cumulative stage counters (monotonic): once a candidate progresses,
    // they are still considered checked-in for ops reporting.
    const checkedIn = await Student.countDocuments({
      ...activeFilter,
      state: {
        $in: [
          "CHECKED_IN",
          "SEAT_ALLOCATED",
          "GOWN_ISSUED",
          "COMPLETED",
          "CANTEEN_TOKEN_ISSUED",
        ],
      },
    });
    const seatAllocated = await Student.countDocuments({
      ...activeFilter,
      state: {
        $in: [
          "SEAT_ALLOCATED",
          "GOWN_ISSUED",
          "COMPLETED",
          "CANTEEN_TOKEN_ISSUED",
        ],
      },
    });
    const gownIssued = await Student.countDocuments({
      ...activeFilter,
      state: { $in: ["GOWN_ISSUED", "COMPLETED", "CANTEEN_TOKEN_ISSUED"] },
    });
    const completed = await Student.countDocuments({
      ...activeFilter,
      state: { $in: ["COMPLETED", "CANTEEN_TOKEN_ISSUED"] },
    });
    const canteenTokenIssued = await Student.countDocuments({
      ...activeFilter,
      state: "CANTEEN_TOKEN_ISSUED",
    });

    res.json({
      total,
      checkedIn,
      seatAllocated,
      gownIssued,
      completed,
      canteenTokenIssued,
      session: {
        activeSince,
        label: sessionLabel,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getRecentScans = async (req, res) => {
  try {
    const activeSince = await getActiveEventStartAt();
    const logFilter = buildActiveEventLogFilter(activeSince);

    const logs = await ScanLog.find(logFilter)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "studentId",
        select: "name qrToken studentId department state",
        strictPopulate: false, // Continue even if ref doesn't exist
      });

    // Build scans with fallback handling
    const scans = await Promise.all(
      logs.map(async (log) => {
        let studentName = "Unknown";
        let studentId = "N/A";
        let department = "N/A";

        if (log.studentId) {
          // Populate worked
          studentName = log.studentId.name || "Unknown";
          studentId = log.studentId.studentId || "N/A";
          department = log.studentId.department || "N/A";
        } else if (log.studentId && typeof log.studentId === "object") {
          // Already populated but null
          console.warn("StudentId populated but null for log:", log._id);
        } else {
          // Fallback: try to fetch directly if populate failed
          const student = await Student.findById(log.studentId).select(
            "name studentId department",
          );
          if (student) {
            studentName = student.name || "Unknown";
            studentId = student.studentId || "N/A";
            department = student.department || "N/A";
            console.log("Fallback fetch succeeded for student:", studentId);
          } else {
            console.warn("Student not found for log:", log.studentId);
          }
        }

        return {
          id: log._id,
          time: new Date(log.createdAt).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          studentId,
          name: studentName,
          department,
          stage: log.scanType,
          status: log.status,
          location: SCAN_TYPE_LOCATION[log.scanType] || "Scanner",
        };
      }),
    );

    res.json({ scans });
  } catch (error) {
    console.error("Error in getRecentScans:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const toRelativeTime = (dateValue) => {
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} mins ago`;
  return `${Math.floor(diffMs / hour)} hour${Math.floor(diffMs / hour) > 1 ? "s" : ""} ago`;
};

const getCandidates = async (req, res) => {
  try {
    const activeSince = await getActiveEventStartAt();
    const page = Math.max(1, Number.parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, Number.parseInt(req.query.limit || "10", 10));
    const department = req.query.department || "ALL";
    const stage = req.query.stage || "ALL";

    const filter = buildActiveEventStudentFilter(activeSince);
    if (department !== "ALL") {
      filter.department = department;
    }

    if (stage !== "ALL") {
      filter.state = stage;
    }

    const [total, students, departments] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name qrToken studentId department state seat updatedAt"),
      Student.distinct("department"),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const items = students.map((student) => {
      const initials = (student.name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");

      const seat =
        student.seat?.section && student.seat?.number
          ? `${student.seat.section}-${student.seat.number}`
          : student.seat?.number || "—";

      return {
        id: student.studentId || student.qrToken,
        initials,
        name: student.name,
        department: student.department || "N/A",
        stage: student.state,
        seat,
        time: toRelativeTime(student.updatedAt),
      };
    });

    res.json({
      items,
      page,
      limit,
      total,
      totalPages,
      departments: departments.filter(Boolean).sort(),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getDepartmentStats = async (req, res) => {
  try {
    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);

    const cacheKey = `deptstats_${new Date(activeSince || 0).toISOString()}`;
    const cached = statsCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Define departments in order (UI expects these).
    const departments = ["INFT", "CMPN", "EXTC", "EXCS", "BIOMD", "MMS"];

    const rows = await Student.aggregate([
      { $match: activeFilter },
      {
        $group: {
          _id: { dept: { $ifNull: ["$department", ""] } },
          totalExpected: { $sum: 1 },
          presentCount: {
            $sum: {
              $cond: [{ $ne: ["$state", "REGISTERED"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsByDept = new Map();
    for (const row of rows) {
      const name = String(row?._id?.dept || "").toUpperCase();
      statsByDept.set(name, {
        totalExpected: Number(row?.totalExpected || 0),
        presentCount: Number(row?.presentCount || 0),
      });
    }

    const deptStats = departments.map((dept) => {
      const stat = statsByDept.get(dept) || {
        totalExpected: 0,
        presentCount: 0,
      };
      const totalExpected = stat.totalExpected;
      const presentCount = stat.presentCount;

      return {
        name: dept,
        present:
          totalExpected > 0
            ? Math.round((presentCount / totalExpected) * 100)
            : 0,
        expected: 100,
        totalExpected,
        presentCount,
      };
    });

    statsCache.set(cacheKey, deptStats);
    return res.json(deptStats);
  } catch (error) {
    console.error("[getDepartmentStats] Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const resetSeatAllocations = async (req, res) => {
  try {
    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);

    // Seat-only reset for CURRENT session:
    // - Clears seat assignments for session students
    // NOTE: Overrides are preserved (no deletions).
    const clearedSeatsResult = await Student.updateMany(activeFilter, {
      $unset: { seat: "" },
    });

    if (getIO()) {
      emitToAdmins("seating:refresh", { reason: "reset" });

      const [
        total,
        checkedIn,
        seatAllocated,
        gownIssued,
        completed,
        canteenTokenIssued,
      ] = await Promise.all([
        Student.countDocuments(activeFilter),
        Student.countDocuments({
          ...activeFilter,
          state: {
            $in: [
              "CHECKED_IN",
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

      // Invalidate cache since event reset
      statsCache.invalidate("stats_");
      statsCache.invalidate("deptstats_");

      emitToAdmins("stats:updated", {
        total,
        checkedIn,
        seatAllocated,
        gownIssued,
        completed,
        canteenTokenIssued,
      });
      emitToAdmins("department-stats:refresh", { ok: true });
    }

    res.json({
      success: true,
      clearedSeats: clearedSeatsResult?.modifiedCount ?? 0,
      resetToRegistered: 0,
      clearedOverrides: 0,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getSeatOccupancy = async (req, res) => {
  try {
    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);
    const seatedStudents = await Student.find({
      ...activeFilter,
      $and: [
        { "seat.section": { $exists: true } },
        { "seat.section": { $ne: null } },
        { "seat.section": { $ne: "" } },
        { "seat.number": { $exists: true } },
        { "seat.number": { $ne: null } },
        { "seat.number": { $ne: "" } },
      ],
    }).select("seat name studentId department phone email state");

    const overrides = await SeatOverride.find({}).select("seatId status");

    const confirmedSeatIds = [];
    const pendingSeatIds = [];

    for (const student of seatedStudents) {
      const section = String(student.seat?.section || "").trim();
      const number = String(student.seat?.number || "").trim();
      if (!section || !number) continue;

      const seatId = `${section}${number}`;
      const state = String(student.state || "").trim();

      if (
        [
          "SEAT_ALLOCATED",
          "GOWN_ISSUED",
          "COMPLETED",
          "CANTEEN_TOKEN_ISSUED",
        ].includes(state)
      ) {
        confirmedSeatIds.push(seatId);
      } else {
        pendingSeatIds.push(seatId);
      }
    }

    const uniqueConfirmed = Array.from(new Set(confirmedSeatIds));
    const uniquePending = Array.from(new Set(pendingSeatIds));

    const seatStudentById = {};

    for (const student of seatedStudents) {
      const section = String(student.seat?.section || "").trim();
      const number = String(student.seat?.number || "").trim();
      if (!section || !number) continue;

      const seatId = `${section}${number}`;
      seatStudentById[seatId] = {
        name: student.name,
        studentId: student.studentId,
        department: student.department || null,
        phone: student.phone || null,
        email: student.email || null,
        state: student.state,
      };
    }

    const seatStatusById = {};

    for (const override of overrides) {
      const seatId = String(override.seatId || "").trim();
      const status = String(override.status || "").trim();
      if (!seatId || !status) continue;
      seatStatusById[seatId] = status;
    }

    // Pending assignments should NOT look like occupied (green) until seating is confirmed.
    for (const seatId of uniquePending) {
      const key = String(seatId);
      if (seatStatusById[key] === "manual") continue;
      if (seatStatusById[key] === "reserved") continue;
      seatStatusById[key] = "reserved";
    }

    // Confirmed seating always overrides overrides.
    for (const seatId of uniqueConfirmed) {
      seatStatusById[String(seatId)] = "occupied";
    }

    const reservedCount = Object.values(seatStatusById).filter(
      (value) => value === "reserved",
    ).length;
    const flaggedCount = Object.values(seatStatusById).filter(
      (value) => value === "manual",
    ).length;

    res.json({
      occupied: uniqueConfirmed,
      occupiedCount: uniqueConfirmed.length,
      reservedCount,
      flaggedCount,
      seatStatusById,
      seatStudentById,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getSeatOverrides = async (req, res) => {
  try {
    const overrides = await SeatOverride.find({}).select("seatId status");
    res.json({ overrides });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const setSeatOverride = async (req, res) => {
  try {
    const { seatId, status } = req.body;
    const normalizedSeatId = String(seatId || "").trim();
    const normalizedStatus = String(status || "")
      .trim()
      .toLowerCase();

    if (!normalizedSeatId || !/^([A-Z]+)(\d+)$/.test(normalizedSeatId)) {
      return res.status(400).json({ message: "Invalid seatId" });
    }

    if (!["reserved", "manual", "empty"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (normalizedStatus === "empty") {
      await SeatOverride.deleteOne({ seatId: normalizedSeatId });

      if (getIO()) {
        emitToAdmins("seating:refresh", {
          reason: "override",
          seatId: normalizedSeatId,
        });
      }

      return res.json({
        success: true,
        seatId: normalizedSeatId,
        status: "empty",
      });
    }

    const override = await SeatOverride.findOneAndUpdate(
      { seatId: normalizedSeatId },
      { $set: { status: normalizedStatus } },
      { new: true, upsert: true },
    );

    if (getIO()) {
      emitToAdmins("seating:refresh", {
        reason: "override",
        seatId: override.seatId,
      });
    }

    res.json({
      success: true,
      seatId: override.seatId,
      status: override.status,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getSeatingReport = async (req, res) => {
  try {
    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);
    const seatedStudents = await Student.find({
      ...activeFilter,
      $and: [
        { "seat.section": { $exists: true } },
        { "seat.section": { $ne: null } },
        { "seat.section": { $ne: "" } },
        { "seat.number": { $exists: true } },
        { "seat.number": { $ne: null } },
        { "seat.number": { $ne: "" } },
      ],
    })
      .select("name studentId department seat state")
      .sort({ "seat.section": 1, "seat.number": 1, studentId: 1 });

    const items = seatedStudents.map((student) => {
      const section = String(student.seat?.section || "").trim();
      const number = String(student.seat?.number || "").trim();
      const seat = section && number ? `${section}-${number}` : "";

      return {
        name: student.name,
        rollno: student.studentId,
        department: student.department || "",
        seat,
        state: student.state,
      };
    });

    res.json({
      generatedAt: new Date().toISOString(),
      count: items.length,
      items,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const resetEventProgress = async (req, res) => {
  try {
    // Start a NEW session cutoff. Previous members remain stored in DB,
    // but are excluded from the active event views.
    const requestedLabel = req?.body?.label;
    const { activeSince, label } = await setActiveEventSession({
      activeSince: new Date(),
      label: requestedLabel,
    });
    const activeFilter = buildActiveEventStudentFilter(activeSince);

    if (getIO()) {
      emitToAdmins("seating:refresh", { reason: "event-session-reset" });

      const [
        total,
        checkedIn,
        seatAllocated,
        gownIssued,
        completed,
        canteenTokenIssued,
      ] = await Promise.all([
        Student.countDocuments(activeFilter),
        Student.countDocuments({
          ...activeFilter,
          state: {
            $in: [
              "CHECKED_IN",
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

      // Invalidate cache since event session reset
      statsCache.invalidate("stats_");
      statsCache.invalidate("deptstats_");

      emitToAdmins("stats:updated", {
        total,
        checkedIn,
        seatAllocated,
        gownIssued,
        completed,
        canteenTokenIssued,
      });

      emitToAdmins("department-stats:refresh", { ok: true });
    }

    res.json({ success: true, activeSince, label });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getDepartmentConfigs = async (req, res) => {
  try {
    const configs = await DepartmentConfig.find();
    res.json({ configs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const setDepartmentConfig = async (req, res) => {
  try {
    const { department, startSeat, endSeat } = req.body;

    if (!department || !startSeat || !endSeat) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const upperDept = department.toUpperCase();
    const upperStart = startSeat.toUpperCase();
    const upperEnd = endSeat.toUpperCase();

    const startIndex = ALL_SEAT_IDS.indexOf(upperStart);
    const endIndex = ALL_SEAT_IDS.indexOf(upperEnd);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      return res.status(400).json({ message: "Invalid seat range" });
    }

    const otherConfigs = await DepartmentConfig.find({
      department: { $ne: upperDept },
    });
    for (const config of otherConfigs) {
      const otherStart = ALL_SEAT_IDS.indexOf(config.startSeat);
      const otherEnd = ALL_SEAT_IDS.indexOf(config.endSeat);

      if (otherStart !== -1 && otherEnd !== -1) {
        if (startIndex <= otherEnd && otherStart <= endIndex) {
          return res.status(400).json({
            message: `Seat range overlaps with department ${config.department} (${config.startSeat} to ${config.endSeat})`,
          });
        }
      }
    }

    const config = await DepartmentConfig.findOneAndUpdate(
      { department: upperDept },
      { startSeat: upperStart, endSeat: upperEnd },
      { new: true, upsert: true },
    );

    res.json({ success: true, config });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllSeats = (req, res) => {
  res.json({ seats: ALL_SEAT_IDS });
};

module.exports = {
  getStats,
  getRecentScans,
  getCandidates,
  getDepartmentStats,
  resetSeatAllocations,
  resetEventProgress,
  getSeatOccupancy,
  getSeatOverrides,
  setSeatOverride,
  getSeatingReport,
  getDepartmentConfigs,
  setDepartmentConfig,
  getAllSeats,
};
