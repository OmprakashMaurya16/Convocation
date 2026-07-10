require("dotenv").config({ path: "../../.env" }); // Just in case, though usually run from root
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db.js");
const Student = require("../models/student.model.js");

const states = [
  "CHECKED_IN",
  "SEAT_ALLOCATED",
  "GOWN_ISSUED",
  "COMPLETED",
  "CANTEEN_TOKEN_ISSUED",
];

const randomizeAttendance = async () => {
  try {
    await connectDB();
    console.log("✓ Connected to database.");

    // Get all students that are currently REGISTERED
    const students = await Student.find({ state: "REGISTERED" });
    console.log(`Found ${students.length} REGISTERED students.`);

    if (students.length === 0) {
      console.log("No registered students found. Please run the seed script first.");
      process.exit(0);
    }

    let updatedCount = 0;
    for (let student of students) {
      if (Math.random() < 0.6) {
        const randomState = states[Math.floor(Math.random() * states.length)];
        student.state = randomState;
        

        if (!student.timestamps) student.timestamps = {};
        student.timestamps.checkedInAt = new Date();
        
        await student.save();
        updatedCount++;
      }
    }

    console.log(`\n🎉 Successfully marked ${updatedCount} students as attended with random states!`);
    console.log("You can now test the PDF Download Report feature.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

randomizeAttendance();
