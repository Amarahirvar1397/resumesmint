const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "Not specified",
    },
    jobType: {
      type: String,
      default: "Not specified",
    },
    salary: {
      type: String,
      default: "Not disclosed",
    },
    applyUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Interview", "Offer", "Rejected", "Withdrawn"],
      default: "Applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for same user and job
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
