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
      // ─────────────────────────────────────────────
      // EXTC – Div A
      // ─────────────────────────────────────────────
      baseStudent("Ghanwat Vinayak Ramesh", "19201A2005", "EXTC"),
      baseStudent("Rane Chaitanya Vasant", "20103A0031", "EXTC"),
      baseStudent("Rakshe Akansha Bhagwan", "21003A0046", "EXTC"),
      baseStudent("Devang Patel", "21103A0003", "EXTC"),
      baseStudent("Kanojia Shreyansh Ramprakash", "21103A0006", "EXTC"),
      baseStudent("Daggula Omkar Vinod", "21103A0007", "EXTC"),
      baseStudent("Sahare Samit", "21103A0008", "EXTC"),
      baseStudent("Mohite Arya Amit Yojana", "21103A0009", "EXTC"),
      baseStudent("Rawat Anushka", "21103A0010", "EXTC"),
      baseStudent("Sushant Ashok Phad", "21103A0011", "EXTC"),
      baseStudent("Dabholkar Nidhi Nandkumar", "21103A0012", "EXTC"),
      baseStudent("Kambli Soham Sandeep Vandana", "21103A0013", "EXTC"),
      baseStudent("Chavan Sarvesh Mahesh Suhasini", "21103A0015", "EXTC"),
      baseStudent("Waghmode Sarthak Sunil", "21103A0016", "EXTC"),
      baseStudent("Pimpalkhare Kaustubh", "21103A0017", "EXTC"),
      baseStudent("Pawar Shubham Pravin", "21103A0018", "EXTC"),
      baseStudent("Pathe Sandip Kacharu", "21103A0020", "EXTC"),
      baseStudent("Khatavkar Anurag Nishad", "21103A0021", "EXTC"),
      baseStudent("Kesharwani Sujal Pravin", "21103A0022", "EXTC"),
      baseStudent("Dikshita Laxman Belchada", "21103A0023", "EXTC"),
      baseStudent("Patil Pradunya Subhash", "21103A0025", "EXTC"),
      baseStudent("Bawane Khushi Sudhir", "21103A0027", "EXTC"),
      baseStudent("Shingade Shital Vinayak", "21103A0029", "EXTC"),
      baseStudent("Nandi Anirudh", "21103A0032", "EXTC"),
      baseStudent("Abhishek Yadav", "21103A0034", "EXTC"),
      baseStudent("Sail Sumer", "21103A0035", "EXTC"),
      baseStudent("Gawande Neha Vinayak", "21103A0036", "EXTC"),
      baseStudent("Rohit Thakur", "21103A0038", "EXTC"),
      baseStudent("Pasupalak Karisma Bhabanisankar", "21103A0039", "EXTC"),
      baseStudent("Shivhare Riya", "21103A0040", "EXTC"),
      baseStudent("Jadhav Mrudula", "21103A0042", "EXTC"),
      baseStudent("Thakkar Neeti", "21103A0043", "EXTC"),
      baseStudent("Narvekar Heramba", "21103A0045", "EXTC"),
      baseStudent("Hirnaik Avanti", "21103A0047", "EXTC"),
      baseStudent("Shinde Sagar Pravin", "21103A0050", "EXTC"),
      baseStudent("Mahajan Kushangi", "21103A0051", "EXTC"),
      baseStudent("Jadhav Yash Sandeep", "21103A0053", "EXTC"),
      baseStudent("Todankar Aashish Sudesh", "21103A0055", "EXTC"),
      baseStudent("Kushwaha Ishani", "21103A0056", "EXTC"),
      baseStudent("Tambe Gaurav", "21103A0059", "EXTC"),
      baseStudent("Amballa Uday", "21103A0061", "EXTC"),
      baseStudent("Yadav Amey", "21103A0063", "EXTC"),
      baseStudent("Piyush Anil Walhekar", "21103A0066", "EXTC"),
      baseStudent("Medhe Vinit Sushil", "21103A0067", "EXTC"),
      baseStudent("Ganesh Nagesh Jangal", "21103A0068", "EXTC"),
      baseStudent("Abhay Pandey", "21103A0070", "EXTC"),
      baseStudent("Pawar Sumit Subhash", "21103A0071", "EXTC"),
      baseStudent("Duryodhan Yog Harish", "21103A0072", "EXTC"),
      baseStudent("Sankhe Kaustubh", "21103A0074", "EXTC"),
      baseStudent("Bhalchandra Sudhir Pimpalkar", "21103A0078", "EXTC"),
      baseStudent("Shinde Rohan Santosh", "21103A0081", "EXTC"),
      baseStudent("Kodere Simran Sachin Manisha", "22103A2001", "EXTC"),
      baseStudent("Rajput Harsh Vijaysing", "22103A2002", "EXTC"),
      baseStudent("Balam Ninad", "22103A2003", "EXTC"),
      baseStudent("Yetam Divya Suresh", "22103A2007", "EXTC"),
      baseStudent("Narwade Sameer Gangaram", "22103A2009", "EXTC"),
      baseStudent("Bhandare Dhiraj Krishnappa", "22103A2010", "EXTC"),
      baseStudent("Vedant Dnyaneshwar Daware", "22103A2011", "EXTC"),
      baseStudent("Chaudhari Divyesh Hemant", "22103A2015", "EXTC"),
      baseStudent("Dubey Himanshu Tribhuvannath", "22103A2016", "EXTC"),
      baseStudent("Tushar Kundlik Waghmode", "22103A2017", "EXTC"),
      baseStudent("Rathod Prajeet", "22103A2018", "EXTC"),
      baseStudent("Lathish Shiva Krishna Rai", "22103A2019", "EXTC"),
      baseStudent("Deshmukh Shivam Ramakant", "22103A2020", "EXTC"),
      baseStudent("Sakshi Pawar", "22103A2021", "EXTC"),
      baseStudent("Harshal Liladhar Patil", "22103A2022", "EXTC"),
      baseStudent("Sarang Sohel Sameer", "22103A2023", "EXTC"),
      baseStudent("Dabir Zumair Parvez", "22103A2024", "EXTC"),
      baseStudent("Sneha Keshav Shinde", "22103A2025", "EXTC"),

      // ─────────────────────────────────────────────
      // EXTC – Div B
      // ─────────────────────────────────────────────
      baseStudent("Kasar Om Prashant", "2103B2004", "EXTC"),
      baseStudent("Birari Ajinkya Kishor", "21103B0003", "EXTC"),
      baseStudent("Mondi Harsh", "21103B0005", "EXTC"),
      baseStudent("Sasane Divya", "21103B0006", "EXTC"),
      baseStudent("Shankar Vadivel", "21103B0010", "EXTC"),
      baseStudent("Aryan Dhananjay Landge", "21103B0012", "EXTC"),
      baseStudent("Yadav Ayush Ashok", "21103B0013", "EXTC"),
      baseStudent("Chavan Harshal Anil Apurva", "21103B0014", "EXTC"),
      baseStudent("Gupta Abhishek", "21103B0017", "EXTC"),
      baseStudent("Chavan Aditya Pradeep", "21103B0019", "EXTC"),
      baseStudent(
        "Aurangabadkar Atharva Pranesh Pradnya",
        "21103B0022",
        "EXTC",
      ),
      baseStudent("Vishesh Sharma", "21103B0025", "EXTC"),
      baseStudent("Dube Bhanudas Manas", "21103B0027", "EXTC"),
      baseStudent("Jalkote Aditya Shivraj", "21103B0029", "EXTC"),
      baseStudent("Dubey Navneet Pradeep", "21103B0030", "EXTC"),
      baseStudent("Thomas Akshay Shaji", "21103B0031", "EXTC"),
      baseStudent("Shingate Hartik Haridas", "21103B0036", "EXTC"),
      baseStudent("Jaiswal Tejal Mahesh", "21103B0039", "EXTC"),
      baseStudent("Sairaj Redekar", "21103B0040", "EXTC"),
      baseStudent("Datekar Aditi Vikas", "21103B0042", "EXTC"),
      baseStudent("Sakshi Sandeep Vichare", "21103B0043", "EXTC"),
      baseStudent("Kirtane Soham Anant", "21103B2014", "EXTC"),
      baseStudent("Chavan Vijay Chandra", "22103B2001", "EXTC"),
      baseStudent("Manerikar Saurabh Rajeev", "22103B2002", "EXTC"),
      baseStudent("Chavan Sagar Suresh", "22103B2003", "EXTC"),
      baseStudent("Rajkundal Mayur Natesh", "22103B2005", "EXTC"),
      baseStudent("Harshal Baswaraj Kalu", "22103B2006", "EXTC"),
      baseStudent("Patil Ankit Rohidas", "22103B2009", "EXTC"),
      baseStudent("Dhaigude Saily Suresh", "22103B2010", "EXTC"),
      baseStudent("Bhandare Aditya Rajesh", "22103B2011", "EXTC"),
      baseStudent("Siddhesh Dilip Teli", "22103B2012", "EXTC"),
      baseStudent("Wandre Gunjan Narendra", "22103B2015", "EXTC"),
      baseStudent("Nandini Basraj Chavan", "22103B2016", "EXTC"),
      baseStudent("Pranjal Bhagwat Patil", "22103B2017", "EXTC"),
      baseStudent("Vikrant Dattatray Bhise", "22103B2018", "EXTC"),
      baseStudent("Tejas Prabhakar Kamble", "22103B2021", "EXTC"),

      // ─────────────────────────────────────────────
      // ETRX – Div A
      // ─────────────────────────────────────────────
      baseStudent("Surlia Abhimanyu", "21104A0001", "ETRX"),
      baseStudent("Chari Soham Sakharam", "21104A0002", "ETRX"),
      baseStudent("Shubhang Mehta", "21104A0004", "ETRX"),
      baseStudent("Gurav Sai Sanjay", "21104A0005", "ETRX"),
      baseStudent("Datar Sahil Kedar", "21104A0006", "ETRX"),
      baseStudent("Talele Bhakti Kiran", "21104A0009", "ETRX"),
      baseStudent("Aditya Bhilare", "21104A0011", "ETRX"),
      baseStudent("Phanse Manas", "21104A0012", "ETRX"),
      baseStudent("Singh Aditya Ashishkumar", "21104A0014", "ETRX"),
      baseStudent("Roy Anushka Roby", "21104A0017", "ETRX"),
      baseStudent("Karkala Aniket", "21104A0020", "ETRX"),
      baseStudent("Yadav Anush Jagannath", "21104A0021", "ETRX"),
      baseStudent("Shukla Ashutosh Raviprakash", "21104A0022", "ETRX"),
      baseStudent("Jadhav Aakansha Shirish Rohini", "21104A0023", "ETRX"),
      baseStudent("Yadav Nitin Krishna Chandra", "21104A0024", "ETRX"),
      baseStudent("Warde Nidhi Prashant", "21104A0027", "ETRX"),
      baseStudent("Ankit Kumar", "21104A0028", "ETRX"),
      baseStudent("Yelgonda Prasanna", "21104A0029", "ETRX"),
      baseStudent("Pawar Aman Raju", "21104A0030", "ETRX"),
      baseStudent("Jondhale Yagnesh Gopal", "21104A0033", "ETRX"),
      baseStudent("Noshi Chopra", "21104A0036", "ETRX"),
      baseStudent("Jain Jatin", "21104A0038", "ETRX"),
      baseStudent("Pandey Harsh", "21104A0041", "ETRX"),
      baseStudent("Prabuddha Vijay Kamble", "21104A0042", "ETRX"),
      baseStudent("Jadhav Nishad Avinash", "21104A0043", "ETRX"),
      baseStudent("Siddhaye Shriraj Ajinkya", "21104A0044", "ETRX"),
      baseStudent("Bendke Aditi Prakash", "21104A0045", "ETRX"),
      baseStudent("Jadhav Anish Rajendra", "21104A0049", "ETRX"),
      baseStudent("Deshmukh Harsh Nitin", "21104A0053", "ETRX"),
      baseStudent("Nagwekar Tanmay Sameer", "21104A0054", "ETRX"),
      baseStudent("Mahadik Unnati Suresh", "21104A0056", "ETRX"),
      baseStudent("Rajbhoj Soham Rajesh", "21104A0057", "ETRX"),
      baseStudent("Chaudhari Siddhi Ganesh", "21104A0058", "ETRX"),
      baseStudent("Shinde Aarya Niteen", "21104A0059", "ETRX"),
      baseStudent("Hambir Nishant", "21104A0060", "ETRX"),
      baseStudent("Pore Atharv Ganesh", "21104A0061", "ETRX"),
      baseStudent("Acharekar Shubham", "21104A0063", "ETRX"),
      baseStudent("Rapte Manomay", "21104A0064", "ETRX"),
      baseStudent("Ghosalkar Avishkar", "21104A0068", "ETRX"),
      baseStudent("Thanekar Hrishita Girish", "21104A0069", "ETRX"),
      baseStudent("Eshwari Ramesh Mundekar", "21104A0070", "ETRX"),
      baseStudent("Dhiran Avinash", "21104A0072", "ETRX"),
      baseStudent("Dhaygude Harshad Popat", "21104A0073", "ETRX"),
      baseStudent("Patil Prerana Dilip", "21104A0074", "ETRX"),
      baseStudent("Daksha Sunil Patil", "21104A0075", "ETRX"),
      baseStudent("Waingankar Aditya", "21104A0076", "ETRX"),
      baseStudent("Yelamkar Om", "21104A0077", "ETRX"),
      baseStudent("Khan Mohammad Masiuddin", "21104A0078", "ETRX"),
      baseStudent("Rane Suyash", "21104A0080", "ETRX"),
      baseStudent("Asodekar Mohit Shailendra", "21104A0082", "ETRX"),
      baseStudent("Bhujbal Amrita Brahmanand", "21104A0083", "ETRX"),
      baseStudent("Naik Pratiksha Dilip", "21104A0084", "ETRX"),
      baseStudent("Bane Siddhi Arvind", "21104B0015", "ETRX"),
      baseStudent("Gagrani Archit", "21104B0022", "ETRX"),
      baseStudent("Khandare Ritesh Ghanshyam", "22104A2002", "ETRX"),
      baseStudent("Munj Vedant Narendra", "22104A2003", "ETRX"),
      baseStudent("Bhavsar Ajay", "22104A2008", "ETRX"),
      baseStudent("Aaryan Navnit Kale", "22104A2009", "ETRX"),
      baseStudent("Shinde Shruri Vijay", "22104A2012", "ETRX"),
      baseStudent("Shubham Murudkar", "2K2104A0055", "ETRX"),
      baseStudent("Mamata Rane", "21103A0057", "ETRX"),

      // ─────────────────────────────────────────────
      // ETRX – Div B
      // ─────────────────────────────────────────────
      baseStudent("Bhatkhande Bhargavi Deepak", "21104B0001", "ETRX"),
      baseStudent("Malavika Ambike", "21104B0004", "ETRX"),
      baseStudent("Kadam Sachin Sandesh", "21104B0006", "ETRX"),
      baseStudent("Mahajan Hrishikesh Kaustubh", "21104B0008", "ETRX"),
      baseStudent("Piyush Parab", "21104B0014", "ETRX"),
      baseStudent("Dani Rutvika", "21104B0016", "ETRX"),
      baseStudent("Chorghe Aaditya Sanjay", "21104B0017", "ETRX"),
      baseStudent("Patil Sarvesh Dilip", "21104B0018", "ETRX"),
      baseStudent("Chache Saakshi Sanjay", "21104B0019", "ETRX"),
      baseStudent("Holani Dhanashri Deepak Kumar", "21104B0020", "ETRX"),
      baseStudent("Sabnis Tanmay", "21104B0023", "ETRX"),
      baseStudent("Jadhav Shraddha Dattatray", "21104B0024", "ETRX"),
      baseStudent("Patil Mrunmai Bharat", "21104B0025", "ETRX"),
      baseStudent("Sakhare Akshaya Shrirang", "21104B0026", "ETRX"),
      baseStudent("Kute Samrudhi Vinod", "21104B0027", "ETRX"),
      baseStudent("Pimpalkar Narendra Ajinkya", "21104B0028", "ETRX"),
      baseStudent("Sushil Sundar Mhapankar", "21104B0029", "ETRX"),
      baseStudent("Sonawane Parth Maneesh", "21104B0030", "ETRX"),
      baseStudent("Yadav Akshat Samarbahadur", "21104B0032", "ETRX"),
      baseStudent("Deshpande Aboli Uday", "21104B0033", "ETRX"),
      baseStudent("Sabjifros Mohammed Aman", "21104B0034", "ETRX"),
      baseStudent("Nigam Abhishek", "21104B0035", "ETRX"),
      baseStudent("Hange Sandeep Sahebrao", "21104B0036", "ETRX"),
      baseStudent("Ashokkumar Yadav", "21104B0038", "ETRX"),
      baseStudent("Baikar Aniket Mahesh", "21104B0039", "ETRX"),
      baseStudent("Srushti Chhagan Nagrale", "21104B0041", "ETRX"),
      baseStudent("Prithvi Vinayak P", "21104B0044", "ETRX"),
      baseStudent("Sanskruti Sandip Patil", "21104B0047", "ETRX"),
      baseStudent("Patil Antara Sunil", "21104B0051", "ETRX"),
      baseStudent("Patil Veershree Ankush", "21104B0052", "ETRX"),
      baseStudent("Jangale Pratik Dnyaneshwar", "21104B0055", "ETRX"),
      baseStudent("Akshada Anand Sohani", "21104B0056", "ETRX"),
      baseStudent("Isame Gaurav Arun", "21104B0057", "ETRX"),
      baseStudent("Harsh Hemant Teli", "21104B0059", "ETRX"),
      baseStudent("Salvi Tanvi Sanjay", "21104B0060", "ETRX"),
      baseStudent("Amin Yash Rajesh", "21104B0061", "ETRX"),
      baseStudent("Yadav Prakanshi Rajaram", "21104B0063", "ETRX"),
      baseStudent("Veeraj Honaji Morajkar", "21104B0064", "ETRX"),
      baseStudent("Pandey Nishant", "21104B0066", "ETRX"),
      baseStudent("Patel Kapish Chetan", "21104B0069", "ETRX"),
      baseStudent("Govindula Pragnya Srinivas", "21104B0070", "ETRX"),
      baseStudent("Suryavanshi Prem Sunil", "21104B0071", "ETRX"),
      baseStudent("Nikam Supriya", "21104B0072", "ETRX"),
      baseStudent("Javkhedkar Vinayak Avinash", "22104B2003", "ETRX"),
      baseStudent("Terde Shivam Vikram", "22104B2004", "ETRX"),
      baseStudent("Thakur Mithila Dinesh", "22104B2005", "ETRX"),
      baseStudent("Chaturvedi Rishabh Rakesh", "22104B2006", "ETRX"),
      baseStudent("Chaitanya Narayan Shewale", "22104B2007", "ETRX"),
      baseStudent("Zinjad Gayatri Gorakshanath", "22104B2009", "ETRX"),
      baseStudent("Kakade Dinesh Dilip", "22104B2010", "ETRX"),
      baseStudent("Singh Aditya", "22104B2012", "ETRX"),
    ];

    await Student.insertMany(students);

    console.log(
      `Seeded ${students.length} students: ` +
        `${students.filter((s) => s.department === "EXTC").length} EXTC, ` +
        `${students.filter((s) => s.department === "ETRX").length} ETRX`,
    );

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedDatabase();
