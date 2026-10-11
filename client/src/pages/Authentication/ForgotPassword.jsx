import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  LockReset,
  MailOutline,
  ArrowBack,
  MarkEmailRead,
} from "@mui/icons-material";
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../../api/auth";

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  background:
    "radial-gradient(circle at 15% 15%, rgba(99,102,241,.18), transparent 32%), radial-gradient(circle at 85% 85%, rgba(139,92,246,.12), transparent 30%), #080d1b",
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    color: "#f8fafc",
    backgroundColor: "rgba(255,255,255,.035)",
    "& fieldset": { borderColor: "#303b53" },
    "&:hover fieldset": { borderColor: "#818cf8" },
    "&.Mui-focused fieldset": { borderColor: "#818cf8" },
  },
  "& .MuiInputLabel-root": { color: "#9ba8c0" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#a5b4fc" },
};

const buttonStyle = {
  mt: 1,
  py: 1.5,
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "15px",
  background: "linear-gradient(100deg,#6366f1,#8b5cf6)",
  boxShadow: "0 8px 24px rgba(99,102,241,.2)",
  "&:hover": {
    background: "linear-gradient(100deg,#4f46e5,#7c3aed)",
  },
};



export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  

  const sendOTP = async (e) => {
    e.preventDefault();
    clearAlerts();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword({ email: normalizedEmail });
      setEmail(normalizedEmail);
      setOtp("");
      setStep(2);
      setMessage(result.message || "OTP sent. Check your email.");
    } catch (err) {
      setError(err.message || "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    clearAlerts();
    setLoading(true);
    try {
      const result = await forgotPassword({ email });
      setOtp("");
      setMessage(result.message || "A new OTP has been sent.");
    } catch (err) {
      setError(err.message || "Could not resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyResetOtp({ email, otp });
      setResetToken(result.resetToken);
      setOtp("");
      setStep(3);
    } catch (err) {
      setError(err.message || "Could not verify the code.");
    } finally {
      setLoading(false);
    }
  };

  

  const handleReset = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({ resetToken, newPassword: password });
      setMessage(result.message || "Password reset successfully.");
      setResetToken("");
      setPassword("");
      setConfirmPassword("");
      setStep(4);
    } catch (err) {
      setError(err.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    1: "Forgot password?",
    2: "Check your email",
    3: "Choose a new password",
    4: "You're all set!",
  };

  const descriptions = {
    1: "Enter your registered email address and we'll send you a verification code.",
    2: `Enter the 6-digit code we sent to ${email}.`,
    3: "Your code was verified. Choose a new password for your account.",
    4: "Your password has been changed successfully. You can now sign in.",
  };

  return (
    <Box sx={pageStyle}>
      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          boxSizing: "border-box",
          borderRadius: "24px",
          color: "#f8fafc",
          background:
            "linear-gradient(145deg,rgba(22,31,54,.97),rgba(13,19,36,.98))",
          border: "1px solid rgba(148,163,184,.16)",
          boxShadow: "0 25px 80px rgba(0,0,0,.42)",
        }}
      >
        <Box
          sx={{
            width: 54,
            height: 54,
            mb: 3,
            borderRadius: "16px",
            display: "grid",
            placeItems: "center",
            color: "#c7d2fe",
            background: "rgba(99,102,241,.17)",
            border: "1px solid rgba(129,140,248,.25)",
          }}
        >
          {step === 1 ? (
            <LockReset sx={{ fontSize: 29 }} />
          ) : (
            <MarkEmailRead sx={{ fontSize: 29 }} />
          )}
        </Box>

        <Typography
          component="h1"
          sx={{ fontSize: { xs: 28, sm: 32 }, fontWeight: 800, letterSpacing: -1, mb: 1 }}
        >
          {titles[step]}
        </Typography>

        <Typography sx={{ color: "#9ba8c0", fontSize: 14, lineHeight: 1.8, mb: 3 }}>
          {descriptions[step]}
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2, overflowWrap: "anywhere" }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, overflowWrap: "anywhere" }}>
            {error}
          </Alert>
        )}

        {step === 1 && (
          <Box component="form" onSubmit={sendOTP}>
            <TextField
              autoFocus
              required
              fullWidth
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={inputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutline sx={{ color: "#818cf8" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={buttonStyle}>
              {loading ? <CircularProgress size={22} color="inherit" /> : "Send verification code"}
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box component="form" onSubmit={handleVerifyOtp} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              autoFocus
              required
              fullWidth
              label="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputProps={{
                maxLength: 6,
                inputMode: "numeric",
                autoComplete: "one-time-code",
                pattern: "[0-9]{6}",
              }}
              disabled={loading}
              sx={inputStyle}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1 }}>
              <Button type="button" onClick={resendOTP} disabled={loading} sx={{ color: "#a5b4fc", textTransform: "none" }}>
                Resend code
              </Button>
            </Box>
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={buttonStyle}>
              {loading ? <CircularProgress size={22} color="inherit" /> : "Verify code"}
            </Button>
          </Box>
        )}

        {step === 3 && (
          <Box component="form" onSubmit={handleReset} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              autoFocus
              required
              fullWidth
              type="password"
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{ minLength: 6, autoComplete: "new-password" }}
              disabled={loading}
              sx={inputStyle}
            />
            <TextField
              required
              fullWidth
              type="password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              inputProps={{ minLength: 6, autoComplete: "new-password" }}
              disabled={loading}
              sx={inputStyle}
            />
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={buttonStyle}>
              {loading ? <CircularProgress size={22} color="inherit" /> : "Reset password"}
            </Button>
          </Box>
        )}

        {step === 4 && (
          <Button component={Link} to="/signin" fullWidth variant="contained" sx={buttonStyle}>
            Back to sign in
          </Button>
        )}

        {step !== 4 && (
          <Button
            component={Link}
            to="/signin"
            startIcon={<ArrowBack />}
            sx={{ mt: 2, color: "#a5b4fc", textTransform: "none" }}
          >
            Back to sign in
          </Button>
        )}
      </Box>
    </Box>
  );
}