import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, MarkEmailRead, VerifiedUser } from "@mui/icons-material";
import apiClient from "../../services/apiClient";

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

const getErrorMessage = (err, fallback) => {
  if (err.response) {
    return (
      err.response.data?.message || `Server error: HTTP ${err.response.status}`
    );
  }
  if (err.request) {
    return "Cannot reach the backend server. Check that your backend is running on port 8000.";
  }
  return err.message || fallback;
};

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  

  const email = (location.state?.email || "").trim().toLowerCase();

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  

  useEffect(() => {
    if (!verified) return undefined;
    const timer = setTimeout(() => navigate("/signin", { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [verified, navigate]);

  

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/verify-email", {
        email,
        otp,
      });
      setMessage(response.data?.message || "Email verified successfully.");
      setVerified(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not verify your email."));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    clearAlerts();
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/resend-verification", {
        email,
      });
      setOtp("");
      setMessage(response.data?.message || "A new code has been sent.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err, "Could not resend the code."));
    } finally {
      setLoading(false);
    }
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
          {verified ? (
            <VerifiedUser sx={{ fontSize: 29 }} />
          ) : (
            <MarkEmailRead sx={{ fontSize: 29 }} />
          )}
        </Box>

        <Typography
          component="h1"
          sx={{ fontSize: { xs: 28, sm: 32 }, fontWeight: 800, letterSpacing: -1, mb: 1 }}
        >
          {verified ? "Email verified!" : "Verify your email"}
        </Typography>

        <Typography sx={{ color: "#9ba8c0", fontSize: 14, lineHeight: 1.8, mb: 3 }}>
          {verified
            ? "Your account is ready. Taking you to sign in..."
            : `Enter the 6-digit code we sent to ${email}.`}
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

        {!verified && (
          <Box
            component="form"
            onSubmit={handleVerify}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
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
              <Button
                type="button"
                onClick={handleResend}
                disabled={loading || cooldown > 0}
                sx={{ color: "#a5b4fc", textTransform: "none" }}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </Button>
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={buttonStyle}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Verify email"}
            </Button>
          </Box>
        )}

        {verified ? (
          <Button
            component={Link}
            to="/signin"
            fullWidth
            variant="contained"
            sx={buttonStyle}
          >
            Go to sign in
          </Button>
        ) : (
          <Button
            component={Link}
            to="/signup"
            startIcon={<ArrowBack />}
            sx={{ mt: 2, color: "#a5b4fc", textTransform: "none" }}
          >
            Back to sign up
          </Button>
        )}
      </Box>
    </Box>
  );
}