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
        name: "Seating Staff",
        email: "seating@convocation.com",
        password: "Seating@Vit",
        role: "SEATING",
      },
      {
        name: "Gown Staff",
        email: "gown@convocation.com",
        password: "Gown@Vit",
        role: "GOWN",
      },
      {
        name: "Return Staff",
        email: "return@convocation.com",
        password: "Return@Vit",
        role: "RETURN",
      },
      {
        name: "Canteen Staff",
        email: "canteen@convocation.com",
        password: "Canteen@Vit",
        role: "CANTEEN",
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
      // INFT (7)
      {
        name: "Aarav Mehta",
        studentId: "23101A0001",
        department: "INFT",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23101A0001"),
        state: "REGISTERED",
      },
      {
        name: "Vivaan Shah",
        studentId: "23101A0002",
        department: "INFT",
        phone: "",
        company: "",
        qrToken: generateQRToken("23101A0002"),
        state: "REGISTERED",
      },
      {
        name: "Aditya Patil",
        studentId: "23101A0003",
        department: "INFT",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23101A0003"),
        state: "REGISTERED",
      },
      {
        name: "Ishaan Kulkarni",
        studentId: "23101A0004",
        department: "INFT",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23101A0004"),
        state: "REGISTERED",
      },
      {
        name: "Rohan Deshmukh",
        studentId: "23101A0005",
        department: "INFT",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23101A0005"),
        state: "REGISTERED",
      },
      {
        name: "Kunal Joshi",
        studentId: "23101A0006",
        department: "INFT",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23101A0006"),
        state: "REGISTERED",
      },
      {
        name: "Sahil Pawar",
        studentId: "23101A0007",
        department: "INFT",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23101A0007"),
        state: "REGISTERED",
      },

      // CMPN (7)
      {
        name: "Aryan Gupta",
        studentId: "23102A0001",
        department: "CMPN",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23102A0001"),
        state: "REGISTERED",
      },
      {
        name: "Rahul Verma",
        studentId: "23102A0002",
        department: "CMPN",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23102A0002"),
        state: "REGISTERED",
      },
      {
        name: "Ankit Singh",
        studentId: "23102A0003",
        department: "CMPN",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23102A0003"),
        state: "REGISTERED",
      },
      {
        name: "Deepak Yadav",
        studentId: "23102A0004",
        department: "CMPN",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23102A0004"),
        state: "REGISTERED",
      },
      {
        name: "Ritika Sharma",
        studentId: "23102A0005",
        department: "CMPN",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23102A0005"),
        state: "REGISTERED",
      },
      {
        name: "Neha Mishra",
        studentId: "23102A0006",
        department: "CMPN",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23102A0006"),
        state: "REGISTERED",
      },
      {
        name: "Pooja Nair",
        studentId: "23102A0007",
        department: "CMPN",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23102A0007"),
        state: "REGISTERED",
      },

      // EXTC (7)
      {
        name: "Prathamesh More",
        studentId: "23103A0001",
        department: "EXTC",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23103A0001"),
        state: "REGISTERED",
      },
      {
        name: "Omkar Sawant",
        studentId: "23103A0002",
        department: "EXTC",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23103A0002"),
        state: "REGISTERED",
      },
      {
        name: "Tejas Shinde",
        studentId: "23103A0003",
        department: "EXTC",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23103A0003"),
        state: "REGISTERED",
      },
      {
        name: "Swapnil Jadhav",
        studentId: "23103A0004",
        department: "EXTC",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23103A0004"),
        state: "REGISTERED",
      },
      {
        name: "Nikhil Patankar",
        studentId: "23103A0005",
        department: "EXTC",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23103A0005"),
        state: "REGISTERED",
      },
      {
        name: "Akash Gawade",
        studentId: "23103A0006",
        department: "EXTC",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23103A0006"),
        state: "REGISTERED",
      },
      {
        name: "Siddharth Bhosale",
        studentId: "23103A0007",
        department: "EXTC",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23103A0007"),
        state: "REGISTERED",
      },

      // EXCS (7)
      {
        name: "Harsh Agarwal",
        studentId: "23104A0001",
        department: "EXCS",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23104A0001"),
        state: "REGISTERED",
      },
      {
        name: "Yash Jain",
        studentId: "23104A0002",
        department: "EXCS",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23104A0002"),
        state: "REGISTERED",
      },
      {
        name: "Tushar Mittal",
        studentId: "23104A0003",
        department: "EXCS",
        phone: "",
        email: "",
        company: "",
        qrToken: generateQRToken("23104A0003"),
        state: "REGISTERED",
      },
      {
        name: "Karan Bansal",
        studentId: "23104A0004",
        department: "EXCS",
        phone: "9000000034",
        email: "",
        company: "",
        qrToken: generateQRToken("23104A0004"),
        state: "REGISTERED",
      },
      {
        name: "Simran Kaur",
        studentId: "23104A0005",
        department: "EXCS",
        phone: "9000000035",
        email: "",
        company: "",
        qrToken: generateQRToken("23104A0005"),
        state: "REGISTERED",
      },
      {
        name: "Aman Choudhary",
        studentId: "23104A0006",
        department: "EXCS",
        phone: "9000000036",
        email: "",
        company: "",
        qrToken: generateQRToken("23104A0006"),
        state: "REGISTERED",
      },
      {
        name: "Gaurav Saxena",
        studentId: "23104A0007",
        department: "EXCS",
        phone: "9000000037",
        email: "",
        company: "",
        qrToken: generateQRToken("23104A0007"),
        state: "REGISTERED",
      },

      // BIOMD (7)
      {
        name: "Ananya Iyer",
        studentId: "23105A0001",
        department: "BIOMD",
        phone: "9000000041",
        email: "",
        company: "",
        qrToken: generateQRToken("23105A0001"),
        state: "REGISTERED",
      },
      {
        name: "Divya Menon",
        studentId: "23105A0002",
        department: "BIOMD",
        phone: "9000000042",
        email: "",
        company: "",
        qrToken: generateQRToken("23105A0002"),
        state: "REGISTERED",
      },
      {
        name: "Keerthana Nair",
        studentId: "23105A0003",
        department: "BIOMD",
        phone: "9000000043",
        email: "",
        company: "",
        qrToken: generateQRToken("23105A0003"),
        state: "REGISTERED",
      },
      {
        name: "Rahul Pillai",
        studentId: "23105A0004",
        department: "BIOMD",
        phone: "9000000044",
        email: "",
        company: "",
        qrToken: generateQRToken("23105A0004"),
        state: "REGISTERED",
      },
      {
        name: "Arjun Krishnan",
        studentId: "23105A0005",
        department: "BIOMD",
        phone: "9000000045",
        email: "",
        company: "",
        qrToken: generateQRToken("23105A0005"),
        state: "REGISTERED",
      },
      {
        name: "Meera Nambiar",
        studentId: "23105A0006",
        department: "BIOMD",
        phone: "9000000046",
        email: "",
        company: "",
        qrToken: generateQRToken("23105A0006"),
        state: "REGISTERED",
      },
      {
        name: "Sanjay Varma",
        studentId: "23105A0007",
        department: "BIOMD",
        phone: "9000000047",
        email: "",
        company: "",
        qrToken: generateQRToken("23105A0007"),
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
    console.log(
      "✓ 5 Staff accounts created (ENTRY, SEATING, GOWN, RETURN, CANTEEN)",
    );
    console.log(`✓ ${students.length} Students created`);
    console.log("===================================\n");

    console.log("📋 Credentials:\n");
    console.log("ADMIN:");
    console.log("  Email: vidyalankar.admin@convocation.com");
    console.log("  Password: Admin@Vit\n");

    console.log("STAFF - ENTRY (Auditorium Gate):");
    console.log("  Email: entry@convocation.com");
    console.log("  Password: Entry@Vit\n");

    console.log("STAFF - SEATING (Seating Station):");
    console.log("  Email: seating@convocation.com");
    console.log("  Password: Seating@Vit\n");

    console.log("STAFF - GOWN (Robe Counter):");
    console.log("  Email: gown@convocation.com");
    console.log("  Password: Gown@Vit\n");

    console.log("STAFF - RETURN (Return Counter):");
    console.log("  Email: return@convocation.com");
    console.log("  Password: return@Vit\n");

    console.log("STAFF - CANTEEN (Canteen Token Desk):");
    console.log("  Email: canteen@convocation.com");
    console.log("  Password: Canteen@Vit\n");

    console.log("STUDENTS (login with Roll No.):");
    console.log(
      "  Fill Mobile + Company at login — saved to DB automatically\n",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

// Run the seed
seedDatabase();
