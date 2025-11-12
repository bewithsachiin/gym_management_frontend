import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { FaDownload, FaCalendarAlt, FaFilter } from "react-icons/fa";

// Super Admin → Reports → Sales
// Matches wireframe: Filters, Widgets, Charts (Revenue by Day, Revenue by Branch), Table, Export, Schedule

export default function SalesReports() {
  // -------------------- Filters --------------------
  const [dateFrom, setDateFrom] = useState("2025-09-01");
  const [dateTo, setDateTo] = useState("2025-09-30");
  const [branchSel, setBranchSel] = useState(["All"]);
  const [method, setMethod] = useState("All"); // All | UPI | Card | Netbanking | Wallet | Cash
  const [plan, setPlan] = useState("All"); // All | Gold | Silver | Student etc.

  const branches = ["All", "Andheri", "Bandra", "Thane", "Pune"];
  const methods = ["All", "Cash", "Razorpay", "Barcode"];
  const plans = ["All", "Gold 12M", "Silver 6M", "Student 3M"]; 

  // -------------------- Mock Transactions --------------------
  // date, branch, invoices, revenue, refunds, ar (receivables), method, plan
  const tx = useMemo(() => ([
    { date: "2025-09-01", branch: "Andheri", invoices: 42, revenue: 178999, refunds: 0, ar: 9000, method: "UPI", plan: "Gold 12M" },
    { date: "2025-09-01", branch: "Bandra", invoices: 31, revenue: 132000, refunds: 3000, ar: 0, method: "Card", plan: "Silver 6M" },
    { date: "2025-09-02", branch: "Thane",   invoices: 20, revenue: 98000,  refunds: 0, ar: 4000, method: "Cash", plan: "Student 3M" },
    { date: "2025-09-02", branch: "Andheri", invoices: 37, revenue: 150400, refunds: 4999, ar: 0, method: "UPI", plan: "Gold 12M" },
    { date: "2025-09-03", branch: "Bandra", invoices: 28, revenue: 118000, refunds: 0, ar: 3000, method: "Card", plan: "Silver 6M" },
    { date: "2025-09-03", branch: "Pune",    invoices: 0,  revenue: 0,     refunds: 0, ar: 0,    method: "UPI", plan: "Gold 12M" },
    { date: "2025-09-04", branch: "Andheri", invoices: 49, revenue: 210000, refunds: 0, ar: 6000, method: "UPI", plan: "Gold 12M" },
    { date: "2025-09-05", branch: "Thane",   invoices: 22, revenue: 104000, refunds: 2000, ar: 0, method: "Cash", plan: "Student 3M" },
    { date: "2025-09-06", branch: "Bandra", invoices: 35, revenue: 146000, refunds: 0, ar: 0, method: "Netbanking", plan: "Silver 6M" },
    { date: "2025-09-07", branch: "Andheri", invoices: 41, revenue: 176000, refunds: 0, ar: 0, method: "UPI", plan: "Gold 12M" },
  ]), []);

  // -------------------- Filter Logic --------------------
  const inRange = (d) => {
    const x = new Date(d).getTime();
    const a = new Date(dateFrom).getTime();
    const b = new Date(dateTo).getTime();
    return x >= a && x <= b;
  };

  const filtered = useMemo(() => {
    return tx.filter((r) => {
      if (!inRange(r.date)) return false;
      if (method !== "All" && r.method !== method) return false;
      if (plan !== "All" && r.plan !== plan) return false;
      if (!(branchSel.includes("All") || branchSel.includes(r.branch))) return false;
      return true;
    });
  }, [tx, dateFrom, dateTo, branchSel, method, plan]);

  // -------------------- Aggregations (KPIs) --------------------
  const kpis = useMemo(() => {
    const gross = filtered.reduce((s, r) => s + r.revenue, 0);
    const refunds = filtered.reduce((s, r) => s + r.refunds, 0);
    const invoices = filtered.reduce((s, r) => s + r.invoices, 0);
    const net = gross - refunds;
    const avgTicket = invoices ? Math.round(gross / invoices) : 0;

    const online = filtered.filter((r) => ["UPI", "Card", "Netbanking", "Wallet"].includes(r.method))
                           .reduce((s, r) => s + r.revenue, 0);
    const pos = filtered.filter((r) => r.method === "Cash").reduce((s, r) => s + r.revenue, 0);

    return { gross, refunds, net, avgTicket, online, pos, invoices };
  }, [filtered]);

  // -------------------- Charts --------------------
  // Revenue by Day (line)
  const byDay = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const prev = map.get(r.date) || { date: r.date, revenue: 0 };
      prev.revenue += r.revenue;
      map.set(r.date, prev);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // Revenue by Branch (bar)
  const byBranch = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const prev = map.get(r.branch) || { branch: r.branch, revenue: 0 };
      prev.revenue += r.revenue;
      map.set(r.branch, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  // Table: aggregate by (date, branch)
  const tableRows = useMemo(() => {
    const key = (r) => `${r.date}__${r.branch}`;
    const map = new Map();
    filtered.forEach((r) => {
      const k = key(r);
      const prev = map.get(k) || { date: r.date, branch: r.branch, invoices: 0, revenue: 0, refunds: 0, ar: 0 };
      prev.invoices += r.invoices;
      prev.revenue += r.revenue;
      prev.refunds += r.refunds;
      prev.ar += r.ar;
      map.set(k, prev);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // -------------------- Export CSV --------------------
  const exportCSV = () => {
    const header = ["Date", "Branch", "Invoices", "Revenue", "Refunds", "Net", "AR"]; 
    const rows = tableRows.map((r) => [r.date, r.branch, r.invoices, r.revenue, r.refunds, r.revenue - r.refunds, r.ar]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_report_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="">
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Sales Report</h2>
         
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={exportCSV}>
            <FaDownload className="me-2"/> Export
          </button>
          {/* <button className="btn btn-outline-secondary" onClick={() => alert("Scheduling UI here (email report)")}>Schedule</button> */}
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-6 col-md-3">
              <label className="form-label"><FaCalendarAlt className="me-2"/>From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-control"/>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label"><FaCalendarAlt className="me-2"/>To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-control"/>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label"><FaFilter className="me-2"/>Branches</label>
              <select className="form-select" multiple value={branchSel} onChange={(e) => {
                const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
                setBranchSel(opts.length ? opts : ["All"]);
              }}>
                {branches.map((b) => (
                  <option value={b} key={b}>{b}</option>
                ))}
              </select>
             
            </div>
            <div className="col-6 col-md-1">
              <label className="form-label">Method</label>
              <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                {methods.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Plan/Product</label>
              <select className="form-select" value={plan} onChange={(e) => setPlan(e.target.value)}>
                {plans.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="row g-3 mb-4">
        <Widget title="Gross" value={fmtINR(kpis.gross)} />
        <Widget title="Net" value={fmtINR(kpis.net)} />
        <Widget title="Refunds" value={fmtINR(kpis.refunds)} />
        <Widget title="Avg Ticket" value={fmtINR(kpis.avgTicket)} />
        <Widget title="Online" value={fmtINR(kpis.online)} />
        <Widget title="POS" value={fmtINR(kpis.pos)} />
      </div>

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Revenue by Day</div>
            <div className="card-body" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byDay} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtINR(v)}/>
                  <Legend/>
                  <Line type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={2} dot={false} name="Revenue"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Revenue by Branch</div>
            <div className="card-body" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byBranch} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branch" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtINR(v)}/>
                  <Bar dataKey="revenue" fill="#20c997" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 fw-semibold">Transactions (Aggregated)</div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Date</th>
                <th>Branch</th>
                <th>Invoices</th>
                <th>Revenue</th>
                <th>Refunds</th>
                <th>Net</th>
                <th>AR</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 && (
                <tr><td colSpan={7} className="text-center py-5 text-muted">No data</td></tr>
              )}
              {tableRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.branch}</td>
                  <td>{r.invoices}</td>
                  <td>{fmtINR(r.revenue)}</td>
                  <td>{fmtINR(r.refunds)}</td>
                  <td>{fmtINR(r.revenue - r.refunds)}</td>
                  <td>{fmtINR(r.ar)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Widget({ title, value }) {
  return (
    <div className="col-6 col-lg-2">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="text-muted small">{title}</div>
          <div className="fs-5 fw-semibold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}

function fmtINR(n) {
  if (typeof n !== "number") return n;
  return "₹ " + n.toLocaleString("en-IN");
}
