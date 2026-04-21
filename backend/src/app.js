const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// List of allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://convocation-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Normalize origin by removing trailing slash
      const normalizedOrigin = origin.replace(/\/$/, "");

      // Check if origin is in allowed list
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // In development mode, allow all origins
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      // In production, reject unknown origins
      callback(new Error("CORS not allowed"));
    },
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
const studentRoutes = require("./routes/student.routes.js");
const qrRoutes = require("./routes/qr.routes.js");

app.use("/api/auth", authRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/qr", qrRoutes);

module.exports = app;
