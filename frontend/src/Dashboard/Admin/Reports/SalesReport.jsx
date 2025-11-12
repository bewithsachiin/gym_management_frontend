import React, { useMemo, useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { FaDownload, FaCalendarAlt, FaFilter, FaUserCog } from "react-icons/fa";

export default function SalesReport() {
  // -------------------- STEP 1: ROLE SELECTION --------------------
  const [selectedRole, setSelectedRole] = useState(""); 
  const roles = [
    { value: "", label: "Select Role..." },
    { value: "member", label: "Member" },
    { value: "receptionist", label: "Receptionist" },
    { value: "personal_trainer", label: "Personal Trainer" },
    { value: "general_trainer", label: "General Trainer" },
    { value: "manager", label: "Manager" },
    { value: "housekeeping", label: "Housekeeping" }
  ];

  // -------------------- STEP 2: FILTERS --------------------
  const [dateFrom, setDateFrom] = useState("2025-09-01");
  const [dateTo, setDateTo] = useState("2025-09-30");
  const [bookingStatus, setBookingStatus] = useState("All");
  const [trainer, setTrainer] = useState("All");

  const statuses = ["All", "Booked", "Confirmed", "Cancelled"];
  const trainersList = ["All", "John Smith", "Mike Williams", "Unknown"];

  // -------------------- MOCK DATA --------------------
  const bookings = useMemo(() => [
    {
      username: "john_doe",
      trainer: "John Smith",
      type: "Strength Training",
      date: "2023-06-20",
      time: "10:00 - 11:00",
      price: 50,
      paymentStatus: "Paid",
      bookingStatus: "Booked"
    },
    {
      username: "mike_w",
      trainer: "Mike Williams",
      type: "Cardio & HIIT",
      date: "2023-06-22",
      time: "14:00 - 15:00",
      price: 60,
      paymentStatus: "Paid",
      bookingStatus: "Booked"
    },
    {
      username: "mike_w",
      trainer: "Mike Williams",
      date: "2025-09-18",
      time: "23:34 - 03:04",
      price: 70,
      paymentStatus: "Paid",
      bookingStatus: "Confirmed"
    },
    {
      username: "guest_user",
      trainer: "Unknown",
      date: "",
      time: "",
      price: 0,
      paymentStatus: "Paid",
      bookingStatus: "Booked"
    },
    {
      username: "john_doe",
      trainer: "John Smith",
      type: "Strength Training",
      date: "2023-06-21",
      time: "16:00 - 17:00",
      price: 50,
      paymentStatus: "Paid",
      bookingStatus: "Cancelled"
    },
    {
      username: "alice_123",
      trainer: "John Smith",
      date: "2023-06-25",
      time: "09:00 - 10:00",
      price: 50,
      paymentStatus: "Paid",
      bookingStatus: "Confirmed"
    },
    {
      username: "bob_456",
      trainer: "Mike Williams",
      date: "2023-06-26",
      time: "17:00 - 18:00",
      price: 60,
      paymentStatus: "Paid",
      bookingStatus: "Booked"
    }
  ], []);

  // ✅ DEFINE isInRange AT TOP LEVEL — OUTSIDE ALL HOOKS
  const isInRange = (d) => {
    const x = new Date(d).getTime();
    const a = new Date(dateFrom).getTime();
    const b = new Date(dateTo).getTime();
    return x >= a && x <= b;
  };

  // -------------------- DYNAMIC FILTERS BASED ON ROLE --------------------
  const isStaff = ["receptionist", "personal_trainer", "general_trainer", "manager", "housekeeping"].includes(selectedRole);
  const isMember = selectedRole === "member";

  // Auto-set trainer for staff based on localStorage (simulated)
  const getMyTrainer = () => {
    const userMap = {
      john_doe: "John Smith",
      mike_w: "Mike Williams",
      guest_user: "Unknown"
    };
    const username = localStorage.getItem("username") || "guest_user";
    return userMap[username] || "Unknown";
  };

  // -------------------- FILTERED DATA --------------------
  const filtered = useMemo(() => {
    if (!selectedRole) return []; 

    return bookings.filter((r) => {
      if (!isInRange(r.date)) return false; // ✅ Now this works!
      if (bookingStatus !== "All" && r.bookingStatus !== bookingStatus) return false;
      if (trainer !== "All" && r.trainer !== trainer) return false;

      if (isMember) {
        const loggedinUser = localStorage.getItem("username") || "guest_user";
        return r.username === loggedinUser;
      }

      if (isStaff && trainer === "My") {
        const myTrainer = getMyTrainer();
        return r.trainer === myTrainer;
      }

      return true;
    });
  }, [bookings, selectedRole, dateFrom, dateTo, bookingStatus, trainer]);

  // -------------------- KPIs --------------------
  const kpis = useMemo(() => {
    const totalBookings = filtered.length;
    const totalRevenue = filtered.reduce((sum, r) => sum + r.price, 0);
    const confirmed = filtered.filter(b => b.bookingStatus === "Confirmed").length;
    const cancelled = filtered.filter(b => b.bookingStatus === "Cancelled").length;
    const booked = filtered.filter(b => b.bookingStatus === "Booked").length;
    const avgTicket = totalBookings ? Math.round(totalRevenue / totalBookings) : 0;

    return { totalBookings, totalRevenue, confirmed, cancelled, booked, avgTicket };
  }, [filtered]);

  // -------------------- CHART DATA --------------------

  // Bookings by Day (Line Chart)
  const byDay = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const prev = map.get(r.date) || { date: r.date, count: 0 };
      prev.count += 1;
      map.set(r.date, prev);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // Booking Status Distribution (Pie Chart)
  const byStatus = useMemo(() => {
    const data = [
      { name: "Booked", value: kpis.booked },
      { name: "Confirmed", value: kpis.confirmed },
      { name: "Cancelled", value: kpis.cancelled },
    ].filter(item => item.value > 0);
    return data;
  }, [kpis]);

  // Table: Aggregated by Date + Trainer
  const tableRows = useMemo(() => {
    const key = (r) => `${r.date}__${r.trainer}`;
    const map = new Map();
    filtered.forEach((r) => {
      const k = key(r);
      const prev = map.get(k) || { date: r.date, trainer: r.trainer, count: 0, revenue: 0 };
      prev.count += 1;
      prev.revenue += r.price;
      map.set(k, prev);
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  // -------------------- EXPORT CSV --------------------
  const exportCSV = () => {
    if (!selectedRole) return alert("Please select a role first!");
    
    const header = ["Date", "Trainer", "Username", "Type", "Time", "Price", "Payment Status", "Booking Status"];
    const rows = filtered.map((r) => [
      r.date,
      r.trainer,
      r.username,
      r.type || "-",
      r.time || "-",
      r.price,
      r.paymentStatus,
      r.bookingStatus
    ]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_report_personal_training_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------- RENDER STATE --------------------
  const canGenerate = selectedRole !== "";

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Sales Report</h2>
          <p className="text-muted mb-0">Generate personalized sales reports based on your role.</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary" 
            onClick={exportCSV}
            disabled={!canGenerate}
          >
            <FaDownload className="me-2" /> Export
          </button>
      
        </div>
      </div>

      {/* STEP 1: Role Selection Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <label className="form-label"><FaUserCog className="me-2" /> Select Your Role</label>
              <select 
                className="form-select" 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {!selectedRole && (
              <div className="col-12">
                <div className="alert alert-warning">
                  <strong>Please select your role to proceed.</strong><br />
                  Members see only their bookings. Staff can view all or their own.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STEP 2: Filters (Only show if role is selected) */}
      {selectedRole && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">

              {/* Always Show Date Range */}
              <div className="col-6 col-md-3">
                <label className="form-label"><FaCalendarAlt className="me-2" /> From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-control" />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label"><FaCalendarAlt className="me-2" /> To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-control" />
              </div>

              {/* STAFF ONLY: Show Status & Trainer Filters */}
              {isStaff && (
                <>
                  <div className="col-6 col-md-2">
                    <label className="form-label"><FaFilter className="me-2" /> Booking Status</label>
                    <select className="form-select" value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)}>
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label">View</label>
                    <select className="form-select" value={trainer} onChange={(e) => setTrainer(e.target.value)}>
                      <option value="All">All Trainers</option>
                      <option value="My">My Bookings Only</option>
                      <option value="John Smith">John Smith</option>
                      <option value="Mike Williams">Mike Williams</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </>
              )}

              {/* MEMBER: Auto-show My Bookings (no filters) */}
              {isMember && (
                <div className="col-12">
                  <div className="alert alert-info">
                    <strong>You are viewing your own bookings only.</strong><br />
                    We automatically filtered data for <code>{localStorage.getItem("username") || "guest_user"}</code>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Generate Button (Only if Role Selected) */}
      {selectedRole && (
        <div className="mb-4 text-end">
          <button 
            className="btn btn-primary"
            onClick={() => alert(`Report generated for ${selectedRole}`)}
            disabled={filtered.length === 0 && !isMember}
          >
            Generate Report
          </button>
        </div>
      )}

      {/* REPORT CONTENT (Only show if role selected and data exists) */}
      {selectedRole && (
        <>
          {/* KPI Widgets */}
          <div className="row g-3 mb-4">
            <Widget title="Total Bookings" value={kpis.totalBookings} />
            <Widget title="Total Revenue" value={`₹ ${kpis.totalRevenue.toLocaleString("en-IN")}`} />
            <Widget title="Avg Ticket" value={`₹ ${kpis.avgTicket.toLocaleString("en-IN")}`} />
            <Widget title="Confirmed" value={kpis.confirmed} />
            <Widget title="Cancelled" value={kpis.cancelled} />
            <Widget title="Booked" value={kpis.booked} />
          </div>

          {/* Charts */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 fw-semibold">Bookings by Day</div>
                <div className="card-body" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={byDay} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(v) => `${v} session(s)`} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#0d6efd" strokeWidth={2} dot={false} name="Bookings" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-0 fw-semibold">Booking Status</div>
                <div className="card-body" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={["#20c997", "#dc3545", "#ffc107"][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
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
                    <th>Trainer</th>
                    <th>Username</th>
                    <th>Type</th>
                    <th>Time</th>
                    <th>Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        {filtered.length === 0
                          ? "No bookings found for the selected filters."
                          : "Loading..."}
                      </td>
                    </tr>
                  ) : (
                    tableRows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.date}</td>
                        <td>{r.trainer}</td>
                        <td>
                          {filtered.find(f => f.date === r.date && f.trainer === r.trainer)?.username || "-"}
                        </td>
                        <td>
                          {filtered.find(f => f.date === r.date && f.trainer === r.trainer)?.type || "-"}
                        </td>
                        <td>
                          {filtered.find(f => f.date === r.date && f.trainer === r.trainer)?.time || "-"}
                        </td>
                        <td>₹ {r.revenue.toLocaleString("en-IN")}</td>
                        <td>
                          <span className={`badge ${
                            filtered.find(f => f.date === r.date && f.trainer === r.trainer)?.bookingStatus === "Confirmed"
                              ? "bg-success"
                              : filtered.find(f => f.date === r.date && f.trainer === r.trainer)?.bookingStatus === "Cancelled"
                                ? "bg-danger"
                                : "bg-primary"
                          }`}>
                            {filtered.find(f => f.date === r.date && f.trainer === r.trainer)?.bookingStatus || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty State Before Role Selection */}
      {!selectedRole && (
        <div className="text-center py-5">
          <div className="text-muted">
            <FaUserCog size={48} className="mb-3" />
            <h5>Select Your Role to Generate Report</h5>
            <p className="lead">Choose whether you're a Member or Staff member to see relevant training sales data.</p>
          </div>
        </div>
      )}
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