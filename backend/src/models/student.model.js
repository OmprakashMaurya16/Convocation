const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
    },

    department: {
      type: String,
      index: true,
    },

    phone: String,
    company: String,

    qrToken: {
      type: String,
      required: true,
      unique: true,
    },

    state: {
      type: String,
      enum: [
        "REGISTERED",
        "CHECKED_IN",
        "SEATED",
        "GOWN_ISSUED",
        "COMPLETED",
        "CANTEEN_TOKEN_ISSUED",
      ],
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

    canteenToken: {
      issued: {
        type: Boolean,
        default: false,
      },
    },

    timestamps: {
      checkedInAt: Date,
      seatedAt: Date,
      gownIssuedAt: Date,
      returnedAt: Date,
      canteenTokenIssuedAt: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure a seat can only be assigned to one student at a time.
// Sparse index allows many students with no seat assigned.
studentSchema.index(
  { "seat.section": 1, "seat.number": 1 },
  { unique: true, sparse: true },
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
