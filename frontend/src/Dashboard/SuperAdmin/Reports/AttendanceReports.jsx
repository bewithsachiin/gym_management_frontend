import React, { useMemo, useState } from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Tooltip } from "recharts";
import { FaDownload, FaCalendarAlt, FaFilter } from "react-icons/fa";

// Super Admin → Reports → Attendance
// Wireframe: Filters (Branches, Role, Shift, Date Range) → Charts (Member Heatmap, Staff Compliance Gauge)
// Tables: Staff (sched/present/OT/compliance) & Members (check-ins/no-shows/avg session/branch)

export default function AttendanceReports() {
  // -------------------- Filters --------------------
  const [role, setRole] = useState("All"); // All | Staff | Member
  const [branchSel, setBranchSel] = useState(["All"]);
  const [shift, setShift] = useState("All"); // All | Straight | Break | Weekend
  const [dateFrom, setDateFrom] = useState("2025-09-01");
  const [dateTo, setDateTo] = useState("2025-09-07");

  const branches = ["All", "Andheri", "Bandra", "Thane", "Pune"];
  const shifts = ["All", "Straight", "Break", "Weekend"];

  // -------------------- Mock Data --------------------
  // Staff attendance (per staff, aggregated for range)
  const staffRows = useMemo(() => ([
    { name: "A. Singh", role: "PT", branch: "Andheri", shift: "Straight", scheduled: 48, present: 46 },
    { name: "R. Khan", role: "Trainer", branch: "Bandra", shift: "Straight", scheduled: 48, present: 44 },
    { name: "M. Patel", role: "Reception", branch: "Thane", shift: "Break", scheduled: 40, present: 40 },
    { name: "I. Desai", role: "Housekeeping", branch: "Andheri", shift: "Weekend", scheduled: 16, present: 14 },
    { name: "S. Gupta", role: "Trainer", branch: "Pune", shift: "Straight", scheduled: 48, present: 38 },
  ]), []);

  // Members attendance summary (aggregated for range)
  const memberRows = useMemo(() => ([
    { name: "K. Sharma", branch: "Andheri", checkins: 4, noshows: 1, avgSession: 55 },
    { name: "S. Rao", branch: "Bandra",  checkins: 3, noshows: 0, avgSession: 48 },
    { name: "P. Gupta", branch: "Thane",  checkins: 5, noshows: 0, avgSession: 62 },
    { name: "N. Joshi", branch: "Andheri", checkins: 2, noshows: 2, avgSession: 41 },
    { name: "A. Dey",   branch: "Pune",    checkins: 1, noshows: 0, avgSession: 37 },
  ]), []);

  // Heatmap data: 7 days × 12 time buckets (e.g., hours 6–18)
  const heatDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const heatHours = ["06","07","08","09","10","11","12","13","14","15","16","17"];
  const heatmap = useMemo(() => {
    // deterministic pseudo-random for demo
    const seed = 37; let x = seed;
    const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    return heatDays.map(() => heatHours.map(() => Math.floor(rnd() * 40)));
  }, []);

  // -------------------- Filtering --------------------
  const roleFilter = (r) => role === "All" || r.role ? role !== "Member" : role !== "Staff"; // naive: staffRows have role; memberRows don't
  const branchFilter = (r) => branchSel.includes("All") || branchSel.includes(r.branch);
  const shiftFilter = (r) => !r.shift || shift === "All" || r.shift === shift;

  const staffFiltered = useMemo(
    () => staffRows.filter((r) => role !== "Member" && branchFilter(r) && shiftFilter(r)),
    [staffRows, role, branchSel, shift]
  );

  const memberFiltered = useMemo(
    () => memberRows.filter((r) => role !== "Staff" && branchFilter(r)),
    [memberRows, role, branchSel]
  );

  // -------------------- Gauges & KPIs --------------------
  const staffCompliancePct = useMemo(() => {
    const S = staffFiltered.reduce((s, r) => s + r.scheduled, 0);
    const P = staffFiltered.reduce((s, r) => s + r.present, 0);
    return S ? Math.round((P / S) * 100) : 0;
  }, [staffFiltered]);

  // -------------------- Exports --------------------
  const exportCSV = (type) => {
    if (type === "staff") {
      const header = ["Name","Role","Branch","Shift","Scheduled Hrs","Present Hrs","OT","Compliance %"]; 
      const rows = staffFiltered.map((r) => [r.name, r.role, r.branch, r.shift || "-", r.scheduled, r.present, Math.max(0, r.present - r.scheduled), pct(r.present, r.scheduled)]);
      downloadCSV([header, ...rows], `attendance_staff_${dateFrom}_${dateTo}.csv`);
    } else {
      const header = ["Name","Branch","Check-ins","No-shows","Avg Session (min)"]; 
      const rows = memberFiltered.map((r) => [r.name, r.branch, r.checkins, r.noshows, r.avgSession]);
      downloadCSV([header, ...rows], `attendance_members_${dateFrom}_${dateTo}.csv`);
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Attendance Report</h2>
         
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-6 col-md-2">
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                {['All','Staff','Member'].map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label"><FaFilter className="me-2"/>Branches</label>
              <select className="form-select" multiple value={branchSel} onChange={(e) => {
                const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
                setBranchSel(opts.length ? opts : ["All"]);
              }}>
                {branches.map((b) => (<option key={b} value={b}>{b}</option>))}
              </select>
             
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Shift</label>
              <select className="form-select" value={shift} onChange={(e) => setShift(e.target.value)}>
                {shifts.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label"><FaCalendarAlt className="me-2"/>From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-control"/>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label"><FaCalendarAlt className="me-2"/>To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-control"/>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        {/* Heatmap */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Member Check-ins Heatmap</div>
            <div className="card-body">
              <div className="d-flex gap-3">
                {/* Y labels */}
                <div className="d-flex flex-column justify-content-between py-2" style={{height: 260}}>
                  {heatDays.map((d) => (<div key={d} className="text-muted small" style={{height: (260/7)-2}}>{d}</div>))}
                </div>
                {/* Grid */}
                <div className="flex-grow-1">
                  <div className="d-grid" style={{gridTemplateColumns: `repeat(${heatHours.length}, 1fr)`, gap: 4}}>
                    {heatDays.map((_, r) => (
                      heatHours.map((_, c) => (
                        <div key={`${r}-${c}`} title={`${heatmap[r][c]} check-ins`} style={{
                          height: 28,
                          borderRadius: 6,
                          backgroundColor: `rgba(13,110,253, ${Math.max(0.08, heatmap[r][c]/40)})`
                        }} />
                      ))
                    ))}
                  </div>
                  <div className="d-flex justify-content-between mt-2 text-muted small">
                    {heatHours.map((h) => (<span key={h}>{h}</span>))}
                  </div>
                </div>
              </div>
              <div className="text-muted small mt-2">Darker = more check-ins</div>
            </div>
          </div>
        </div>

        {/* Staff Compliance Gauge */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Staff Compliance</div>
            <div className="card-body d-flex align-items-center justify-content-center" style={{height: 300}}>
              <div style={{width: 260, height: 260}}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0}
                                  data={[{ name: 'Compliance', value: staffCompliancePct, fill: staffCompliancePct>=90? '#198754' : staffCompliancePct>=75? '#0d6efd' : '#dc3545' }]}
                                  cy="100%" cx="50%" >
                    <PolarAngleAxis type="number" domain={[0,100]} tick={false} />
                    <RadialBar minAngle={15} background dataKey="value" cornerRadius={10} />
                    <Tooltip formatter={(v) => `${v}%`} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="position-absolute text-center" style={{marginTop: 0}}>
                <div className="fw-bold" style={{fontSize: 28}}>{staffCompliancePct}%</div>
                <div className="text-muted">Present ÷ Scheduled</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="row g-3">
        {/* Staff Table */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="fw-semibold">Staff Attendance</div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => exportCSV('staff')}>
                <FaDownload className="me-2"/>Export
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th>Scheduled Hrs</th>
                    <th>Present Hrs</th>
                    <th>OT</th>
                    <th>Compliance%</th>
                  </tr>
                </thead>
                <tbody>
                  {staffFiltered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-5 text-muted">No data</td></tr>
                  )}
                  {staffFiltered.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.role}</td>
                      <td>{r.branch}</td>
                      <td>{r.scheduled}</td>
                      <td>{r.present}</td>
                      <td>{Math.max(0, r.present - r.scheduled)}</td>
                      <td>{pct(r.present, r.scheduled)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Member Table */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="fw-semibold">Member Attendance</div>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => exportCSV('member')}>
                <FaDownload className="me-2"/>Export
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Branch</th>
                    <th>Check-ins</th>
                    <th>No-shows</th>
                    <th>Avg Session</th>
                  </tr>
                </thead>
                <tbody>
                  {memberFiltered.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-5 text-muted">No data</td></tr>
                  )}
                  {memberFiltered.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.branch}</td>
                      <td>{r.checkins}</td>
                      <td>{r.noshows}</td>
                      <td>{r.avgSession} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- helpers ----------
function pct(present, scheduled) {
  if (!scheduled) return "0%";
  return Math.round((present / scheduled) * 100) + "%";
}

function downloadCSV(rows, filename) {
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
