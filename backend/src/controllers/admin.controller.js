const Student = require("../models/student.model.js");

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

module.exports = {
  getStats,
};
