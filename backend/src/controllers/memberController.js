"use strict";

const bcrypt = require("bcrypt");
const memberService = require("../services/memberService");

// -----------------------------------------------------
// SAFE NUMBER PARSER (runtime type check)
// -----------------------------------------------------
const toInt = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

module.exports = {
  // ----------------------------------------------------
  // GET ALL MEMBERS
  // ----------------------------------------------------
  getMembers: async (req, res) => {
    try {
      const { userBranchId, isSuperAdmin } = req.accessFilters;
      const search = req.query.search || "";

      const members = await memberService.getMembersService(
        userBranchId,
        search,
        isSuperAdmin
      );

      return res.json({
        success: true,
        message: "Members fetched successfully",
        data: members
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // GET SINGLE MEMBER
  // ----------------------------------------------------
  getMemberById: async (req, res) => {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: "Invalid member ID" });

      const branchId = req.user.branchId;
      const isSuperAdmin = req.user.role === "superadmin";

      const member = await memberService.getMemberByIdService(
        id,
        branchId,
        isSuperAdmin
      );

      if (!member) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      return res.json({
        success: true,
        message: "Member fetched successfully",
        data: member
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // CREATE MEMBER
  // ----------------------------------------------------
  createMember: async (req, res) => {
    try {
      const data = req.body;

      if (req.file) data.photo = req.file.path;

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      data.role = "member";

      const { userRole, userBranchId } = req.accessFilters;
      if (userRole === "admin" && !data.branchId) {
        data.branchId = userBranchId;
      }

      const newMember = await memberService.createMemberService(data);

      return res.status(201).json({
        success: true,
        message: "Member created successfully",
        data: newMember
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // UPDATE MEMBER
  // ----------------------------------------------------
  updateMember: async (req, res) => {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: "Invalid member ID" });

      const data = req.body;

      if (req.file) data.photo = req.file.path;

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      } else {
        delete data.password;
      }

      const { userRole } = req.accessFilters;
      if (userRole === "admin") {
        delete data.branchId;
      }

      const updatedMember = await memberService.updateMemberService(id, data);

      return res.json({
        success: true,
        message: "Member updated successfully",
        data: updatedMember
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // ACTIVATE/DEACTIVATE MEMBER
  // ----------------------------------------------------
  activateMember: async (req, res) => {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: "Invalid member ID" });

      const updated = await memberService.activateMemberService(id);

      if (!updated) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      return res.json({
        success: true,
        message: "Member activation status updated",
        data: updated
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // DELETE MEMBER
  // ----------------------------------------------------
  deleteMember: async (req, res) => {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: "Invalid member ID" });

      await memberService.deleteMemberService(id);

      return res.json({
        success: true,
        message: "Member deleted successfully"
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // GET MEMBER PROFILE (Admin/Trainer/Receptionist)
  // ----------------------------------------------------
  getMemberProfile: async (req, res) => {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: "Invalid member ID" });

      const member = await memberService.getMemberProfileService(id);

      if (!member) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      return res.json({
        success: true,
        message: "Member profile fetched successfully",
        data: member
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // GET MY PROFILE (Self service)
  // ----------------------------------------------------
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const member = await memberService.getMyProfileService(userId);

      if (!member) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }

      return res.json({
        success: true,
        message: "Member profile fetched successfully",
        data: member
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // UPDATE MY PROFILE (Self service)
  // ----------------------------------------------------
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;

      if (req.file) {
        data.profile_picture = req.file.path;
      }

      const updatedMember = await memberService.updateMyProfileService(userId, data);

      return res.json({
        success: true,
        message: "Member profile updated successfully",
        data: updatedMember
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // CHANGE MY PASSWORD (Self service)
  // ----------------------------------------------------
  changeMyPassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const result = await memberService.changeMyPasswordService(
        userId,
        currentPassword,
        newPassword
      );

      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // GET BRANCH PLANS (Self service)
  // ----------------------------------------------------
  getPlans: async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const type = req.query.type;

      const plans = await memberService.getBranchPlansService(branchId, type);

      return res.json({
        success: true,
        message: "Plans fetched successfully",
        data: plans
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // CREATE BOOKING (Self service)
  // ----------------------------------------------------
  createBooking: async (req, res) => {
    try {
      const memberId = req.user.id;
      const branchId = req.user.branchId;
      const { planId, paymentDetails } = req.body;

      if (!planId || !paymentDetails || !paymentDetails.upi) {
        return res.status(400).json({
          success: false,
          message: "Plan ID and UPI details are required"
        });
      }

      const result = await memberService.createBookingService(
        memberId,
        branchId,
        planId,
        paymentDetails
      );

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: result
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ----------------------------------------------------
  // GET MEMBER BOOKINGS (Self service)
  // ----------------------------------------------------
  getBookings: async (req, res) => {
    try {
      const memberId = req.user.id;
      const branchId = req.user.branchId;

      const bookings = await memberService.getMemberBookingsService(memberId, branchId);

      return res.json({
        success: true,
        message: "Bookings fetched successfully",
        data: bookings
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
