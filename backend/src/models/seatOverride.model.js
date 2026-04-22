const mongoose = require("mongoose");

const seatOverrideSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["reserved", "manual"],
      index: true,
    },
  },
  { timestamps: true },
);

const SeatOverride = mongoose.model("SeatOverride", seatOverrideSchema);

module.exports = SeatOverride;
