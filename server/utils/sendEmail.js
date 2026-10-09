const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 6,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
});

const sendOTPEmail = async (email, otp, type) => {
  let subject = "";
  let html = "";

  if (type === "verify") {
    subject = "PaperLingo - Email Verification OTP";

    html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>PaperLingo Email Verification</h2>

        <p>Hello,</p>

        <p>Your OTP for verifying your PaperLingo account is:</p>

        <h1 style="letter-spacing: 8px; font-size: 32px;">
          ${otp}
        </h1>

        <p>This OTP will expire in 10 minutes.</p>

        <p>If you did not create this account, you can safely ignore this email.</p>
      </div>
    `;
  }

  if (type === "reset") {
    subject = "PaperLingo - Password Reset OTP";

    html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>PaperLingo Password Reset</h2>

        <p>Hello,</p>

        <p>Your OTP for resetting your PaperLingo password is:</p>

        <h1 style="letter-spacing: 8px; font-size: 32px;">
          ${otp}
        </h1>

        <p>This OTP will expire in 10 minutes.</p>

        <p>If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;
  }

  if (!subject || !html) {
    throw new Error("Invalid email type");
  }

  const mailOptions = {
    from: `"PaperLingo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTPEmail,
};