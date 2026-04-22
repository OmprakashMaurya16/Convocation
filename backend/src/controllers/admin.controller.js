const Student = require("../models/student.model.js");
const ScanLog = require("../models/scanLog.model.js");
const SeatOverride = require("../models/seatOverride.model.js");

const SCAN_TYPE_LOCATION = {
  ENTRY: "Entry Gate",
  SEATING: "Seating Station",
  GOWN: "Gown Counter",
  RETURN: "Return Counter",
};

const getStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();

    // Cumulative stage counters (monotonic): once a candidate progresses,
    // they are still considered checked-in / seated for ops reporting.
    const checkedIn = await Student.countDocuments({
      state: { $in: ["CHECKED_IN", "SEATED", "GOWN_ISSUED", "COMPLETED"] },
    });
    const seated = await Student.countDocuments({
      state: { $in: ["SEATED", "GOWN_ISSUED", "COMPLETED"] },
    });
    const gownIssued = await Student.countDocuments({
      state: { $in: ["GOWN_ISSUED", "COMPLETED"] },
    });
    const completed = await Student.countDocuments({ state: "COMPLETED" });

    res.json({
      total,
      checkedIn,
      seated,
      gownIssued,
      completed,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getRecentScans = async (req, res) => {
  try {
    const logs = await ScanLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({ path: "studentId", select: "name qrToken studentId" });

    const scans = logs.map((log) => ({
      id: log._id,
      time: new Date(log.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      studentId: log.studentId?.studentId || "N/A",
      name: log.studentId?.name || "Unknown",
      stage: log.scanType,
      status: log.status,
      location: SCAN_TYPE_LOCATION[log.scanType] || "Scanner",
    }));

    res.json({ scans });
  } catch (error) {
    console.error(error.message);
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
    const page = Math.max(1, Number.parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, Number.parseInt(req.query.limit || "10", 10));
    const department = req.query.department || "ALL";
    const stage = req.query.stage || "ALL";

    const filter = {};
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
    // Get all students grouped by department
    const allStudents = await Student.find().select("department state");

    // Define departments in order
    const departments = ["INFT", "CMPN", "EXTC", "EXCS", "BIOMD"];

    // Calculate stats for each department
    const deptStats = departments.map((dept) => {
      const deptStudents = allStudents.filter((s) => s.department === dept);
      const totalExpected = deptStudents.length;
      const presentCount = deptStudents.filter(
        (s) => s.state === "COMPLETED" || s.state === "GOWN_ISSUED",
      ).length;

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

    res.json(deptStats);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const resetSeatAllocations = async (req, res) => {
  try {
    // Next-day reset for the full pipeline:
    // - Clear seat assignments
    // - Return candidates back to REGISTERED so Entry scan works again
    // - Clear stage timestamps
    // - Reset gown issued/returned flags
    const [clearedSeatsResult, resetPipelineResult, clearedOverridesResult] =
      await Promise.all([
        Student.updateMany({}, { $unset: { seat: "" } }),
        Student.updateMany(
          {},
          {
            $set: {
              state: "REGISTERED",
              "timestamps.checkedInAt": null,
              "timestamps.seatedAt": null,
              "timestamps.gownIssuedAt": null,
              "timestamps.returnedAt": null,
              "gown.issued": false,
              "gown.returned": false,
            },
          },
        ),
        SeatOverride.deleteMany({}),
      ]);

    res.json({
      success: true,
      clearedSeats: clearedSeatsResult?.modifiedCount ?? 0,
      resetToRegistered: resetPipelineResult?.modifiedCount ?? 0,
      clearedOverrides: clearedOverridesResult?.deletedCount ?? 0,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getSeatOccupancy = async (req, res) => {
  try {
    const seatedStudents = await Student.find({
      "seat.section": { $exists: true, $ne: null, $ne: "" },
      "seat.number": { $exists: true, $ne: null, $ne: "" },
    }).select("seat name studentId department phone email state");

    const overrides = await SeatOverride.find({}).select("seatId status");

    const occupiedSeatIds = seatedStudents
      .map((student) => {
        const section = String(student.seat?.section || "").trim();
        const number = String(student.seat?.number || "").trim();
        if (!section || !number) return null;
        return `${section}${number}`;
      })
      .filter(Boolean);

    const uniqueOccupied = Array.from(new Set(occupiedSeatIds));

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

    for (const seatId of uniqueOccupied) {
      seatStatusById[String(seatId)] = "occupied";
    }

    const reservedCount = Object.values(seatStatusById).filter(
      (value) => value === "reserved",
    ).length;
    const flaggedCount = Object.values(seatStatusById).filter(
      (value) => value === "manual",
    ).length;

    res.json({
      occupied: uniqueOccupied,
      occupiedCount: uniqueOccupied.length,
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
    const seatedStudents = await Student.find({
      "seat.section": { $exists: true, $ne: null, $ne: "" },
      "seat.number": { $exists: true, $ne: null, $ne: "" },
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

module.exports = {
  getStats,
  getRecentScans,
  getCandidates,
  getDepartmentStats,
  resetSeatAllocations,
  getSeatOccupancy,
  getSeatOverrides,
  setSeatOverride,
  getSeatingReport,
};
