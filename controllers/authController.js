const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ResumesMint Email Verification OTP",
      text: `Your ResumesMint verification OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Server error during signup",
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      !user.otp ||
      user.otp !== otp ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      message: "Server error during OTP verification",
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    req.session.userId = user._id;

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:4000"}/reset-password.html?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ResumesMint Password Reset",
      text: `Reset your password using this link: ${resetLink}`,
    });

    res.status(200).json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Server error during password reset",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Server error during password reset",
    });
  }
};

module.exports = {
  signup,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
};
