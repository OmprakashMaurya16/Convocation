const mongoose = require("mongoose");

const departmentConfigSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    startSeat: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    endSeat: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true }
);

const DepartmentConfig = mongoose.model("DepartmentConfig", departmentConfigSchema);

module.exports = DepartmentConfig;
