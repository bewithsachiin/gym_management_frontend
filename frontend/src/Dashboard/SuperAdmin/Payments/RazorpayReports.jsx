import React, { useMemo, useState } from "react";
import { FaCheckCircle, FaSyncAlt, FaDownload, FaLink, FaExchangeAlt } from "react-icons/fa";

// Super Admin → Payments → Razorpay Reports
// Implements the wireframe:
// Banner (connection + last sync + Sync Now)
// Filters: Date Range, Branch, Status (captured/refunded/failed), Method
// Widgets: Collected | Refunds | Net | Fees | Payout Cycles
// Tables: Payments | Refunds | Payouts
// Actions: Export • Reconcile (payments↔invoices) • Create Payment Link

export default function RazorpayReports() {
  // -------------------- Connection Banner --------------------
  const [connected, setConnected] = useState(true);
  const [accountId] = useState("acct_9XYZ1234");
  const [lastSync, setLastSync] = useState("12m ago");

  // -------------------- Filters --------------------
  const [dateFrom, setDateFrom] = useState("2025-09-01");
  const [dateTo, setDateTo] = useState("2025-09-10");
  const [branch, setBranch] = useState("All");
  const [status, setStatus] = useState("All"); // All | captured | refunded | failed
  const [method, setMethod] = useState("All"); // All | UPI | Card | Netbanking | Wallet | Cash

  const branches = ["All", "Andheri", "Bandra", "Thane", "Pune"];
  const statuses = ["All", "captured", "refunded", "failed"];
  const methods = ["All", "Cash", "Razorpay", "Barcode"];

  // -------------------- Mock Data --------------------
  const payments = useMemo(
    () => [
      { date: "2025-09-01", branch: "Andheri", id: "pay_And_001", customer: "K. Sharma", amount: 14999, status: "captured", method: "UPI", invoice: "INV-1001", fee: 225 },
      { date: "2025-09-01", branch: "Bandra",  id: "pay_Ban_002", customer: "S. Rao",    amount: 8499,  status: "captured", method: "Card", invoice: "INV-1002", fee: 170 },
      { date: "2025-09-02", branch: "Thane",   id: "pay_Tha_003", customer: "P. Gupta",  amount: 3999,  status: "refunded", method: "Cash", invoice: "INV-1003", fee: 0 },
      { date: "2025-09-03", branch: "Andheri", id: "pay_And_004", customer: "N. Joshi",  amount: 2999,  status: "failed",   method: "UPI", invoice: "—",        fee: 0 },
      { date: "2025-09-04", branch: "Pune",    id: "pay_Pun_005", customer: "A. Dey",    amount: 12999, status: "captured", method: "Netbanking", invoice: "INV-1004", fee: 210 },
      { date: "2025-09-05", branch: "Bandra",  id: "pay_Ban_006", customer: "R. Khan",   amount: 14999, status: "captured", method: "Card", invoice: "INV-1005", fee: 230 },
      { date: "2025-09-06", branch: "Thane",   id: "pay_Tha_007", customer: "I. Desai",  amount: 3999,  status: "captured", method: "UPI", invoice: "INV-1006", fee: 60 },
      { date: "2025-09-07", branch: "Andheri", id: "pay_And_008", customer: "M. Patel",  amount: 9999,  status: "refunded", method: "Card", invoice: "INV-1007", fee: 0 },
    ],
    []
  );

  const refunds = useMemo(
    () => [
      { date: "2025-09-07", paymentId: "pay_And_008", amount: 9999, reason: "Customer request" },
      { date: "2025-09-02", paymentId: "pay_Tha_003", amount: 3999, reason: "Plan switch" },
    ],
    []
  );

  const payouts = useMemo(
    () => [
      { date: "2025-09-05", utr: "HDFC202509050001", amount: 250000, status: "processed" },
      { date: "2025-09-09", utr: "HDFC202509090045", amount: 320000, status: "queued" },
    ],
    []
  );

  // -------------------- Helpers --------------------
  const toDate = (s) => new Date(`${s}T00:00:00`);
  const inRange = (d) => {
    const x = toDate(d).getTime();
    return x >= toDate(dateFrom).getTime() && x <= toDate(dateTo).getTime();
  };

  // -------------------- Filtered Views --------------------
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!inRange(p.date)) return false;
      if (branch !== "All" && p.branch !== branch) return false;
      if (status !== "All" && p.status !== status) return false;
      if (method !== "All" && p.method !== method) return false;
      return true;
    });
  }, [payments, dateFrom, dateTo, branch, status, method]);

  const filteredRefunds = useMemo(() => {
    const setIds = new Set(filteredPayments.filter((p) => p.status === "refunded").map((p) => p.id));
    return refunds.filter((r) => inRange(r.date) && (setIds.size === 0 || setIds.has(r.paymentId)));
  }, [refunds, filteredPayments, dateFrom, dateTo]);

  const filteredPayouts = useMemo(() => payouts.filter((p) => inRange(p.date)), [payouts, dateFrom, dateTo]);

  // -------------------- Widgets --------------------
  const kpi = useMemo(() => {
    const collected = filteredPayments.filter((p) => p.status === "captured").reduce((s, p) => s + p.amount, 0);
    const refundsSum = filteredRefunds.reduce((s, r) => s + r.amount, 0);
    const fees = filteredPayments.reduce((s, p) => s + (p.fee || 0), 0);
    const net = collected - refundsSum - fees;
    const payoutCycles = filteredPayouts.length;
    return { collected, refundsSum, net, fees, payoutCycles };
  }, [filteredPayments, filteredRefunds, filteredPayouts]);

  // -------------------- Actions --------------------
  const syncNow = () => {
    setLastSync("Just now");
    // TODO: call backend to pull latest RZP data
  };

  const exportCSV = (type) => {
    let header = [], rows = [];
    if (type === "payments") {
      header = ["Date","Branch","RZP Payment ID","Customer","Amount","Status","Method","Invoice"];
      rows = filteredPayments.map((p) => [p.date, p.branch, p.id, p.customer, p.amount, p.status, p.method, p.invoice]);
    } else if (type === "refunds") {
      header = ["Date","Payment ID","Amount","Reason"]; 
      rows = filteredRefunds.map((r) => [r.date, r.paymentId, r.amount, r.reason]);
    } else {
      header = ["Date","UTR","Amount","Status"];
      rows = filteredPayouts.map((r) => [r.date, r.utr, r.amount, r.status]);
    }
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `razorpay_${type}_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reconcile = () => {
    alert("Reconcile started — matching payments to invoices. (Mock UI)\nUnmatched list will appear in a drawer.");
  };

  const createPaymentLink = () => {
    alert("Open Create Payment Link modal (amount, purpose, customer, branch)");
  };

  return (
    <div className="">
      {/* Banner */}
      <div className={`alert d-flex align-items-center justify-content-between ${connected ? 'alert-success' : 'alert-warning'} shadow-sm`}>
        <div className="d-flex align-items-center gap-3">
          {connected ? <FaCheckCircle/> : <FaSyncAlt/>}
          <div>
            <div className="fw-semibold">{connected ? 'Connected' : 'Not Connected'}</div>
            <div className="small text-muted">Account: {accountId} · Last Sync: {lastSync}</div>
          </div>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={syncNow}>
          <FaSyncAlt className="me-2"/>Sync Now
        </button>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-6 col-md-3">
              <label className="form-label">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="form-control"/>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="form-control"/>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Branch</label>
              <select className="form-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
                {branches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label">Method</label>
              <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                {methods.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="row g-5  mb-4 mx-4">
        <Widget title="Collected" value={fmtINR(kpi.collected)} />
        <Widget title="Refunds" value={fmtINR(kpi.refundsSum)} />
        <Widget title="Net" value={fmtINR(kpi.net)} />
        <Widget title="Fees" value={fmtINR(kpi.fees)} />
        <Widget title="Payout Cycles" value={kpi.payoutCycles} />
      </div>

      {/* Actions */}
      <div className="d-flex gap-5 mb-3">
        <button className="btn btn-outline-secondary" onClick={() => exportCSV('payments')}><FaDownload className="me-2"/>Export Payments</button>
        <button className="btn btn-outline-secondary" onClick={() => exportCSV('refunds')}><FaDownload className="me-2"/>Export Refunds</button>
        <button className="btn btn-outline-secondary" onClick={() => exportCSV('payouts')}><FaDownload className="me-2"/>Export Payouts</button>
        <button className="btn btn-outline-primary" onClick={reconcile}><FaExchangeAlt className="me-2 mx-2 "/>Reconcile</button>
        <button className="btn btn-primary" onClick={createPaymentLink}><FaLink className="me-2 ms-auto align-items-center"/>Create Payment Link</button>
      </div>

      {/* Tables */}
      <div className="row g-4">
        {/* Payments */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 fw-semibold">Payments</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Date</th>
                    <th>Branch</th>
                    <th>RZP Payment ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-5 text-muted">No payments</td></tr>
                  )}
                  {filteredPayments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.date}</td>
                      <td>{p.branch}</td>
                      <td>{p.id}</td>
                      <td>{p.customer}</td>
                      <td>{fmtINR(p.amount)}</td>
                      <td><span className={`badge rounded-pill px-3 py-1 ${badgeForStatus(p.status)}`}>{p.status}</span></td>
                      <td>{p.method}</td>
                      <td>{p.invoice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Refunds */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Refunds</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Date</th>
                    <th>Payment ID</th>
                    <th>Amount</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRefunds.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-5 text-muted">No refunds</td></tr>
                  )}
                  {filteredRefunds.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.paymentId}</td>
                      <td>{fmtINR(r.amount)}</td>
                      <td>{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payouts */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 fw-semibold">Payouts</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Date</th>
                    <th>UTR</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-5 text-muted">No payouts</td></tr>
                  )}
                  {filteredPayouts.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.utr}</td>
                      <td>{fmtINR(r.amount)}</td>
                      <td>{r.status}</td>
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

function Widget({ title, value }) {
  return (
    <div className="col-6 col-lg-2">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <div className="text-muted small">{title}</div>
          <div className="fs-5 fw-semibold mt-1">{typeof value === 'number' ? value : value}</div>
        </div>
      </div>
    </div>
  );
}

function fmtINR(n) {
  if (typeof n !== "number") return n;
  return "₹ " + n.toLocaleString("en-IN");
}

function badgeForStatus(s) {
  if (s === 'captured') return 'bg-success-subtle text-success-emphasis';
  if (s === 'refunded') return 'bg-warning-subtle text-warning-emphasis';
  if (s === 'failed') return 'bg-danger-subtle text-danger-emphasis';
  return 'bg-secondary-subtle text-secondary-emphasis';
}
