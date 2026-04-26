require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");

const connectDB = require("../config/db.js");

const Staff = require("../models/staff.model.js");
const Student = require("../models/student.model.js");
const EventMeta = require("../models/eventMeta.model.js");

const generateQRToken = (id) =>
  crypto
    .createHash("sha256")
    .update(`${id}-${Date.now()}-${Math.random()}`)
    .digest("hex");

const seedDatabase = async () => {
  try {
    await connectDB();

    await Promise.all([
      Staff.deleteMany({}),
      Student.deleteMany({}),
      EventMeta.deleteMany({}),
    ]);

    // Admin
    await Staff.create({
      name: "Admin",
      email: "vidyalankar.admin@convocation.com",
      password: "Admin@Vit",
      role: "ADMIN",
      active: true,
    });

    // Staff
    await Staff.create([
      {
        name: "Entry Staff",
        email: "entry@convocation.com",
        password: "Entry@Vit",
        role: "ENTRY",
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
    ]);

    const baseStudent = (name, studentId, department, phone = "") => ({
      name,
      studentId,
      department,
      phone,
      email: "",
      company: "",
      qrToken: generateQRToken(studentId),
      state: "REGISTERED",
    });

    const students = [
      // INFT
      baseStudent("Aarav Mehta", "23101A0001", "INFT"),
      baseStudent("Vivaan Shah", "23101A0002", "INFT"),
      baseStudent("Aditya Patil", "23101A0003", "INFT"),
      baseStudent("Ishaan Kulkarni", "23101A0004", "INFT"),
      baseStudent("Rohan Deshmukh", "23101A0005", "INFT"),
      baseStudent("Kunal Joshi", "23101A0006", "INFT"),
      baseStudent("Sahil Pawar", "23101A0007", "INFT"),
      baseStudent("Manav Kapoor", "23101A0008", "INFT"),
      baseStudent("Dev Malhotra", "23101A0009", "INFT"),
      baseStudent("Nitin Arora", "23101A0010", "INFT"),

      // CMPN
      baseStudent("Aryan Gupta", "23102A0001", "CMPN"),
      baseStudent("Rahul Verma", "23102A0002", "CMPN"),
      baseStudent("Ankit Singh", "23102A0003", "CMPN"),
      baseStudent("Deepak Yadav", "23102A0004", "CMPN"),
      baseStudent("Ritika Sharma", "23102A0005", "CMPN"),
      baseStudent("Neha Mishra", "23102A0006", "CMPN"),
      baseStudent("Pooja Nair", "23102A0007", "CMPN"),
      baseStudent("Saurabh Jain", "23102A0008", "CMPN"),
      baseStudent("Keshav Meena", "23102A0009", "CMPN"),
      baseStudent("Tarun Saini", "23102A0010", "CMPN"),

      // EXTC
      baseStudent("Prathamesh More", "23103A0001", "EXTC"),
      baseStudent("Omkar Sawant", "23103A0002", "EXTC"),
      baseStudent("Tejas Shinde", "23103A0003", "EXTC"),
      baseStudent("Swapnil Jadhav", "23103A0004", "EXTC"),
      baseStudent("Nikhil Patankar", "23103A0005", "EXTC"),
      baseStudent("Akash Gawade", "23103A0006", "EXTC"),
      baseStudent("Siddharth Bhosale", "23103A0007", "EXTC"),
      baseStudent("Ritesh Patil", "23103A0008", "EXTC"),
      baseStudent("Amol Kale", "23103A0009", "EXTC"),
      baseStudent("Vishal Khot", "23103A0010", "EXTC"),

      // EXCS
      baseStudent("Harsh Agarwal", "23104A0001", "EXCS"),
      baseStudent("Yash Jain", "23104A0002", "EXCS"),
      baseStudent("Tushar Mittal", "23104A0003", "EXCS"),
      baseStudent("Karan Bansal", "23104A0004", "EXCS", "9000000034"),
      baseStudent("Simran Kaur", "23104A0005", "EXCS", "9000000035"),
      baseStudent("Aman Choudhary", "23104A0006", "EXCS", "9000000036"),
      baseStudent("Gaurav Saxena", "23104A0007", "EXCS", "9000000037"),
      baseStudent("Rohit Khanna", "23104A0008", "EXCS"),
      baseStudent("Varun Arora", "23104A0009", "EXCS"),
      baseStudent("Nikhil Batra", "23104A0010", "EXCS"),

      // BIOMD
      baseStudent("Ananya Iyer", "23105A0001", "BIOMD", "9000000041"),
      baseStudent("Divya Menon", "23105A0002", "BIOMD", "9000000042"),
      baseStudent("Keerthana Nair", "23105A0003", "BIOMD", "9000000043"),
      baseStudent("Rahul Pillai", "23105A0004", "BIOMD", "9000000044"),
      baseStudent("Arjun Krishnan", "23105A0005", "BIOMD", "9000000045"),
      baseStudent("Meera Nambiar", "23105A0006", "BIOMD", "9000000046"),
      baseStudent("Sanjay Varma", "23105A0007", "BIOMD", "9000000047"),
      baseStudent("Lakshmi Nair", "23105A0008", "BIOMD"),
      baseStudent("Sneha Pillai", "23105A0009", "BIOMD"),
      baseStudent("Adarsh Menon", "23105A0010", "BIOMD"),

      // MMS
      baseStudent("Priya Sharma", "23106A0001", "MMS", "9000000048"),
      baseStudent("Ravi Verma", "23106A0002", "MMS", "9000000049"),
      baseStudent("Neha Gupta", "23106A0003", "MMS", "9000000050"),
      baseStudent("Akshay Singh", "23106A0004", "MMS", "9000000051"),
      baseStudent("Anjali Desai", "23106A0005", "MMS", "9000000052"),
      baseStudent("Vikram Reddy", "23106A0006", "MMS", "9000000053"),
      baseStudent("Shalini Patel", "23106A0007", "MMS", "9000000054"),
      baseStudent("Kiran Joshi", "23106A0008", "MMS"),
      baseStudent("Pankaj Yadav", "23106A0009", "MMS"),
      baseStudent("Mehul Shah", "23106A0010", "MMS"),
    ];

    await Student.insertMany(students);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedDatabase();
