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

  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
    throw new Error("BREVO_API_KEY or EMAIL_USER is missing");
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>${heading}</h2>
      <p>Hello,</p>
      <p>Your OTP for ${purpose} is:</p>
      <h1 style="letter-spacing: 8px; font-size: 32px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "PaperLingo", email: process.env.EMAIL_USER },
        to: [{ email }],
        subject,
        htmlContent,
        textContent: `Your OTP for ${purpose} is ${otp}. It expires in 10 minutes.`,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        `Brevo error ${response.status}: ${data.message || "unknown error"}`
      );
    }

    console.log(`[MAIL] ${type} email sent. messageId: ${data.messageId}`);
    return data;
  } catch (error) {
    console.error("[MAIL] Brevo sending failed:", error.message);
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

module.exports = { sendOTPEmail };