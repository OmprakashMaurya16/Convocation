const Student = require("../models/student.model.js");
const ScanLog = require("../models/scanLog.model.js");
const { getIO, emitToStudent } = require("../socket.js");
const { findNextAvailableSeat } = require("../utils/seatAllocator.js");

const SCAN_TYPE_LOCATION = {
  ENTRY: "Entry Gate",
  SEATING: "Seating Station",
  GOWN: "Gown Counter",
  RETURN: "Return Counter",
};

const scanQR = async (req, res) => {
  try {
    const { qrToken, scanType } = req.body;
    const staff = req.user;

    if (!qrToken || !scanType) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const student = await Student.findOne({
      $or: [{ qrToken }, { studentId: qrToken }],
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const isAuthorizedForScanType =
      staff.role === "ADMIN" ||
      staff.role === scanType ||
      (scanType === "ENTRY" && staff.role === "SEATING");

    if (!isAuthorizedForScanType) {
      return res.status(403).json({
        message: "Unauthorized scan type for this role",
      });
    }

    let valid = false;
    let message = "";

    if (scanType === "ENTRY" && student.state === "REGISTERED") {
      const now = new Date();

      const seat = await findNextAvailableSeat();
      if (!seat) {
        message = "No available seats";
      } else {
        student.seat = seat;
        student.state = "SEATED";
        student.timestamps.checkedInAt = now;
        student.timestamps.seatedAt = now;
        valid = true;
        message = `Seat assigned: ${seat.section}${seat.number}`;
      }
    } else if (scanType === "SEATING" && student.state === "CHECKED_IN") {
      const now = new Date();
      student.state = "SEATED";
      student.timestamps.seatedAt = now;

      // Backward-compatible: if someone is still in CHECKED_IN, seat them here.
      if (!student.seat?.section || !student.seat?.number) {
        const seat = await findNextAvailableSeat();
        if (!seat) {
          message = "No available seats";
          valid = false;
        } else {
          student.seat = seat;
          valid = true;
          message = `Seat assigned: ${seat.section}${seat.number}`;
        }
      } else {
        valid = true;
      }
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

    const scanLog = await ScanLog.create({
      studentId: student._id,
      scanType,
      status: valid ? "SUCCESS" : "REJECTED",
      message,
      scannedBy: staff.id,
    });

    const io = getIO();
    if (io) {
      io.emit("scan:created", {
        id: scanLog._id,
        time: new Date(scanLog.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        studentId: student.studentId,
        name: student.name,
        stage: scanType,
        status: valid ? "SUCCESS" : "REJECTED",
        location: SCAN_TYPE_LOCATION[scanType] || "Scanner",
      });

      // Send real-time update to specific student
      if (valid) {
        emitToStudent(student.studentId, "student:updated", {
          studentId: student.studentId,
          qrToken: student.qrToken,
          state: student.state,
          gown: student.gown,
          seat: student.seat,
        });
      }
    }

    const seatId =
      student.seat?.section && student.seat?.number
        ? `${student.seat.section}${student.seat.number}`
        : null;

    res.json({
      success: valid,
      message: valid ? message || "Scan successful" : message,
      state: student.state,
      seat: seatId,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  scanQR,
};
