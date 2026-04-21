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
      department: student.department,
      state: student.state,
      seat: student.seat,
      gown: student.gown,
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getStudentByQR,
};
