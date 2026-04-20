const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set in environment variables");
  }

  if (mongoose.connection.readyState === 1) {
    console.log("MongoDB already connected");
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    console.log("MongoDB connection is in progress");
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
