const Student = require("../models/student.model.js");
const { emitToAdmins, emitToStudent } = require("../socket.js");
const {
  getActiveEventStartAt,
  buildActiveEventStudentFilter,
} = require("../utils/eventSession.js");

const getStudentByQR = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);
    const activeSessionKey = (
      activeSince instanceof Date ? activeSince : new Date(0)
    ).toISOString();

    // Try to find by qrToken first, then by studentId
    let student = await Student.findOne({ ...activeFilter, qrToken });

    if (!student) {
      student = await Student.findOne({ ...activeFilter, studentId: qrToken });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      name: student.name,
      studentId: student.studentId,
      department: student.department,
      phone: student.phone || null,
      company: student.company || null,
      state: student.state,
      seat: student.seat,
      gown: student.gown,
      canteenToken: student.canteenToken,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/student/:qrToken/profile
 * Called on student login to save/update mobile and company details.
 */
const updateStudentProfile = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { phone, company } = req.body;

    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);

    // Find student by qrToken or studentId
    let student = await Student.findOne({ ...activeFilter, qrToken });
    if (!student) {
      student = await Student.findOne({ ...activeFilter, studentId: qrToken });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Only update fields that were provided
    if (phone !== undefined && phone !== null) {
      student.phone = String(phone).trim();
    }
    if (company !== undefined && company !== null) {
      student.company = String(company).trim();
    }

    await student.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      phone: student.phone || null,
      company: student.company || null,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/student/:qrToken/event-login
 * During-event student sign-in:
 * - Verifies studentId exists in DB
 * - Confirms name + department match pre-event DB record
 * - Stores phone + company
 */
const eventLogin = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { name, department, phone, company } = req.body || {};

    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);

    const trimmedName = String(name || "").trim();
    const trimmedDepartment = String(department || "").trim();
    const trimmedPhone = String(phone || "").trim();
    const trimmedCompany = String(company || "").trim();

    if (!qrToken || !String(qrToken).trim()) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (
      !trimmedName ||
      !trimmedDepartment ||
      !trimmedPhone ||
      !trimmedCompany
    ) {
      return res.status(400).json({
        message:
          "Student ID, full name, branch/department, mobile number, and company are required",
      });
    }

    // Find student by qrToken or studentId
    let student = await Student.findOne({ qrToken });
    if (!student) {
      student = await Student.findOne({ studentId: qrToken });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const dbName = String(student.name || "").trim();
    const dbDepartment = String(student.department || "").trim();

    if (!dbName || !dbDepartment) {
      return res.status(409).json({
        message:
          "Student pre-event data is incomplete (name/branch missing). Please contact admin.",
      });
    }

    const normalizeName = (value) =>
      String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    const normalizeDepartment = (value) =>
      String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    const matchesName = normalizeName(trimmedName) === normalizeName(dbName);
    const matchesDepartment =
      normalizeDepartment(trimmedDepartment) ===
      normalizeDepartment(dbDepartment);

    if (!matchesName || !matchesDepartment) {
      return res.status(400).json({
        message:
          "Entered name/branch does not match our records. Please check and try again.",
      });
    }

    const now = new Date();
    const currentSessionKey = student.event?.sessionKey;
    const shouldStartNewSessionForStudent =
      currentSessionKey !== activeSessionKey;

    if (shouldStartNewSessionForStudent) {
      student.event = {
        ...(student.event || {}),
        sessionKey: activeSessionKey,
        registeredAt: now,
      };
      student.state = "REGISTERED";
      student.seat = undefined;
      student.gown = {
        ...(student.gown || {}),
        issued: false,
        returned: false,
      };
      student.canteenToken = { ...(student.canteenToken || {}), issued: false };
      student.timestamps = student.timestamps || {};
      student.timestamps.checkedInAt = undefined;
      student.timestamps.seatedAt = undefined;
      student.timestamps.gownIssuedAt = undefined;
      student.timestamps.returnedAt = undefined;
      student.timestamps.canteenTokenIssuedAt = undefined;
    } else {
      student.event = {
        ...(student.event || {}),
        sessionKey: activeSessionKey,
        registeredAt: now,
      };
    }

    student.phone = trimmedPhone;
    student.company = trimmedCompany;
    await student.save();

    // Real-time updates
    emitToStudent(student.studentId, "student:updated", {
      studentId: student.studentId,
      qrToken: student.qrToken,
      name: student.name,
      department: student.department,
      phone: student.phone || null,
      company: student.company || null,
    });

    emitToAdmins("student:profileUpdated", {
      studentId: student.studentId,
      name: student.name,
      department: student.department,
      phone: student.phone || null,
      company: student.company || null,
      updatedAt: student.updatedAt,
    });

    const [
      total,
      checkedIn,
      seated,
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
            "SEATED",
            "GOWN_ISSUED",
            "COMPLETED",
            "CANTEEN_TOKEN_ISSUED",
          ],
        },
      }),
      Student.countDocuments({
        ...activeFilter,
        state: {
          $in: ["SEATED", "GOWN_ISSUED", "COMPLETED", "CANTEEN_TOKEN_ISSUED"],
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

    emitToAdmins("stats:updated", {
      total,
      checkedIn,
      seated,
      gownIssued,
      completed,
      canteenTokenIssued,
    });
    emitToAdmins("department-stats:refresh", { ok: true });

    return res.json({
      name: student.name,
      studentId: student.studentId,
      department: student.department,
      phone: student.phone || null,
      company: student.company || null,
      state: student.state,
      seat: student.seat,
      gown: student.gown,
      canteenToken: student.canteenToken,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getStudentByQR,
  updateStudentProfile,
  eventLogin,
};
