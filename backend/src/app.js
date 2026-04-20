const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "All Good! Backend is running.",
  });
});

const authRoutes = require("./routes/auth.routes.js");
const scanRoutes = require("./routes/scan.routes.js");
const adminRoutes = require("./routes/admin.routes.js");

app.use("/api/auth", authRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
