const express = require("express");
const router = express.Router();

// Debugging ke liye
const authCtrl = require("../controllers/authController");
console.log("Auth Controller Functions:", authCtrl);

// Destructure functions
const { signup, verifyOtp, login, forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
