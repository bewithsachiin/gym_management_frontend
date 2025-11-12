import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FaDownload, FaCalendarAlt, FaFilter } from "react-icons/fa";

// Super Admin → Reports → Memberships
// Wireframe: Filters (Plan, Status, Branches, Date Range) → Widgets (Active, New, Renewals Due, Churn %)
// Table: Member | Plan | Start | End | Days Left | Branch | Contact

export default function MembershipsReports() {
  // -------------------- Filters --------------------
  const [dateFrom, setDateFrom] = useState("2025-08-15");
  const [dateTo, setDateTo] = useState("2025-09-10"); // current date in mock
  const [branchSel, setBranchSel] = useState(["All"]);
  const [planSel, setPlanSel] = useState("All");
  const [statusSel, setStatusSel] = useState("All"); // All | Active | Expiring | Expired

  const branches = ["All", "Andheri", "Bandra", "Thane", "Pune"];
  const plans = ["All", "Gold 12M", "Silver 6M", "Student 3M"];

  // -------------------- Mock Members --------------------
  const members = useMemo(() => ([
    { id: "M-1203", name: "K. Sharma", phone: "+91 90000 11111", branch: "Andheri", plan: "Gold 12M", start: "2024-11-15", end: "2025-11-14" },
    { id: "M-0891", name: "S. Rao",    phone: "+91 90000 22222", branch: "Bandra",  plan: "Silver 6M", start: "2025-04-02", end: "2025-10-01" },
    { id: "M-0774", name: "P. Gupta",  phone: "+91 90000 33333", branch: "Thane",   plan: "Gold 12M", start: "2024-09-05", end: "2025-09-04" },
    { id: "M-1410", name: "N. Joshi",  phone: "+91 90000 44444", branch: "Andheri", plan: "Student 3M", start: "2025-08-20", end: "2025-11-18" },
    { id: "M-1555", name: "A. Dey",    phone: "+91 90000 55555", branch: "Pune",    plan: "Silver 6M", start: "2025-03-12", end: "2025-09-11" },
    { id: "M-1666", name: "R. Khan",   phone: "+91 90000 66666", branch: "Bandra",  plan: "Gold 12M", start: "2025-09-03", end: "2026-09-02" },
    { id: "M-1777", name: "I. Desai",  phone: "+91 90000 77777", branch: "Thane",   plan: "Student 3M", start: "2025-07-01", end: "2025-09-29" },
  ]), []);

  // Utilities
  const toDate = (s) => new Date(`${s}T00:00:00`);
  const daysBetween = (a, b) => Math.ceil((toDate(b) - toDate(a)) / (1000 * 60 * 60 * 24));

  const inRange = (d) => {
    const x = toDate(d).getTime();
    return x >= toDate(dateFrom).getTime() && x <= toDate(dateTo).getTime();
  };

  // Enriched rows with derived status & daysLeft
  const enriched = useMemo(() => {
    const today = toDate(dateTo); // assume report "as of" dateTo
    return members.map((m) => {
      const daysLeft = daysBetween(today, m.end);
      let status = "Active";
      if (daysLeft < 0) status = "Expired";
      else if (daysLeft <= 30) status = "Expiring";
      return { ...m, daysLeft, status };
    });
  }, [members, dateTo]);

  // Filtered
  const filtered = useMemo(() => {
    return enriched.filter((r) => {
      if (!(branchSel.includes("All") || branchSel.includes(r.branch))) return false;
      if (planSel !== "All" && r.plan !== planSel) return false;
      if (statusSel !== "All" && r.status !== statusSel) return false;
      // Date range impacts metrics (new/renewals), but we still display all by default; keep all rows
      return true;
    });
  }, [enriched, branchSel, planSel, statusSel]);

  // Widgets metrics
  const widgets = useMemo(() => {
    const today = toDate(dateTo);
    const active = filtered.filter((r) => r.status === 'Active').length;
    const expired = filtered.filter((r) => r.status === 'Expired').length;
    const expiring = filtered.filter((r) => r.status === 'Expiring').length;

    // New memberships within date range (start within range)
    const newlyStarted = filtered.filter((r) => inRange(r.start)).length;
    // Renewals due: end in next 30 days from "today"
    const dueSoon = filtered.filter((r) => {
      const dl = daysBetween(today, r.end);
      return dl >= 0 && dl <= 30;
    }).length;

    // Churn % (expired during period / (active + expired during period))
    const expiredDuringPeriod = filtered.filter((r) => inRange(r.end) && toDate(r.end) < today).length;
    const base = active + expired;
    const churn = base ? Math.round((expiredDuringPeriod / base) * 100) : 0;

    return { active, newlyStarted, dueSoon, churn, expired, expiring };
  }, [filtered, dateFrom, dateTo]);

  // Chart: Members by Plan
  const byPlan = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const prev = map.get(r.plan) || { plan: r.plan, count: 0 };
      prev.count += 1;
      map.set(r.plan, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Table sort
  const tableRows = useMemo(() => {
    return [...filtered].sort((a, b) => a.daysLeft - b.daysLeft);
  }, [filtered]);

  // Export CSV
  const exportCSV = () => {
    const header = ["Member","Plan","Start","End","Days Left","Branch","Contact","Status"]; 
    const rows = tableRows.map((r) => [r.name, r.plan, r.start, r.end, r.daysLeft, r.branch, r.phone, r.status]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memberships_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="">
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Memberships Report</h2>
          
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={exportCSV}><FaDownload className="me-2"/>Export</button>
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
                {branches.map((b) => (<option key={b} value={b}>{b}</option>))}
              </select>
              
            </div>
            <div className="col-6 col-md-1">
              <label className="form-label">Plan</label>
              <select className="form-select" value={planSel} onChange={(e) => setPlanSel(e.target.value)}>
                {plans.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {/* <div className="col-6 col-md-2">
              <label className="form-label">Status</label>
              <select className="form-select" value={statusSel} onChange={(e) => setStatusSel(e.target.value)}>
                {['All','Active','Expiring','Expired'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div> */}
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="row g-3 mb-4">
        <Widget title="Active" value={widgets.active} subtitle="current active memberships"/>
        <Widget title="New" value={widgets.newlyStarted} subtitle="started in range"/>
        <Widget title="Renewals Due" value={widgets.dueSoon} subtitle="ending in next 30 days"/>
        <Widget title="Churn %" value={`${widgets.churn}%`} subtitle="expired in range / base"/>
      </div>

      {/* Chart: Members by Plan */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-0 fw-semibold">Members by Plan</div>
        <div className="card-body" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPlan} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="plan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0d6efd" name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 fw-semibold">Memberships</div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Start</th>
                <th>End</th>
                <th>Days Left</th>
                <th>Branch</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-5 text-muted">No data</td></tr>
              )}
              {tableRows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.plan}</td>
                  <td>{r.start}</td>
                  <td>{r.end}</td>
                  <td>{r.daysLeft}</td>
                  <td>{r.branch}</td>
                  <td>{r.phone}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 ${badgeClass(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Widget({ title, value, subtitle }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="text-muted small">{title}</div>
          <div className="fs-4 fw-semibold mt-1">{value}</div>
          {subtitle && <div className="text-muted small">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function badgeClass(status) {
  if (status === 'Active') return 'bg-success-subtle text-success-emphasis';
  if (status === 'Expiring') return 'bg-warning-subtle text-warning-emphasis';
  return 'bg-danger-subtle text-danger-emphasis';
}
