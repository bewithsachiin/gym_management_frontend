const nodemailer = require("nodemailer");

// Create Email Connection
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your app password
  },
});

// Send OTP Email
function sendResetOtpEmail(to, otp) {
  if (!to) {
    throw new Error("Email is required");
  }
  if (!otp) {
    throw new Error("OTP is required");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Password Reset OTP",
    html:
      "<div style='font-family: Arial; max-width:600px; margin:0 auto;'>" +
      "<h2>Password Reset Request</h2>" +
      "<p>Your OTP for password reset is:</p>" +
      "<h1 style='color:#007bff; font-size:32px;'>" +
      otp +
      "</h1>" +
      "<p>This OTP will expire in 15 minutes.</p>" +
      "<p>If you didn't request this, please ignore this email.</p>" +
      "</div>",
  };

  return transporter
    .sendMail(mailOptions)
    .then(function () {
      console.log("OTP email sent successfully");
    })
    .catch(function (error) {
      console.log("Failed to send OTP email:", error);
      throw new Error("Could not send OTP email");
    });
}

module.exports = {
  sendResetOtpEmail: sendResetOtpEmail,
};
