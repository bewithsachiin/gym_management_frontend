const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { sendResetOtpEmail } = require('../utils/nodemailer');

class AuthService {
  async login(email, password) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          branch: true,
        },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
      });

      // Return user data and token
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          branchId: user.branchId,
          branch: user.branch ? {
            id: user.branch.id,
            name: user.branch.name,
            code: user.branch.code,
            address: user.branch.address,
            phone: user.branch.phone,
            email: user.branch.email,
            status: user.branch.status,
          } : null,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async signup(firstName, lastName, email, password, confirmPassword) {
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: 'MEMBER',
        },
      });

      // Generate JWT token
      const token = generateToken({
        id: newUser.id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: newUser.role,
        branchId: newUser.branchId,
      });

      // Return response
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
  }

  async forgotPassword(email) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate 6-digit OTP
      const otp = crypto.randomInt(100000, 999999).toString();

      // Set expiration time (15 minutes from now)
      const expirationTime = new Date(Date.now() + 15 * 60 * 1000);

      // Save OTP and expiration in database
      await prisma.user.update({
        where: { email },
        data: {
          resetOtp: otp,
          resetOtpExp: expirationTime,
        },
      });

      // Send OTP via email
      await sendResetOtpEmail(email, otp);

      return {
        success: true,
        message: 'Password reset OTP sent to your email',
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(email, otp, newPassword) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if OTP matches and is not expired
      if (user.resetOtp !== otp) {
        throw new Error('Invalid OTP');
      }

      if (!user.resetOtpExp || user.resetOtpExp < new Date()) {
        throw new Error('OTP has expired');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear OTP
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
  }
}

module.exports = new AuthService();
