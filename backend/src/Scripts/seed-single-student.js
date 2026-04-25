const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const mongoose = require("mongoose");
const crypto = require("crypto");
const connectDB = require("../config/db.js");

// Import models
const Student = require("../models/student.model.js");

const generateQRToken = (rollno) => {
  return crypto
    .createHash("sha256")
    .update(`${rollno}-${Date.now()}-${Math.random()}`)
    .digest("hex");
};

const seedSingleStudent = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("✓ Connected to database");

    // Delete this specific student if exists
    await Student.deleteOne({ studentId: "23101A0001" });
    console.log("✓ Cleared previous student data");

    // Create single test student
    const student = new Student({
      name: "Omprakash Maurya",
      studentId: "23101A0033",
      department: "INFT",
      phone: "",
      email: "",
      company: "",
      qrToken: generateQRToken("23101A0001"),
      state: "REGISTERED",
    });

    await student.save();
    console.log("✓ Single test student created");

    console.log("\n========== TEST STUDENT ==========");
    console.log(`Student ID: ${student.studentId}`);
    console.log(`Name: ${student.name}`);
    console.log(`Department: ${student.department}`);
    console.log(`QR Token: ${student.qrToken}`);
    console.log("==================================\n");

    console.log("Ready for testing!");
    console.log("Mobile: 9000000000");
    console.log("Company: TCS\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

// Run the seed
seedSingleStudent();
