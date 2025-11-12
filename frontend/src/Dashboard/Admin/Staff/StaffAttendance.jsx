import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaPlus, FaSearch, FaFilter, FaFileExport, FaExclamationTriangle } from 'react-icons/fa';

const StaffAttendance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // New: Role Filter

  // 👇 Updated Sample Data with ROLE FIELD
  const [records, setRecords] = useState([
    {
      attendance_id: 1,
      staff_id: 101,
      staff_name: "Alex Johnson",
      role: "Personal Trainer", // 👈 NEW!
      date: "2025-04-05",
      checkin_time: "2025-04-05T06:15:00",
      checkout_time: "2025-04-05T07:45:00",
      mode: "QR",
      shift_id: "SH001",
      shift_name: "Morning Shift",
      status: "Present",
      notes: ""
    },
    {
      attendance_id: 2,
      staff_id: 102,
      staff_name: "Braidy Con",
      role: "Receptionist", // 👈 NEW!
      date: "2025-04-05",
      checkin_time: "2025-04-05T09:30:00",
      checkout_time: "2025-04-05T10:45:00",
      mode: "QR",
      shift_id: "SH002",
      shift_name: "Day Shift",
      status: "Late",
      notes: "Traffic delay"
    },
    {
      attendance_id: 3,
      staff_id: 103,
      staff_name: "Sarah Kim",
      role: "Housekeeping", // 👈 NEW!
      date: "2025-04-05",
      checkin_time: null,
      checkout_time: null,
      mode: "QR",
      shift_id: "SH003",
      shift_name: "Evening Shift",
      status: "Absent",
      notes: "Sick leave"
    },
    {
      attendance_id: 4,
      staff_id: 104,
      staff_name: "Michael Brown",
      role: "General Trainer", // 👈 NEW!
      date: "2025-04-04",
      checkin_time: "2025-04-04T05:55:00",
      checkout_time: "2025-04-04T07:30:00",
      mode: "QR",
      shift_id: "SH001",
      shift_name: "Morning Shift",
      status: "Overtime",
      notes: "Stayed back to complete inventory"
    }
  ]);

  // 👇 Updated Staff Members with Role
  const staffMembers = [
    { id: 101, name: "Alex Johnson", role: "Personal Trainer" },
    { id: 102, name: "Braidy Con", role: "Receptionist" },
    { id: 103, name: "Sarah Kim", role: "Housekeeping" },
    { id: 104, name: "Michael Brown", role: "General Trainer" },
    { id: 105, name: "Emily Davis", role: "Receptionist" }
  ];

  const shifts = [
    { id: "SH001", name: "Morning Shift" },
    { id: "SH002", name: "Day Shift" },
    { id: "SH003", name: "Evening Shift" }
  ];

  // Get unique roles for dropdown
  const allRoles = ['All', ...new Set(staffMembers.map(s => s.role))];

  // Filter records based on search term AND role
  const filteredRecords = records.filter(record =>
    (record.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     record.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
     record.status.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'All' || record.role === roleFilter)
  );

  const handleAddNew = () => {
    setModalType('add');
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleView = (record) => {
    setModalType('view');
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalType('edit');
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      setRecords(prev => prev.filter(r => r.attendance_id !== selectedRecord.attendance_id));
      alert(`Deleted attendance record for ${selectedRecord.staff_name} (${selectedRecord.role}).`);
    }
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  // Prevent background scroll
  useEffect(() => {
    if (isModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isDeleteModalOpen]);

  const getStatusBadge = (status) => {
    const badgeClasses = {
      Present: "bg-success text-white",
      Late: "bg-warning text-dark",
      Absent: "bg-danger text-white",
      Overtime: "bg-info text-white"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      "Personal Trainer": "bg-primary",
      "Receptionist": "bg-info",
      "Housekeeping": "bg-secondary",
      "General Trainer": "bg-success"
    };
    return (
      <span className={`badge rounded-pill ${colors[role] || 'bg-light'} text-dark px-2 py-1 fs-7`}>
        {role}
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return 'Add New Staff Attendance Record';
      case 'edit': return 'Edit Staff Attendance Record';
      case 'view':
      default: return 'View Staff Attendance Record';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return <span className="text-muted">—</span>;
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getNextId = () => {
    return records.length > 0 ? Math.max(...records.map(r => r.attendance_id)) + 1 : 1;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (modalType === 'add') {
      const staffId = parseInt(formData.get('staff_id'));
      const staffData = staffMembers.find(s => s.id === staffId);
      if (!staffData) return alert("Invalid staff selection");

      const shiftId = formData.get('shift_id');
      const shiftName = shifts.find(s => s.id === shiftId)?.name || '';

      const newRecord = {
        attendance_id: getNextId(),
        staff_id: staffId,
        staff_name: staffData.name,
        role: staffData.role, // 👈 Added Role from staffMembers
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        checkin_time: formData.get('checkin_time') || null,
        checkout_time: formData.get('checkout_time') || null,
        mode: formData.get('mode') || 'Manual',
        shift_id: shiftId,
        shift_name: shiftName,
        status: formData.get('status') || 'Present',
        notes: formData.get('notes') || ''
      };
      setRecords(prev => [...prev, newRecord]);
      alert('New staff attendance record added successfully!');
    } else if (modalType === 'edit') {
      const staffId = parseInt(formData.get('staff_id'));
      const staffData = staffMembers.find(s => s.id === staffId);
      if (!staffData) return alert("Invalid staff selection");

      const shiftId = formData.get('shift_id');
      const shiftName = shifts.find(s => s.id === shiftId)?.name || '';

      const updatedRecord = {
        ...selectedRecord,
        staff_id: staffId,
        staff_name: staffData.name,
        role: staffData.role, // 👈 Update Role from staffMembers
        date: formData.get('date') || selectedRecord.date,
        checkin_time: formData.get('checkin_time') || selectedRecord.checkin_time,
        checkout_time: formData.get('checkout_time') || selectedRecord.checkout_time,
        mode: formData.get('mode') || selectedRecord.mode,
        shift_id: shiftId,
        shift_name: shiftName,
        status: formData.get('status') || selectedRecord.status,
        notes: formData.get('notes') || selectedRecord.notes
      };
      setRecords(prev =>
        prev.map(r => r.attendance_id === selectedRecord.attendance_id ? updatedRecord : r)
      );
      alert('Staff attendance record updated successfully!');
    }
    closeModal();
  };

  // Export CSV with Role
  const exportCSV = () => {
    const header = ["Date", "Staff Name", "Role", "Check-in", "Check-out", "Mode", "Shift", "Status", "Notes"];
    const rows = filteredRecords.map(record => [
      record.date,
      record.staff_name,
      record.role,
      formatTime(record.checkin_time),
      formatTime(record.checkout_time),
      record.mode,
      record.shift_name,
      record.status,
      record.notes
    ]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff_attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Staff Attendance Records</h2>
          <p className="text-muted mb-0">Track staff attendance via QR scan or manual entry.</p>
        </div>
        <div className="col-12 col-lg-4 d-flex flex-column flex-lg-row gap-2 justify-content-lg-end mt-3 mt-lg-0">
          <button className="btn btn-outline-primary w-100 w-lg-auto" onClick={exportCSV}>
            <FaFileExport className="me-1" /> Export
          </button>
          <button className="btn btn-primary w-100 w-lg-auto" onClick={handleAddNew}>
            <FaPlus className="me-1" /> Add Record
          </button>
        </div>
      </div>

      {/* Search, Role Filter & Actions */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="input-group">
            <span className="input-group-text bg-light border">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border"
              placeholder="Search by name, role, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Filter by Role</label>
          <select
            className="form-select rounded-3"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {allRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <FaFilter className="me-1" /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold">DATE</th>
                <th className="fw-semibold">STAFF NAME</th>
                <th className="fw-semibold">ROLE</th> {/* 👈 NEW COLUMN */}
                <th className="fw-semibold">CHECK-IN</th>
                <th className="fw-semibold">CHECK-OUT</th>
                <th className="fw-semibold">MODE</th>
                <th className="fw-semibold">SHIFT</th>
                <th className="fw-semibold">STATUS</th>
                <th className="fw-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.attendance_id}>
                  <td>{formatDate(record.date)}</td>
                  <td><strong>{record.staff_name}</strong></td>
                  <td>{getRoleBadge(record.role)}</td> {/* 👈 Role Badge */}
                  <td>{formatTime(record.checkin_time)}</td>
                  <td>{formatTime(record.checkout_time)}</td>
                  <td>
                    <span className={`badge rounded-pill ${
                      record.mode === 'QR' ? 'bg-info text-white' : 'bg-secondary text-white'
                    } px-2 py-1`}>
                      {record.mode}
                    </span>
                  </td>
                  <td>{record.shift_name}</td>
                  <td>{getStatusBadge(record.status)}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center flex-nowrap" style={{ gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-outline-secondary action-btn"
                        title="View"
                        onClick={() => handleView(record)}
                        style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary action-btn"
                        title="Edit"
                        onClick={() => handleEdit(record)}
                        style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger action-btn"
                        title="Delete"
                        onClick={() => handleDeleteClick(record)}
                        style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MAIN MODAL (Add/Edit/View) */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
            key={selectedRecord ? selectedRecord.attendance_id : 'add'}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{getModalTitle()}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleFormSubmit}>
                  {/* Staff & Role (Auto-filled from selection) */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Staff Member <span className="text-danger">*</span></label>
                      <select
                        name="staff_id"
                        className="form-select rounded-3"
                        defaultValue={selectedRecord?.staff_id || ''}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="">Select Staff Member</option>
                        {staffMembers.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Display Selected Role (Read-only in View/Edit) */}
                    <div className="col-12 col-md-6">
                      <label className="form-label">Assigned Role</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        defaultValue={selectedRecord?.role || ''}
                        readOnly
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                    </div>
                  </div>

                  {/* Date & Shift */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Date <span className="text-danger">*</span></label>
                      <input
                        name="date"
                        type="date"
                        className="form-control rounded-3"
                        defaultValue={selectedRecord?.date || new Date().toISOString().split('T')[0]}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Shift</label>
                      <select
                        name="shift_id"
                        className="form-select rounded-3"
                        defaultValue={selectedRecord?.shift_id || ''}
                        disabled={modalType === 'view'}
                      >
                        <option value="">No Shift</option>
                        {shifts.map(shift => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Check-in / Check-out */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Check-in Time</label>
                      <input
                        name="checkin_time"
                        type="datetime-local"
                        className="form-control rounded-3"
                        defaultValue={selectedRecord?.checkin_time || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Check-out Time</label>
                      <input
                        name="checkout_time"
                        type="datetime-local"
                        className="form-control rounded-3"
                        defaultValue={selectedRecord?.checkout_time || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                  </div>

                  {/* Mode & Status */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Mode <span className="text-danger">*</span></label>
                      <select
                        name="mode"
                        className="form-select rounded-3"
                        defaultValue={selectedRecord?.mode || 'QR'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="QR">QR</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Status <span className="text-danger">*</span></label>
                      <select
                        name="status"
                        className="form-select rounded-3"
                        defaultValue={selectedRecord?.status || 'Present'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Overtime">Overtime</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="form-label">Notes</label>
                    <textarea
                      name="notes"
                      className="form-control rounded-3"
                      rows="3"
                      placeholder="Reason for absence or late entry..."
                      defaultValue={selectedRecord?.notes || ''}
                      readOnly={modalType === 'view'}
                    ></textarea>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2 w-100 w-sm-auto"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    {modalType !== 'view' && (
                      <button
                        type="submit"
                        className="btn w-100 w-sm-auto"
                        style={{
                          backgroundColor: '#6EB2CC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: '500',
                        }}
                      >
                        {modalType === 'add' ? 'Add Record' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeDeleteModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3">
                  <FaExclamationTriangle />
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will permanently delete the attendance record for <strong>{selectedRecord?.staff_name}</strong> ({selectedRecord?.role}) on <strong>{selectedRecord ? formatDate(selectedRecord.date) : ''}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 w-100 w-sm-auto"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 w-100 w-sm-auto"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .action-btn {
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .action-btn {
            width: 32px;
            height: 32px;
          }
        }
        
        .form-control, .form-select {
          width: 100%;
        }
        
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.5rem;
            max-width: 95%;
          }
          .modal-content {
            border-radius: 0.5rem;
          }
        }
        
        .table thead th {
          font-size: 0.9rem;
        }
        .table td {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default StaffAttendance;