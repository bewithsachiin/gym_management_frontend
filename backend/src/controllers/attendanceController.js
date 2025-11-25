const attendanceService = require("../services/attendanceService");

// ===============================
// 📌 GET ALL ATTENDANCE RECORDS
// ===============================
const getAttendances = async (req, res) => {
  try {
    const { userBranchId, isSuperAdmin } = req.accessFilters;

    // Query Filters
    const {
      search = "",
      memberId = null,
      memberName,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {
      memberId: memberId ? parseInt(memberId) : null,
      memberName,
      status,
      search,
    };

    const attendanceData = await attendanceService.getAttendancesService(
      userBranchId,
      filters,
      parseInt(page),
      parseInt(limit),
      isSuperAdmin
    );

    return res.json({
      success: true,
      message: "Attendance records fetched successfully",
      data: attendanceData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📌 GET SINGLE ATTENDANCE RECORD
// ===============================
const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userBranchId, isSuperAdmin } = req.accessFilters;

    const attendance = await attendanceService.getAttendanceByIdService(
      id,
      userBranchId,
      isSuperAdmin
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    return res.json({
      success: true,
      message: "Attendance record fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📌 CREATE ATTENDANCE RECORD
// ===============================
const createAttendance = async (req, res) => {
  try {
    const data = req.body;
    const { userBranchId } = req.accessFilters;

    // Enforce branch ownership
    data.branchId = userBranchId;

    const newRecord = await attendanceService.createAttendanceService(data);

    return res.status(201).json({
      success: true,
      message: "Attendance record created successfully",
      data: newRecord,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📌 UPDATE ATTENDANCE RECORD
// ===============================
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { userBranchId, isSuperAdmin } = req.accessFilters;

    const updated = await attendanceService.updateAttendanceService(
      id,
      data,
      userBranchId,
      isSuperAdmin
    );

    return res.json({
      success: true,
      message: "Attendance record updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📌 DELETE ATTENDANCE RECORD
// ===============================
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { userBranchId, isSuperAdmin } = req.accessFilters;

    await attendanceService.deleteAttendanceService(id, userBranchId, isSuperAdmin);

    return res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 📌 MARK ATTENDANCE (CHECK-IN/CHECK-OUT)
// ===============================
const markAttendance = async (req, res) => {
  try {
    const { memberId, action, mode = "Manual", notes } = req.body;
    const { userBranchId } = req.accessFilters;

    const attendance = await attendanceService.markAttendanceService(
      memberId,
      action,
      mode,
      notes,
      userBranchId
    );

    return res.json({
      success: true,
      message: `Member ${action} successful`,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  markAttendance,
};
