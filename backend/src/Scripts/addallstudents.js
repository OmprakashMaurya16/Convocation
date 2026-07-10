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
      convocationYear: "2026",
      phone,
      email: "",
      company: "",
      qrToken: generateQRToken(studentId),
      state: "REGISTERED",
    });

    const students = [
      // ─────────────────────────────────────────────
      // INFT – Div A (Regular)
      // ─────────────────────────────────────────────
      baseStudent("Ghadge Soham Vijay", "21101A0005", "INFT"),
      baseStudent("Rotwal Paramvir Dnyaneshwarsingh", "21101A0006", "INFT"),
      baseStudent("Harsh Yadav", "21101A0007", "INFT"),
      baseStudent("Sawant Aryan Umesh", "21101A0008", "INFT"),
      baseStudent("Mhatre Saurabh Suresh", "21101A0009", "INFT"),
      baseStudent("Langhi Darshan Haribhau", "21101A0010", "INFT"),
      baseStudent("Ashish Brijmohan Verma", "21101A0011", "INFT"),
      baseStudent("Markam Tarunkumar Harshita", "21101A0012", "INFT"),
      baseStudent("Pandey Pawankumar Laxmishankar", "21101A0013", "INFT"),
      baseStudent("Dode Shravani", "21101A0014", "INFT"),
      baseStudent("Vaishnavi Gondage", "21101A0015", "INFT"),
      baseStudent("Badgujar Harshal Bharat", "21101A0016", "INFT"),
      baseStudent("Panchal Karan Kamlesh", "21101A0018", "INFT"),
      baseStudent("Devkate Vishal Rajendra", "21101A0019", "INFT"),
      baseStudent("Ayush Ajay Darade", "21101A0020", "INFT"),
      baseStudent("Jadhav Gaurav Vivek", "21101A0021", "INFT"),
      baseStudent("Pimple Yash Nilesh", "21101A0023", "INFT"),
      baseStudent("Suvarna Kartik Mahesh", "21101A0029", "INFT"),
      baseStudent("Sonesha Praveen Nenaram", "21101A0030", "INFT"),
      baseStudent("Badgujar Vaishnavi Kamalakar", "21101A0035", "INFT"),
      baseStudent("Shruti Mahesh Hushe", "21101A0037", "INFT"),
      baseStudent("More Rachana", "21101A0038", "INFT"),
      baseStudent("Shantanu Shirkar", "21101A0039", "INFT"),
      baseStudent("Manjrekar Madhura Hemant", "21101A0040", "INFT"),
      baseStudent("Manyar Shivanand Eknath", "21101A0044", "INFT"),
      baseStudent("Mane Harshal", "21101A0045", "INFT"),
      baseStudent("Chaudhari Prasad Dnyaneshwar", "21101A0046", "INFT"),
      baseStudent("Sali Manasi Mahesh", "21101A0048", "INFT"),
      baseStudent("Bhusekar Prathamesh Ravindra", "21101A0053", "INFT"),
      baseStudent("Mali Amey Narendra", "21101A0054", "INFT"),
      baseStudent("Vaishnavi Subash Paulraj", "21101A0055", "INFT"),
      baseStudent("Mejari Atharv Mahesh", "21101A0056", "INFT"),
      baseStudent("Tinwala Shabbir Taikhum", "21101A0057", "INFT"),
      baseStudent("Pimpale Rohit Dilip", "21101A0058", "INFT"),
      baseStudent("Gamre Navin", "21101A0059", "INFT"),
      baseStudent("Nida Mazhar Sagri", "21101A0060", "INFT"),
      baseStudent("Semwal Tanmay Devendra", "21101A0061", "INFT"),
      baseStudent("Patil Jay Pravin", "21101A0062", "INFT"),
      baseStudent("Maroof Sameer Ahmad Mohammed Amin", "21101A0063", "INFT"),
      baseStudent("Harad Rishikesh Subash", "21101A0066", "INFT"),
      baseStudent("Shejul Sonali Bapu", "21101A0067", "INFT"),
      baseStudent("Shinde Shivam Rohidas", "21101A0068", "INFT"),
      baseStudent("Salagre Anvesh", "21101A0069", "INFT"),
      baseStudent("Yadav Karan Shri Bhagwan", "21101A0070", "INFT"),
      baseStudent("Garmale Aditya Gunwant", "21101A0071", "INFT"),
      baseStudent("Sakre Kaushik Mohan", "21101A0072", "INFT"),
      baseStudent("Paranjpe Chaitanya Nilesh", "21101A0073", "INFT"),
      baseStudent("Anjali", "21101A0074", "INFT"),
      baseStudent("Chaurasiya Tisha Surajnarayan", "21101A0076", "INFT"),
      baseStudent("Vinesh Ryapak", "21101A0077", "INFT"),
      baseStudent("Rane Mukul Surendra", "21101A0078", "INFT"),
      baseStudent("Parkar Saloni Nitin", "21101A2007", "INFT"),

      // ─────────────────────────────────────────────
      // INFT – Div B (Regular)
      // ─────────────────────────────────────────────
      baseStudent("Ware Prathamesh Dattatray", "21101B0002", "INFT"),
      baseStudent("Bhandary Dhruv Ravindra", "21101B0004", "INFT"),
      baseStudent("Kaparvena Kamlesh", "21101B0007", "INFT"),
      baseStudent("Gala Khushi Ravilal", "21101B0010", "INFT"),
      baseStudent("Kulkarni Rutam Sandeep", "21101B0012", "INFT"),
      baseStudent("Desai Sakshi Sanjay", "21101B0014", "INFT"),
      baseStudent("Patil Sejal Pravin", "21101B0015", "INFT"),
      baseStudent("Gutte Audumbar Navnath", "21101B0016", "INFT"),
      baseStudent("Kamble Anish Sanjay", "21101B0017", "INFT"),
      baseStudent("Vedali Nilesh Pawar", "21101B0021", "INFT"),
      baseStudent("Mane Mansi Jalindar", "21101B0022", "INFT"),
      baseStudent("Ukarde Sahil Sandesh", "21101B0027", "INFT"),
      baseStudent("Agrawal Aryan Brij", "21101B0029", "INFT"),
      baseStudent("Mohammad Ahmed Ansari", "21101B0031", "INFT"),
      baseStudent("Manjalkar Aaditi", "21101B0032", "INFT"),
      baseStudent("Shetye Purva Prashant", "21101B0034", "INFT"),
      baseStudent("Ansari Irfan", "21101B0038", "INFT"),
      baseStudent("Shah Tanishq Mukesh", "21101B0039", "INFT"),
      baseStudent("Gawade Abhinav Shivram", "21101B0040", "INFT"),
      baseStudent("Gupta Yash Premchand", "21101B0043", "INFT"),
      baseStudent("Nagvekar Prathamesh", "21101B0044", "INFT"),
      baseStudent("Mahalungekar Atharva Prabhakar", "21101B0045", "INFT"),
      baseStudent("Matta Ankith", "21101B0046", "INFT"),
      baseStudent("Shinde Devank Sanjay", "21101B0047", "INFT"),
      baseStudent("Sawant Eshwari", "21101B0048", "INFT"),
      baseStudent("Rahul Shrinivas Akula", "21101B0049", "INFT"),
      baseStudent("Aakash Ashish Ranade", "21101B0050", "INFT"),
      baseStudent("Patil Pranav Pradeep", "21101B0051", "INFT"),
      baseStudent("Rasam Sudhansh", "21101B0053", "INFT"),
      baseStudent("Dhanawade Yash Vijay", "21101B0054", "INFT"),
      baseStudent("Iyer Hanesh", "21101B0056", "INFT"),
      baseStudent("Siddhi Amberkar", "21101B0057", "INFT"),
      baseStudent("Awate Vedanti", "21101B0058", "INFT"),
      baseStudent("Pansare Sarvesh Prakash", "21101B0060", "INFT"),
      baseStudent("Nagula Rohitkumar Rameshbabu", "21101B0061", "INFT"),
      baseStudent("Suryawanshi Vaidehi Sanjay", "21101B0062", "INFT"),
      baseStudent("Bhoga Varnika", "21101B0063", "INFT"),
      baseStudent("Bhendawdekar Shravani", "21101B0065", "INFT"),
      baseStudent("Lokhande Vishant", "21101B0066", "INFT"),
      baseStudent("Prahlad Devraj Varma", "21101B0069", "INFT"),
      baseStudent("Lakade Aniruddha Dnyeshwar", "21101B0071", "INFT"),
      baseStudent("Rane Nirmiti", "21101B0073", "INFT"),

      // ─────────────────────────────────────────────
      // INFT – Mismatched Roll (CMPN roll, INFT dept)
      // ─────────────────────────────────────────────
      baseStudent("Chaudhari Harshal Dinesh", "21102A0042", "INFT"),

      // ─────────────────────────────────────────────
      // INFT – DSY (Direct Second Year)
      // ─────────────────────────────────────────────
      baseStudent("Aniket Metkari", "22101A2001", "INFT"),
      baseStudent("Sanika Santosh Gadekar", "22101A2002", "INFT"),
      baseStudent("Walhekar Sanket", "22101A2003", "INFT"),
      baseStudent("Jadhav Niraj Vishwas", "22101A2004", "INFT"),
      baseStudent("Kate Sanika Sharad", "22101A2005", "INFT"),
      baseStudent("Kachare Aditya", "22101A2006", "INFT"),
      baseStudent("Aatmaja Mandar Joshi", "22101A2007", "INFT"),
      baseStudent("Powale Shubham", "22101A2008", "INFT"),
      baseStudent("Patel Kadambari", "22101A2009", "INFT"),
      baseStudent("Katkar Shubham Bharat", "22101A2010", "INFT"),
      baseStudent("Nangare Jayesh Bhausaheb", "22101B2002", "INFT"),
      baseStudent("Ankita Santosh Pilvilkar", "22101B2003", "INFT"),
      baseStudent("Ansari Anam", "22101B2005", "INFT"),
      baseStudent("Rakhangi Arisha Aejaz", "22101B2006", "INFT"),
      baseStudent("Shaikh Nadim", "22101B2007", "INFT"),
      baseStudent("Patil Yash Kailas", "22101B2008", "INFT"),
      baseStudent("Zeenat Imtiyaz Mujawar", "22101B2009", "INFT"),
      baseStudent("Thorat Soham", "22101B2010", "INFT"),
    ];

    await Student.insertMany(students);

    console.log(`Seeded ${students.length} students (year 2026): ${students.length} INFT`);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedDatabase();
