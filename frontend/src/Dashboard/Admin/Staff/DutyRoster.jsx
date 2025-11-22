import React, { useState, useEffect, useRef } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaPlus, FaSearch, FaFilter, FaFileExport, FaExclamationTriangle, FaCheck, FaClock, FaSave, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';

const DutyRoster = () => {
  // ===== STATE MANAGEMENT =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // API data states
  const [records, setRecords] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Form states
  const [shiftType, setShiftType] = useState('Straight Shift');
  const [breaks, setBreaks] = useState([{ start: '', end: '' }]);
  const formRef = useRef({});

  // ===== API INTEGRATION =====
  const fetchDutyRosters = async () => {
    try {
      const response = await axiosInstance.get('/duty-rosters');
      if (response.data.success) {
        // Transform API response to match frontend structure
        const transformedRecords = response.data.data.records?.map(record => ({
          id: record.shift_id,
          shift_id: record.shift_id,
          staff_id: record.staff_id,
          staff_name: record.staff_name,
          role: record.role,
          shift_type: record.shift_type,
          date: record.date,
          start_time: record.start_time,
          end_time: record.end_time,
          breaks: record.breaks || [],
          approved_by: record.approved_by,
          approved_by_name: record.approved_by_name,
          approved_at: record.approved_at,
          status: record.status
        })) || [];
        setRecords(transformedRecords);
      }
    } catch (err) {
      console.error('Error fetching duty rosters:', err);
      throw new Error('Failed to fetch duty rosters');
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await axiosInstance.get('/duty-rosters/staff-members');
      if (response.data.success) {
        const transformedStaff = response.data.data.staffMembers?.map(staff => ({
          id: staff.id,
          staff_id: staff.staffId,
          name: staff.name,
          role: staff.role,
          email: staff.email,
          phone: staff.phone
        })) || [];
        setStaffMembers(transformedStaff);
      }
    } catch (err) {
      console.error('Error fetching staff members:', err);
      throw new Error('Failed to fetch staff members');
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axiosInstance.get('/duty-rosters/managers');
      if (response.data.success) {
        const transformedManagers = response.data.data.managers?.map(manager => ({
          id: manager.id,
          name: manager.name,
          role: manager.role
        })) || [];
        setManagers(transformedManagers);
      }
    } catch (err) {
      console.error('Error fetching managers:', err);
      throw new Error('Failed to fetch managers');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchDutyRosters(),
        fetchStaffMembers(),
        fetchManagers()
      ]);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===== FILTERED DATA =====
  const filteredRecords = records.filter(record =>
    (record.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     record.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
     record.status.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'All' || record.role === roleFilter) &&
    (statusFilter === 'All Status' || record.status === statusFilter)
  );

  // Get unique roles for dropdown
  const allRoles = ['All', ...new Set(staffMembers.map(s => s.role))];

  // ===== MODAL HANDLERS =====
  const handleAddNew = () => {
    setModalType('add');
    setSelectedRecord(null);
    setShiftType('Straight Shift');
    setBreaks([{ start: '', end: '' }]);
    setIsModalOpen(true);
  };

  const handleView = (record) => {
    setModalType('view');
    setSelectedRecord(record);
    setShiftType(record.shift_type);
    setBreaks(record.breaks.length > 0 ? record.breaks : [{ start: '', end: '' }]);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setModalType('edit');
    setSelectedRecord(record);
    setShiftType(record.shift_type);
    setBreaks(record.breaks.length > 0 ? record.breaks : [{ start: '', end: '' }]);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRecord) return;

    try {
      setSubmitLoading(true);
      const response = await axiosInstance.delete(`/duty-rosters/${selectedRecord.id}`);
      
      if (response.data.success) {
        setRecords(prev => prev.filter(r => r.id !== selectedRecord.id));
        alert(`Shift record for ${selectedRecord.staff_name} has been deleted successfully.`);
      } else {
        alert('Failed to delete shift record: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete shift record';
      alert(errorMessage);
      console.error('Error deleting shift record:', err);
    } finally {
      setSubmitLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setBreaks([{ start: '', end: '' }]);
    formRef.current = {};
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  // ===== BREAK MANAGEMENT =====
  const addBreak = () => {
    setBreaks([...breaks, { start: '', end: '' }]);
  };

  const removeBreak = (index) => {
    if (breaks.length > 1) {
      const updatedBreaks = [...breaks];
      updatedBreaks.splice(index, 1);
      setBreaks(updatedBreaks);
    }
  };

  const handleBreakChange = (index, field, value) => {
    const updatedBreaks = [...breaks];
    updatedBreaks[index][field] = value;
    setBreaks(updatedBreaks);
  };

  // ===== FORM SUBMISSION =====
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    
    // Basic validation
    const staffId = form.staff?.value;
    const date = form.date?.value;
    const startTime = form.start_time?.value;
    const endTime = form.end_time?.value;

    if (!staffId || !date || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitLoading(true);

      const selectedStaff = staffMembers.find(s => s.id === parseInt(staffId));
      if (!selectedStaff) {
        alert('Invalid staff selection');
        return;
      }

      const payload = {
        staff_id: parseInt(staffId),
        shift_type: form.shift_type?.value,
        date: date,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        breaks: shiftType === 'Break Shift' ? breaks.filter(b => b.start && b.end).map(breakItem => ({
          start: new Date(breakItem.start).toISOString(),
          end: new Date(breakItem.end).toISOString()
        })) : [],
        status: form.status?.value || 'Scheduled'
      };

      let response;

      if (modalType === 'add') {
        // Create new duty roster
        response = await axiosInstance.post('/duty-rosters', payload);
        if (response.data.success) {
          const newRecord = {
            id: response.data.data.record?.shift_id,
            ...payload,
            staff_name: selectedStaff.name,
            role: selectedStaff.role,
            approved_by: null,
            approved_by_name: null,
            approved_at: null
          };
          setRecords(prev => [...prev, newRecord]);
          alert('Shift allocation added successfully!');
        }
      } else if (modalType === 'edit') {
        // Update existing duty roster
        response = await axiosInstance.put(`/duty-rosters/${selectedRecord.id}`, payload);
        if (response.data.success) {
          const updatedRecord = {
            ...selectedRecord,
            ...payload,
            staff_name: selectedStaff.name,
            role: selectedStaff.role
          };
          setRecords(prev => prev.map(r => r.id === selectedRecord.id ? updatedRecord : r));
          alert('Shift allocation updated successfully!');
        }
      }

      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save shift record';
      alert(errorMessage);
      console.error('Error saving shift record:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // ===== APPROVE SHIFT =====
  const approveShift = async (record) => {
    try {
      setSubmitLoading(true);
      const response = await axiosInstance.patch(`/duty-rosters/${record.id}/approve`);
      
      if (response.data.success) {
        const updatedRecord = {
          ...record,
          approved_by: response.data.data.record?.approved_by,
          approved_by_name: response.data.data.record?.approved_by_name,
          approved_at: response.data.data.record?.approved_at,
          status: 'Approved'
        };
        setRecords(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
        alert(`Shift for ${record.staff_name} has been approved successfully!`);
      } else {
        alert('Failed to approve shift: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve shift';
      alert(errorMessage);
      console.error('Error approving shift:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // ===== EXPORT FUNCTION =====
  const exportCSV = () => {
    const header = ["Date", "Staff Name", "Role", "Shift Type", "Start Time", "End Time", "Approved By", "Status"];
    const rows = filteredRecords.map(record => [
      record.date,
      record.staff_name,
      record.role,
      record.shift_type,
      formatTime(record.start_time),
      formatTime(record.end_time),
      record.approved_by_name || "-",
      record.status
    ]);
    const csv = [header, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `duty_roster_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  // ===== UI HELPERS =====
  const getStatusBadge = (status) => {
    const badgeClasses = {
      Scheduled: "bg-warning text-dark",
      Approved: "bg-success text-white",
      Completed: "bg-info text-white"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getShiftTypeBadge = (type) => {
    const badgeClasses = {
      'Straight Shift': "bg-primary text-white",
      'Break Shift': "bg-info text-black"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[type] || 'bg-secondary'} px-3 py-1`}>
        {type}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      "Personal Trainer": "bg-primary",
      "Receptionist": "bg-info",
      "Housekeeping": "bg-secondary",
      "General Trainer": "bg-success",
      "Trainer": "bg-success",
      "Admin": "bg-danger"
    };
    return (
      <span className={`badge rounded-pill ${colors[role] || 'bg-light'} text-dark px-2 py-1`}>
        {role}
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return 'Add New Shift Allocation';
      case 'edit': return 'Edit Shift Allocation';
      case 'view':
      default: return 'View Shift Allocation';
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

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return <span className="text-muted">—</span>;
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ===== LOADING AND ERROR STATES =====
  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading duty roster data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button 
            className="btn btn-sm btn-outline-danger"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8 mb-3 mb-lg-0">
          <h2 className="fw-bold h4 h2-md">Duty Roster Management</h2>
          <p className="text-muted mb-0 small small-md">Manage staff shift allocations by role and shift type.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end">
          <button
            className="btn w-100 w-md-auto"
            style={{
              backgroundColor: '#6EB2CC',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
            onClick={handleAddNew}
          >
            <FaPlus className="me-2" /> New Shift
          </button>
        </div>
      </div>

      {/* Search, Role Filter & Actions */}
      <div className="row mb-4 g-2 g-md-3">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="input-group input-group-sm input-group-md">
            <span className="input-group-text bg-light border-end-0">
              <FaSearch className="text-muted" size={14} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search staff, role, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-6 col-md-3 col-lg-2">
          <label className="form-label small d-none d-md-block">Role</label>
          <select
            className="form-select form-select-sm form-select-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {allRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-3 col-lg-2">
          <label className="form-label small d-none d-md-block">Status</label>
          <select
            className="form-select form-select-sm form-select-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Scheduled</option>
            <option>Approved</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100 btn-sm btn-md">
            <FaFilter className="me-1" /> Filter
          </button>
        </div>
        
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100 btn-sm btn-md" onClick={exportCSV}>
            <FaFileExport className="me-1" /> Export
          </button>
        </div>

        <div className="col-12 col-md-6 col-lg-1 d-flex justify-content-end align-items-end">
          <div className="text-muted small">
            {filteredRecords.length} records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold small">DATE</th>
                <th className="fw-semibold small">STAFF NAME</th>
                <th className="fw-semibold small">ROLE</th>
                <th className="fw-semibold small">SHIFT TYPE</th>
                <th className="fw-semibold small">START TIME</th>
                <th className="fw-semibold small">END TIME</th>
                <th className="fw-semibold small d-none d-md-table-cell">APPROVED BY</th>
                <th className="fw-semibold small">STATUS</th>
                <th className="fw-semibold small text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="mb-2">
                      <FaSearch size={32} className="text-muted" />
                    </div>
                    No shift records found
                    {searchTerm || roleFilter !== 'All' || statusFilter !== 'All Status' ? 
                      ' matching your filters' : ''
                    }
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="small">{formatDate(record.date)}</td>
                    <td className="small"><strong>{record.staff_name}</strong></td>
                    <td className="small">{getRoleBadge(record.role)}</td>
                    <td className="small">{getShiftTypeBadge(record.shift_type)}</td>
                    <td className="small">{formatTime(record.start_time)}</td>
                    <td className="small">{formatTime(record.end_time)}</td>
                    <td className="small d-none d-md-table-cell">
                      {record.approved_by_name || <span className="text-muted">—</span>}
                    </td>
                    <td className="small">{getStatusBadge(record.status)}</td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          title="View"
                          onClick={() => handleView(record)}
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          title="Edit"
                          onClick={() => handleEdit(record)}
                          disabled={record.status === 'Approved'}
                        >
                          <FaEdit size={12} />
                        </button>
                        {record.status !== 'Approved' && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            title="Approve"
                            onClick={() => approveShift(record)}
                            disabled={submitLoading}
                          >
                            <FaCheck size={12} />
                          </button>
                        )}
                        <button
                          className="btn btn-outline-danger btn-sm"
                          title="Delete"
                          onClick={() => handleDeleteClick(record)}
                          disabled={record.status === 'Approved'}
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MAIN MODAL */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered m-0 m-sm-3"
            onClick={(e) => e.stopPropagation()}
            key={selectedRecord ? selectedRecord.id : 'add'}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold h6 h5-md">{getModalTitle()}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={submitLoading}
                ></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <form onSubmit={handleFormSubmit}>
                  {/* Staff & Role */}
                  <div className="row mb-3 g-2 g-md-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Staff Member <span className="text-danger">*</span>
                      </label>
                      <select
                        name="staff_id"
                        className="form-select form-select-sm form-select-md"
                        defaultValue={selectedRecord?.staff_id || ''}
                        disabled={modalType === 'view' || submitLoading}
                        ref={input => formRef.current.staff = input}
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

                    <div className="col-12 col-md-6">
                      <label className="form-label small">Assigned Role</label>
                      <input
                        type="text"
                        className="form-control form-control-sm form-control-md"
                        value={selectedRecord?.role || ''}
                        readOnly
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                    </div>
                  </div>

                  {/* Shift Type & Date */}
                  <div className="row mb-3 g-2 g-md-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Shift Type <span className="text-danger">*</span>
                      </label>
                      <select
                        name="shift_type"
                        className="form-select form-select-sm form-select-md"
                        defaultValue={selectedRecord?.shift_type || 'Straight Shift'}
                        disabled={modalType === 'view' || submitLoading}
                        onChange={(e) => setShiftType(e.target.value)}
                        ref={input => formRef.current.shift_type = input}
                        required
                      >
                        <option value="Straight Shift">Straight Shift</option>
                        <option value="Break Shift">Break Shift</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Date <span className="text-danger">*</span>
                      </label>
                      <input
                        name="date"
                        type="date"
                        className="form-control form-control-sm form-control-md"
                        defaultValue={selectedRecord?.date || new Date().toISOString().split('T')[0]}
                        readOnly={modalType === 'view' || submitLoading}
                        ref={input => formRef.current.date = input}
                        required
                      />
                    </div>
                  </div>

                  {/* Start & End Time */}
                  <div className="row mb-3 g-2 g-md-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Start Time <span className="text-danger">*</span>
                      </label>
                      <input
                        name="start_time"
                        type="datetime-local"
                        className="form-control form-control-sm form-control-md"
                        defaultValue={selectedRecord?.start_time ? new Date(selectedRecord.start_time).toISOString().slice(0, 16) : ''}
                        readOnly={modalType === 'view' || submitLoading}
                        ref={input => formRef.current.start_time = input}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        End Time <span className="text-danger">*</span>
                      </label>
                      <input
                        name="end_time"
                        type="datetime-local"
                        className="form-control form-control-sm form-control-md"
                        defaultValue={selectedRecord?.end_time ? new Date(selectedRecord.end_time).toISOString().slice(0, 16) : ''}
                        readOnly={modalType === 'view' || submitLoading}
                        ref={input => formRef.current.end_time = input}
                        required
                      />
                    </div>
                  </div>

                  {/* Breaks for Break Shift */}
                  {shiftType === 'Break Shift' && (
                    <div className="mb-3">
                      <label className="form-label small d-flex justify-content-between align-items-center">
                        Breaks
                        {modalType !== 'view' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={addBreak}
                            disabled={submitLoading}
                          >
                            <FaPlus size={12} /> Add Break
                          </button>
                        )}
                      </label>
                      {breaks.map((breakItem, index) => (
                        <div key={index} className="row g-2 mb-2">
                          <div className="col-12 col-md-5">
                            <input
                              type="datetime-local"
                              className="form-control form-control-sm"
                              value={breakItem.start}
                              onChange={(e) => handleBreakChange(index, 'start', e.target.value)}
                              readOnly={modalType === 'view' || submitLoading}
                            />
                          </div>
                          <div className="col-12 col-md-5">
                            <input
                              type="datetime-local"
                              className="form-control form-control-sm"
                              value={breakItem.end}
                              onChange={(e) => handleBreakChange(index, 'end', e.target.value)}
                              readOnly={modalType === 'view' || submitLoading}
                            />
                          </div>
                          {modalType !== 'view' && breaks.length > 1 && (
                            <div className="col-12 col-md-2 d-flex align-items-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger w-100"
                                onClick={() => removeBreak(index)}
                                disabled={submitLoading}
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status (for edit mode) */}
                  {modalType === 'edit' && (
                    <div className="mb-3">
                      <label className="form-label small">Status</label>
                      <select
                        name="status"
                        className="form-select form-select-sm form-select-md"
                        defaultValue={selectedRecord?.status || 'Scheduled'}
                        disabled={submitLoading}
                        ref={input => formRef.current.status = input}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  )}

                  {/* Approval Info (for view mode) */}
                  {modalType === 'view' && selectedRecord?.approved_by && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <h6 className="fw-bold small">Approval Information</h6>
                      <div className="row">
                        <div className="col-12 col-md-6 mb-2 mb-md-0">
                          <small className="text-muted">Approved By:</small>
                          <p className="mb-0 small">{selectedRecord.approved_by_name}</p>
                        </div>
                        <div className="col-12 col-md-6">
                          <small className="text-muted">Approved At:</small>
                          <p className="mb-0 small">{formatDateTime(selectedRecord.approved_at)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-3 px-md-4 py-2 small"
                      onClick={closeModal}
                      disabled={submitLoading}
                    >
                      Cancel
                    </button>
                    {modalType !== 'view' && (
                      <button
                        type="submit"
                        className="btn px-3 px-md-4 py-2 small d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: '#6EB2CC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '500',
                          minWidth: '140px'
                        }}
                        disabled={submitLoading}
                      >
                        {submitLoading ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            {modalType === 'add' ? 'Creating...' : 'Updating...'}
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" size={14} />
                            {modalType === 'add' ? 'Add Shift' : 'Save Changes'}
                          </>
                        )}
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
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeDeleteModal}
        >
          <div
            className="modal-dialog modal-dialog-centered m-0 m-sm-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold h6 h5-md">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDeleteModal}
                  disabled={submitLoading}
                ></button>
              </div>
              <div className="modal-body text-center py-3 py-md-4">
                <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>
                  <FaExclamationTriangle />
                </div>
                <h5 className="h6 h5-md">Are you sure?</h5>
                <p className="text-muted small small-md">
                  This will permanently delete the shift allocation for <strong>{selectedRecord?.staff_name}</strong> ({selectedRecord?.role}) on <strong>{selectedRecord ? formatDate(selectedRecord.date) : ''}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-3 pb-md-4">
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center w-100">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3 px-md-4 small"
                    onClick={closeDeleteModal}
                    disabled={submitLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-3 px-md-4 small d-flex align-items-center justify-content-center"
                    onClick={confirmDelete}
                    disabled={submitLoading}
                    style={{ minWidth: '100px' }}
                  >
                    {submitLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DutyRoster;