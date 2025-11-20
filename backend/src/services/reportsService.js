const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// Get sales reports with filtering and aggregations
const getSalesReports = async (filters = {}, userBranchId = null, userRole = null) => {
  const { dateFrom, dateTo, branches, method, plan } = filters;

  // Build where clause for transactions
  const where = {};

  // Date range filter
  if (dateFrom && dateTo) {
    where.date = {
      gte: new Date(dateFrom),
      lte: new Date(dateTo),
    };
  }

  // Branch filter - superadmin can see all, others see their branch only
  if (userRole !== 'superadmin' && userBranchId) {
    where.branchId = parseInt(userBranchId);
  } else if (branches && branches !== 'All') {
    const branchIds = branches.split(',').map(id => parseInt(id.trim()));
    where.branchId = { in: branchIds };
  }

  // Method filter
  if (method && method !== 'All') {
    where.method = method;
  }

  // Plan filter
  if (plan && plan !== 'All') {
    // Check if it's a global plan or branch plan
    const planId = parseInt(plan);
    where.OR = [
      { planId: planId },
      { branchPlanId: planId }
    ];
  }

  // Fetch transactions with relations
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      plan: {
        select: {
          id: true,
          plan_name: true,
        },
      },
      branchPlan: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  // Compute KPIs
  const kpis = computeKPIs(transactions);

  // Revenue by day
  const byDay = computeRevenueByDay(transactions);

  // Revenue by branch
  const byBranch = computeRevenueByBranch(transactions);

  // Table data (aggregated by date and branch)
  const tableRows = computeTableRows(transactions);

  return {
    kpis,
    byDay,
    byBranch,
    tableRows,
    totalRecords: transactions.length,
  };
};

// Compute KPIs from transactions
const computeKPIs = (transactions) => {
  const gross = transactions.reduce((sum, t) => sum + t.revenue, 0);
  const refunds = transactions.reduce((sum, t) => sum + t.refunds, 0);
  const invoices = transactions.reduce((sum, t) => sum + t.invoices, 0);
  const net = gross - refunds;
  const avgTicket = invoices ? Math.round(gross / invoices) : 0;

  const online = transactions
    .filter((t) => ["UPI", "Card", "Netbanking", "Wallet", "Barcode", "Razorpay"].includes(t.method))
    .reduce((sum, t) => sum + t.revenue, 0);

  const pos = transactions
    .filter((t) => t.method === "Cash")
    .reduce((sum, t) => sum + t.revenue, 0);

  return {
    gross: Math.round(gross / 100), // Convert cents to rupees
    refunds: Math.round(refunds / 100),
    net: Math.round(net / 100),
    avgTicket: Math.round(avgTicket / 100),
    online: Math.round(online / 100),
    pos: Math.round(pos / 100),
    invoices,
  };
};

// Compute revenue by day
const computeRevenueByDay = (transactions) => {
  const map = new Map();

  transactions.forEach((t) => {
    const dateKey = t.date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const prev = map.get(dateKey) || { date: dateKey, revenue: 0 };
    prev.revenue += t.revenue;
    map.set(dateKey, prev);
  });

  return Array.from(map.values())
    .map(item => ({ ...item, revenue: Math.round(item.revenue / 100) })) // Convert to rupees
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Compute revenue by branch
const computeRevenueByBranch = (transactions) => {
  const map = new Map();

  transactions.forEach((t) => {
    const branchKey = t.branch.name;
    const prev = map.get(branchKey) || { branch: branchKey, revenue: 0 };
    prev.revenue += t.revenue;
    map.set(branchKey, prev);
  });

  return Array.from(map.values())
    .map(item => ({ ...item, revenue: Math.round(item.revenue / 100) })) // Convert to rupees
    .sort((a, b) => b.revenue - a.revenue);
};

// Compute table rows (aggregated by date and branch)
const computeTableRows = (transactions) => {
  const map = new Map();

  transactions.forEach((t) => {
    const key = `${t.date.toISOString().split('T')[0]}_${t.branchId}`;
    const prev = map.get(key) || {
      date: t.date.toISOString().split('T')[0],
      branch: t.branch.name,
      invoices: 0,
      revenue: 0,
      refunds: 0,
      ar: 0,
    };
    prev.invoices += t.invoices;
    prev.revenue += t.revenue;
    prev.refunds += t.refunds;
    prev.ar += t.ar;
    map.set(key, prev);
  });

  return Array.from(map.values())
    .map(row => ({
      ...row,
      revenue: Math.round(row.revenue / 100), // Convert to rupees
      refunds: Math.round(row.refunds / 100),
      ar: Math.round(row.ar / 100),
      net: Math.round((row.revenue - row.refunds) / 100),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Export sales reports as CSV
const exportSalesReports = async (filters = {}, userBranchId = null, userRole = null) => {
  const reports = await getSalesReports(filters, userBranchId, userRole);

  const header = ["Date", "Branch", "Invoices", "Revenue", "Refunds", "Net", "AR"];
  const rows = reports.tableRows.map((r) => [
    r.date,
    r.branch,
    r.invoices,
    `₹${r.revenue.toLocaleString('en-IN')}`,
    `₹${r.refunds.toLocaleString('en-IN')}`,
    `₹${(r.revenue - r.refunds).toLocaleString('en-IN')}`,
    `₹${r.ar.toLocaleString('en-IN')}`,
  ]);

  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
};

module.exports = {
  getSalesReports,
  exportSalesReports,
};
