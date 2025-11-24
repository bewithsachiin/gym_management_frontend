const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { sendResetOtpEmail } = require('../utils/nodemailer');

// LOGIN
const login = async (email, password) => {
  console.log("▶️ [Service] login");

  try {
    console.log("🔎 Finding user:", email);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: true },
    });

    if (!user) {
      console.log("⛔ No user found");
      throw new Error('Invalid email or password');
    }

    console.log("🔑 Checking password");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("⛔ Invalid password");
      throw new Error('Invalid email or password');
    }

    console.log("🎟 Creating token");
    const token = generateToken({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    });

    console.log("🚀 Login Service Success");
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
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
      token,
    };
  } catch (error) {
    console.error("❌ Login Service Error:", error);
    throw error;
  }
};

// SIGNUP
const signup = async (firstName, lastName, email, password, confirmPassword) => {
  console.log("▶️ [Service] signup");

  try {
    console.log("🔎 Checking existing user:", email);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("⛔ Email exists");
      throw new Error('Email already exists');
    }

    console.log("🔐 Hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🆕 Creating user");
    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, role: 'member' },
    });


    console.log("🎟 Generating signup token");
    const token = generateToken({
      id: newUser.id,
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      role: newUser.role,
      branchId: newUser.branchId,
    });

    console.log("🎉 Signup Service Success");
    return {
      success: true,
      message: 'Signup successful',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    };
  } catch (error) {
    console.error("❌ Signup Service Error:", error);
    throw error;
  }
};

// FORGOT PASSWORD
const forgotPassword = async (email) => {
  console.log("▶️ [Service] forgotPassword");

  try {
    console.log("🔎 Checking user:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("⛔ User not found");
      throw new Error('User not found');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000);
    console.log("🔐 OTP Generated:", otp);

    console.log("💾 Storing OTP + Sending email");
    await Promise.all([
      prisma.user.update({
        where: { email },
        data: { resetOtp: otp, resetOtpExp: expirationTime },
      }),
      sendResetOtpEmail(email, otp),
    ]);

    console.log("📨 OTP Email sent!");
    return { success: true, message: 'Password reset OTP sent to your email' };

  } catch (error) {
    console.error("❌ Forgot Password Service Error:", error);
    throw error;
  }
};

// RESET PASSWORD
const resetPassword = async (email, otp, newPassword) => {
  console.log("▶️ [Service] resetPassword");

  try {
    console.log("🔎 Verifying user:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("⛔ User not found");
      throw new Error('User not found');
    }

    console.log("🔍 Checking OTP");
    if (user.resetOtp !== otp) {
      console.log("⛔ Invalid OTP");
      throw new Error('Invalid OTP');
    }

    if (!user.resetOtpExp || user.resetOtpExp < new Date()) {
      console.log("⏳ OTP Expired");
      throw new Error('OTP has expired');
    }

    console.log("🔐 Hashing new password");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log("💾 Updating password");
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, resetOtp: null, resetOtpExp: null },
    });

    console.log("🔄 Password Reset Service Completed");
    return { success: true, message: 'Password reset successful' };

  } catch (error) {
    console.error("❌ Reset Password Service Error:", error);
    throw error;
  }
};

module.exports = {
  login,
  signup,
  forgotPassword,
  resetPassword,
};
