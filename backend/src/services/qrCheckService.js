const prisma = require('../config/db');
const logger = require('../utils/logger');

class QRCheckService {
  /**
   * Validate QR code data
   * @param {Object} qrData - Parsed QR code data
   * @param {number} scannerBranchId - Branch ID of the scanner
   * @returns {Object} Validation result
   */
  async validateQR(qrData, scannerBranchId) {
    try {
      const now = new Date();
      const issuedAt = new Date(qrData.issued_at);
      const expiresAt = new Date(qrData.expires_at);

      // Check if QR has expired
      if (now > expiresAt) {
        logger.warn(`QR code expired: nonce=${qrData.nonce}, issued=${issuedAt}, expires=${expiresAt}`);
        return { valid: false, reason: 'QR code has expired' };
      }

      // Check if nonce has been used before
      const existingCheck = await prisma.qRCheck.findUnique({
        where: { nonce: qrData.nonce }
      });

      if (existingCheck) {
        logger.warn(`QR code nonce already used: nonce=${qrData.nonce}`);
        return { valid: false, reason: 'QR code has already been used' };
      }

      // Find member or staff by ID
      let person = null;
      let personType = null;

      if (qrData.member_id) {
        person = await prisma.member.findUnique({
          where: { id: parseInt(qrData.member_id) },
          include: { user: true, branch: true }
        });
        personType = 'member';
      } else if (qrData.staff_id) {
        person = await prisma.staff.findUnique({
          where: { id: parseInt(qrData.staff_id) },
          include: { user: true, branch: true }
        });
        personType = 'staff';
      }

      if (!person) {
        logger.warn(`Person not found: member_id=${qrData.member_id}, staff_id=${qrData.staff_id}`);
        return { valid: false, reason: 'Person not found' };
      }

      // Check if person is active
      if (person.status !== 'Active') {
        logger.warn(`Person not active: ${personType}_id=${person.id}, status=${person.status}`);
        return { valid: false, reason: 'Person account is not active' };
      }

      // Check branch isolation
      if (person.branchId !== scannerBranchId) {
        logger.warn(`Branch mismatch: person_branch=${person.branchId}, scanner_branch=${scannerBranchId}`);
        return { valid: false, reason: 'Branch access denied' };
      }

      return {
        valid: true,
        person,
        personType,
        qrData
      };
    } catch (error) {
      logger.error(`QR validation error: ${error.message}`);
      return { valid: false, reason: 'Validation error occurred' };
    }
  }

  /**
   * Process check-in/out logic
   * @param {Object} validationResult - Result from validateQR
   * @param {number} scannerId - ID of the user scanning the QR
   * @returns {Object} Check-in/out result
   */
  async processCheckInOut(validationResult, scannerId) {
    const { person, personType, qrData } = validationResult;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      // Check current attendance status for today
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          [personType === 'member' ? 'memberId' : 'staffId']: person.id,
          date: today
        }
      });

      let action = 'checkin';
      let attendanceRecord = existingAttendance;

      if (existingAttendance && existingAttendance.checkInTime && !existingAttendance.checkOutTime) {
        // Currently checked in, so check out
        action = 'checkout';
        attendanceRecord = await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            checkOutTime: now,
            totalHours: (now - existingAttendance.checkInTime) / (1000 * 60 * 60), // hours
            status: 'completed'
          }
        });
      } else if (!existingAttendance) {
        // First check-in of the day
        attendanceRecord = await prisma.attendance.create({
          data: {
            [personType === 'member' ? 'memberId' : 'staffId']: person.id,
            branchId: person.branchId,
            date: today,
            checkInTime: now,
            status: 'active'
          }
        });
      } else {
        // Already checked out today, this shouldn't happen but handle gracefully
        logger.warn(`Attempted check-in but already checked out today: ${personType}_id=${person.id}`);
        return { success: false, message: 'Already checked out for today' };
      }

      // Create QR check record
      const qrCheckRecord = await prisma.qRCheck.create({
        data: {
          [personType === 'member' ? 'memberId' : 'staffId']: person.id,
          branchId: person.branchId,
          nonce: qrData.nonce,
          issuedAt: new Date(qrData.issued_at),
          expiresAt: new Date(qrData.expires_at),
          scannedAt: now,
          action,
          status: 'valid',
          scannedBy: scannerId
        }
      });

      logger.info(`QR check processed: action=${action}, ${personType}_id=${person.id}, scanner_id=${scannerId}`);

      return {
        success: true,
        action,
        attendance: attendanceRecord,
        qrCheck: qrCheckRecord,
        person: {
          id: person.id,
          name: `${person.user.firstName} ${person.user.lastName}`,
          type: personType
        }
      };
    } catch (error) {
      logger.error(`Check-in/out processing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get today's QR check history for a branch
   * @param {number} branchId - Branch ID
   * @returns {Array} Today's QR checks
   */
  async getTodayHistory(branchId) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    try {
      const qrChecks = await prisma.qRCheck.findMany({
        where: {
          branchId,
          scannedAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        include: {
          member: {
            include: { user: true }
          },
          staff: {
            include: { user: true }
          },
          scanner: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { scannedAt: 'desc' }
      });

      return qrChecks.map(check => ({
        id: check.id,
        action: check.action,
        scannedAt: check.scannedAt,
        person: check.member ? {
          id: check.member.id,
          name: `${check.member.user.firstName} ${check.member.user.lastName}`,
          type: 'member'
        } : {
          id: check.staff.id,
          name: `${check.staff.user.firstName} ${check.staff.user.lastName}`,
          type: 'staff'
        },
        scanner: check.scanner ? `${check.scanner.firstName} ${check.scanner.lastName}` : null
      }));
    } catch (error) {
      logger.error(`Error fetching QR history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get attendance records for a person
   * @param {number} personId - Person ID
   * @param {string} personType - 'member' or 'staff'
   * @returns {Array} Attendance records
   */
  async getAttendanceHistory(personId, personType) {
    try {
      const attendances = await prisma.attendance.findMany({
        where: {
          [personType === 'member' ? 'memberId' : 'staffId']: personId
        },
        include: {
          branch: { select: { name: true } }
        },
        orderBy: { date: 'desc' }
      });

      return attendances;
    } catch (error) {
      logger.error(`Error fetching attendance history: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new QRCheckService();
