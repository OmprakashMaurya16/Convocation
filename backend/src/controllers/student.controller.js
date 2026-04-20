const Student = require("../models/student.model.js");

const getStudentByQR = async (req, res) => {
  try {
    const { qrToken } = req.params;

    const student = await Student.findOne({ qrToken });

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
