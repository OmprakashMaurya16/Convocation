const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const mongoose = require("mongoose");
const connectDB = require("../config/db.js");
const Student = require("../models/student.model.js");

const dummyStudent = {
  name: "Omprakash Maurya",
  studentId: "23101A0030",
  email: "omprakash.maurya@vit.edu.in",
  department: "CSE",
  phone: "9999999999",
  qrToken: "23101A0030",
  state: "REGISTERED",
};

const upsertStudent = async (studentPayload) => {
  const existing = await Student.findOne({
    studentId: studentPayload.studentId,
  });

  if (existing) {
    existing.name = studentPayload.name;
    existing.email = studentPayload.email;
    existing.department = studentPayload.department;
    existing.phone = studentPayload.phone;
    existing.qrToken = studentPayload.qrToken;
    existing.state = studentPayload.state;
    await existing.save();

    return { action: "updated", studentId: existing.studentId };
  }

  await Student.create(studentPayload);
  return { action: "created", studentId: studentPayload.studentId };
};

const seedStudent = async () => {
  try {
    await connectDB();

    const result = await upsertStudent(dummyStudent);
    console.log(`Student ${result.action}: ${result.studentId}`);
  } catch (error) {
    console.error("Failed to seed dummy student:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedStudent();
