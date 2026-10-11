const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 45000,
});

const sendOTPEmail = async (email, otp, type) => {
    let subject;
    let heading;
    let purpose;

    if (type === "verify") {
        subject = "PaperLingo - Email Verification OTP";
        heading = "PaperLingo Email Verification";
        purpose = "verifying your PaperLingo account";
    } else if (type === "reset") {
        subject = "PaperLingo - Password Reset OTP";
        heading = "PaperLingo Password Reset";
        purpose = "resetting your PaperLingo password";
    } else {
        throw new Error("Invalid email type");
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("EMAIL_USER or EMAIL_PASS is missing");
    }

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>${heading}</h2>
            <p>Hello,</p>
            <p>Your OTP for ${purpose} is:</p>
            <h1 style="letter-spacing: 8px; font-size: 32px;">${otp}</h1>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
        </div>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"PaperLingo" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html,
            text: `Your OTP for ${purpose} is ${otp}. It expires in 10 minutes.`,
        });

        console.log(
            `[MAIL] ${type} email sent. Accepted: ${JSON.stringify(info.accepted)}`
        );

        return info;
    } catch (error) {
        console.error("[MAIL] SMTP sending failed:", {
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            message: error.message,
        });

        throw error;
    }
};

module.exports = { sendOTPEmail };