require("dotenv").config();
const crypto = require("crypto");

const connectDB = require("../config/db.js");
const Student = require("../models/student.model.js");

const generateQRToken = (id) =>
  crypto
    .createHash("sha256")
    .update(`${id}-${Date.now()}-${Math.random()}`)
    .digest("hex");

const seedOneStudent = async () => {
  try {
    await connectDB();

    const student = await Student.create({
      name: "Omprakash Maurya",
      studentId: "23101A0030",
      department: "INFT",
      phone: "",
      email: "",
      company: "",
      qrToken: generateQRToken("23101A9999"),
      state: "REGISTERED",
    });

    console.log(student._id);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedOneStudent();
