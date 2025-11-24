const branchService = require('../services/branchService');
const responseHandler = require('../utils/responseHandler');

const getBranches = async (req, res, next) => {
  console.log("\n🟦 [Controller] getBranches() triggered");

  try {
    const { userRole, userBranchId, isSuperAdmin } = req.accessFilters;
    const filters = req.queryFilters;
    console.log("🔎 Filters:", { userRole, userBranchId, isSuperAdmin, filters });

    let branches;

    if (isSuperAdmin) {
      console.log("🆔 Role: SuperAdmin - Fetching ALL branches...");
      branches = await branchService.getAllBranches();
      console.log(`📦 Total Branches Retrieved: ${branches?.length}`);
    } else {
      console.log(`🆔 Role: ${userRole} - Fetching ONLY branchId: ${userBranchId}`);
      branches = await branchService.getBranchById(userBranchId);
      branches = branches ? [branches] : [];
      console.log(`📦 Branch Retrieved Count: ${branches.length}`);
    }

    responseHandler.success(res, 'Branches fetched successfully', { branches });
  } catch (error) {
    console.error("❌ [Controller Error] getBranches():", error);
    next(error);
  }
};

const createBranch = async (req, res, next) => {
  console.log("\n🟩 [Controller] createBranch() triggered");

  try {
    const branchData = req.body;
    console.log("📥 Received Body:", branchData);

    if (req.file) {
      console.log("📸 Image Uploaded via Cloudinary =>", req.file?.path);
      branchData.branch_image = req.file.path;
    }

    // Auto link admin by superadmin when missing
    if (req.user.role === 'superadmin' && !branchData.adminId) {
      console.log("👑 SuperAdmin Creating Branch, auto-linking adminId =", req.user.id);
      branchData.adminId = req.user.id;
    }

    // Convert frontend fields
    console.log("🔄 Mapping Frontend fields -> DB fields");
    branchData.operatingHours = branchData.hours;
    branchData.holidays = branchData.holidayList ? JSON.stringify(branchData.holidayList) : null;

    console.log("💾 Calling Service: createBranch()");
    const branch = await branchService.createBranch(branchData, req.user.id);

    console.log("🎉 Branch Created:", branch?.id);
    responseHandler.success(res, 'Branch created successfully', { branch });
  } catch (error) {
    console.error("❌ [Controller Error] createBranch():", error);
    next(error);
  }
};

const updateBranch = async (req, res, next) => {
  console.log("\n🟨 [Controller] updateBranch() triggered");

  try {
    const { id } = req.params;
    const branchData = req.body;
    console.log("🔐 Id:", id, "\n📥 Body:", branchData);

    if (req.file) {
      console.log("📸 Updating Image =>", req.file?.path);
      branchData.branch_image = req.file.path;
    }

    console.log("💾 Calling Service: updateBranch()");
    const branch = await branchService.updateBranch(id, branchData);

    console.log("♻️ Branch Updated:", branch?.id);
    responseHandler.success(res, 'Branch updated successfully', { branch });
  } catch (error) {
    console.error("❌ [Controller Error] updateBranch():", error);
    next(error);
  }
};

const deleteBranch = async (req, res, next) => {
  console.log("\n🟥 [Controller] deleteBranch() triggered");

  try {
    const { id } = req.params;
    console.log("🧹 Deleting Branch Id:", id);

    await branchService.deleteBranch(id);

    console.log("🗑️ Branch Deleted Successfully");
    responseHandler.success(res, 'Branch deleted successfully');
  } catch (error) {
    console.error("❌ [Controller Error] deleteBranch():", error);
    next(error);
  }
};

const getAvailableAdmins = async (req, res, next) => {
  console.log("\n🟪 [Controller] getAvailableAdmins() triggered");

  try {
    console.log("🔍 Fetching Available Admins...");
    const admins = await branchService.getAvailableAdmins();

    console.log("📌 Admins Found:", admins?.length);
    responseHandler.success(res, 'Available admins fetched successfully', { admins });
  } catch (error) {
    console.error("❌ [Controller Error] getAvailableAdmins():", error);
    next(error);
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getAvailableAdmins,
};
