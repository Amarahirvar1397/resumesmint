// routes/resume.js
const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");

// Save resume data (now public)
router.post("/save", resumeController.saveResume);

// Export resume (PDF/HTML) (now public)
router.get("/export/:id", resumeController.exportResume);

module.exports = router;
