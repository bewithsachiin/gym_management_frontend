import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaArrowUp, FaArrowDown, FaBell, FaPlus, FaReceipt, FaCreditCard, FaBullhorn } from "react-icons/fa";

// Super Admin → Dashboard (Home)
// Matches your wireframe exactly:
// - KPI cards (6)
// - Row 2: Revenue vs Target (line) + Branch Leaderboard
// - Row 3: Attendance Heatmap + Alerts & Tasks
// - Row 4: Quick Actions

export default function DashboardHomePage() {
  // ------- Mock Data -------
  const kpis = [
    { title: "Total Revenue", value: 3500000, delta: +12 },
    { title: "New Members", value: 186, delta: +8 },
    { title: "Active Members", value: 720, delta: +3 },
    { title: "Check-ins", value: 412, delta: +5 },
    { title: "PT Revenue", value: 920000, delta: +15 },
    { title: "AR/Overdue", value: 110000, delta: -4 },
  ];

  const revenueData = [
    { d: "01", revenue: 120000, target: 100000 },
    { d: "05", revenue: 160000, target: 120000 },
    { d: "10", revenue: 210000, target: 180000 },
    { d: "15", revenue: 190000, target: 200000 },
    { d: "20", revenue: 260000, target: 230000 },
    { d: "25", revenue: 300000, target: 260000 },
    { d: "30", revenue: 350000, target: 300000 },
  ];

  const leaderboard = [
    { branch: "Andheri", revenue: 1550000, newMembers: 85 },
    { branch: "Bandra", revenue: 1320000, newMembers: 64 },
    { branch: "Thane", revenue: 980000, newMembers: 51 },
    { branch: "Pune", revenue: 760000, newMembers: 43 },
  ];

  const heatDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heatHours = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];
  const heatmap = useMemo(() => {
    const seed = 11; let x = seed;
    const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    return heatDays.map(() => heatHours.map(() => Math.floor(rnd() * 40)));
  }, []);

  const alerts = [
    { type: "danger", text: "12 invoices overdue (₹87,990)" },
    { type: "success", text: "Razorpay webhook verified" },
    { type: "warning", text: "Diwali Promo scheduled (All branches)" },
    { type: "info", text: "New QR batch printed for Pune" },
  ];

  return (
    <div className="">
      {/* Heading */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <div className="text-muted">Overview of revenue, activity & operations</div>
        </div>
        {/* <button className="btn btn-outline-secondary">
          <FaBell className="me-2"/>Alerts
        </button> */}
      </div>

      {/* KPI row (6) */}
      <div className="row g-3 mb-4">
        {kpis.map((k, i) => (
          <div className="col-6 col-lg-2" key={i}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">{k.title}</div>
                <div className="fs-5 fw-semibold mt-1">{k.title.includes("Rev") || k.title.includes("AR") ? fmtINR(k.value) : k.value}</div>
                <div className={`small mt-1 d-inline-flex align-items-center ${k.delta >= 0 ? "text-success" : "text-danger"}`}>
                  {k.delta >= 0 ? <FaArrowUp className="me-1"/> : <FaArrowDown className="me-1"/>}
                  {Math.abs(k.delta)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Revenue vs Target + Branch Leaderboard */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Revenue vs Target</div>
            <div className="card-body" style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="d" />
                  <YAxis />
                  <Tooltip formatter={(v) => (typeof v === 'number' ? fmtINR(v) : v)} />
                  <Legend/>
                  <Line type="monotone" dataKey="revenue" stroke="#0d6efd" strokeWidth={2} dot={false} name="Revenue" />
                  <Line type="monotone" dataKey="target" stroke="#6c757d" strokeWidth={2} dot={false} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Branch Leaderboard</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Branch</th>
                    <th>Revenue</th>
                    <th>New</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((r, i) => (
                    <tr key={i}>
                      <td>{r.branch}</td>
                      <td>{fmtINR(r.revenue)}</td>
                      <td>{r.newMembers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Attendance Heatmap + Alerts & Tasks */}
      <div className="row g-3 mb-4">
    

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Alerts & Tasks</div>
            <div className="list-group list-group-flush">
              {alerts.map((a, i) => (
                <div key={i} className={`list-group-item d-flex align-items-center`}>
                  <span className={`badge rounded-pill me-3 ${badgeTone(a.type)}`}>{a.type.toUpperCase()}</span>
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

  
    </div>
  );
}

function QA({ icon, text }) {
  return (
    <button className="btn btn-light border d-flex align-items-center justify-content-between px-3 py-3">
      <span className="fw-medium">{text}</span>
      <span className="opacity-75">{icon}</span>
    </button>
  );
}

function fmtINR(n) {
  if (typeof n !== "number") return n;
  return "₹ " + n.toLocaleString("en-IN");
}

function badgeTone(type) {
  switch (type) {
    case "danger":
      return "bg-danger-subtle text-danger-emphasis";
    case "success":
      return "bg-success-subtle text-success-emphasis";
    case "warning":
      return "bg-warning-subtle text-warning-emphasis";
    default:
      return "bg-info-subtle text-info-emphasis";
  }
}
