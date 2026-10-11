import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://paperlingo-api.onrender.com/api";

function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Login failed (${response.status}).`
        );
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/dashboard/home");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
          "Could not login. Please try again."
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
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "420px",
          maxWidth: "100%",
          background: "#fff",
          color: "#222",
          padding: "35px",
          borderRadius: "8px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            color: "#222",
            fontSize: "38px",
            fontWeight: "400",
            marginTop: 0,
            marginBottom: "25px",
          }}
        >
          Sign in
        </h1>

        {error && (
          <p
            role="alert"
            style={{
              color: "#d32f2f",
              marginBottom: "15px",
              overflowWrap: "anywhere",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="signin-email"
            style={{ display: "block", color: "#222" }}
          >
            Email *
          </label>

          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />

          <label
            htmlFor="signin-password"
            style={{ display: "block", color: "#222" }}
          >
            Password *
          </label>

          <input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />

          <div
            style={{
              textAlign: "right",
              marginBottom: "15px",
            }}
          >
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "5px",
              background: loading ? "#999" : "#333",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "15px",
            }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p
          style={{
            color: "#222",
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          Don't have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  marginTop: "6px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
  color: "#222",
  backgroundColor: "#fff",
};

export default SignIn;