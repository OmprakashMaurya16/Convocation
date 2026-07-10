const Student = require("../models/student.model.js");
const { emitToAdmins, emitToStudent } = require("../socket.js");
const statsCache = require("../utils/statsCache.js");
const {
  getActiveEventStartAt,
  buildActiveEventStudentFilter,
} = require("../utils/eventSession.js");

const getStudentByQR = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);
    const displayFilter = { ...activeFilter, isActive: true };

    console.log(
      `[getStudentByQR] Fetching student: ${qrToken}, displayFilter:`,
      displayFilter,
    );


    let student = await Student.findOne({ ...displayFilter, qrToken });

    if (!student) {
      student = await Student.findOne({
        ...displayFilter,
        studentId: new RegExp(`^${qrToken}$`, "i"),
      });
    }

    if (!student) {
      console.warn(`[getStudentByQR] ️ Student not found: ${qrToken}`);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log(`[getStudentByQR]  Found student:`, {
      studentId: student.studentId,
      state: student.state,
      seat: student.seat,
      sessionKey: student.event?.sessionKey,
    });

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
    console.error("getStudentByQR Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};


const updateStudentProfile = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { phone, company } = req.body;

    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);
    const displayFilter = { ...activeFilter, isActive: true };


    let student = await Student.findOne({ ...displayFilter, qrToken });
    if (!student) {
      student = await Student.findOne({
        ...displayFilter,
        studentId: new RegExp(`^${qrToken}$`, "i"),
      });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }


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
    console.error("updateStudentProfile Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};


const eventLogin = async (req, res) => {
  try {
    const { qrToken } = req.params;
    const { name, department, phone, company } = req.body || {};

    const activeSince = await getActiveEventStartAt();
    const activeFilter = buildActiveEventStudentFilter(activeSince);
    const activeSessionKey = (
      activeSince instanceof Date ? activeSince : new Date(0)
    ).toISOString();

    const trimmedName = String(name || "").trim();
    const trimmedDepartment = String(department || "").trim();
    const trimmedPhone = String(phone || "").trim();
    const trimmedCompany = String(company || "").trim();

    if (!qrToken || !String(qrToken).trim()) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (!trimmedPhone || !trimmedCompany) {
      return res.status(400).json({
        message: "Student ID, mobile number, and company are required",
      });
    }


    const phoneDigits = trimmedPhone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return res.status(400).json({
        message: "Mobile number must be exactly 10 digits",
      });
    }


    let student = await Student.findOne({ qrToken });
    if (!student) {
      student = await Student.findOne({
        studentId: new RegExp(`^${qrToken}$`, "i"),
      });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }


    if (student.isActive === false) {
      return res.status(403).json({
        message:
          "Your account has been deactivated. Please contact the administration office.",
      });
    }


    if (trimmedName && trimmedDepartment) {
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
    }

    const now = new Date();
    const currentSessionKey = student.event?.sessionKey;
    const isValidActiveEvent =
      activeSessionKey && activeSessionKey !== new Date(0).toISOString();

    console.log(`[eventLogin] Student: ${student.studentId}`);
    console.log(`[eventLogin] currentSessionKey: ${currentSessionKey}`);
    console.log(`[eventLogin] activeSessionKey: ${activeSessionKey}`);
    console.log(`[eventLogin] isValidActiveEvent: ${isValidActiveEvent}`);






    const hasNoSessionKeyYet = !currentSessionKey;
    const isTransitioningToNewEvent =
      currentSessionKey && currentSessionKey !== activeSessionKey;

    console.log(`[eventLogin] hasNoSessionKeyYet: ${hasNoSessionKeyYet}`);
    console.log(
      `[eventLogin] isTransitioningToNewEvent: ${isTransitioningToNewEvent}`,
    );

    if (hasNoSessionKeyYet) {

      console.log(`[eventLogin] Case 1: FIRST LOGIN - initializing`);
      student.state = "REGISTERED";
      student.isActive = true;
      student.seat = null;
      student.gown = {
        ...(student.gown || {}),
        issued: false,
        returned: false,
      };
      student.canteenToken = { ...(student.canteenToken || {}), issued: false };
      student.timestamps = {
        checkedInAt: null,
        seatedAt: null,
        gownIssuedAt: null,
        returnedAt: null,
        canteenTokenIssuedAt: null,
      };


      student.event = {
        sessionKey: activeSessionKey, // ← ALWAYS SET, even if epoch
        registeredAt: now,
      };
    } else if (isTransitioningToNewEvent) {

      console.log(`[eventLogin] Case 2: NEW EVENT - resetting state`);
      student.state = "REGISTERED";
      student.isActive = true;
      student.seat = null;
      student.gown = {
        ...(student.gown || {}),
        issued: false,
        returned: false,
      };
      student.canteenToken = { ...(student.canteenToken || {}), issued: false };
      student.timestamps = {
        checkedInAt: null,
        seatedAt: null,
        gownIssuedAt: null,
        returnedAt: null,
        canteenTokenIssuedAt: null,
      };


      student.event = {
        sessionKey: activeSessionKey, // ← ALWAYS SET, even if epoch
        registeredAt: now,
      };
    } else {


      console.log(`[eventLogin] Case 3: SAME SESSION - preserving state`);
      student.isActive = true;
      student.event = {
        sessionKey: activeSessionKey, // ← ALWAYS SET to ensure consistency
        registeredAt: student.event?.registeredAt || now, // Keep existing registeredAt
      };
    }

    console.log(`[eventLogin] Updated event object:`, {
      sessionKey: student.event.sessionKey,
      registeredAt: student.event.registeredAt,
      state: student.state,
      seat: student.seat,
    });

    student.phone = trimmedPhone;
    student.company = trimmedCompany;


    student.markModified("event");


    try {
      await student.save();
      console.log(
        `[eventLogin]  Saved student to DB - sessionKey: ${student.event?.sessionKey}, state: ${student.state}`,
      );
    } catch (saveError) {
      console.error(
        `[eventLogin]  FAILED TO SAVE student: ${student.studentId}`,
        saveError,
      );
      return res.status(500).json({
        success: false,
        message: "Failed to save session to database",
        error: saveError.message,
      });
    }


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

    const displayFilter = { ...activeFilter, isActive: true };

    console.log(`[eventLogin] Query Debug:`, {
      activeFilter: JSON.stringify(activeFilter),
      displayFilter: JSON.stringify(displayFilter),
      activeSessionKey,
      activeSince,
    });

    const [
      total,
      checkedIn,
      seatAllocated,
      gownIssued,
      completed,
      canteenTokenIssued,
    ] = await Promise.all([
      Student.countDocuments(displayFilter),
      Student.countDocuments({
        ...displayFilter,
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
        ...displayFilter,
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
        ...displayFilter,
        state: {
          $in: ["GOWN_ISSUED", "COMPLETED", "CANTEEN_TOKEN_ISSUED"],
        },
      }),
      Student.countDocuments({
        ...displayFilter,
        state: { $in: ["COMPLETED", "CANTEEN_TOKEN_ISSUED"] },
      }),
      Student.countDocuments({
        ...displayFilter,
        state: "CANTEEN_TOKEN_ISSUED",
      }),
    ]);


    statsCache.invalidate("stats_");

    console.log(`[eventLogin] Stats Counts:`, {
      total,
      checkedIn,
      seatAllocated,
      gownIssued,
      completed,
      canteenTokenIssued,
    });


    const verifySaved = await Student.findOne({
      qrToken: student.qrToken,
    }).select("isActive event.sessionKey state");
    console.log(`[eventLogin] Student Verification:`, {
      studentId: student.studentId,
      isActive: verifySaved?.isActive,
      sessionKey: verifySaved?.event?.sessionKey,
      state: verifySaved?.state,
    });

    emitToAdmins("stats:updated", {
      total,
      checkedIn,
      seatAllocated,
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
    console.error("eventLogin Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = {
  getStudentByQR,
  updateStudentProfile,
  eventLogin,
};
