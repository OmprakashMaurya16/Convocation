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

    // Try to find by qrToken first, then by studentId (case-insensitive)
    let student = await Student.findOne({ ...displayFilter, qrToken });

    if (!student) {
      student = await Student.findOne({
        ...displayFilter,
        studentId: new RegExp(`^${qrToken}$`, "i"),
      });
    }

    if (!student) {
      console.warn(`[getStudentByQR] ⚠️ Student not found: ${qrToken}`);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log(`[getStudentByQR] ✅ Found student:`, {
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
    const displayFilter = { ...activeFilter, isActive: true };

    // Find student by qrToken or studentId (case-insensitive)
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
    console.error("updateStudentProfile Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
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

    // Validate phone is exactly 10 digits
    const phoneDigits = trimmedPhone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return res.status(400).json({
        message: "Mobile number must be exactly 10 digits",
      });
    }

    // Find student by qrToken or studentId (case-insensitive for studentId)
    let student = await Student.findOne({ qrToken });
    if (!student) {
      student = await Student.findOne({
        studentId: new RegExp(`^${qrToken}$`, "i"),
      });
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // If name and department are provided, optionally check them, otherwise skip strict validation
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

    // THREE distinct cases:
    // 1. First ever login (no sessionKey) → Initialize
    // 2. Transitioning to NEW event (sessionKey differs) → Reset
    // 3. Re-login to SAME session (sessionKey matches) → Preserve

    const hasNoSessionKeyYet = !currentSessionKey;
    const isTransitioningToNewEvent =
      currentSessionKey && currentSessionKey !== activeSessionKey;

    console.log(`[eventLogin] hasNoSessionKeyYet: ${hasNoSessionKeyYet}`);
    console.log(
      `[eventLogin] isTransitioningToNewEvent: ${isTransitioningToNewEvent}`,
    );

    if (hasNoSessionKeyYet) {
      // Case 1: FIRST EVER LOGIN - Initialize as REGISTERED
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

      // ALWAYS set sessionKey on first login (regardless of event validity)
      student.event = {
        sessionKey: activeSessionKey, // ← ALWAYS SET, even if epoch
        registeredAt: now,
      };
    } else if (isTransitioningToNewEvent) {
      // Case 2: NEW EVENT SESSION - Reset progress
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

      // ALWAYS set sessionKey (regardless of event validity)
      student.event = {
        sessionKey: activeSessionKey, // ← ALWAYS SET, even if epoch
        registeredAt: now,
      };
    } else {
      // Case 3: RE-LOGIN TO SAME SESSION - PRESERVE state completely!
      // Just ensure sessionKey is set (no changes to state/seat/gown/timestamps)
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

    // Mark event object as modified so Mongoose knows to save it
    student.markModified("event");

    // SAVE TO DATABASE
    try {
      await student.save();
      console.log(
        `[eventLogin] ✅ Saved student to DB - sessionKey: ${student.event?.sessionKey}, state: ${student.state}`,
      );
    } catch (saveError) {
      console.error(
        `[eventLogin] ❌ FAILED TO SAVE student: ${student.studentId}`,
        saveError,
      );
      return res.status(500).json({
        success: false,
        message: "Failed to save session to database",
        error: saveError.message,
      });
    }

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

    // Invalidate stats cache since new student added
    statsCache.invalidate("stats_");

    console.log(`[eventLogin] Stats Counts:`, {
      total,
      checkedIn,
      seatAllocated,
      gownIssued,
      completed,
      canteenTokenIssued,
    });

    // Verify student was saved correctly
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
