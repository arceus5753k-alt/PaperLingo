import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  TextField,
  Typography,
  Container,
} from "@mui/material";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const ConfirmPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/auth/confirmpassword/${id}/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update password."
        );
      }

      alert(data.message || "Password updated successfully.");
      navigate("/signin");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#222",
        padding: 4,
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "#fff", mb: 2 }}
      >
        Reset Password
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          padding: 3,
          width: "100%",
          backgroundColor: "#333",
          borderRadius: 2,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          boxSizing: "border-box",
        }}
      >
        {error && (
          <Typography
            role="alert"
            sx={{ color: "#ff7777", width: "100%" }}
          >
            {error}
          </Typography>
        )}

        <FormControl fullWidth>
          <TextField
            type="password"
            label="New Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            inputProps={{ minLength: 6 }}
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{
              style: { color: "#fff", backgroundColor: "#444" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
        </FormControl>

        <FormControl fullWidth>
          <TextField
            type="password"
            label="Confirm Password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            inputProps={{ minLength: 6 }}
            InputLabelProps={{ style: { color: "#aaa" } }}
            InputProps={{
              style: { color: "#fff", backgroundColor: "#444" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            mt: 2,
            backgroundColor: "#555",
            color: "#fff",
            "&:hover": { backgroundColor: "#666" },
            borderRadius: "8px",
            paddingX: 3,
          }}
        >
          {loading ? "UPDATING..." : "Submit"}
        </Button>
      </Box>
    </Container>
  );
};

export default ConfirmPassword;