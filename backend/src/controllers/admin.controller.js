const Student = require("../models/student.model.js");
const ScanLog = require("../models/scanLog.model.js");

const SCAN_TYPE_LOCATION = {
  ENTRY: "Entry Gate",
  SEATING: "Seating Station",
  GOWN: "Gown Counter",
  RETURN: "Return Counter",
};

const getStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();

    const checkedIn = await Student.countDocuments({ state: "CHECKED_IN" });
    const seated = await Student.countDocuments({ state: "SEATED" });
    const gownIssued = await Student.countDocuments({ state: "GOWN_ISSUED" });
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

module.exports = {
  getStats,
  getRecentScans,
  getCandidates,
  getDepartmentStats,
};
