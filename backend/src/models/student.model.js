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

    convocationYear: {
      type: String,
      index: true,
      default: null,
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
        "SEAT_ALLOCATED",
        "GOWN_ISSUED",
        "COMPLETED",
        "CANTEEN_TOKEN_ISSUED",
      ],
      default: "REGISTERED",
      index: true,
    },

    seat: {
      section: {
        type: String,
        default: null,
      },
      number: {
        type: String,
        default: null,
      },
    },

    canteenToken: {
      issued: {
        type: Boolean,
        default: false,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    event: {
      sessionKey: {
        type: String,
        index: true,
        default: null,
      },
      registeredAt: {
        type: Date,
        index: true,
        default: null,
      },
    },

    timestamps: {
      checkedInAt: {
        type: Date,
        default: null,
      },
      seatedAt: {
        type: Date,
        default: null,
      },
      gownIssuedAt: {
        type: Date,
        default: null,
      },
      returnedAt: {
        type: Date,
        default: null,
      },
      canteenTokenIssuedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);


studentSchema.pre("save", async function () {

  if (!this.event) {
    this.event = {
      sessionKey: null,
      registeredAt: null,
    };
  }


  if (typeof this.event === "object") {
    if (!("sessionKey" in this.event)) {
      this.event.sessionKey = null;
    }
    if (!("registeredAt" in this.event)) {
      this.event.registeredAt = null;
    }
  }


  if (!this.seat) {
    this.seat = {
      section: null,
      number: null,
    };
  }


  if (!this.timestamps) {
    this.timestamps = {
      checkedInAt: null,
      seatedAt: null,
      gownIssuedAt: null,
      returnedAt: null,
      canteenTokenIssuedAt: null,
    };
  }

  console.log(
    `[Student.pre-save] ${this.studentId} - event:`,
    this.event,
    "seat:",
    this.seat,
  );
});



studentSchema.index(
  { "event.sessionKey": 1, "seat.section": 1, "seat.number": 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      "seat.section": { $exists: true },
      "seat.number": { $exists: true },
    },
  },
);



studentSchema.index(
  { "event.sessionKey": 1, "event.registeredAt": 1 },
  { sparse: true },
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
