require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db.js");
const Student = require("../models/student.model.js");

const cleanup = async () => {
  try {
    await connectDB();

    // Delete all INFT students
    const result = await Student.deleteMany({ department: "INFT" });

    console.log(`✓ Removed ${result.deletedCount} INFT students from database`);

    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err.message);
    process.exit(1);
  }
};

cleanup();
