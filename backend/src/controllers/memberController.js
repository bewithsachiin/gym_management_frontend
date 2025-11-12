const memberService = require('../services/memberService');
const responseHandler = require('../utils/responseHandler');

const getMembers = async (req, res, next) => {
  try {
    const members = await memberService.getAllMembers();
    responseHandler.success(res, 'Members fetched successfully', { members });
  } catch (error) {
    next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const memberData = req.body;
    if (req.file) {
      memberData.profile_photo = req.file.path; // Cloudinary URL from middleware
    }
    const createdById = req.user.id; // Get creator ID from authenticated user
    const member = await memberService.createMember(memberData, createdById);
    responseHandler.success(res, 'Member created successfully', { member });
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const memberData = req.body;
    if (req.file) {
      memberData.profile_photo = req.file.path; // Cloudinary URL from middleware
    }
    const member = await memberService.updateMember(id, memberData);
    responseHandler.success(res, 'Member updated successfully', { member });
  } catch (error) {
    next(error);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    await memberService.deleteMember(id);
    responseHandler.success(res, 'Member deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
};
