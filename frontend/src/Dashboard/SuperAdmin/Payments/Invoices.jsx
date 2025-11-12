import React, { useMemo, useState, useEffect } from "react";
import { FaPlus, FaDownload, FaFileExport, FaCopy, FaExternalLinkAlt, FaTimes, FaTrashAlt } from "react-icons/fa";

// Super Admin → Payments → Invoices
// Wireframe implemented + NEW: Create Invoice modal with full form
// Header: + Create Invoice • Bulk Download • Export
// Table: Invoice # | Date | Branch | Customer | Amount | Due | Status | Payment Link | •••
// Drawer (on row click): PDF Preview | Send (Email/SMS) | Download | Void | Edit
// Modal (Create Invoice): customer, branch, dates, line items, taxes, discount, notes, auto totals

export default function Invoices() {
  // -------------------- Sample Invoices --------------------
  const [invoices, setInvoices] = useState([
    { id: "INV-1001", date: "2025-09-01", branch: "Andheri", customer: "K. Sharma", amount: 14999,  status: "Paid", paymentLink: "https://rzp.io/i/abcd1001  " },
    { id: "INV-1002", date: "2025-09-01", branch: "Bandra",  customer: "S. Rao",    amount: 8499,  status: "Paid", paymentLink: "https://rzp.io/i/abcd1002  " },
    { id: "INV-1003", date: "2025-09-02", branch: "Thane",   customer: "P. Gupta",  amount: 3999,  status: "Unpaid", paymentLink: "" },
    { id: "INV-1004", date: "2025-09-04", branch: "Pune",    customer: "A. Dey",    amount: 12999,  status: "Unpaid", paymentLink: "" },
    { id: "INV-1005", date: "2025-09-05", branch: "Bandra",  customer: "R. Khan",   amount: 14999, status: "Partially Paid", paymentLink: "https://rzp.io/i/abcd1005  " },
    { id: "INV-1006", date: "2025-09-06", branch: "Thane",   customer: "I. Desai",  amount: 3999,  status: "Paid", paymentLink: "https://rzp.io/i/abcd1006  " },
    { id: "INV-1007", date: "2025-09-07", branch: "Andheri", customer: "N. Joshi",  amount: 9999,  status: "Void", paymentLink: "" },
  ]);

  const branches = ["Andheri", "Bandra", "Thane", "Pune"];

  // Selection for Bulk Download
  const [selected, setSelected] = useState(new Set());

  // Drawer state
  const [openId, setOpenId] = useState(null);
  const openInvoice = invoices.find((i) => i.id === openId) || null;

  // Create/Edit Invoice modal state
  const [showCreate, setShowCreate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    customer: "",
    email: "",
    phone: "",
    branch: "",
    date: today,
    dueDate: today,
    discount: 0,
    notes: "",
    generateLink: true,
    items: [
      { description: "Gym Membership", qty: 1, price: 0, tax: 18 },
    ],
  });
  const [errors, setErrors] = useState({});

  // Auto-scroll modal to top on open
  useEffect(() => {
    if (showCreate) {
      const modal = document.querySelector('.modal-content');
      if (modal) modal.scrollTop = 0;
    }
  }, [showCreate]);

  // -------------------- Handlers --------------------
  const toggleAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(invoices.map((i) => i.id)));
    } else {
      setSelected(new Set());
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const bulkDownload = () => {
    if (!selected.size) return alert("Please select at least one invoice.");
    alert(`Bulk download started for ${selected.size} invoice(s). (Mock)`);
  };

  const exportCSV = () => {
    const header = ["Invoice #","Date","Branch","Customer","Amount","Due","Status","Payment Link"]; 
    const rows = invoices.map((r) => [r.id, r.date, r.branch, r.customer, r.amount, r.due, r.status, r.paymentLink || "-"]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLink = async (link) => {
    if (!link) return alert("No payment link. Generate first.");
    try { await navigator.clipboard.writeText(link); alert("Payment link copied!"); }
    catch { alert("Copy failed"); }
  };

  const generateLink = (id) => {
    setInvoices((prev) => prev.map((r) => (r.id === id ? { ...r, paymentLink: `https://rzp.io/i/${id.toLowerCase()}` } : r)));
  };

  const voidInvoice = (id) => {
    if (!confirm(`Void invoice ${id}?`)) return;
    setInvoices((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Void", due: 0 } : r)));
    alert(`Invoice ${id} voided.`);
  };

  const createInvoiceOpen = () => {
    setErrors({});
    setForm({
      customer: "",
      email: "",
      phone: "",
      branch: branches[0] || "",
      date: today,
      dueDate: today,
      discount: 0,
      notes: "",
      generateLink: true,
      items: [{ description: "Gym Membership", qty: 1, price: 0, tax: 18 }],
    });
    setIsEditing(false);
    setShowCreate(true);
  };

  const editInvoice = (invoice) => {
    setOpenId(null);
    setForm({
      customer: invoice.customer || "",
      email: invoice.meta?.email || "",
      phone: invoice.meta?.phone || "",
      branch: invoice.branch || "",
      date: invoice.date || today,
      dueDate: invoice.meta?.dueDate || today,
      discount: invoice.meta?.discount || 0,
      notes: invoice.meta?.notes || "",
      generateLink: !!invoice.paymentLink,
      items: invoice.meta?.items || [{ description: "", qty: 1, price: 0, tax: 18 }],
    });
    setErrors({});
    setIsEditing(true);
    setShowCreate(true);
  };

  const validate = () => {
    const e = {};
    if (!form.customer.trim()) e.customer = "Customer required";
    if (!form.branch) e.branch = "Branch required";
    if (!form.date) e.date = "Date required";
    if (!form.dueDate) e.dueDate = "Due date required";
    if (!form.items.length) e.items = "At least one line item";
    form.items.forEach((it, idx) => {
      if (!it.description.trim()) e[`item_${idx}_desc`] = "Required";
      if (!(Number(it.qty) > 0)) e[`item_${idx}_qty`] = "+Qty";
      if (!(Number(it.price) >= 0)) e[`item_${idx}_price`] = "Price";
      if (!(Number(it.tax) >= 0)) e[`item_${idx}_tax`] = "Tax";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
    const taxTotal = form.items.reduce((s, it) => s + (Number(it.qty || 0) * Number(it.price || 0)) * (Number(it.tax || 0) / 100), 0);
    const discount = Number(form.discount || 0);
    const total = Math.max(0, subtotal + taxTotal - discount);
    return { subtotal, taxTotal, discount, total };
  }, [form.items, form.discount]);

  const submitCreate = () => {
    if (!validate()) return;

    if (isEditing && openId) {
      // UPDATE existing invoice
      setInvoices(prev =>
        prev.map(inv => {
          if (inv.id === openId) {
            return {
              ...inv,
              date: form.date,
              branch: form.branch,
              customer: form.customer,
              amount: Math.round(totals.total),
              paymentLink: form.generateLink ? `https://rzp.io/i/${openId.toLowerCase()}` : "",
              meta: {
                email: form.email,
                phone: form.phone,
                dueDate: form.dueDate,
                items: form.items,
                discount: totals.discount,
                tax: totals.taxTotal,
                subtotal: totals.subtotal,
                notes: form.notes,
              },
            };
          }
          return inv;
        })
      );
      alert(`Invoice ${openId} updated successfully.`);
    } else {
      // CREATE new invoice
      const maxNum = invoices.reduce((m, r) => Math.max(m, parseInt(r.id.split("-")[1] || 0, 10)), 0);
      const nextId = `INV-${String(maxNum + 1).padStart(4, "0")}`;

      const newInvoice = {
        id: nextId,
        date: form.date,
        branch: form.branch,
        customer: form.customer,
        amount: Math.round(totals.total),
        status: "Unpaid",
        paymentLink: form.generateLink ? `https://rzp.io/i/${nextId.toLowerCase()}` : "",
        meta: {
          email: form.email,
          phone: form.phone,
          dueDate: form.dueDate,
          items: form.items,
          discount: totals.discount,
          tax: totals.taxTotal,
          subtotal: totals.subtotal,
          notes: form.notes,
        },
      };

      setInvoices((prev) => [newInvoice, ...prev]);
      setOpenId(newInvoice.id); // open drawer for the newly created invoice
    }

    setShowCreate(false);
    setIsEditing(false);
  };

  // ---------- Local helpers for items ----------
  function updateItem(idx, patch) {
    setForm((f) => {
      const items = f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
      return { ...f, items };
    });
  }

  function removeItem(idx) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { description: "", qty: 1, price: 0, tax: 18 }] }));
  }

  // -------------------- UI --------------------
  return (
    <div className="">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h2 className="fw-bold mb-0">Invoices</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={createInvoiceOpen}><FaPlus className="me-2"/>Create Invoice</button>
          <button className="btn btn-outline-secondary" onClick={bulkDownload}><FaDownload className="me-2"/>Bulk Download</button>
          <button className="btn btn-outline-secondary" onClick={exportCSV}><FaFileExport className="me-2"/>Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th style={{width: 36}}>
                  <input type="checkbox" className="form-check-input" onChange={toggleAll}
                    checked={selected.size === invoices.length && invoices.length>0} />
                </th>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Branch</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Link</th>
                <th style={{width: 40}}>•••</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((r) => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} style={{cursor: 'pointer'}}>
                  <td onClick={(e)=>e.stopPropagation()}>
                    <input type="checkbox" className="form-check-input" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
                  </td>
                  <td className="fw-semibold">{r.id}</td>
                  <td>{r.date}</td>
                  <td>{r.branch}</td>
                  <td>{r.customer}</td>
                  <td>{fmtINR(r.amount)}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 ${badgeForStatus(r.status)}`}>{r.status}</span>
                  </td>
                  <td>
                    {r.paymentLink ? (
                      <div className="d-flex align-items-center gap-2" onClick={(e)=>e.stopPropagation()}>
                        <button className="btn btn-sm btn-outline-secondary" title="Copy" onClick={() => copyLink(r.paymentLink)}>
                          <FaCopy/>
                        </button>
                        <a href={r.paymentLink} className="btn btn-sm btn-outline-primary" onClick={(e)=>e.stopPropagation()} target="_blank" rel="noreferrer">
                          Open <FaExternalLinkAlt className="ms-1"/>
                        </a>
                      </div>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary" onClick={(e)=>{e.stopPropagation(); generateLink(r.id);}}>
                        Generate Link
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-light" onClick={(e)=>{e.stopPropagation(); setOpenId(r.id);}}>Open</button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={10} className="text-center py-5 text-muted">No invoices</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER — Fully Responsive */}
      {openInvoice && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpenId(null)}
        >
          <div className="modal-dialog modal-fullscreen modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-bold">{openInvoice.id}</div>
                  <div className="small text-muted">{openInvoice.date} · {openInvoice.branch}</div>
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpenId(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body p-0 d-flex flex-column">
                {/* PDF Preview placeholder */}
                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                  <div className="text-center">
                    <div className="fw-semibold">PDF Preview</div>
                    <div className="text-muted small">(Render invoice PDF here)</div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <div className="mb-2"><span className="text-muted">Customer: </span>{openInvoice.customer}</div>
                  <div className="mb-2"><span className="text-muted">Amount: </span>{fmtINR(openInvoice.amount)}</div>
                  <div className="mb-2">
                    <span className="text-muted">Status: </span>
                    <span className={`badge rounded-pill px-3 py-1 ${badgeForStatus(openInvoice.status)}`}>
                      {openInvoice.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-muted">Payment Link: </span>
                    {openInvoice.paymentLink ? (
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() => copyLink(openInvoice.paymentLink)}
                      >
                        <FaCopy className="me-1" /> Copy
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() => generateLink(openInvoice.id)}
                      >
                        Generate
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <button className="btn btn-primary">Send Email</button>
                    <button className="btn btn-outline-primary">Send SMS</button>
                    <button className="btn btn-outline-secondary">Download PDF</button>
                    <button className="btn btn-outline-danger" onClick={() => voidInvoice(openInvoice.id)}>
                      Void
                    </button>
                    <button className="btn btn-secondary" onClick={() => editInvoice(openInvoice)}>
                      Edit
                    </button>
                  </div>
                </div>

                <div className="mt-auto p-3 text-muted small">
                  Tip: Reconcile payments from Razorpay tab to auto-mark invoices as Paid.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT INVOICE MODAL */}
      {showCreate && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCreate(false)}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{isEditing ? "Edit Invoice" : "Create Invoice"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreate(false)}></button>
              </div>
              <div className="modal-body">
                {/* Top fields */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label">Customer<span className="text-danger"> *</span></label>
                    <input className={`form-control ${errors.customer? 'is-invalid':''}`} value={form.customer} onChange={(e)=>setForm({...form, customer:e.target.value})} placeholder="Full name"/>
                    {errors.customer && <div className="invalid-feedback">{errors.customer}</div>}
                  </div>
                  <div className="col-6 col-md-4">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} placeholder="customer@email.com"/>
                  </div>
                  <div className="col-6 col-md-4">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} placeholder="+91 XXXXX XXXXX"/>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6 col-md-3">
                    <label className="form-label">Branch<span className="text-danger"> *</span></label>
                    <select className={`form-select ${errors.branch? 'is-invalid':''}`} value={form.branch} onChange={(e)=>setForm({...form, branch:e.target.value})}>
                      <option value="">Select Branch</option>
                      {branches.map((b)=> <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.branch && <div className="invalid-feedback">{errors.branch}</div>}
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">Invoice Date<span className="text-danger"> *</span></label>
                    <input type="date" className={`form-control ${errors.date? 'is-invalid':''}`} value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})}/>
                    {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">Due Date<span className="text-danger"> *</span></label>
                    <input type="date" className={`form-control ${errors.dueDate? 'is-invalid':''}`} value={form.dueDate} onChange={(e)=>setForm({...form, dueDate:e.target.value})}/>
                    {errors.dueDate && <div className="invalid-feedback">{errors.dueDate}</div>}
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label">Discount (₹)</label>
                    <input type="number" min={0} className="form-control" value={form.discount} onChange={(e)=>setForm({...form, discount:Number(e.target.value)})}/>
                  </div>
                </div>

                {/* Line Items */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-white border-0 fw-semibold">Line Items</div>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th style={{width: '45%'}}>Description<span className="text-danger"> *</span></th>
                          <th style={{width: '10%'}}>Qty<span className="text-danger"> *</span></th>
                          <th style={{width: '20%'}}>Price (₹)<span className="text-danger"> *</span></th>
                          <th style={{width: '15%'}}>Tax %</th>
                          <th style={{width: '10%'}} className="text-end">Line Total</th>
                          <th style={{width: 40}}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.items.map((it, idx) => {
                          const line = (Number(it.qty||0) * Number(it.price||0));
                          const lineWithTax = line + line * (Number(it.tax||0)/100);
                          return (
                            <tr key={idx}>
                              <td>
                                <input className={`form-control form-control-sm ${errors[`item_${idx}_desc`]?'is-invalid':''}`} value={it.description} onChange={(e)=>updateItem(idx, { description: e.target.value })} placeholder="Item description"/>
                              </td>
                              <td>
                                <input type="number" min={1} className={`form-control form-control-sm text-end ${errors[`item_${idx}_qty`]?'is-invalid':''}`} value={it.qty} onChange={(e)=>updateItem(idx, { qty: Number(e.target.value) })}/>
                              </td>
                              <td>
                                <input type="number" min={0} className={`form-control form-control-sm text-end ${errors[`item_${idx}_price`]?'is-invalid':''}`} value={it.price} onChange={(e)=>updateItem(idx, { price: Number(e.target.value) })}/>
                              </td>
                              <td>
                                <input type="number" min={0} className={`form-control form-control-sm text-end ${errors[`item_${idx}_tax`]?'is-invalid':''}`} value={it.tax} onChange={(e)=>updateItem(idx, { tax: Number(e.target.value) })}/>
                              </td>
                              <td className="text-end">{fmtINR(Math.round(lineWithTax))}</td>
                              <td className="text-end">
                                <button className="btn btn-sm btn-light" onClick={() => removeItem(idx)} title="Remove"><FaTrashAlt/></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={addItem}>+ Add Item</button>
                  </div>
                </div>

                {/* Totals */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows={3} value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} placeholder="Internal or customer-visible notes"></textarea>
                    <div className="form-check mt-2">
                      <input type="checkbox" className="form-check-input" id="genLink" checked={form.generateLink} onChange={(e)=>setForm({...form, generateLink:e.target.checked})}/>
                      <label className="form-check-label" htmlFor="genLink">Generate Razorpay Payment Link</label>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <div className="d-flex justify-content-between"><span>Subtotal</span><strong>{fmtINR(Math.round(totals.subtotal))}</strong></div>
                        <div className="d-flex justify-content-between"><span>Tax</span><strong>{fmtINR(Math.round(totals.taxTotal))}</strong></div>
                        <div className="d-flex justify-content-between"><span>Discount</span><strong>- {fmtINR(Math.round(totals.discount))}</strong></div>
                        <hr/>
                        <div className="d-flex justify-content-between fs-5"><span>Total</span><strong>{fmtINR(Math.round(totals.total))}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitCreate}>
                  {isEditing ? "Update Invoice" : "Create Invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function fmtINR(n) {
  if (typeof n !== "number") return n;
  return "₹ " + n.toLocaleString("en-IN");
}

function badgeForStatus(s) {
  if (s === 'Paid') return 'bg-success-subtle text-success-emphasis';
  if (s === 'Partially Paid') return 'bg-warning-subtle text-warning-emphasis';
  if (s === 'Unpaid') return 'bg-danger-subtle text-danger-emphasis';
  if (s === 'Void') return 'bg-secondary-subtle text-secondary-emphasis';
  return 'bg-light text-dark';
}