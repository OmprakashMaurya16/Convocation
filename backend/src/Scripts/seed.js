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
      // ETRX – Div A
      // ─────────────────────────────────────────────
      baseStudent("Ghanwat Vinayak Ramesh", "19201A2005", "ETRX"),
      baseStudent("Rane Chaitanya Vasant", "20103A0031", "ETRX"),
      baseStudent("Rakshe Akansha Bhagwan", "21003A0046", "ETRX"),
      baseStudent("Devang Patel", "21103A0003", "ETRX"),
      baseStudent("Kanojia Shreyansh Ramprakash", "21103A0006", "ETRX"),
      baseStudent("Daggula Omkar Vinod", "21103A0007", "ETRX"),
      baseStudent("Sahare Samit", "21103A0008", "ETRX"),
      baseStudent("Mohite Arya Amit Yojana", "21103A0009", "ETRX"),
      baseStudent("Rawat Anushka", "21103A0010", "ETRX"),
      baseStudent("Sushant Ashok Phad", "21103A0011", "ETRX"),
      baseStudent("Dabholkar Nidhi Nandkumar", "21103A0012", "ETRX"),
      baseStudent("Kambli Soham Sandeep Vandana", "21103A0013", "ETRX"),
      baseStudent("Chavan Sarvesh Mahesh Suhasini", "21103A0015", "ETRX"),
      baseStudent("Waghmode Sarthak Sunil", "21103A0016", "ETRX"),
      baseStudent("Pimpalkhare Kaustubh", "21103A0017", "ETRX"),
      baseStudent("Pawar Shubham Pravin", "21103A0018", "ETRX"),
      baseStudent("Pathe Sandip Kacharu", "21103A0020", "ETRX"),
      baseStudent("Khatavkar Anurag Nishad", "21103A0021", "ETRX"),
      baseStudent("Kesharwani Sujal Pravin", "21103A0022", "ETRX"),
      baseStudent("Dikshita Laxman Belchada", "21103A0023", "ETRX"),
      baseStudent("Patil Pradunya Subhash", "21103A0025", "ETRX"),
      baseStudent("Bawane Khushi Sudhir", "21103A0027", "ETRX"),
      baseStudent("Shingade Shital Vinayak", "21103A0029", "ETRX"),
      baseStudent("Nandi Anirudh", "21103A0032", "ETRX"),
      baseStudent("Abhishek Yadav", "21103A0034", "ETRX"),
      baseStudent("Sail Sumer", "21103A0035", "ETRX"),
      baseStudent("Gawande Neha Vinayak", "21103A0036", "ETRX"),
      baseStudent("Rohit Thakur", "21103A0038", "ETRX"),
      baseStudent("Pasupalak Karisma Bhabanisankar", "21103A0039", "ETRX"),
      baseStudent("Shivhare Riya", "21103A0040", "ETRX"),
      baseStudent("Jadhav Mrudula", "21103A0042", "ETRX"),
      baseStudent("Thakkar Neeti", "21103A0043", "ETRX"),
      baseStudent("Narvekar Heramba", "21103A0045", "ETRX"),
      baseStudent("Hirnaik Avanti", "21103A0047", "ETRX"),
      baseStudent("Shinde Sagar Pravin", "21103A0050", "ETRX"),
      baseStudent("Mahajan Kushangi", "21103A0051", "ETRX"),
      baseStudent("Jadhav Yash Sandeep", "21103A0053", "ETRX"),
      baseStudent("Todankar Aashish Sudesh", "21103A0055", "ETRX"),
      baseStudent("Kushwaha Ishani", "21103A0056", "ETRX"),
      baseStudent("Tambe Gaurav", "21103A0059", "ETRX"),
      baseStudent("Amballa Uday", "21103A0061", "ETRX"),
      baseStudent("Yadav Amey", "21103A0063", "ETRX"),
      baseStudent("Piyush Anil Walhekar", "21103A0066", "ETRX"),
      baseStudent("Medhe Vinit Sushil", "21103A0067", "ETRX"),
      baseStudent("Ganesh Nagesh Jangal", "21103A0068", "ETRX"),
      baseStudent("Abhay Pandey", "21103A0070", "ETRX"),
      baseStudent("Pawar Sumit Subhash", "21103A0071", "ETRX"),
      baseStudent("Duryodhan Yog Harish", "21103A0072", "ETRX"),
      baseStudent("Sankhe Kaustubh", "21103A0074", "ETRX"),
      baseStudent("Bhalchandra Sudhir Pimpalkar", "21103A0078", "ETRX"),
      baseStudent("Shinde Rohan Santosh", "21103A0081", "ETRX"),
      baseStudent("Kodere Simran Sachin Manisha", "22103A2001", "ETRX"),
      baseStudent("Rajput Harsh Vijaysing", "22103A2002", "ETRX"),
      baseStudent("Balam Ninad", "22103A2003", "ETRX"),
      baseStudent("Yetam Divya Suresh", "22103A2007", "ETRX"),
      baseStudent("Narwade Sameer Gangaram", "22103A2009", "ETRX"),
      baseStudent("Bhandare Dhiraj Krishnappa", "22103A2010", "ETRX"),
      baseStudent("Vedant Dnyaneshwar Daware", "22103A2011", "ETRX"),
      baseStudent("Chaudhari Divyesh Hemant", "22103A2015", "ETRX"),
      baseStudent("Dubey Himanshu Tribhuvannath", "22103A2016", "ETRX"),
      baseStudent("Tushar Kundlik Waghmode", "22103A2017", "ETRX"),
      baseStudent("Rathod Prajeet", "22103A2018", "ETRX"),
      baseStudent("Lathish Shiva Krishna Rai", "22103A2019", "ETRX"),
      baseStudent("Deshmukh Shivam Ramakant", "22103A2020", "ETRX"),
      baseStudent("Sakshi Pawar", "22103A2021", "ETRX"),
      baseStudent("Harshal Liladhar Patil", "22103A2022", "ETRX"),
      baseStudent("Sarang Sohel Sameer", "22103A2023", "ETRX"),
      baseStudent("Dabir Zumair Parvez", "22103A2024", "ETRX"),
      baseStudent("Sneha Keshav Shinde", "22103A2025", "ETRX"),

      // ─────────────────────────────────────────────
      // ETRX – Div B
      // ─────────────────────────────────────────────
      baseStudent("Kasar Om Prashant", "2103B2004", "ETRX"),
      baseStudent("Birari Ajinkya Kishor", "21103B0003", "ETRX"),
      baseStudent("Mondi Harsh", "21103B0005", "ETRX"),
      baseStudent("Sasane Divya", "21103B0006", "ETRX"),
      baseStudent("Shankar Vadivel", "21103B0010", "ETRX"),
      baseStudent("Aryan Dhananjay Landge", "21103B0012", "ETRX"),
      baseStudent("Yadav Ayush Ashok", "21103B0013", "ETRX"),
      baseStudent("Chavan Harshal Anil Apurva", "21103B0014", "ETRX"),
      baseStudent("Gupta Abhishek", "21103B0017", "ETRX"),
      baseStudent("Chavan Aditya Pradeep", "21103B0019", "ETRX"),
      baseStudent(
        "Aurangabadkar Atharva Pranesh Pradnya",
        "21103B0022",
        "ETRX",
      ),
      baseStudent("Vishesh Sharma", "21103B0025", "ETRX"),
      baseStudent("Dube Bhanudas Manas", "21103B0027", "ETRX"),
      baseStudent("Jalkote Aditya Shivraj", "21103B0029", "ETRX"),
      baseStudent("Dubey Navneet Pradeep", "21103B0030", "ETRX"),
      baseStudent("Thomas Akshay Shaji", "21103B0031", "ETRX"),
      baseStudent("Shingate Hartik Haridas", "21103B0036", "ETRX"),
      baseStudent("Jaiswal Tejal Mahesh", "21103B0039", "ETRX"),
      baseStudent("Sairaj Redekar", "21103B0040", "ETRX"),
      baseStudent("Datekar Aditi Vikas", "21103B0042", "ETRX"),
      baseStudent("Sakshi Sandeep Vichare", "21103B0043", "ETRX"),
      baseStudent("Kirtane Soham Anant", "21103B2014", "ETRX"),
      baseStudent("Chavan Vijay Chandra", "22103B2001", "ETRX"),
      baseStudent("Manerikar Saurabh Rajeev", "22103B2002", "ETRX"),
      baseStudent("Chavan Sagar Suresh", "22103B2003", "ETRX"),
      baseStudent("Rajkundal Mayur Natesh", "22103B2005", "ETRX"),
      baseStudent("Harshal Baswaraj Kalu", "22103B2006", "ETRX"),
      baseStudent("Patil Ankit Rohidas", "22103B2009", "ETRX"),
      baseStudent("Dhaigude Saily Suresh", "22103B2010", "ETRX"),
      baseStudent("Bhandare Aditya Rajesh", "22103B2011", "ETRX"),
      baseStudent("Siddhesh Dilip Teli", "22103B2012", "ETRX"),
      baseStudent("Wandre Gunjan Narendra", "22103B2015", "ETRX"),
      baseStudent("Nandini Basraj Chavan", "22103B2016", "ETRX"),
      baseStudent("Pranjal Bhagwat Patil", "22103B2017", "ETRX"),
      baseStudent("Vikrant Dattatray Bhise", "22103B2018", "ETRX"),
      baseStudent("Tejas Prabhakar Kamble", "22103B2021", "ETRX"),

      // ─────────────────────────────────────────────
      // ETRX – Div A
      // ─────────────────────────────────────────────
      baseStudent("Surlia Abhimanyu", "21104A0001", "EXTC"),
      baseStudent("Chari Soham Sakharam", "21104A0002", "EXTC"),
      baseStudent("Shubhang Mehta", "21104A0004", "EXTC"),
      baseStudent("Gurav Sai Sanjay", "21104A0005", "EXTC"),
      baseStudent("Datar Sahil Kedar", "21104A0006", "EXTC"),
      baseStudent("Talele Bhakti Kiran", "21104A0009", "EXTC"),
      baseStudent("Aditya Bhilare", "21104A0011", "EXTC"),
      baseStudent("Phanse Manas", "21104A0012", "EXTC"),
      baseStudent("Singh Aditya Ashishkumar", "21104A0014", "EXTC"),
      baseStudent("Roy Anushka Roby", "21104A0017", "EXTC"),
      baseStudent("Karkala Aniket", "21104A0020", "EXTC"),
      baseStudent("Yadav Anush Jagannath", "21104A0021", "EXTC"),
      baseStudent("Shukla Ashutosh Raviprakash", "21104A0022", "EXTC"),
      baseStudent("Jadhav Aakansha Shirish Rohini", "21104A0023", "EXTC"),
      baseStudent("Yadav Nitin Krishna Chandra", "21104A0024", "EXTC"),
      baseStudent("Warde Nidhi Prashant", "21104A0027", "EXTC"),
      baseStudent("Ankit Kumar", "21104A0028", "EXTC"),
      baseStudent("Yelgonda Prasanna", "21104A0029", "EXTC"),
      baseStudent("Pawar Aman Raju", "21104A0030", "EXTC"),
      baseStudent("Jondhale Yagnesh Gopal", "21104A0033", "EXTC"),
      baseStudent("Noshi Chopra", "21104A0036", "EXTC"),
      baseStudent("Jain Jatin", "21104A0038", "EXTC"),
      baseStudent("Pandey Harsh", "21104A0041", "EXTC"),
      baseStudent("Prabuddha Vijay Kamble", "21104A0042", "EXTC"),
      baseStudent("Jadhav Nishad Avinash", "21104A0043", "EXTC"),
      baseStudent("Siddhaye Shriraj Ajinkya", "21104A0044", "EXTC"),
      baseStudent("Bendke Aditi Prakash", "21104A0045", "EXTC"),
      baseStudent("Jadhav Anish Rajendra", "21104A0049", "EXTC"),
      baseStudent("Deshmukh Harsh Nitin", "21104A0053", "EXTC"),
      baseStudent("Nagwekar Tanmay Sameer", "21104A0054", "EXTC"),
      baseStudent("Mahadik Unnati Suresh", "21104A0056", "EXTC"),
      baseStudent("Rajbhoj Soham Rajesh", "21104A0057", "EXTC"),
      baseStudent("Chaudhari Siddhi Ganesh", "21104A0058", "EXTC"),
      baseStudent("Shinde Aarya Niteen", "21104A0059", "EXTC"),
      baseStudent("Hambir Nishant", "21104A0060", "EXTC"),
      baseStudent("Pore Atharv Ganesh", "21104A0061", "EXTC"),
      baseStudent("Acharekar Shubham", "21104A0063", "EXTC"),
      baseStudent("Rapte Manomay", "21104A0064", "EXTC"),
      baseStudent("Ghosalkar Avishkar", "21104A0068", "EXTC"),
      baseStudent("Thanekar Hrishita Girish", "21104A0069", "EXTC"),
      baseStudent("Eshwari Ramesh Mundekar", "21104A0070", "EXTC"),
      baseStudent("Dhiran Avinash", "21104A0072", "EXTC"),
      baseStudent("Dhaygude Harshad Popat", "21104A0073", "EXTC"),
      baseStudent("Patil Prerana Dilip", "21104A0074", "EXTC"),
      baseStudent("Daksha Sunil Patil", "21104A0075", "EXTC"),
      baseStudent("Waingankar Aditya", "21104A0076", "EXTC"),
      baseStudent("Yelamkar Om", "21104A0077", "EXTC"),
      baseStudent("Khan Mohammad Masiuddin", "21104A0078", "EXTC"),
      baseStudent("Rane Suyash", "21104A0080", "EXTC"),
      baseStudent("Asodekar Mohit Shailendra", "21104A0082", "EXTC"),
      baseStudent("Bhujbal Amrita Brahmanand", "21104A0083", "EXTC"),
      baseStudent("Naik Pratiksha Dilip", "21104A0084", "EXTC"),
      baseStudent("Bane Siddhi Arvind", "21104B0015", "EXTC"),
      baseStudent("Gagrani Archit", "21104B0022", "EXTC"),
      baseStudent("Khandare Ritesh Ghanshyam", "22104A2002", "EXTC"),
      baseStudent("Munj Vedant Narendra", "22104A2003", "EXTC"),
      baseStudent("Bhavsar Ajay", "22104A2008", "EXTC"),
      baseStudent("Aaryan Navnit Kale", "22104A2009", "EXTC"),
      baseStudent("Shinde Shruri Vijay", "22104A2012", "EXTC"),
      baseStudent("Shubham Murudkar", "2K2104A0055", "EXTC"),
      baseStudent("Mamata Rane", "21103A0057", "EXTC"),

      // ─────────────────────────────────────────────
      // EXTC – Div B
      // ─────────────────────────────────────────────
      baseStudent("Bhatkhande Bhargavi Deepak", "21104B0001", "EXTC"),
      baseStudent("Malavika Ambike", "21104B0004", "EXTC"),
      baseStudent("Kadam Sachin Sandesh", "21104B0006", "EXTC"),
      baseStudent("Mahajan Hrishikesh Kaustubh", "21104B0008", "EXTC"),
      baseStudent("Piyush Parab", "21104B0014", "EXTC"),
      baseStudent("Dani Rutvika", "21104B0016", "EXTC"),
      baseStudent("Chorghe Aaditya Sanjay", "21104B0017", "EXTC"),
      baseStudent("Patil Sarvesh Dilip", "21104B0018", "EXTC"),
      baseStudent("Chache Saakshi Sanjay", "21104B0019", "EXTC"),
      baseStudent("Holani Dhanashri Deepak Kumar", "21104B0020", "EXTC"),
      baseStudent("Sabnis Tanmay", "21104B0023", "EXTC"),
      baseStudent("Jadhav Shraddha Dattatray", "21104B0024", "EXTC"),
      baseStudent("Patil Mrunmai Bharat", "21104B0025", "EXTC"),
      baseStudent("Sakhare Akshaya Shrirang", "21104B0026", "EXTC"),
      baseStudent("Kute Samrudhi Vinod", "21104B0027", "EXTC"),
      baseStudent("Pimpalkar Narendra Ajinkya", "21104B0028", "EXTC"),
      baseStudent("Sushil Sundar Mhapankar", "21104B0029", "EXTC"),
      baseStudent("Sonawane Parth Maneesh", "21104B0030", "EXTC"),
      baseStudent("Yadav Akshat Samarbahadur", "21104B0032", "EXTC"),
      baseStudent("Deshpande Aboli Uday", "21104B0033", "EXTC"),
      baseStudent("Sabjifros Mohammed Aman", "21104B0034", "EXTC"),
      baseStudent("Nigam Abhishek", "21104B0035", "EXTC"),
      baseStudent("Hange Sandeep Sahebrao", "21104B0036", "EXTC"),
      baseStudent("Ashokkumar Yadav", "21104B0038", "EXTC"),
      baseStudent("Baikar Aniket Mahesh", "21104B0039", "EXTC"),
      baseStudent("Srushti Chhagan Nagrale", "21104B0041", "EXTC"),
      baseStudent("Prithvi Vinayak P", "21104B0044", "EXTC"),
      baseStudent("Sanskruti Sandip Patil", "21104B0047", "EXTC"),
      baseStudent("Patil Antara Sunil", "21104B0051", "EXTC"),
      baseStudent("Patil Veershree Ankush", "21104B0052", "EXTC"),
      baseStudent("Jangale Pratik Dnyaneshwar", "21104B0055", "EXTC"),
      baseStudent("Akshada Anand Sohani", "21104B0056", "EXTC"),
      baseStudent("Isame Gaurav Arun", "21104B0057", "EXTC"),
      baseStudent("Harsh Hemant Teli", "21104B0059", "EXTC"),
      baseStudent("Salvi Tanvi Sanjay", "21104B0060", "EXTC"),
      baseStudent("Amin Yash Rajesh", "21104B0061", "EXTC"),
      baseStudent("Yadav Prakanshi Rajaram", "21104B0063", "EXTC"),
      baseStudent("Veeraj Honaji Morajkar", "21104B0064", "EXTC"),
      baseStudent("Pandey Nishant", "21104B0066", "EXTC"),
      baseStudent("Patel Kapish Chetan", "21104B0069", "EXTC"),
      baseStudent("Govindula Pragnya Srinivas", "21104B0070", "EXTC"),
      baseStudent("Suryavanshi Prem Sunil", "21104B0071", "EXTC"),
      baseStudent("Nikam Supriya", "21104B0072", "EXTC"),
      baseStudent("Javkhedkar Vinayak Avinash", "22104B2003", "EXTC"),
      baseStudent("Terde Shivam Vikram", "22104B2004", "EXTC"),
      baseStudent("Thakur Mithila Dinesh", "22104B2005", "EXTC"),
      baseStudent("Chaturvedi Rishabh Rakesh", "22104B2006", "EXTC"),
      baseStudent("Chaitanya Narayan Shewale", "22104B2007", "EXTC"),
      baseStudent("Zinjad Gayatri Gorakshanath", "22104B2009", "EXTC"),
      baseStudent("Kakade Dinesh Dilip", "22104B2010", "EXTC"),
      baseStudent("Singh Aditya", "22104B2012", "EXTC"),
    ];

    await Student.insertMany(students);

    console.log(
      `Seeded ${students.length} students: ` +
        `${students.filter((s) => s.department === "ETRX").length} ETRX, ` +
        `${students.filter((s) => s.department === "ETRX").length} ETRX`,
    );

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedDatabase();
