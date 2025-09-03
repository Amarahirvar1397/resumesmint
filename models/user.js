const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // 👈 Added unique username
  email: { type: String, required: true, unique: true },    // gmail (unique)
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },            // Email verification status
  otp: { type: String },          // Temporary OTP
  otpExpiry: { type: Date },      // OTP expiry time
  resetOtp: { type: String },     // Password reset OTP
  resetOtpExpiry: { type: Date }  // Reset OTP expiry time
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Remove the pre-save hook since we're handling password hashing in the controller

module.exports = mongoose.model("User", userSchema);
