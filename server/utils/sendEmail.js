const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4, // use IPv4 (family: 6 times out on networks without IPv6)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
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

    // Development only: print the OTP so you can keep testing even if the email is late or lost
    if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV] ${type} OTP for ${email}: ${otp}`);
    }

    const info = await transporter.sendMail({
        from: `"PaperLingo" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
        text: `Your OTP for ${purpose} is ${otp}. It expires in 10 minutes.`,
    });

    // What Gmail actually answered. If "accepted" has the address, Gmail took the mail.
    console.log(
        `[MAIL] ${type} to ${email} | accepted: ${JSON.stringify(info.accepted)} | rejected: ${JSON.stringify(info.rejected)} | response: ${info.response}`
    );

    return info;
};

module.exports = { sendOTPEmail };