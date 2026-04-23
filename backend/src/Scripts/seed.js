const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const connectDB = require("../config/db.js");

// Import models
const Staff = require("../models/staff.model.js");
const Student = require("../models/student.model.js");

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("✓ Connected to database");

    // Clear existing data
    await Staff.deleteMany({});
    await Student.deleteMany({});
    console.log("✓ Cleared existing data");

    // ========== ADMIN USER ==========
    const adminStaff = new Staff({
      name: "Admin",
      email: "vidyalankar.admin@convocation.com",
      password: "Admin@Vit",
      role: "ADMIN",
      active: true,
    });
    await adminStaff.save();
    console.log("✓ Admin created");

    // ========== STAFF USERS ==========
    const staffUsers = [
      {
        name: "Entry Staff",
        email: "entry@convocation.com",
        password: "Entry@Vit",
        role: "ENTRY",
      },
      {
        name: "Gown Staff",
        email: "gown@convocation.com",
        password: "gown@Vit",
        role: "GOWN",
      },
      {
        name: "Return Staff",
        email: "return@convocation.com",
        password: "return@Vit",
        role: "RETURN",
      },
    ];

    for (const staffData of staffUsers) {
      const staff = new Staff(staffData);
      await staff.save();
      console.log(`✓ Staff created: ${staffData.role} (${staffData.email})`);
    }

    // ========== STUDENTS ==========
    const generateQRToken = (rollno) => {
      return crypto
        .createHash("sha256")
        .update(`${rollno}-${Date.now()}-${Math.random()}`)
        .digest("hex");
    };

    const students = [
      {
        name: "Omprakash Maurya",
        studentId: "23101A0030",
        department: "INFT",
        phone: "8989898989",
        email: "",
        qrToken: generateQRToken("23101A0030"),
        state: "REGISTERED",
      },
      {
        name: "Kamraan Mulani",
        studentId: "23101A0028",
        department: "INFT",
        phone: "8989898989",
        email: "",
        qrToken: generateQRToken("23101A0028"),
        state: "REGISTERED",
      },
      {
        name: "Sherya Gankoar",
        studentId: "23101A0032",
        department: "INFT",
        phone: "8989898989",
        email: "",
        qrToken: generateQRToken("23101A0032"),
        state: "REGISTERED",
      },
      {
        name: "Abhishek Wali",
        studentId: "23101A0042",
        department: "INFT",
        phone: "8989898989",
        email: "",
        qrToken: generateQRToken("23101A0042"),
        state: "REGISTERED",
      },
      {
        name: "Mayank Ekbote",
        studentId: "23101A0001",
        department: "INFT",
        phone: "8989898989",
        email: "",
        qrToken: generateQRToken("23101A0001"),
        state: "REGISTERED",
      },
    ];

    for (const studentData of students) {
      const student = new Student(studentData);
      await student.save();
      console.log(
        `✓ Student created: ${studentData.name} (${studentData.studentId})`,
      );
    }

    console.log("\n========== SEED SUMMARY ==========");
    console.log("✓ 1 Admin account created");
    console.log("✓ 3 Staff accounts created (ENTRY, GOWN, RETURN)");
    console.log("✓ 5  Students created");
    console.log("===================================\n");

    console.log("📋 Credentials:\n");
    console.log("ADMIN:");
    console.log("  Email: vidyalankar.admin@convocation.com");
    console.log("  Password: Admin@Vit\n");

    console.log("STAFF - ENTRY:");
    console.log("  Email: entry@convocation.com");
    console.log("  Password: Entry@Vit\n");

    console.log("STAFF - GOWN:");
    console.log("  Email: gown@convocation.com");
    console.log("  Password: gown@Vit\n");

    console.log("STAFF - RETURN:");
    console.log("  Email: return@convocation.com");
    console.log("  Password: return@Vit\n");

    console.log("STUDENTS:");
    console.log("  1. Omprakash Maurya - Roll No: 23101A0030");
    console.log("  2. Kamraan Mulani - Roll No: 23101A0028\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

// Run the seed
seedDatabase();
