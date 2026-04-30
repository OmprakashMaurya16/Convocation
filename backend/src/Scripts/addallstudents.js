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
      // ─────────────────────────────────────────────
      // MMS – Div A
      // ─────────────────────────────────────────────
      baseStudent("Mandpe Siddhant Rajan", "23106A1002", "MMS"),
      baseStudent("Shah Harsh Ritesh Heena", "23106A1003", "MMS"),
      baseStudent("Ghode Divyal", "23106A1007", "MMS"),
      baseStudent("Madhavi Anvesh Avinash", "23106A1008", "MMS"),
      baseStudent("Khare Akash Shankar", "23106A1009", "MMS"),
      baseStudent("Abhishek Ajit Badade", "23106A1010", "MMS"),
      baseStudent("Shweta Manoj Gandhi", "23106A1011", "MMS"),
      baseStudent("Jadhav Pritam Arun", "23106A1012", "MMS"),
      baseStudent("Kopardekar Rohit Pandit Rekha", "23106A1013", "MMS"),
      baseStudent("Viraj Arjun Mhatre", "23106A1014", "MMS"),
      baseStudent("Dongre Isha Santosh", "23106A1015", "MMS"),
      baseStudent("Parth Ramesh Andhari", "23106A1016", "MMS"),
      baseStudent("Ardekar Riddhi Sunil", "23106A1017", "MMS"),
      baseStudent("Lonandkar Dattaraj Sanjay", "23106A1018", "MMS"),
      baseStudent("Mansi Patil", "23106A1020", "MMS"),
      baseStudent("Salunke Sakshi Dadaji", "23106A1021", "MMS"),
      baseStudent("Mayekar Tanmay Santosh Sunita", "23106A1022", "MMS"),
      baseStudent("Patil Janhavi Satish", "23106A1023", "MMS"),
      baseStudent("Saeesh Keer", "23106A1024", "MMS"),
      baseStudent("Dalvi Pranali Rajendra", "23106A1029", "MMS"),
      baseStudent("Amol Bapu Salunkhe", "23106A1033", "MMS"),
      baseStudent("Adhav Prasanna Satish", "23106A1034", "MMS"),
      baseStudent("Patil Aryan Jayesh", "23106A1039", "MMS"),
      baseStudent("Fendar Aboli Naresh", "23106A1041", "MMS"),
      baseStudent("Patil Siddhesh", "23106A1042", "MMS"),
      baseStudent("Darekar Omkar Ganesh", "23106A1043", "MMS"),
      baseStudent("Balgude Sarthak Tanaji", "23106A1044", "MMS"),
      baseStudent("Salunkhe Akshata Mangesh Jayshree", "23106A1045", "MMS"),
      baseStudent("Patil Prachi Pradeep Bharti", "23106A1046", "MMS"),
      baseStudent("Salgaonkar Siddhi Sunil", "23106A1047", "MMS"),
      baseStudent("Dheb Rutuja Hanmant", "23106A1048", "MMS"),
      baseStudent("Mrunmayee Sakare", "23106A1049", "MMS"),
      baseStudent("Darsani Kulanthaialwar Kavitha", "23106A1050", "MMS"),
      baseStudent("Salunkhe Manali Manoj", "23106A1051", "MMS"),
      baseStudent("Trivedi Sayyam Bharat", "23106A1053", "MMS"),
      baseStudent("Manakulam Indulekha Krishnakumar", "23106A1055", "MMS"),
      baseStudent("Shaikh Mohammad Danish", "23106A1056", "MMS"),
      baseStudent("Shah Yashvi", "23106A1059", "MMS"),
      baseStudent("Sakshi Mahendra Patankar", "23106A1060", "MMS"),
      baseStudent("Chaudhari Bhargav Nilkanth", "23106A0061", "MMS"),
      baseStudent("Mishra Priya", "23106A1064", "MMS"),
      baseStudent("Shinde Amey Pradip", "23106A1065", "MMS"),
      baseStudent("Rai Akanksha", "23106A1066", "MMS"),
      baseStudent("Bhere Aditi Yashwant Pratiksha", "23106A1067", "MMS"),
      baseStudent("Aniket Balkrishna Dighole", "23106A1068", "MMS"),
      baseStudent("Pilane Ganesh Popat", "23106A1069", "MMS"),

      // ─────────────────────────────────────────────
      // MMS – Div B
      // ─────────────────────────────────────────────
      baseStudent("Gujar Varad Vaibhav", "23106B1001", "MMS"),
      baseStudent("Kulkarni Gaurav Damodhar", "23106B1005", "MMS"),
      baseStudent("Gughane Revati Chaitanyarao", "23106B1006", "MMS"),
      baseStudent("Neetu Dinesh Gupta", "23106B1007", "MMS"),
      baseStudent("Swami Praphulla Vaidya", "23106B1008", "MMS"),
      baseStudent("Tripathi Vartika Chandraprakash", "23106B1009", "MMS"),
      baseStudent("Nimbalkar Shubham Suresh", "23106B1010", "MMS"),
      baseStudent("Deshmukh Snehal Sunil", "23106B1011", "MMS"),
      baseStudent("Dhuri Riddhi Mangesh", "23106B1012", "MMS"),
      baseStudent("Parab Prathamesh", "23106B1017", "MMS"),
      baseStudent("Pathak Shreyas", "23106B1019", "MMS"),
      baseStudent("Khandagale Isha Narendra", "23106B1021", "MMS"),
      baseStudent("Mohammad Sartazul Haque", "23106B1022", "MMS"),
      baseStudent("Siddhi Gaikar", "23106B1024", "MMS"),
      baseStudent("Patil Nimish Nitin", "23106B1025", "MMS"),
      baseStudent("Karkare Smeet Shreenath", "23106B1029", "MMS"),
      baseStudent("Bhosale Akash Rameshwar Meerabai", "23106B1030", "MMS"),
      baseStudent("More Komalika Rajendra", "23106B1032", "MMS"),
      baseStudent("Jadhav Pratiksha Ramrao", "23106B1033", "MMS"),
      baseStudent("Shivam Namdev Butere", "23106B1034", "MMS"),
      baseStudent("Shruti Bendugade", "23106B1035", "MMS"),
      baseStudent("Rhenius Stephen Robert", "23106B1038", "MMS"),
      baseStudent("Ritesh Patil", "23106B1040", "MMS"),
      baseStudent("Vichare Anuja Pradosh", "23106B1041", "MMS"),
      baseStudent("Monde Siddhesh Sandeep", "23106B1042", "MMS"),
      baseStudent("Raut Swarada Prashant", "23106B1043", "MMS"),
      baseStudent("Rane Riyanka Rajesh", "23106B1044", "MMS"),
      baseStudent("Mahajan Dhanashree Prakash", "23106B1045", "MMS"),
      baseStudent("Magar Aditya Bhimrao", "23106B1046", "MMS"),
      baseStudent("Gumgaonkar Jay Narendra", "23106B1049", "MMS"),
      baseStudent("Yash Narendra Gumgaonkar", "23106B1050", "MMS"),
      baseStudent("Naik Manjiri Dayanand", "23106B1051", "MMS"),
      baseStudent("Joshi Sahil Anant", "23106B1052", "MMS"),
      baseStudent("Shifa Abdul Rahim Hudewale", "23106B1053", "MMS"),
      baseStudent("Jakkula Saikiran", "23106B1054", "MMS"),
      baseStudent("Kamble Sejal Arun", "23106B1055", "MMS"),
      baseStudent("Siddhi Rane", "23106B1057", "MMS"),
      baseStudent("Aditi Rajendra Patole", "23106B1058", "MMS"),
      baseStudent("More Anish", "23106B1060", "MMS"),
      baseStudent("Pallavi Sanjay Suryawanshi", "23106B1061", "MMS"),
      baseStudent("Harshada Umesh Dhamapurkar", "23106B1065", "MMS"),
      baseStudent("Srushti Tanaji Yadav", "23106B1067", "MMS"),

      // ─────────────────────────────────────────────
      // MMS – Other
      // ─────────────────────────────────────────────
      baseStudent("Ashwin Donuji Yemalkurtiwar", "23107A1005", "MMS"),
    ];

    await Student.insertMany(students);

    console.log(`Seeded ${students.length} students: ${students.length} MMS`);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedDatabase();
