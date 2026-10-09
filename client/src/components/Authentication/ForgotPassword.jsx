import React, { useState } from "react";

import PropTypes from "prop-types";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import {
  forgotPassword,
  resetPassword,
} from "../../api/auth";

function ForgotPassword({ open, handleClose }) {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await forgotPassword({
        email,
      });

      setMessage(response.message);

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        email,
        otp,
        password,
      });

      setMessage(response.message);

      setTimeout(() => {
        handleClose();

        setStep(1);
        setEmail("");
        setOtp("");
        setPassword("");
        setMessage("");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    handleClose();

    setStep(1);
    setEmail("");
    setOtp("");
    setPassword("");
    setMessage("");
    setError("");
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      PaperProps={{
        component: "form",
        onSubmit:
          step === 1
            ? handleSendOtp
            : handleResetPassword,
      }}
    >
      <DialogTitle>
        Reset Password
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        {step === 1 ? (
          <>
            <DialogContentText>
              Enter your email address. We will send
              you a password reset OTP.
            </DialogContentText>

            <TextField
              autoFocus
              required
              fullWidth
              label="Email address"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </>
        ) : (
          <>
            <DialogContentText>
              Enter the OTP sent to:
            </DialogContentText>

            <strong>{email}</strong>

            <TextField
              autoFocus
              required
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              inputProps={{
                maxLength: 6,
              }}
            />

            <TextField
              required
              fullWidth
              label="New Password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </>
        )}

        {error && (
          <DialogContentText color="error">
            {error}
          </DialogContentText>
        )}

        {message && (
          <DialogContentText color="green">
            {message}
          </DialogContentText>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          pb: 3,
          px: 3,
        }}
      >
        <Button onClick={closeDialog}>
          Cancel
        </Button>

        <Button
          variant="contained"
          type="submit"
          disabled={loading}
        >
          {step === 1
            ? loading
              ? "Sending..."
              : "Send OTP"
            : loading
            ? "Resetting..."
            : "Reset Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;