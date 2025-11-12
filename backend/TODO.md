# Backend Implementation for Forgot Password with OTP

## Completed Tasks
- [x] Updated Prisma schema to add resetOtp and resetOtpExp fields to User model
- [x] Installed nodemailer package
- [x] Created utils/nodemailer.js with sendResetOtpEmail function
- [x] Added forgotPassword and resetPassword methods to auth.service.js
- [x] Added forgotPassword and resetPassword methods to auth.controller.js
- [x] Updated auth.routes.js to include new endpoints
- [x] Implemented OTP generation (6-digit random number)
- [x] Implemented OTP expiration logic (15 minutes)
- [x] Implemented email sending with HTML template
- [x] Implemented password hashing with bcrypt
- [x] Implemented proper error handling and validation

## Remaining Tasks
- [ ] Run Prisma migration to update database schema
- [ ] Set up environment variables for email (EMAIL_USER, EMAIL_PASS)
- [ ] Test the endpoints
- [ ] Update frontend to handle OTP instead of link (if needed)

## API Endpoints
- POST /api/auth/forgot-password
  - Body: { email: string }
  - Response: { success: true, message: "Password reset OTP sent to your email" }

- POST /api/auth/reset-password
  - Body: { email: string, otp: string, newPassword: string }
  - Response: { success: true, message: "Password reset successful" }

## Environment Variables Needed
- EMAIL_USER: Your Gmail address
- EMAIL_PASS: Your Gmail app password (not regular password)
- DATABASE_URL: Your MySQL database URL
- JWT_SECRET: Your JWT secret key
