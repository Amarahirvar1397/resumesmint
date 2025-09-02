require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

// ===== Import Routes =====
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const jobsRoutes = require("./routes/jobs");

const app = express();
const PORT = process.env.PORT || 4000;

// ===== Middleware =====
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== Session =====
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // ✅ Set true if using HTTPS
}));

// ===== MongoDB connection =====
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resumifyx")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ DB connection error:", err);
  console.log("💡 Make sure MongoDB Atlas is configured properly");
  console.log("💡 Check your .env file and MONGO_URI");
});

// ===== Logger (for debugging) =====
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// ===== Routes =====
app.use("/auth", authRoutes);         // Signup/Login/OTP
app.use("/api/resume", resumeRoutes); // Resume CRUD
app.use("/api/jobs", jobsRoutes);     // Jobs API

// ===== Static files =====
app.use(express.static("public"));
app.use("/templates", express.static(path.join(__dirname, "public/templates")));

// ===== Default route (homepage) =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== Server Start =====
app.listen(PORT, () => {
  console.log(`🚀 resumesmint running at http://localhost:${PORT}`);
});
