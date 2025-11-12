import React, { useState } from 'react';
import { FaMoneyBillWave, FaReceipt, FaCheck, FaUndo, FaEye, FaFileCsv, FaFilePdf, FaCalendarAlt, FaUser, FaSearch, FaFilter } from 'react-icons/fa';

const ReceptionistPaymentCollection = () => {
  const [activeTab, setActiveTab] = useState('payment'); // 'payment' or 'attendance'
  
  // Payment Collection State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState('view'); // 'view', 'edit', 'add'
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Attendance Report State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalType, setAttendanceModalType] = useState('view'); // 'view', 'filter'
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  
  // Pagination states
  const [paymentEntriesPerPage, setPaymentEntriesPerPage] = useState(10);
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [attendanceEntriesPerPage, setAttendanceEntriesPerPage] = useState(10);
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);
  
  // Sample data for payments
  const [payments, setPayments] = useState([
    {
      id: 1,
      member_name: "Alex Johnson",
      member_id: "MBR-001",
      payment_amount: 350000, // in cents
      payment_mode: "Razorpay",
      payment_status: "Paid",
      invoice_number: "INV-2025-001",
      receipt_url: "https://example.com/receipts/INV-2025-001.pdf",
      payment_date: "2025-04-05",
      payment_for: "Premium Annual Membership"
    },
    {
      id: 2,
      member_name: "Priya Patel",
      member_id: "MBR-002",
      payment_amount: 150000, // in cents
      payment_mode: "Cash",
      payment_status: "Pending",
      invoice_number: "INV-2025-002",
      receipt_url: null,
      payment_date: "2025-04-06",
      payment_for: "Basic Monthly Membership"
    },
    {
      id: 3,
      member_name: "Amit Verma",
      member_id: "MBR-003",
      payment_amount: 200000, // in cents
      payment_mode: "Card",
      payment_status: "Failed",
      invoice_number: "INV-2025-003",
      receipt_url: null,
      payment_date: "2025-04-07",
      payment_for: "Personal Training Package"
    },
    {
      id: 4,
      member_name: "Sarah Kim",
      member_id: "MBR-004",
      payment_amount: 500000, // in cents
      payment_mode: "Razorpay",
      payment_status: "Paid",
      invoice_number: "INV-2025-004",
      receipt_url: "https://example.com/receipts/INV-2025-004.pdf",
      payment_date: "2025-04-08",
      payment_for: "Corporate Package"
    }
  ]);

  // Sample data for attendance
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      member_name: "Alex Johnson",
      member_id: "MBR-001",
      date: "2025-04-05",
      checkin_time: "06:15",
      checkout_time: "07:45",
      attendance_status: "Present",
      mode: "QR"
    },
    {
      id: 2,
      member_name: "Priya Patel",
      member_id: "MBR-002",
      date: "2025-04-05",
      checkin_time: "09:30",
      checkout_time: "10:45",
      attendance_status: "Late",
      mode: "Manual"
    },
    {
      id: 3,
      member_name: "Amit Verma",
      member_id: "MBR-003",
      date: "2025-04-05",
      checkin_time: null,
      checkout_time: null,
      attendance_status: "Absent",
      mode: "QR"
    },
    {
      id: 4,
      member_name: "Sarah Kim",
      member_id: "MBR-004",
      date: "2025-04-05",
      checkin_time: "05:55",
      checkout_time: "07:30",
      attendance_status: "Present",
      mode: "QR"
    },
    {
      id: 5,
      member_name: "Michael Brown",
      member_id: "MBR-005",
      date: "2025-04-05",
      checkin_time: null,
      checkout_time: null,
      attendance_status: "No-Show",
      mode: "Manual"
    }
  ]);

  // Payment pagination logic
  const paymentIndexOfLastEntry = paymentCurrentPage * paymentEntriesPerPage;
  const paymentIndexOfFirstEntry = paymentIndexOfLastEntry - paymentEntriesPerPage;
  const currentPayments = payments.slice(paymentIndexOfFirstEntry, paymentIndexOfLastEntry);
  const paymentTotalPages = Math.ceil(payments.length / paymentEntriesPerPage);
  
  // Attendance pagination logic
  const attendanceIndexOfLastEntry = attendanceCurrentPage * attendanceEntriesPerPage;
  const attendanceIndexOfFirstEntry = attendanceIndexOfLastEntry - attendanceEntriesPerPage;
  const currentAttendanceRecords = attendanceRecords.slice(attendanceIndexOfFirstEntry, attendanceIndexOfLastEntry);
  const attendanceTotalPages = Math.ceil(attendanceRecords.length / attendanceEntriesPerPage);
  
  // Handle payment entries per page change
  const handlePaymentEntriesChange = (e) => {
    setPaymentEntriesPerPage(parseInt(e.target.value));
    setPaymentCurrentPage(1); // Reset to first page when entries per page changes
  };
  
  // Handle attendance entries per page change
  const handleAttendanceEntriesChange = (e) => {
    setAttendanceEntriesPerPage(parseInt(e.target.value));
    setAttendanceCurrentPage(1); // Reset to first page when entries per page changes
  };
  
  // Handle payment page change
  const paymentPaginate = (pageNumber) => setPaymentCurrentPage(pageNumber);
  
  // Handle attendance page change
  const attendancePaginate = (pageNumber) => setAttendanceCurrentPage(pageNumber);
  
  // Payment navigation functions
  const paymentNextPage = () => {
    if (paymentCurrentPage < paymentTotalPages) {
      setPaymentCurrentPage(paymentCurrentPage + 1);
    }
  };
  
  const paymentPrevPage = () => {
    if (paymentCurrentPage > 1) {
      setPaymentCurrentPage(paymentCurrentPage - 1);
    }
  };
  
  // Attendance navigation functions
  const attendanceNextPage = () => {
    if (attendanceCurrentPage < attendanceTotalPages) {
      setAttendanceCurrentPage(attendanceCurrentPage + 1);
    }
  };
  
  const attendancePrevPage = () => {
    if (attendanceCurrentPage > 1) {
      setAttendanceCurrentPage(attendanceCurrentPage - 1);
    }
  };

  // Payment handlers
  const handleAddPayment = () => {
    setPaymentModalType('add');
    setSelectedPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleViewPayment = (payment) => {
    setPaymentModalType('view');
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setPaymentModalType('edit');
    setSelectedPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handleGenerateReceipt = (payment) => {
    alert(`Receipt generated for ${payment.member_name} (Invoice: ${payment.invoice_number})`);
    // In a real app, this would generate and download a receipt
  };

  const handleMarkAsPaid = (payment) => {
    const updatedPayments = payments.map(p => 
      p.id === payment.id ? { ...p, payment_status: "Paid" } : p
    );
    setPayments(updatedPayments);
    alert(`Payment marked as paid for ${payment.member_name}`);
  };

  const handleRefund = (payment) => {
    const updatedPayments = payments.map(p => 
      p.id === payment.id ? { ...p, payment_status: "Refunded" } : p
    );
    setPayments(updatedPayments);
    alert(`Refund processed for ${payment.member_name}`);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  // Attendance handlers
  const handleFilterAttendance = () => {
    setAttendanceModalType('filter');
    setIsAttendanceModalOpen(true);
  };

  const handleViewMemberDetails = (record) => {
    setAttendanceModalType('view');
    setSelectedAttendance(record);
    setIsAttendanceModalOpen(true);
  };

  const handleExportAttendance = (format) => {
    alert(`Exporting attendance data as ${format.toUpperCase()}`);
    // In a real app, this would generate and download the file
  };

  const closeAttendanceModal = () => {
    setIsAttendanceModalOpen(false);
    setSelectedAttendance(null);
  };

  // Prevent background scroll
  React.useEffect(() => {
    if (isPaymentModalOpen || isAttendanceModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPaymentModalOpen, isAttendanceModalOpen]);

  // Format currency from cents to rupees
  const formatCurrency = (amountInCents) => {
    return `₹${(amountInCents / 100).toFixed(2)}`;
  };

  // Get status badge for payments
  const getPaymentStatusBadge = (status) => {
    const badgeClasses = {
      Paid: "bg-success-subtle text-success-emphasis",
      Pending: "bg-warning-subtle text-warning-emphasis",
      Failed: "bg-danger-subtle text-danger-emphasis",
      Refunded: "bg-info-subtle text-info-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  // Get status badge for attendance
  const getAttendanceStatusBadge = (status) => {
    const badgeClasses = {
      Present: "bg-success-subtle text-success-emphasis",
      Absent: "bg-danger-subtle text-danger-emphasis",
      Late: "bg-warning-subtle text-warning-emphasis",
      "No-Show": "bg-secondary-subtle text-secondary-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold">Receptionist Dashboard</h2>
          <p className="text-muted mb-0">Manage payments and view attendance reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs border-0">
            <li className="nav-item">
              <button
                className={`nav-link col-12 px-4 ${activeTab === 'payment' ? 'active' : ''}`}
                style={activeTab === 'payment' ? { 
                  backgroundColor: '#218ebaff', 
                  color: 'white',
                  border: 'gray',
                  borderRadius: '8px 8px 0 0'
                } : {}}
                onClick={() => setActiveTab('payment')}
              >
                <FaMoneyBillWave className="me-2" /> Payment Collection
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link col-12 px-4 ${activeTab === 'attendance' ? 'active' : ''}`}
                style={activeTab === 'attendance' ? { 
                  backgroundColor: '#218ebaff', 
                  color: 'white',
                  border: 'gray',
                  borderRadius: '8px 8px 0 0'
                } : {}}
                onClick={() => setActiveTab('attendance')}
              >
                <FaCalendarAlt className="me-2" /> Daily Attendance Report
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="row">
        <div className="col-12">
          {/* Payment Collection Tab */}
          {activeTab === 'payment' && (
            <div>
              {/* Header */}
              <div className="row mb-4 align-items-center">
                <div className="col-12 col-lg-8">
                  <h3 className="fw-bold">Payment Collection</h3>
                  <p className="text-muted mb-0">Manage member payments and receipts</p>
                </div>
                <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
                  <button
                    className="btn d-flex align-items-center justify-content-center col-12"
                    style={{
                      backgroundColor: '#6EB2CC',
                      color: 'white',
                      border: '#575353ff',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={handleAddPayment}
                  >
                    <i className="fas fa-plus me-2"></i> Add Payment
                  </button>
                </div>
              </div>

              {/* Search & Actions */}
              <div className="row mb-4 g-3">
                <div className="col-12 col-md-6 col-lg-5">
                  <div className="input-group">
                    {/* <span className="input-group-text bg-light border">
                      <i className="fas fa-search text-muted"></i>
                    </span> */}
                    <input
                      type="text"
                      className="form-control border"
                      placeholder="Search by member name or invoice..."
                    />
                  </div>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                  <button className="btn btn-outline-secondary w-100">
                    <i className="fas fa-filter me-1"></i> Filter
                  </button>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                  <button className="btn btn-outline-secondary w-100">
                    <i className="fas fa-file-export me-1"></i> Export
                  </button>
                </div>
              </div>

              {/* Show Entries Dropdown */}
              <div className="row mb-3">
                <div className="col-12 col-md-6">
                  <div className="d-flex align-items-center">
                    <span className="me-2">Show</span>
                    <select 
                      className="form-select form-select-sm w-auto" 
                      value={paymentEntriesPerPage}
                      onChange={handlePaymentEntriesChange}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="ms-2">entries</span>
                  </div>
                </div>
              </div>

              {/* Payment Table */}
              <div className="card shadow-sm border-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="fw-semibold">MEMBER</th>
                        <th className="fw-semibold">AMOUNT</th>
                        <th className="fw-semibold">MODE</th>
                        <th className="fw-semibold">STATUS</th>
                        <th className="fw-semibold">INVOICE</th>
                        <th className="fw-semibold">DATE</th>
                        <th className="fw-semibold text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            <div>
                              <strong>{payment.member_name}</strong>
                              <div className="small text-muted">{payment.member_id}</div>
                            </div>
                          </td>
                          <td><strong>{formatCurrency(payment.payment_amount)}</strong></td>
                          <td>{payment.payment_mode}</td>
                          <td>{getPaymentStatusBadge(payment.payment_status)}</td>
                          <td>{payment.invoice_number}</td>
                          <td>{formatDate(payment.payment_date)}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-secondary me-1"
                              title="View Details"
                              onClick={() => handleViewPayment(payment)}
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              title="Generate Receipt"
                              onClick={() => handleGenerateReceipt(payment)}
                              disabled={payment.payment_status !== 'Paid'}
                            >
                              <FaReceipt size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success me-1"
                              title="Mark as Paid"
                              onClick={() => handleMarkAsPaid(payment)}
                              disabled={payment.payment_status === 'Paid' || payment.payment_status === 'Refunded'}
                            >
                              <FaCheck size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              title="Refund"
                              onClick={() => handleRefund(payment)}
                              disabled={payment.payment_status !== 'Paid'}
                            >
                              <FaUndo size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Pagination */}
              <div className="row mt-3">
                <div className="col-12 col-md-5">
                  <div className="d-flex align-items-center">
                    <span>
                      Showing {paymentIndexOfFirstEntry + 1} to {Math.min(paymentIndexOfLastEntry, payments.length)} of {payments.length} entries
                    </span>
                  </div>
                </div>
                <div className="col-12 col-md-7">
                  <div className="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${paymentCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={paymentPrevPage}>
                            Previous
                          </button>
                        </li>
                        <li className={`page-item ${paymentCurrentPage === 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => paymentPaginate(1)}>
                            1
                          </button>
                        </li>
                        {paymentTotalPages > 1 && (
                          <li className={`page-item ${paymentCurrentPage === 2 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paymentPaginate(2)}>
                              2
                            </button>
                          </li>
                        )}
                        {paymentTotalPages > 2 && (
                          <li className={`page-item ${paymentCurrentPage === 3 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => paymentPaginate(3)}>
                              3
                            </button>
                          </li>
                        )}
                        <li className={`page-item ${paymentCurrentPage === paymentTotalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={paymentNextPage}>
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Attendance Report Tab */}
          {activeTab === 'attendance' && (
            <div>
              {/* Header */}
              <div className="row mb-4 align-items-center">
                <div className="col-12 col-lg-8">
                  <h3 className="fw-bold">Daily Attendance Report</h3>
                  <p className="text-muted mb-0">View and filter member attendance records</p>
                </div>
                <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0 d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
                  <button
                    className="btn d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={handleFilterAttendance}
                  >
                    <FaFilter className="me-2" /> Filter
                  </button>
                  <div className="btn-group">
                    <button
                      className="btn d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: '#6EB2CC',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px 0 0 8px',
                        padding: '10px 15px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => handleExportAttendance('csv')}
                      title="Export as CSV"
                    >
                      <FaFileCsv />
                    </button>
                    <button
                      className="btn d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: '#6EB2CC',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0 8px 8px 0',
                        padding: '10px 15px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => handleExportAttendance('pdf')}
                      title="Export as PDF"
                    >
                      <FaFilePdf />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search & Actions */}
              <div className="row mb-4 g-3">
                <div className="col-12 col-md-6 col-lg-5">
                  <div className="input-group">
                    <span className="input-group-text bg-light border">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border"
                      placeholder="Search by member name..."
                    />
                  </div>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                  <button className="btn btn-outline-secondary w-100">
                    <i className="fas fa-filter me-1"></i> Filter
                  </button>
                </div>
              </div>

              {/* Show Entries Dropdown */}
              <div className="row mb-3">
                <div className="col-12 col-md-6">
                  <div className="d-flex align-items-center">
                    <span className="me-2">Show</span>
                    <select 
                      className="form-select form-select-sm w-auto" 
                      value={attendanceEntriesPerPage}
                      onChange={handleAttendanceEntriesChange}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="ms-2">entries</span>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="card shadow-sm border-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="fw-semibold">MEMBER</th>
                        <th className="fw-semibold">DATE</th>
                        <th className="fw-semibold">CHECK-IN</th>
                        <th className="fw-semibold">CHECK-OUT</th>
                        <th className="fw-semibold">STATUS</th>
                        <th className="fw-semibold">MODE</th>
                        <th className="fw-semibold text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAttendanceRecords.map((record) => (
                        <tr key={record.id}>
                          <td>
                            <div>
                              <strong>{record.member_name}</strong>
                              <div className="small text-muted">{record.member_id}</div>
                            </div>
                          </td>
                          <td>{formatDate(record.date)}</td>
                          <td>{record.checkin_time || <span className="text-muted">—</span>}</td>
                          <td>{record.checkout_time || <span className="text-muted">—</span>}</td>
                          <td>{getAttendanceStatusBadge(record.attendance_status)}</td>
                          <td>{record.mode}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="View Member Details"
                              onClick={() => handleViewMemberDetails(record)}
                            >
                              <FaEye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Pagination */}
              <div className="row mt-3">
                <div className="col-12 col-md-5">
                  <div className="d-flex align-items-center">
                    <span>
                      Showing {attendanceIndexOfFirstEntry + 1} to {Math.min(attendanceIndexOfLastEntry, attendanceRecords.length)} of {attendanceRecords.length} entries
                    </span>
                  </div>
                </div>
                <div className="col-12 col-md-7">
                  <div className="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${attendanceCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={attendancePrevPage}>
                            Previous
                          </button>
                        </li>
                        <li className={`page-item ${attendanceCurrentPage === 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => attendancePaginate(1)}>
                            1
                          </button>
                        </li>
                        {attendanceTotalPages > 1 && (
                          <li className={`page-item ${attendanceCurrentPage === 2 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => attendancePaginate(2)}>
                              2
                            </button>
                          </li>
                        )}
                        {attendanceTotalPages > 2 && (
                          <li className={`page-item ${attendanceCurrentPage === 3 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => attendancePaginate(3)}>
                              3
                            </button>
                          </li>
                        )}
                        <li className={`page-item ${attendanceCurrentPage === attendanceTotalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={attendanceNextPage}>
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closePaymentModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {paymentModalType === 'add' ? 'Add New Payment' : 
                   paymentModalType === 'edit' ? 'Edit Payment' : 
                   'Payment Details'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePaymentModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form>
                  {/* Member & Amount */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Member <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        defaultValue={selectedPayment?.member_name || ''}
                        readOnly={paymentModalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Amount (₹) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        defaultValue={selectedPayment ? (selectedPayment.payment_amount / 100).toFixed(2) : ''}
                        placeholder="0.00"
                        readOnly={paymentModalType === 'view'}
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Mode & Status */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Payment Mode <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        defaultValue={selectedPayment?.payment_mode || 'Razorpay'}
                        disabled={paymentModalType === 'view'}
                        required
                      >
                        <option value="Razorpay">Razorpay</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Payment Status <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        defaultValue={selectedPayment?.payment_status || 'Pending'}
                        disabled={paymentModalType === 'view'}
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Invoice & Receipt */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Invoice Number <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        defaultValue={selectedPayment?.invoice_number || ''}
                        readOnly={paymentModalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Receipt URL</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        defaultValue={selectedPayment?.receipt_url || ''}
                        placeholder="https://example.com/receipt.pdf"
                        readOnly={paymentModalType === 'view'}
                      />
                    </div>
                  </div>

                  {/* Payment For */}
                  <div className="mb-4">
                    <label className="form-label">Payment For <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      defaultValue={selectedPayment?.payment_for || ''}
                      placeholder="e.g., Membership, PT Session"
                      readOnly={paymentModalType === 'view'}
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={closePaymentModal}
                    >
                      Close
                    </button>
                    {paymentModalType !== 'view' && (
                      <button
                        type="button"
                        className="btn"
                        style={{
                          backgroundColor: '#6EB2CC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: '500',
                        }}
                        onClick={() => {
                          alert(`Payment ${paymentModalType === 'add' ? 'added' : 'updated'} successfully!`);
                          closePaymentModal();
                        }}
                      >
                        {paymentModalType === 'add' ? 'Add Payment' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE MODAL */}
      {isAttendanceModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeAttendanceModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {attendanceModalType === 'filter' ? 'Filter Attendance Records' : 
                   'Member Attendance Details'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAttendanceModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                {attendanceModalType === 'filter' ? (
                  // Filter Form
                  <form>
                    {/* Date Range */}
                    <div className="row mb-3 g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">From Date</label>
                        <input
                          type="date"
                          className="form-control rounded-3"
                          defaultValue={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">To Date</label>
                        <input
                          type="date"
                          className="form-control rounded-3"
                          defaultValue={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Member & Status */}
                    <div className="row mb-3 g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Member (Optional)</label>
                        <select className="form-select rounded-3">
                          <option value="">All Members</option>
                          <option value="MBR-001">Alex Johnson (MBR-001)</option>
                          <option value="MBR-002">Priya Patel (MBR-002)</option>
                          <option value="MBR-003">Amit Verma (MBR-003)</option>
                          <option value="MBR-004">Sarah Kim (MBR-004)</option>
                          <option value="MBR-005">Michael Brown (MBR-005)</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Attendance Status</label>
                        <select className="form-select rounded-3">
                          <option value="">All Statuses</option>
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                          <option value="No-Show">No-Show</option>
                        </select>
                      </div>
                    </div>

                    {/* Branch (if applicable) */}
                    <div className="mb-4">
                      <label className="form-label">Branch (Optional)</label>
                      <select className="form-select rounded-3">
                        <option value="">All Branches</option>
                        <option value="1">Main Branch</option>
                        <option value="2">Downtown Branch</option>
                        <option value="3">Westside Branch</option>
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2"
                        onClick={closeAttendanceModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{
                          backgroundColor: '#6EB2CC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: '500',
                        }}
                        onClick={() => {
                          alert('Filters applied successfully!');
                          closeAttendanceModal();
                        }}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </form>
                ) : (
                  // Member Details View
                  <div>
                    <div className="row mb-4">
                      <div className="col-12">
                        <h5 className="fw-bold">{selectedAttendance?.member_name}</h5>
                        <p className="text-muted mb-0">Member ID: {selectedAttendance?.member_id}</p>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <p className="mb-1"><strong>Date:</strong> {formatDate(selectedAttendance?.date)}</p>
                        <p className="mb-1"><strong>Status:</strong> {getAttendanceStatusBadge(selectedAttendance?.attendance_status)}</p>
                      </div>
                      <div className="col-6">
                        <p className="mb-1"><strong>Check-in:</strong> {selectedAttendance?.checkin_time || '—'}</p>
                        <p className="mb-1"><strong>Check-out:</strong> {selectedAttendance?.checkout_time || '—'}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="mb-1"><strong>Mode:</strong> {selectedAttendance?.mode}</p>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2"
                        onClick={closeAttendanceModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistPaymentCollection;