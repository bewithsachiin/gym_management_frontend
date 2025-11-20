const reportsService = require('../services/reportsService');
const responseHandler = require('../utils/responseHandler');

// Get sales reports
const getSalesReports = async (req, res, next) => {
  try {
    const { userRole, userBranchId } = req.accessFilters;
    const filters = req.query;

    console.log(`📊 Reports Controller - Get sales reports - Role: ${userRole}, Branch: ${userBranchId}, Filters:`, filters);

    const reports = await reportsService.getSalesReports(filters, userBranchId, userRole);
    console.log(`📊 Sales reports generated successfully`);

    responseHandler.success(res, 'Sales reports fetched successfully', { reports });
  } catch (error) {
    console.error('❌ Reports Controller Error:', error);
    next(error);
  }
};

// Export sales reports as CSV
const exportSalesReports = async (req, res, next) => {
  try {
    const { userRole, userBranchId } = req.accessFilters;
    const filters = req.query;

    console.log(`📊 Reports Controller - Export sales reports - Role: ${userRole}, Branch: ${userBranchId}, Filters:`, filters);

    const csvData = await reportsService.exportSalesReports(filters, userBranchId, userRole);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales_report_${new Date().toISOString().split('T')[0]}.csv"`);

    res.send(csvData);
  } catch (error) {
    console.error('❌ Reports Controller Export Error:', error);
    next(error);
  }
};

module.exports = {
  getSalesReports,
  exportSalesReports,
};
