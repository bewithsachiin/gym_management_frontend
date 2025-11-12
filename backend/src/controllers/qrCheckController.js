const qrCheckService = require('../services/qrCheckService');
const responseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');
const prisma = require('../config/db');

class QRCheckController {
  /**
   * Handle QR code check-in/out
   * POST /api/v1/qr-check/in
   */
  async checkInOut(req, res) {
    try {
      const { qrData } = req.body;
      const scannerId = req.user.id;
      const scannerBranchId = req.user.branchId;

      // Validate required fields
      if (!qrData) {
        return responseHandler.error(res, 'QR data is required', 400);
      }

      // Parse QR data if it's a string
      let parsedQRData;
      try {
        parsedQRData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      } catch (error) {
        logger.warn(`Invalid QR data format: ${error.message}`);
        return responseHandler.error(res, 'Invalid QR data format', 400);
      }

      // Validate QR code
      const validationResult = await qrCheckService.validateQR(parsedQRData, scannerBranchId);

      if (!validationResult.valid) {
        return responseHandler.error(res, validationResult.reason, 400);
      }

      // Process check-in/out
      const result = await qrCheckService.processCheckInOut(validationResult, scannerId);

      if (!result.success) {
        return responseHandler.error(res, result.message, 400);
      }

      logger.info(`QR check successful: action=${result.action}, person=${result.person.name}, scanner_id=${scannerId}`);

      responseHandler.success(res, `Successfully ${result.action === 'checkin' ? 'checked in' : 'checked out'} ${result.person.name}`, {
        action: result.action,
        person: result.person,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`QR check-in/out error: ${error.message}`);
      responseHandler.error(res, 'Failed to process QR check', 500);
    }
  }

  /**
   * Get today's QR check history
   * GET /api/v1/qr-check/history
   */
  async getHistory(req, res) {
    try {
      const branchId = req.user.branchId;

      if (!branchId) {
        return responseHandler.error(res, 'Branch access required', 403);
      }

      const history = await qrCheckService.getTodayHistory(branchId);

      responseHandler.success(res, 'QR check history retrieved successfully', { history });

    } catch (error) {
      logger.error(`Error fetching QR history: ${error.message}`);
      responseHandler.error(res, 'Failed to fetch QR history', 500);
    }
  }

  /**
   * Get attendance records for a user (admin view)
   * GET /api/v1/attendance/:userId
   */
  async getAttendance(req, res) {
    try {
      const { userId } = req.params;
      const requesterRole = req.user.role;
      const requesterBranchId = req.user.branchId;

      // Only admins and above can view attendance
      if (!['ADMIN', 'GENERALTRAINER', 'PERSONALTRAINER', 'SUPERADMIN'].includes(requesterRole)) {
        return responseHandler.error(res, 'Insufficient permissions', 403);
      }

      // Find the person (member or staff) by user ID
      let person = await prisma.member.findFirst({
        where: { userId: parseInt(userId) }
      });

      let personType = 'member';

      if (!person) {
        person = await prisma.staff.findFirst({
          where: { userId: parseInt(userId) }
        });
        personType = 'staff';
      }

      if (!person) {
        return responseHandler.error(res, 'Person not found', 404);
      }

      // Check branch access
      if (person.branchId !== requesterBranchId && requesterRole !== 'SUPERADMIN') {
        return responseHandler.error(res, 'Branch access denied', 403);
      }

      const attendance = await qrCheckService.getAttendanceHistory(person.id, personType);

      responseHandler.success(res, 'Attendance records retrieved successfully', {
        person: {
          id: person.id,
          name: `${person.user?.firstName} ${person.user?.lastName}`,
          type: personType
        },
        attendance
      });

    } catch (error) {
      logger.error(`Error fetching attendance: ${error.message}`);
      responseHandler.error(res, 'Failed to fetch attendance records', 500);
    }
  }
}

module.exports = new QRCheckController();
