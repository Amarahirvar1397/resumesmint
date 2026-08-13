require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
console.log("🌱 seedJobs.js started");
require("dotenv").config();
const mongoose = require("mongoose");
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
    description:
      "We are looking for a frontend developer to build responsive and modern web applications.",
    applyUrl: "https://example.com/apply"
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
    description:
      "Join our backend team and work on scalable APIs and database-driven applications.",
    applyUrl: "https://example.com/apply"
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
    description:
      "Develop modern user interfaces using React and JavaScript.",
    applyUrl: "https://example.com/apply"
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
    description:
      "Looking for a passionate JavaScript developer to join our development team.",
    applyUrl: "https://example.com/apply"
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
    description:
      "Work with our development team and gain practical web development experience.",
    applyUrl: "https://example.com/apply"
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
    description:
      "Build full-stack web applications using modern JavaScript technologies.",
    applyUrl: "https://example.com/apply"
  }
];

async function seedJobs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    await Job.deleteMany();

    await Job.insertMany(jobs);

    console.log(`✅ ${jobs.length} jobs inserted successfully`);

    await mongoose.connection.close();

    console.log("✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error seeding jobs:", error);
  }
}

seedJobs();