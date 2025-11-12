// src/components/SalaryCalculator.js
import React, { useState } from 'react';
import { FaPlus, FaTrashAlt, FaEdit, FaEye } from 'react-icons/fa';

const SalaryCalculator = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedSalary, setSelectedSalary] = useState(null);

  // Sample data — in real app, fetch from API
  const staffList = [
    { id: 101, staff_id: "STAFF001", first_name: "Alex", last_name: "Martinez", role: "Manager", fixed_salary: 60000, hourly_rate: null, commission_rate_percent: 0 },
    { id: 102, staff_id: "STAFF002", first_name: "Sarah", last_name: "Kim", role: "Trainer", fixed_salary: null, hourly_rate: 35, commission_rate_percent: 15 },
    { id: 103, staff_id: "STAFF003", first_name: "Raj", last_name: "Patel", role: "Receptionist", fixed_salary: 35000, hourly_rate: null, commission_rate_percent: 0 }
  ];

  const [salaries, setSalaries] = useState([
    {
      salary_id: "SAL001",
      staff_id: "STAFF002",
      period_start: "2025-04-01",
      period_end: "2025-04-30",
      hours_worked: 160,
      hourly_total: 5600,
      fixed_salary: null,
      commission_total: 1200,
      bonuses: [{ label: "Performance Bonus", amount: 500 }],
      deductions: [{ label: "Late Penalty", amount: 100 }],
      net_pay: 7200,
      status: "Paid",
      paid_at: "2025-05-02T10:30:00Z"
    },
    {
      salary_id: "SAL002",
      staff_id: "STAFF001",
      period_start: "2025-04-01",
      period_end: "2025-04-30",
      hours_worked: null,
      hourly_total: null,
      fixed_salary: 5000,
      commission_total: 0,
      bonuses: [],
      deductions: [{ label: "Tax", amount: 800 }],
      net_pay: 4200,
      status: "Approved",
      paid_at: null
    }
  ]);

  // ===== HANDLERS =====
  const handleAddNew = () => {
    setModalType('add');
    setSelectedSalary(null);
    setIsModalOpen(true);
  };

  const handleView = (salary) => {
    setModalType('view');
    setSelectedSalary(salary);
    setIsModalOpen(true);
  };

  const handleEdit = (salary) => {
    setModalType('edit');
    setSelectedSalary(salary);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (salary) => {
    setSelectedSalary(salary);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSalary) {
      setSalaries(prev => prev.filter(s => s.salary_id !== selectedSalary.salary_id));
      alert(`Salary record ${selectedSalary.salary_id} deleted.`);
    }
    setIsDeleteModalOpen(false);
    setSelectedSalary(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSalary(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedSalary(null);
  };

  // Prevent background scroll
  React.useEffect(() => {
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
    const badges = {
      Generated: "bg-warning-subtle text-warning-emphasis",
      Approved: "bg-info-subtle text-info-emphasis",
      Paid: "bg-success-subtle text-success-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${badges[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getStaffInfo = (staffId) => {
    const staff = staffList.find(s => s.staff_id === staffId);
    return staff || { first_name: 'Unknown', last_name: '', role: 'Unknown' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNextSalaryId = () => {
    const prefix = "SAL";
    const maxId = salaries.length > 0
      ? Math.max(...salaries.map(s => parseInt(s.salary_id.replace(prefix, '')) || 0))
      : 0;
    return `${prefix}${String(maxId + 1).padStart(3, '0')}`;
  };

  // Auto-calculate hourly total based on hours and staff's hourly rate
  const calculateHourlyTotal = (hoursWorked, staffId) => {
    const staff = staffList.find(s => s.staff_id === staffId);
    if (!hoursWorked || !staff?.hourly_rate) return 0;
    return hoursWorked * staff.hourly_rate;
  };

  // Auto-calculate commission total based on fixed/hourly earnings and commission rate
  const calculateCommissionTotal = (hourlyTotal, fixedSalary, staffId) => {
    const staff = staffList.find(s => s.staff_id === staffId);
    if (!staff?.commission_rate_percent || staff.commission_rate_percent === 0) return 0;

    const baseAmount = (hourlyTotal || 0) + (fixedSalary || 0);
    return (baseAmount * staff.commission_rate_percent) / 100;
  };

  // Auto-calculate net pay
  const calculateNetPay = (hourlyTotal, fixedSalary, commissionTotal, bonuses, deductions) => {
    const bonusSum = (bonuses || []).reduce((sum, b) => sum + b.amount, 0);
    const deductionSum = (deductions || []).reduce((sum, d) => sum + d.amount, 0);
    return (hourlyTotal || 0) + (fixedSalary || 0) + commissionTotal + bonusSum - deductionSum;
  };

  // ===== JSX =====
  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Salary Calculator</h2>
          <p className="text-muted mb-0">Calculate and manage staff salaries based on role (Fixed, Hourly, Commission).</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn w-100 w-md-auto"
            style={{
              backgroundColor: '#6EB2CC',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onClick={handleAddNew}
          >
            <FaPlus size={14} className="me-2" /> Add Salary Record
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group">
            <span className="input-group-text bg-light border">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border"
              placeholder="Search by staff name or ID..."
            />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <select className="form-select">
            <option>All Status</option>
            <option>Generated</option>
            <option>Approved</option>
            <option>Paid</option>
          </select>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <select className="form-select">
            <option>All Roles</option>
            <option>Manager</option>
            <option>Trainer</option>
            <option>Receptionist</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold">SALARY ID</th>
                <th className="fw-semibold">STAFF</th>
                <th className="fw-semibold">ROLE</th>
                <th className="fw-semibold">PERIOD</th>
                <th className="fw-semibold text-end">NET PAY</th>
                <th className="fw-semibold">STATUS</th>
                <th className="fw-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((salary) => {
                const staff = getStaffInfo(salary.staff_id);
                return (
                  <tr key={salary.salary_id}>
                    <td><strong>{salary.salary_id}</strong></td>
                    <td>{staff.first_name} {staff.last_name}</td>
                    <td><span className="badge bg-primary">{staff.role}</span></td>
                    <td>
                      {formatDate(salary.period_start)}<br/>
                      <small className="text-muted">to {formatDate(salary.period_end)}</small>
                    </td>
                    <td className="text-end fw-bold">₹{(salary.net_pay)}</td>
                    <td>{getStatusBadge(salary.status)}</td>
                    <td className="text-center">
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="View"
                          onClick={() => handleView(salary)}
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                          onClick={() => handleEdit(salary)}
                          disabled={salary.status === "Paid"}
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDeleteClick(salary)}
                          disabled={salary.status === "Paid"}
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
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
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {modalType === 'add' ? 'Add New Salary Record' :
                   modalType === 'edit' ? 'Edit Salary Record' : 'View Salary Record'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-4">
                <form>
                  {/* SECTION 1: Staff & Period */}
                  <h6 className="fw-bold mb-3">Staff & Period</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Salary ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedSalary?.salary_id || (modalType === 'add' ? getNextSalaryId() : '')}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Staff Member <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        disabled={modalType === 'view'}
                        defaultValue={selectedSalary?.staff_id || ''}
                        onChange={(e) => {
                          if (modalType === 'add' || modalType === 'edit') {
                            const staffId = e.target.value;
                            const staff = staffList.find(s => s.staff_id === staffId);
                            if (staff) {
                              // Auto-set roles-related fields
                              // We'll update form values dynamically via state later
                            }
                          }
                        }}
                        required
                      >
                        <option value="">Select Staff</option>
                        {staffList.map(staff => (
                          <option key={staff.staff_id} value={staff.staff_id}>
                            {staff.first_name} {staff.last_name} ({staff.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedSalary 
                          ? getStaffInfo(selectedSalary.staff_id)?.role 
                          : ''}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Period Start <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        defaultValue={selectedSalary?.period_start || ''}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Period End <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        defaultValue={selectedSalary?.period_end || ''}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                  </div>

                  {/* SECTION 2: Compensation Details */}
                  <h6 className="fw-bold mb-3">Compensation Details</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Hours Worked</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g., 160"
                        defaultValue={selectedSalary?.hours_worked || ''}
                        disabled={modalType === 'view'}
                        step="0.1"
                        min="0"
                        onChange={(e) => {
                          if (modalType !== 'view' && selectedSalary) {
                            const hours = parseFloat(e.target.value) || 0;
                            const staff = staffList.find(s => s.staff_id === selectedSalary.staff_id);
                            const hourlyTotal = hours * (staff?.hourly_rate || 0);
                            const commissionTotal = calculateCommissionTotal(hourlyTotal, selectedSalary.fixed_salary, selectedSalary.staff_id);
                            const netPay = calculateNetPay(hourlyTotal, selectedSalary.fixed_salary, commissionTotal, selectedSalary.bonuses, selectedSalary.deductions);
                            // In real app: update state with calculated values
                            // For demo, we just show auto-calculation
                          }
                        }}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Hourly Rate (from profile)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Auto-filled from staff profile"
                        readOnly
                        defaultValue={selectedSalary 
                          ? getStaffInfo(selectedSalary.staff_id)?.hourly_rate || 0 
                          : 0}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Hourly Total</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Auto-calculated"
                        readOnly
                        defaultValue={selectedSalary?.hourly_total || 0}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Fixed Salary</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g., 5000"
                        defaultValue={selectedSalary?.fixed_salary || ''}
                        disabled={modalType === 'view'}
                        min="0"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Commission Total</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g., 1200"
                        defaultValue={selectedSalary?.commission_total || ''}
                        disabled={modalType === 'view'}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* SECTION 3: Bonuses & Deductions */}
                  <h6 className="fw-bold mb-3">Bonuses</h6>
                  <div className="mb-3">
                    <div className="row g-2 mb-2">
                      <div className="col-12 col-md-5">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Bonus label (e.g., Performance Bonus)"
                          disabled={modalType === 'view'}
                        />
                      </div>
                      <div className="col-12 col-md-5">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Amount"
                          disabled={modalType === 'view'}
                          min="0"
                        />
                      </div>
                      <div className="col-12 col-md-2 d-flex align-items-center">
                        <button
                          type="button"
                          className="btn btn-outline-success w-100"
                          disabled={modalType === 'view'}
                        >
                          <FaPlus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="border rounded p-2 bg-light small">
                      {selectedSalary?.bonuses?.length > 0 ? (
                        <ul className="mb-0">
                          {selectedSalary.bonuses.map((bonus, i) => (
                            <li key={i} className="d-flex justify-content-between">
                              <span>{bonus.label}</span>
                              <span>{formatCurrency(bonus.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No bonuses added</span>
                      )}
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3">Deductions</h6>
                  <div className="mb-3">
                    <div className="row g-2 mb-2">
                      <div className="col-12 col-md-5">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Deduction label (e.g., Tax)"
                          disabled={modalType === 'view'}
                        />
                      </div>
                      <div className="col-12 col-md-5">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Amount"
                          disabled={modalType === 'view'}
                          min="0"
                        />
                      </div>
                      <div className="col-12 col-md-2 d-flex align-items-center">
                        <button
                          type="button"
                          className="btn btn-outline-danger w-100"
                          disabled={modalType === 'view'}
                        >
                          <FaPlus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="border rounded p-2 bg-light small">
                      {selectedSalary?.deductions?.length > 0 ? (
                        <ul className="mb-0">
                          {selectedSalary.deductions.map((deduction, i) => (
                            <li key={i} className="d-flex justify-content-between">
                              <span>{deduction.label}</span>
                              <span>{formatCurrency(deduction.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No deductions added</span>
                      )}
                    </div>
                  </div>

                  {/* SECTION 4: Summary & Status */}
                  <h6 className="fw-bold mb-3">Summary</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Net Pay (auto-calculated)</label>
                      <input
                        type="number"
                        className="form-control fw-bold"
                        value={selectedSalary?.net_pay || 0}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        disabled={modalType === 'view'}
                        defaultValue={selectedSalary?.status || 'Generated'}
                      >
                        <option value="Generated">Generated</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    {selectedSalary?.status === "Paid" && (
                      <div className="col-12">
                        <label className="form-label">Paid At</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          defaultValue={selectedSalary?.paid_at ? new Date(selectedSalary.paid_at).toISOString().slice(0,16) : ''}
                          disabled={modalType === 'view'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    {modalType !== 'view' && (
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
                          alert(modalType === 'add' ? 'Salary record added!' : 'Salary record updated!');
                          closeModal();
                        }}
                      >
                        {modalType === 'add' ? 'Generate Salary' : 'Update Record'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
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
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will permanently delete salary record <strong>{selectedSalary?.salary_id}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4"
                    onClick={confirmDelete}
                  >
                    Delete
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

export default SalaryCalculator;