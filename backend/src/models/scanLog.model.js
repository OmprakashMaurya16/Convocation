const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    scanType: {
      type: String,
      enum: ["ENTRY", "SEATING", "GOWN", "RETURN", "CANTEEN"],
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "REJECTED"],
      required: true,
    },

    message: String,

    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ScanLog = mongoose.model("ScanLog", scanLogSchema);

module.exports = ScanLog;
