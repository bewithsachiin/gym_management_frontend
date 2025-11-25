const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/db");
const { generateToken } = require("../utils/jwt");
const { sendResetOtpEmail } = require("../utils/nodemailer");

// =====================================================
// 📌 LOGIN SERVICE
// =====================================================
const login = async (email, password) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email },
    include: { branch: true },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    name: user.firstName + " " + user.lastName,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
  });

  // Clean response
  return {
    user: {
      id: user.id,
      name: user.firstName + " " + user.lastName,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branch: user.branch
        ? {
            id: user.branch.id,
            name: user.branch.name,
            code: user.branch.code,
            address: user.branch.address,
            phone: user.branch.phone,
            email: user.branch.email,
            status: user.branch.status,
          }
        : null,
    },
    token: token,
  };
};

// =====================================================
// 📌 SIGNUP SERVICE
// =====================================================
const signup = async (firstName, lastName, email, password, confirmPassword) => {
  // Email exists?
  const exists = await prisma.user.findUnique({ where: { email: email } });
  if (exists) {
    throw new Error("Email already exists");
  }

  // Password mismatch
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashed,
      role: "member",
    },
  });

  // Generate token
  const token = generateToken({
    id: user.id,
    name: user.firstName + " " + user.lastName,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
  });

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    token: token,
  };
};

// =====================================================
// 📌 FORGOT PASSWORD SERVICE (SEND OTP)
// =====================================================
const forgotPassword = async (email) => {
  // Check user
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    throw new Error("User not found");
  }

  // Random OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // valid for 15 mins

  // Save + send email
  await Promise.all([
    prisma.user.update({
      where: { email: email },
      data: { resetOtp: otp, resetOtpExp: expiry },
    }),
    sendResetOtpEmail(email, otp),
  ]);

  return { message: "Password reset OTP sent to your email" };
};

// =====================================================
// 📌 RESET PASSWORD SERVICE
// =====================================================
const resetPassword = async (email, otp, newPassword) => {
  // Check user
  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    throw new Error("User not found");
  }

  // Validate OTP
  if (user.resetOtp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (!user.resetOtpExp || user.resetOtpExp < new Date()) {
    throw new Error("OTP has expired");
  }

  // Hash password
  const hashed = await bcrypt.hash(newPassword, 10);

  // Update password + clear OTP
  await prisma.user.update({
    where: { email: email },
    data: { password: hashed, resetOtp: null, resetOtpExp: null },
  });

  return { message: "Password reset successful" };
};

// =====================================================
// 📌 EXPORTS
// =====================================================
module.exports = {
  login,
  signup,
  forgotPassword,
  resetPassword,
};
