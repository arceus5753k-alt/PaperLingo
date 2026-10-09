import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState(1);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/auth/forgot-password`,
        {
          email,
        }
      );

      setMessage(response.data.message);

      setStep(2);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not send OTP"
      );
    }
  };

  const verifyOTP = async () => {
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/auth/verify-reset-otp`,
        {
          email,
          otp,
        }
      );

      setMessage(response.data.message);

      setStep(3);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    }
  };

  const resetPassword = async () => {
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/auth/reset-password`,
        {
          email,
          otp,
          newPassword,
        }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        window.location.href = "/signin";
      }, 1500);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not reset password"
      );
    }
  };

  return (
    <div
      style={{
        width: "400px",
        margin: "100px auto",
      }}
    >
      <h1>Forgot Password</h1>

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {step === 1 && (
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <button onClick={sendOTP}>
            SEND OTP
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>
            OTP sent to {email}
          </p>

          <input
            placeholder="Enter OTP"
            value={otp}
            maxLength={6}
            onChange={(e) =>
              setOtp(e.target.value)
            }
          />

          <button onClick={verifyOTP}>
            VERIFY OTP
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
          />

          <button onClick={resetPassword}>
            RESET PASSWORD
          </button>
        </div>
      )}
    </div>
  );
}