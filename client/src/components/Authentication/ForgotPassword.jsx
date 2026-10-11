import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://paperlingo-api.onrender.com/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

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

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/auth/forgot-password`,
        { email: normalizedEmail }
      );

      setEmail(normalizedEmail);
      setOtp("");
      setStep(2);
      setMessage(
        response.data.message || "OTP sent to your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    clearAlerts();

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/auth/forgot-password`,
        { email: email.trim().toLowerCase() }
      );

      setOtp("");
      setMessage(
        response.data.message || "A new OTP has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the latest 6-digit OTP from your email.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/auth/reset-password`,
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }
      );

      setMessage(
        response.data.message ||
          "Password reset successfully."
      );

      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "400px",
        maxWidth: "calc(100% - 32px)",
        margin: "100px auto",
        color: "#222",
      }}
    >
      <h1>
        {step === 1
          ? "Forgot Password"
          : step === 2
          ? "Reset Password"
          : "Password Reset Successful"}
      </h1>

      {message && (
        <p
          role="status"
          style={{
            color: "green",
            overflowWrap: "anywhere",
          }}
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          style={{
            color: "red",
            overflowWrap: "anywhere",
          }}
        >
          {error}
        </p>
      )}

      {step === 1 && (
        <form onSubmit={sendOTP}>
          <p>Enter your registered email to receive an OTP.</p>

          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "SENDING..." : "SEND OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={resetPassword}>
          <p>Enter the latest OTP sent to {email}.</p>

          <label htmlFor="forgot-otp">6-digit OTP</label>
          <input
            id="forgot-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(/\D/g, "").slice(0, 6)
              )
            }
            disabled={loading}
            style={inputStyle}
          />

          <button
            type="button"
            onClick={resendOTP}
            disabled={loading}
            style={{
              ...buttonStyle,
              background: "#555",
            }}
          >
            {loading ? "PLEASE WAIT..." : "RESEND OTP"}
          </button>

          <label htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            style={inputStyle}
          />

          <label htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            disabled={loading}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? "RESETTING..."
              : "VERIFY OTP & RESET PASSWORD"}
          </button>
        </form>
      )}

      {step === 3 && (
        <div>
          <p>You can now sign in with your new password.</p>
          <Link to="/signin">Back to Sign in</Link>
        </div>
      )}

      {step !== 3 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/signin">Back to Sign in</Link>
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  marginBottom: "18px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
  color: "#222",
  backgroundColor: "#fff",
};

const buttonStyle = {
  display: "block",
  width: "100%",
  padding: "13px",
  marginBottom: "18px",
  border: "none",
  borderRadius: "5px",
  background: "#333",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
};

export default ForgotPassword;