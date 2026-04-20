const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      index: true,
    },

    phone: String,
    email: String,

    qrToken: {
      type: String,
      required: true,
      unique: true,
    },

    state: {
      type: String,
      enum: ["REGISTERED", "CHECKED_IN", "SEATED", "GOWN_ISSUED", "COMPLETED"],
      default: "REGISTERED",
      index: true,
    },

    seat: {
      section: String,
      number: String,
    },

    gown: {
      size: {
        type: String,
        enum: ["S", "M", "L"],
      },
      issued: {
        type: Boolean,
        default: false,
      },
      returned: {
        type: Boolean,
        default: false,
      },
    },

    timestamps: {
      checkedInAt: Date,
      seatedAt: Date,
      gownIssuedAt: Date,
      returnedAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
