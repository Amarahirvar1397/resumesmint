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
app.use(
  session({
    secret: process.env.SESSION_SECRET || "227f3e1318f74e461dc25a412321042d00fb4afa5ad00759aa7ef008d0c8579bfe6f0f2fa301906ef7eb82aae8975d330868c470f44e9b721dceebff7662ab", // ✅ .env me rakho
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // ✅ Render ya Atlas ka URI
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 din
      secure: false, // agar https enable ho to true karna
      httpOnly: true,
    },
  })
);

// ===== MongoDB connection =====
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://ahirwaramar685:Mom1977@cluster0.iblxmai.mongodb.net/project0?retryWrites=true&w=majority&appName=Cluster0")
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
