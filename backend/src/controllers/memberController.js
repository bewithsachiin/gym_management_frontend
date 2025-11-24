const bcrypt = require("bcrypt");
const memberService = require("../services/memberService");

module.exports = {

  // ----------------------------------------------------
  // 📌 GET ALL MEMBERS
  // ----------------------------------------------------
  getMembers: async (req, res) => {
    try {
      // Use access filters from middleware
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
        data: members,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 GET SINGLE MEMBER
  // ----------------------------------------------------
  getMemberById: async (req, res) => {
    try {
      const id = req.params.id;
      const branchId = req.user.branchId;
      const isSuperAdmin = req.user.role === "superadmin";

      const member = await memberService.getMemberByIdService(
        id,
        branchId,
        isSuperAdmin
      );

      if (!member) {
        return res
          .status(404)
          .json({ success: false, message: "Member not found" });
      }

      return res.json({
        success: true,
        message: "Member fetched successfully",
        data: member,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 CREATE MEMBER
  // ----------------------------------------------------
  createMember: async (req, res) => {
    try {
      const data = req.body;

      // Add image (Cloudinary)
      if (req.file) data.photo = req.file.path;

      // Hash password
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      // Force user role to "member" (secure)
      data.role = "member";

      // Set branchId from access filters for admin
      const { userRole, userBranchId } = req.accessFilters;
      if (userRole === "admin" && !data.branchId) {
        data.branchId = userBranchId;
      }

      const newMember = await memberService.createMemberService(data);

      return res.status(201).json({
        success: true,
        message: "Member created successfully",
        data: newMember,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 UPDATE MEMBER
  // ----------------------------------------------------
  updateMember: async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;

      // Update image only if new file uploaded
      if (req.file) {
        data.photo = req.file.path;
      }

      // Update password (hash if sent)
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      } else {
        delete data.password; // prevent setting empty password
      }

      // Ensure branch cannot be changed for admin users
      const { userRole } = req.accessFilters;
      if (userRole === "admin") {
        delete data.branchId; // Prevent branch changes
      }

      const updatedMember = await memberService.updateMemberService(id, data);

      return res.json({
        success: true,
        message: "Member updated successfully",
        data: updatedMember,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 ACTIVATE / DEACTIVATE MEMBER
  // ----------------------------------------------------
  activateMember: async (req, res) => {
    try {
      const id = req.params.id;

      const updated = await memberService.activateMemberService(id);

      if (!updated)
        return res.status(404).json({
          success: false,
          message: "Member not found",
        });

      return res.json({
        success: true,
        message: "Member activation status updated",
        data: updated,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 DELETE MEMBER
  // ----------------------------------------------------
  deleteMember: async (req, res) => {
    try {
      const id = req.params.id;

      await memberService.deleteMemberService(id);

      return res.json({
        success: true,
        message: "Member deleted successfully",
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 GET MEMBER PROFILE
  // ----------------------------------------------------
  getMemberProfile: async (req, res) => {
    try {
      const id = req.params.id;

      const member = await memberService.getMemberProfileService(id);

      if (!member) {
        return res
          .status(404)
          .json({ success: false, message: "Member not found" });
      }

      return res.json({
        success: true,
        message: "Member profile fetched successfully",
        data: member,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 GET MY PROFILE (for member self-service)
  // ----------------------------------------------------
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const member = await memberService.getMyProfileService(userId);

      if (!member) {
        return res
          .status(404)
          .json({ success: false, message: "Member not found" });
      }

      return res.json({
        success: true,
        message: "Member profile fetched successfully",
        data: member,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 UPDATE MY PROFILE (for member self-service)
  // ----------------------------------------------------
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Update image only if new file uploaded
      if (req.file) {
        data.profile_picture = req.file.path;
      }

      const updatedMember = await memberService.updateMyProfileService(userId, data);

      return res.json({
        success: true,
        message: "Member profile updated successfully",
        data: updatedMember,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },


  // ----------------------------------------------------
  // 📌 CHANGE MY PASSWORD (for member self-service)
  // ----------------------------------------------------
  changeMyPassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const result = await memberService.changeMyPasswordService(userId, currentPassword, newPassword);

      return res.json({
        success: true,
        message: result.message,
      });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
