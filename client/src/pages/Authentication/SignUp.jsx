import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:8000/api";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    age: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          age: Number(formData.age),
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // IMPORTANT:
      // Do NOT go to signin yet.
      // First verify the email using OTP.
      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.message || "Could not register user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f9fc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "#fff",
          padding: "35px",
          borderRadius: "8px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.12)",
        }}
      >
        <h1
          style={{
            fontSize: "38px",
            fontWeight: "400",
            marginBottom: "25px",
          }}
        >
          Sign up
        </h1>

        {error && (
          <p
            style={{
              color: "red",
              marginBottom: "15px",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>Name *</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label>Username *</label>

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label>Age *</label>

          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="1"
            style={inputStyle}
          />

          <label>Email *</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label>Password *</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "15px",
              border: "none",
              borderRadius: "5px",
              background: loading ? "#999" : "#333",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
            }}
          >
            {loading ? "SIGNING UP..." : "SIGN UP"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          Already have an account?{" "}
          <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  marginTop: "6px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
};

export default SignUp;