const express = require("express");

const {
    registerUser,
    verifyEmail,
    resendVerificationOTP,
    loginUser,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
} = require("../controllers/authController");

const {
    getProfile,
    updateProfile,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationOTP);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;