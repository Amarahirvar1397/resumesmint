const Application = require("../models/Application");

// Create new application
exports.createApplication = async (req, res) => {
  try {
    const { jobId, jobTitle, company, location, jobType, salary, applyUrl } = req.body;

    // Validate required fields
    if (!jobId || !jobTitle || !company || !applyUrl) {
      return res.status(400).json({
        message: "Job ID, title, company, and apply URL are required",
      });
    }

    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: "You must be logged in to apply for jobs",
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      userId: req.session.userId,
      jobId: jobId,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied to this job",
      });
    }

    // Create new application
    const application = new Application({
      userId: req.session.userId,
      jobId,
      jobTitle,
      company,
      location: location || "Not specified",
      jobType: jobType || "Not specified",
      salary: salary || "Not disclosed",
      applyUrl,
      status: "Applied",
    });

    await application.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Error creating application:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied to this job",
      });
    }

    res.status(500).json({
      message: "Server error during application",
    });
  }
};

// Get user's applications
exports.getMyApplications = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: "You must be logged in to view your applications",
      });
    }

    const applications = await Application.find({
      userId: req.session.userId,
    }).sort({ appliedAt: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      message: "Server error fetching applications",
    });
  }
};

// Get user's application count
exports.getApplicationCount = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: "You must be logged in to view application count",
      });
    }

    const count = await Application.countDocuments({
      userId: req.session.userId,
    });

    res.status(200).json({
      count,
    });
  } catch (error) {
    console.error("Error fetching application count:", error);
    res.status(500).json({
      message: "Server error fetching application count",
    });
  }
};

// Delete application
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: "You must be logged in to delete applications",
      });
    }

    // Find application and ensure it belongs to the user
    const application = await Application.findOne({
      _id: id,
      userId: req.session.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found or you don't have permission to delete it",
      });
    }

    await Application.deleteOne({ _id: id });

    res.status(200).json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({
      message: "Server error deleting application",
    });
  }
};

// Check if user has applied to a specific job
exports.checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: "You must be logged in to check application status",
      });
    }

    const application = await Application.findOne({
      userId: req.session.userId,
      jobId: jobId,
    });

    res.status(200).json({
      applied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error("Error checking application status:", error);
    res.status(500).json({
      message: "Server error checking application status",
    });
  }
};
