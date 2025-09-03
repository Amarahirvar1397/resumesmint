const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // 🔑 .env में रखें

// ===== Nodemailer Transporter =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "ahirwaramar685@gmail.com", // Gmail
    pass: process.env.EMAIL_PASS || "your-app-password"  // App password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ===== Generate 6-digit OTP =====
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ===== Test email connection =====
async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log("✅ Email server connection verified");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    return false;
  }
}

// ====================== SIGNUP ======================
exports.signup = async (req, res) => {
  try {
    console.log("📝 Signup request body:", req.body);
    const { username, email, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        received: { username: !!username, email: !!email, password: !!password }
      });
    }

    // check existing user
    const existingUser = await User.findOne({
      $or: [{ username: new RegExp(`^${username}$`, "i") }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ msg: "Username or Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    // create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000 // 5 min expiry
    });

    await user.save();

    // Test email connection first
    const emailConnectionOk = await testEmailConnection();
    
    // Send OTP email
    try {
      const mailOptions = {
        from: `"resumesmint" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "resumesmint - Email Verification OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; text-align: center; margin-bottom: 20px;">🎯 Welcome to resumesmint!</h2>
              <p style="color: #666; font-size: 16px;">Thank you for signing up! To complete your registration, please verify your email address.</p>
              <p style="color: #666; font-size: 16px;">Your email verification OTP is:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 3px;">${otp}</span>
              </div>
              <p style="color: #dc3545; font-weight: bold; text-align: center;">⏰ This OTP will expire in 5 minutes.</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">If you didn't request this verification, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">resumesmint - Create Professional Resumes</p>
            </div>
          </div>
        `
      };

      if (!emailConnectionOk) {
        throw new Error("Email server connection failed");
      }

      const info = await transporter.sendMail(mailOptions);
      console.log("📧 OTP email sent successfully to:", email);
      console.log("📧 Message ID:", info.messageId);
      
      return res.status(201).json({ 
        msg: "Signup successful! Please check your email for OTP verification.",
        note: "OTP sent to your email address",
        emailSent: true
      });
    } catch (emailError) {
      console.error("❌ Email Error:", emailError.message);
      console.error("❌ Full Error:", emailError);
      
      // Still create user but show OTP in response
      return res.status(201).json({ 
        msg: "Signup successful! Email delivery failed, but here's your OTP:",
        otp: otp,
        note: "Please save this OTP for verification. Check your email settings.",
        emailSent: false,
        emailError: emailError.message
      });
    }
  } catch (err) {
    console.error("❌ Signup Error:", err);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
};

// ====================== VERIFY OTP ======================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // clear OTP and mark as verified
    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;
    await user.save();

    // Generate JWT token for automatic login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Set HttpOnly cookie
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });

    return res.json({ 
      msg: "OTP verified successfully! You are now logged in.",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ OTP Verification Error:", err);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
};

// ====================== LOGIN ======================
exports.login = async (req, res) => {
  try {
    console.log("🔑 Login request body:", req.body);
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        received: { email: !!email, password: !!password }
      });
    }
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        msg: "Please verify your email first before logging in",
        needsVerification: true 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // set HttpOnly cookie (secure if https)
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });

    return res.json({ 
      msg: "Login successful", 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
};

// ====================== FORGOT PASSWORD ======================
exports.forgotPassword = async (req, res) => {
  try {
    console.log("🔑 Forgot password request:", req.body);
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "No account found with this email" });
    }

    // Generate reset OTP
    const resetOtp = generateOTP();
    user.resetOtp = resetOtp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send reset OTP email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "resumesmint - Password Reset OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🔐 Password Reset Request</h2>
            <p>You requested to reset your password. Your reset OTP is:</p>
            <h1 style="color: #dc3545; font-size: 48px; text-align: center; margin: 20px 0;">${resetOtp}</h1>
            <p><strong>This OTP will expire in 5 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">resumesmint - Create Professional Resumes</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log("📧 Reset OTP email sent successfully to:", email);
      
      return res.json({ 
        msg: "Password reset OTP sent to your email",
        note: "Reset OTP sent to your email address"
      });
    } catch (emailError) {
      console.error("❌ Reset Email Error:", emailError);
      return res.status(500).json({ 
        error: "Failed to send reset email. Please try again later.",
        fallbackOtp: resetOtp
      });
    }
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
};

// ====================== RESET PASSWORD ======================
exports.resetPassword = async (req, res) => {
  try {
    console.log("🔄 Reset password request:", req.body);
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Verify reset OTP
    if (user.resetOtp !== otp || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired reset OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset OTP
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return res.json({ msg: "Password reset successful! You can now login with your new password." });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
};


