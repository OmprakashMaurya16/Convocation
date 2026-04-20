const Student = require("../models/student.model.js");
const ScanLog = require("../models/scanLog.model.js");

const scanQR = async (req, res) => {
  try {
    const { qrToken, scanType } = req.body;
    const staff = req.user;

    if (!qrToken || !scanType) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const student = await Student.findOne({ qrToken });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (staff.role !== scanType && staff.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized scan type for this role",
      });
    }

    let valid = false;
    let message = "";

    if (scanType === "ENTRY" && student.state === "REGISTERED") {
      student.state = "CHECKED_IN";
      student.timestamps.checkedInAt = new Date();
      valid = true;
    } else if (scanType === "SEATING" && student.state === "CHECKED_IN") {
      student.state = "SEATED";
      student.timestamps.seatedAt = new Date();
      valid = true;
    } else if (scanType === "GOWN" && student.state === "SEATED") {
      student.state = "GOWN_ISSUED";
      student.gown.issued = true;
      student.timestamps.gownIssuedAt = new Date();
      valid = true;
    } else if (scanType === "RETURN" && student.state === "GOWN_ISSUED") {
      student.state = "COMPLETED";
      student.gown.returned = true;
      student.timestamps.returnedAt = new Date();
      valid = true;
    } else {
      message = "Invalid stage transition";
    }

    if (valid) await student.save();

    await ScanLog.create({
      studentId: student._id,
      scanType,
      status: valid ? "SUCCESS" : "REJECTED",
      message,
      scannedBy: staff.id,
    });

    res.json({
      success: valid,
      message: valid ? "Scan successful" : message,
      state: student.state,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  scanQR,
};
