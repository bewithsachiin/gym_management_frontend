const authService = require("../services/auth.service");

// ============================================
// 📌 LOGIN
// ============================================
const login = async (req, res) => {
  console.log("▶️ [Controller] login");

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// ============================================
// 📌 SIGNUP
// ============================================
const signup = async (req, res) => {
  console.log("▶️ [Controller] signup");

  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validate mandatory fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const result = await authService.signup(
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      data: result,
    });
  } catch (error) {
    console.error("❌ Signup Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
};

// ============================================
// 📌 FORGOT PASSWORD (SEND OTP)
// ============================================
const forgotPassword = async (req, res) => {
  console.log("▶️ [Controller] forgotPassword");

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await authService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send reset OTP",
    });
  }
};

// ============================================
// 📌 RESET PASSWORD BY OTP
// ============================================
const resetPassword = async (req, res) => {
  console.log("▶️ [Controller] resetPassword");

  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    const result = await authService.resetPassword(email, otp, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
      data: result,
    });
  } catch (error) {
    console.error("❌ Reset Password Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Password reset failed",
    });
  }
};

// ============================================
// 📌 EXPORT FUNCTIONS
// ============================================
module.exports = {
  login,
  signup,
  forgotPassword,
  resetPassword,
};
