// routes/resume.js
const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ JWT middleware import

// Save resume data (🔒 protected)
router.post("/save", authMiddleware, resumeController.saveResume);

// Export resume (PDF/HTML) (🔒 protected)
router.get("/export/:id", authMiddleware, resumeController.exportResume);

module.exports = router;
