const authService = require('../services/auth.service');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Call service
      const result = await authService.login(email, password);

      res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  async signup(req, res) {
    try {
      const { firstName, lastName, email, password, confirmPassword } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      // Call service
      const result = await authService.signup(firstName, lastName, email, password, confirmPassword);

      res.status(201).json(result);
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Signup failed',
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Validate email
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      // Call service
      const result = await authService.forgotPassword(email);

      res.status(200).json(result);
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send reset OTP',
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      // Validate required fields
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, OTP, and new password are required',
        });
      }

      // Call service
      const result = await authService.resetPassword(email, otp, newPassword);

      res.status(200).json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Password reset failed',
      });
    }
  }
}

module.exports = new AuthController();
