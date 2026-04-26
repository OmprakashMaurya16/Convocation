require("dotenv").config();
const crypto = require("crypto");

const connectDB = require("../config/db.js");
const Student = require("../models/student.model.js");
const { getActiveEventStartAt } = require("../utils/eventSession.js");

const generateQRToken = (id) =>
  crypto
    .createHash("sha256")
    .update(`${id}-${Date.now()}-${Math.random()}`)
    .digest("hex");

const seedOneStudent = async () => {
  try {
    await connectDB();
    console.log("✓ Connected to database");

    // Get current active event session
    const activeSince = await getActiveEventStartAt();
    const sessionKey = (
      activeSince instanceof Date ? activeSince : new Date(0)
    ).toISOString();

    console.log(`✓ Active event session: ${sessionKey}`);

    // Create student registered for current active event (appears on dashboard immediately)
    const student = new Student({
      name: "Omprakash Maurya",
      studentId: "23101A0030",
      department: "INFT",
      phone: "",
      email: "",
      company: "",
      qrToken: generateQRToken("23101A9999"),
      state: "REGISTERED",
      isActive: true,
      event: {
        sessionKey: sessionKey,
        registeredAt: new Date(),
      },
    });

    student.markModified("event");
    await student.save();

    console.log("\n========== NEW STUDENT REGISTERED ==========");
    console.log(`✓ Name: ${student.name}`);
    console.log(`✓ Student ID: ${student.studentId}`);
    console.log(`✓ Department: ${student.department}`);
    console.log(`✓ Session: ${sessionKey}`);
    console.log(`✓ State: ${student.state}`);
    console.log("✓ Status on Dashboard: VISIBLE (no login required)");
    console.log("===========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seedOneStudent();
