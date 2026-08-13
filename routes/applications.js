const express = require("express");
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getApplicationCount,
  deleteApplication,
  checkApplicationStatus,
} = require("../controllers/applicationController");

// Create new application
router.post("/", createApplication);

// Get user's applications
router.get("/my", getMyApplications);

// Get user's application count
router.get("/count", getApplicationCount);

// Check if user has applied to a specific job
router.get("/check/:jobId", checkApplicationStatus);

// Delete application
router.delete("/:id", deleteApplication);

module.exports = router;
