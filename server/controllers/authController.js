const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const { sendOTPEmail } = require("../utils/sendEmail");

const MAX_OTP_ATTEMPTS = 5;

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}







const registerUser = async (req, res) => {
  try {
    const { name, username, age, email, password } = req.body;

    if (!name || !username || !age || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingEmail = await User.findOne({ email: normalizedEmail });

    if (existingEmail) {
      if (existingEmail.isVerified) {
        return res.status(400).json({ message: "Email already registered" });
      }

      

      const otp = generateOTP();

      existingEmail.verificationOTP = otp;
      existingEmail.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);

      await existingEmail.save();
      await sendOTPEmail(normalizedEmail, otp, "verify");

      return res.status(200).json({
        message: "Account already exists but is not verified. New OTP sent.",
        requiresVerification: true,
        email: normalizedEmail,
      });
    }

    const existingUsername = await User.findOne({ username: username.trim() });

    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = new User({
      name: name.trim(),
      username: username.trim(),
      age: Number(age),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verificationOTP: otp,
      verificationOTPExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await user.save();
    await sendOTPEmail(normalizedEmail, otp, "verify");

    return res.status(201).json({
      message: "Registration successful. OTP sent to your email.",
      requiresVerification: true,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Could not register user. Please try again.",
    });
  }
};







const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (!user.verificationOTP) {
      return res.status(400).json({
        message: "No OTP found. Please request a new OTP.",
      });
    }

    if (!user.verificationOTPExpires || user.verificationOTPExpires < new Date()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.verificationOTP !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;

    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Could not verify email" });
  }
};







const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const otp = generateOTP();

    user.verificationOTP = otp;
    user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();
    await sendOTPEmail(user.email, otp, "verify");

    return res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Could not send OTP" });
  }
};







const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        requiresVerification: true,
        email: user.email,
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        age: user.age,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Could not login" });
  }
};







const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    

    if (user && user.isVerified) {
      const otp = generateOTP();

      user.resetOTP = otp;
      user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.resetOTPAttempts = 0;

      await user.save();
      await sendOTPEmail(user.email, otp, "reset");
    }

    return res.status(200).json({
      message: "If an account exists for this email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Could not send reset OTP" });
  }
};







const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    const invalid = () =>
      res.status(400).json({ message: "Invalid or expired code" });

    if (
      !user ||
      !user.resetOTP ||
      !user.resetOTPExpires ||
      user.resetOTPExpires < new Date()
    ) {
      return invalid();
    }

    if ((user.resetOTPAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      user.resetOTP = null;
      user.resetOTPExpires = null;
      user.resetOTPAttempts = 0;
      await user.save();

      return res.status(429).json({
        message: "Too many wrong attempts. Please request a new code.",
      });
    }

    if (user.resetOTP !== otp.toString().trim()) {
      user.resetOTPAttempts = (user.resetOTPAttempts || 0) + 1;
      await user.save();
      return invalid();
    }

    

    user.resetOTP = null;
    user.resetOTPExpires = null;
    user.resetOTPAttempts = 0;
    await user.save();

    

    const resetToken = jwt.sign(
      {
        id: user._id,
        purpose: "password-reset",
        fp: user.password.slice(-12),
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({ message: "Code verified", resetToken });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return res.status(500).json({ message: "Could not verify code" });
  }
};







const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const expired = () =>
      res.status(400).json({
        message: "Reset session expired. Please start again.",
      });

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return expired();
    }

    if (payload.purpose !== "password-reset") {
      return expired();
    }

    const user = await User.findById(payload.id);

    if (!user || user.password.slice(-12) !== payload.fp) {
      return expired();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Could not reset password" });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationOTP,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};