import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const API = "http://localhost:8000/api";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email || !otp) {
      setError("Please enter your email and OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      setMessage("Email verified successfully!");

      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Could not verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setResending(true);

      const response = await fetch(
        `${API}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not resend OTP.");
      }

      setMessage("New OTP sent to your email.");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
      }}
    >
      <div
        style={{
          width: "400px",
          padding: "40px",
          background: "white",
          borderRadius: "10px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h1>Verify Email</h1>

        <p>
          Enter the OTP sent to your email.
        </p>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {message && (
          <p style={{ color: "green" }}>
            {message}
          </p>
        )}

        <form onSubmit={verifyOTP}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <label>OTP</label>

          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "VERIFYING..." : "VERIFY OTP"}
          </button>
        </form>

        <button
          onClick={resendOTP}
          disabled={resending}
          style={{
            ...buttonStyle,
            background: "#666",
            marginTop: "10px",
          }}
        >
          {resending ? "SENDING..." : "RESEND OTP"}
        </button>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/signin">Back to Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  marginBottom: "18px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  border: "none",
  borderRadius: "5px",
  background: "#333",
  color: "white",
  cursor: "pointer",
  fontSize: "15px",
};

export default VerifyOTP;