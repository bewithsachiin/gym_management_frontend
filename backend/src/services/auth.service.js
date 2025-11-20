const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { sendResetOtpEmail } = require('../utils/nodemailer');

// LOGIN
const login = async (email, password) => {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: true },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // JWT Token
    const token = generateToken({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
    });

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
    throw error;
  }
};

// SIGNUP
const signup = async (firstName, lastName, email, password, confirmPassword) => {
  try {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'MEMBER',
      },
    });

    // Token
    const token = generateToken({
      id: newUser.id,
      name: `${newUser.firstName} ${newUser.lastName}`,
      email: newUser.email,
      role: newUser.role,
      branchId: newUser.branchId,
    });

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
    throw error;
  }
};

// FORGOT PASSWORD
const forgotPassword = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Expiration: 15 minutes
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000);

    // Save OTP in DB
    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExp: expirationTime,
      },
    });

    // Send Email
    await sendResetOtpEmail(email, otp);

    return {
      success: true,
      message: 'Password reset OTP sent to your email',
    };
  } catch (error) {
    throw error;
  }
};

// RESET PASSWORD
const resetPassword = async (email, otp, newPassword) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Validate OTP
    if (user.resetOtp !== otp) {
      throw new Error('Invalid OTP');
    }

    if (!user.resetOtpExp || user.resetOtpExp < new Date()) {
      throw new Error('OTP has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password + clear OTP
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExp: null,
      },
    });

    return {
      success: true,
      message: 'Password reset successful',
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  login,
  signup,
  forgotPassword,
  resetPassword,
};
