const Student = require("../models/student.model.js");

const getStudentByQR = async (req, res) => {
  try {
    const { qrToken } = req.params;

    // Try to find by qrToken first, then by studentId
    let student = await Student.findOne({ qrToken });

    if (!student) {
      student = await Student.findOne({ studentId: qrToken });
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

    // Find student by qrToken or studentId
    let student = await Student.findOne({ qrToken });
    if (!student) {
      student = await Student.findOne({ studentId: qrToken });
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

module.exports = {
  getStudentByQR,
  updateStudentProfile,
};
