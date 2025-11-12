# Implementation Plan

Implement a comprehensive QR code-based attendance system for gym members and staff, enabling secure check-in/out tracking with branch-based isolation and role-based access control.

The system will generate QR codes containing member/staff information with 60-second expiration, validate them server-side, and maintain attendance records in both real-time QRCheck logs and official Attendance tables for reporting and payroll purposes.

[Types]
No type system changes needed as this is JavaScript/Node.js.

[Files]
- backend/prisma/schema.prisma: Add QRCheck and Attendance models with proper relationships
- backend/src/controllers/qrCheckController.js: New controller for QR check-in/out logic
- backend/src/services/qrCheckService.js: New service for business logic and database operations
- backend/src/routes/qrCheckRoutes.js: New routes for QR check endpoints
- backend/src/app.js: Register new QR check routes
- backend/package.json: Add winston dependency for structured logging
- backend/src/utils/logger.js: New logger utility using Winston
- frontend/src/Dashboard/Admin/AdminQrCheckin.jsx: Update to send QR data to backend API
- frontend/src/utils/qrScanner.js: New utility for QR code scanning functionality

[Functions]
- backend/src/controllers/qrCheckController.js
  - checkInOut: Main endpoint handler for QR check-in/out
  - getHistory: Handler for retrieving today's QR logs
- backend/src/services/qrCheckService.js
  - validateQR: Validate QR expiry, nonce, branch, and member status
  - processCheckInOut: Handle check-in/out logic with transaction safety
  - createQRCheckRecord: Save to QRCheck table
  - createAttendanceRecord: Save to Attendance table
- frontend/src/Dashboard/Admin/AdminQrCheckin.jsx
  - sendQRToBackend: Send scanned QR data to API
  - handleScanResult: Process API response and update UI

[Classes]
No class modifications needed - using functional approach.

[Dependencies]
- winston: ^3.11.0 (for structured logging)
- qrcode: ^1.5.3 (for QR generation if needed on backend)

[Testing]
- Unit tests for QR validation logic
- Integration tests for check-in/out flow
- API tests for all QR check endpoints
- Frontend tests for QR scanning and API integration

[Implementation Order]
1. Update Prisma schema with QRCheck and Attendance models
2. Run Prisma migration
3. Add Winston dependency and create logger utility
4. Create QR check service with validation and business logic
5. Create QR check controller with endpoints
6. Create QR check routes and register in app.js
7. Update frontend AdminQrCheckin component to integrate with backend
8. Create QR scanner utility for frontend
9. Test complete check-in/out flow
10. Add error handling and logging throughout
