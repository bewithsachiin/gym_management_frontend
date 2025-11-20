const memberService = require("../services/member.service");
const bcrypt = require("bcryptjs");

module.exports = {
  // Get all members
  getMembers: async (req, res) => {
    try {
      const branchId = Number(req.query.branchId) || req.user.branchId;
      const search = req.query.search || "";

      const members = await memberService.getMembersService(branchId, search);

      return res.json({
        success: true,
        message: "Members fetched successfully",
        data: { members },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get single member
  getMemberById: async (req, res) => {
    try {
      const member = await memberService.getMemberByIdService(req.params.id);

      if (!member)
        return res.status(404).json({ success: false, message: "Member not found" });

      return res.json({
        success: true,
        message: "Member fetched successfully",
        data: { member },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create member
  createMember: async (req, res) => {
    try {
      const body = req.body;

      // Cloudinary URL
      if (req.file) body.photo = req.file.path;

      body.password = await bcrypt.hash(body.password, 10);

      const newMember = await memberService.createMemberService(body);

      return res.status(201).json({
        success: true,
        message: "Member created successfully",
        data: { member: newMember },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update member
  updateMember: async (req, res) => {
    try {
      const body = req.body;

      // Only update image if new one uploaded
      if (req.file) body.photo = req.file.path;

      if (body.password) {
        body.password = await bcrypt.hash(body.password, 10);
      } else {
        delete body.password;
      }

      const updated = await memberService.updateMemberService(req.params.id, body);

      return res.json({
        success: true,
        message: "Member updated successfully",
        data: { member: updated },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Toggle activation
  toggleActivation: async (req, res) => {
    try {
      const updated = await memberService.toggleActivationService(req.params.id);

      return res.json({
        success: true,
        message: "Member activation updated",
        data: { member: updated },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Delete member
  deleteMember: async (req, res) => {
    try {
      await memberService.deleteMemberService(req.params.id);

      return res.json({
        success: true,
        message: "Member deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
