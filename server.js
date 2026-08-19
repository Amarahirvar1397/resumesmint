require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

// ===== Import Routes =====
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const jobsRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");

const app = express();
const PORT = process.env.PORT || 4000;

// ===== Middleware =====
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== Session =====
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey", // ✅ .env me rakho
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // ✅ Render ya Atlas ka URI
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 din
      secure: false, // agar https enable ho 
      httpOnly: true,
    },
  })
);

// ===== MongoDB connection =====
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    
    // Fix leftover username index
    try {
      const db = mongoose.connection.db;
      const collection = db.collection("users");
      await collection.dropIndex("username_1");
      console.log("✅ Dropped old username_1 index");
    } catch (error) {
      if (error.code === 26) {
        console.log("ℹ️  No old username index to drop");
      } else {
        console.log("ℹ️  Index check:", error.message);
      }
    }
    
    // Ensure Application model indexes are created
    try {
      const Application = require("./models/Application");
      await Application.createIndexes();
      console.log("✅ Application model indexes ensured");
    } catch (error) {
      console.log("ℹ️  Application indexes check:", error.message);
    }
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
  });

// ===== Logger (for debugging) =====
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// ===== Routes =====
app.use("/auth", authRoutes);              // Signup/Login/OTP
app.use("/api/resume", resumeRoutes);      // Resume CRUD
app.use("/api/jobs", jobsRoutes);          // Jobs API
app.use("/api/applications", applicationRoutes); // Job Applications
app.post("/api/seed-jobs", async (req, res) => {
  try {
    const Job = require("./models/Job");

    const jobs = [
      {
        title: "Frontend Developer",
        company: "TechNova Solutions",
        location: "Noida",
        jobType: "Full Time",
        experience: "0-2 Years",
        salary: "₹4-6 LPA",
        industry: "IT",
        skills: ["HTML", "CSS", "JavaScript", "React"],
        description: "Build responsive and modern web applications.",
        applyUrl: "#"
      },
      {
        title: "Backend Developer",
        company: "CodeSphere Technologies",
        location: "Delhi",
        jobType: "Full Time",
        experience: "1-3 Years",
        salary: "₹5-8 LPA",
        industry: "IT",
        skills: ["Node.js", "Express.js", "MongoDB", "REST API"],
        description: "Build scalable APIs and database-driven applications.",
        applyUrl: "#"
      },
      {
        title: "React Developer",
        company: "WebCraft India",
        location: "Gurgaon",
        jobType: "Full Time",
        experience: "0-2 Years",
        salary: "₹4-7 LPA",
        industry: "IT",
        skills: ["React", "JavaScript", "HTML", "CSS"],
        description: "Develop modern user interfaces using React.",
        applyUrl: "#"
      },
      {
        title: "JavaScript Developer",
        company: "DigitalWorks",
        location: "Noida",
        jobType: "Full Time",
        experience: "Fresher",
        salary: "₹3-5 LPA",
        industry: "IT",
        skills: ["JavaScript", "HTML", "CSS", "Git"],
        description: "Join our JavaScript development team.",
        applyUrl: "#"
      },
      {
        title: "Web Development Intern",
        company: "StartupHub",
        location: "Remote",
        jobType: "Internship",
        experience: "Fresher",
        salary: "₹10,000-15,000/month",
        industry: "IT",
        skills: ["HTML", "CSS", "JavaScript"],
        description: "Gain practical web development experience.",
        applyUrl: "#"
      },
      {
        title: "Full Stack Developer",
        company: "InnovateTech",
        location: "Bangalore",
        jobType: "Full Time",
        experience: "1-3 Years",
        salary: "₹6-10 LPA",
        industry: "IT",
        skills: ["React", "Node.js", "Express.js", "MongoDB"],
        description: "Build full-stack web applications.",
        applyUrl: "#"
      }
    ];

    await Job.deleteMany({});
    const insertedJobs = await Job.insertMany(jobs);

    res.json({
      success: true,
      message: `${insertedJobs.length} jobs inserted successfully`
    });

  } catch (error) {
    console.error("❌ Seed error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to seed jobs",
      error: error.message
    });
  }
});

// ===== Static files =====
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  return res.redirect("/login.html");
}

app.use((req, res, next) => {
  if (req.path === "/" || req.path === "/index.html" || req.path === "/fill.html") {
    return next();
  }

  express.static("public")(req, res, next);
});

app.get("/", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/index.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/fill.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "fill.html"));
});

// ===== Default route (homepage) =====

// ===== Server Start =====
app.listen(PORT, () => {
  console.log(`🚀 resumesmint running at http://localhost:${PORT}`);
});
