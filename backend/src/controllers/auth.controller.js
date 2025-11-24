const authService = require('../services/auth.service');

const login = async (req, res) => {
  console.log("▶️ [Controller] login");

  try {
    const { email, password } = req.body;
    console.log("📥 Input:", { email });

    if (!email || !password) {
      console.log("⚠️ Missing fields");
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await authService.login(email, password);
    console.log("✅ Login Success:", result.user?.id);
    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

const signup = async (req, res) => {
  console.log("▶️ [Controller] signup");

  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    console.log("📥 Input:", { email });

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      console.log("⚠️ Missing signup fields");
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const result = await authService.signup(firstName, lastName, email, password, confirmPassword);
    console.log("🎉 Signup Success:", result.user?.id);
    return res.status(201).json(result);

  } catch (error) {
    console.error("❌ Signup Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Signup failed',
    });
  }
};

const forgotPassword = async (req, res) => {
  console.log("▶️ [Controller] forgotPassword");

  try {
    const { email } = req.body;
    console.log("📥 Input:", { email });

    if (!email) {
      console.log("⚠️ Missing email for OTP");
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await authService.forgotPassword(email);
    console.log("📨 OTP Sent:", email);
    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to send reset OTP',
    });
  }
};

const resetPassword = async (req, res) => {
  console.log("▶️ [Controller] resetPassword");

  try {
    const { email, otp, newPassword } = req.body;
    console.log("📥 Input:", { email, otp });

    if (!email || !otp || !newPassword) {
      console.log("⚠️ Missing reset fields");
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
      });
    }

    const result = await authService.resetPassword(email, otp, newPassword);
    console.log("🔐 Password Reset Success:", email);
    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ Reset Password Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Password reset failed',
    });
  }
};

module.exports = {
  login,
  signup,
  forgotPassword,
  resetPassword,
};
