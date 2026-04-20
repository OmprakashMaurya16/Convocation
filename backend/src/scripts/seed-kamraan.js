/**
 * SEED KAMRAAN MULANI & GENERATE QR CODE
 */

const mongoose = require("mongoose");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Student = require("../models/student.model");

async function createStudentAndQR() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Student data
    const studentData = {
      studentId: "23101A0028",
      qrToken: "23101A0028",
      name: "Kamraan Mulani",
      email: "kamraan.mulani@vit.edu.in",
      phone: "9999999999",
      department: "CSE",
      state: "REGISTERED",
      timestamps: {},
      gown: { issued: false, returned: false },
    };

    // Create or update student
    let student = await Student.findOne({ qrToken: studentData.qrToken });

    if (student) {
      console.log("✅ Student already exists in database");
      console.log(`   ID: ${student.studentId}`);
      console.log(`   Name: ${student.name}`);
      console.log(`   Email: ${student.email}\n`);
    } else {
      student = await Student.create(studentData);
      console.log("✅ Student created successfully!");
      console.log(`   ID: ${student.studentId}`);
      console.log(`   Name: ${student.name}`);
      console.log(`   Email: ${student.email}\n`);
    }

    // Generate QR code
    console.log("🔄 Generating QR code...\n");

    const qrDirectory = path.join(__dirname, "../../frontend/public/qr-codes");

    // Ensure directory exists
    if (!fs.existsSync(qrDirectory)) {
      fs.mkdirSync(qrDirectory, { recursive: true });
      console.log(`✅ Created QR directory: ${qrDirectory}\n`);
    }

    // Generate QR code as image file
    const qrFilePath = path.join(qrDirectory, `${studentData.qrToken}.png`);

    await QRCode.toFile(qrFilePath, studentData.qrToken, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Also generate as base64 data URL
    const qrBase64 = await QRCode.toDataURL(studentData.qrToken, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
    });

    console.log("════════════════════════════════════════════════════════════════");
    console.log("✅ QR CODE GENERATED SUCCESSFULLY!");
    console.log("════════════════════════════════════════════════════════════════\n");

    console.log("📋 STUDENT DETAILS:");
    console.log(`   Name: ${student.name}`);
    console.log(`   Student ID: ${student.studentId}`);
    console.log(`   QR Token: ${student.qrToken}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Department: ${student.department}`);
    console.log(`   State: ${student.state}\n`);

    console.log("📁 QR CODE SAVED TO:");
    console.log(`   ${qrFilePath}\n`);

    console.log("🌐 YOU CAN NOW:");
    console.log("   1. Open in browser: http://localhost:5173");
    console.log("   2. Select 'Staff' role");
    console.log("   3. Login with any staff credentials");
    console.log("   4. Enter QR Token: 23101A0028");
    console.log("   5. Or use QR code at: /qr-codes/23101A0028.png\n");

    console.log("🖼️  QR CODE PREVIEW (use this to scan):");
    console.log("   Open: " + qrFilePath);
    console.log(`   Or visit: http://localhost:5173/qr-codes/23101A0028.png\n`);

    // Save base64 to a separate file for easy access
    const qrDataFile = path.join(qrDirectory, `${studentData.qrToken}-base64.txt`);
    fs.writeFileSync(qrDataFile, qrBase64);

    console.log("════════════════════════════════════════════════════════════════");
    console.log("✅ ALL DONE! Ready for testing.");
    console.log("════════════════════════════════════════════════════════════════\n");

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createStudentAndQR();
