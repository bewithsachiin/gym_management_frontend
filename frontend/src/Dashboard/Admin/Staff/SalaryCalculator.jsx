// src/components/SalaryCalculator.js
import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrashAlt, FaEdit, FaEye, FaSave, FaTimes, FaSearch, FaFilter, FaUser, FaIdCard } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';

const SalaryCalculator = () => {
  // ===== STATE MANAGEMENT =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Data states
  const [staffList, setStaffList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  // Form models
  const [salaryForm, setSalaryForm] = useState({
    staffId: '',
    roleId: '',
    periodStart: '',
    periodEnd: '',
    hoursWorked: '',
    fixedSalary: '',
    bonuses: [],
    deductions: [],
    status: 'Generated'
  });

  // Form refs
  const formRef = useRef({});

  // ===== API INTEGRATION =====
  const fetchStaffList = async () => {
    try {
      const response = await axiosInstance.get('/staff');
      if (response.data.success) {
        const transformedStaff = response.data.data.staff.map(staff => ({
          id: staff.id,
          staffId: staff.staffId,
          firstName: staff.user.firstName,
          lastName: staff.user.lastName,
          fullName: `${staff.user.firstName} ${staff.user.lastName}`,
          roleId: staff.roleId,
          roleName: staff.role.name,
          salaryType: staff.salaryType,
          fixedSalary: staff.fixedSalary,
          hourlyRate: staff.hourlyRate,
          commissionRatePercent: staff.commissionRatePercent,
          status: staff.status,
          email: staff.user.email,
          phone: staff.phone,
          joinDate: staff.joinDate
        }));
        setStaffList(transformedStaff);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      throw new Error('Failed to fetch staff list');
    }
  };

  const fetchRolesList = async () => {
    try {
      const response = await axiosInstance.get('/staff-roles');
      if (response.data.success) {
        const transformedRoles = response.data.data.roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          status: role.status
        }));
        setRolesList(transformedRoles);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      throw new Error('Failed to fetch roles list');
    }
  };

  const fetchSalaries = async () => {
    try {
      const response = await axiosInstance.get('/salaries');
      if (response.data.success) {
        const transformedSalaries = response.data.data.salaries.map(salary => ({
          id: salary.id,
          salaryId: salary.salaryId,
          staffId: salary.staffId,
          staffName: `${salary.staff.user.firstName} ${salary.staff.user.lastName}`,
          staffRole: salary.staff.role.name,
          roleId: salary.staff.role.id,
          periodStart: salary.periodStart,
          periodEnd: salary.periodEnd,
          hoursWorked: salary.hoursWorked,
          hourlyTotal: salary.hourlyTotal,
          fixedSalary: salary.fixedSalary,
          commissionTotal: salary.commissionTotal,
          bonuses: salary.bonuses || [],
          deductions: salary.deductions || [],
          netPay: salary.netPay,
          status: salary.status,
          approvedBy: salary.approvedBy,
          paidAt: salary.paidAt,
          createdAt: salary.createdAt,
          updatedAt: salary.updatedAt
        }));
        setSalaries(transformedSalaries);
      }
    } catch (err) {
      console.error('Error fetching salaries:', err);
      throw new Error('Failed to fetch salary records');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchStaffList(), fetchRolesList(), fetchSalaries()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===== FORM MODEL HANDLERS =====
  const handleFormChange = (field, value) => {
    setSalaryForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate when dependent fields change
    if (['staffId', 'hoursWorked', 'fixedSalary'].includes(field)) {
      handleCalculationChange();
    }
  };

  const resetForm = () => {
    setSalaryForm({
      staffId: '',
      roleId: '',
      periodStart: '',
      periodEnd: '',
      hoursWorked: '',
      fixedSalary: '',
      bonuses: [],
      deductions: [],
      status: 'Generated'
    });
  };

  // ===== FILTERED DATA =====
  const filteredSalaries = salaries.filter(salary => {
    const matchesSearch = 
      salary.salaryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.staffRole.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || salary.status === statusFilter;
    const matchesRole = roleFilter === 'All Roles' || salary.staffRole === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // ===== MODAL HANDLERS =====
  const handleAddNew = () => {
    setModalType('add');
    setSelectedSalary(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleView = (salary) => {
    setModalType('view');
    setSelectedSalary(salary);
    // Populate form with selected salary data
    setSalaryForm({
      staffId: salary.staffId,
      roleId: salary.roleId,
      periodStart: salary.periodStart ? new Date(salary.periodStart).toISOString().split('T')[0] : '',
      periodEnd: salary.periodEnd ? new Date(salary.periodEnd).toISOString().split('T')[0] : '',
      hoursWorked: salary.hoursWorked || '',
      fixedSalary: salary.fixedSalary || '',
      bonuses: salary.bonuses || [],
      deductions: salary.deductions || [],
      status: salary.status
    });
    setIsModalOpen(true);
  };

  const handleEdit = (salary) => {
    setModalType('edit');
    setSelectedSalary(salary);
    // Populate form with selected salary data
    setSalaryForm({
      staffId: salary.staffId,
      roleId: salary.roleId,
      periodStart: salary.periodStart ? new Date(salary.periodStart).toISOString().split('T')[0] : '',
      periodEnd: salary.periodEnd ? new Date(salary.periodEnd).toISOString().split('T')[0] : '',
      hoursWorked: salary.hoursWorked || '',
      fixedSalary: salary.fixedSalary || '',
      bonuses: salary.bonuses || [],
      deductions: salary.deductions || [],
      status: salary.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (salary) => {
    setSelectedSalary(salary);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSalary) return;

    try {
      setSubmitLoading(true);
      const response = await axiosInstance.delete(`/salaries/${selectedSalary.id}`);
      
      if (response.data.success) {
        setSalaries(prev => prev.filter(s => s.id !== selectedSalary.id));
        alert(`Salary record ${selectedSalary.salaryId} has been deleted successfully.`);
      } else {
        alert('Failed to delete salary record: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete salary record';
      alert(errorMessage);
      console.error('Error deleting salary:', err);
    } finally {
      setSubmitLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedSalary(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSalary(null);
    resetForm();
    formRef.current = {};
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedSalary(null);
  };

  // ===== CALCULATION HELPERS =====
  const getSelectedStaff = () => {
    return staffList.find(staff => staff.staffId === salaryForm.staffId);
  };

  const calculateHourlyTotal = () => {
    const staff = getSelectedStaff();
    if (!salaryForm.hoursWorked || !staff?.hourlyRate) return 0;
    return parseFloat(salaryForm.hoursWorked) * staff.hourlyRate;
  };

  const calculateCommissionTotal = () => {
    const staff = getSelectedStaff();
    if (!staff?.commissionRatePercent || staff.commissionRatePercent === 0) return 0;
    const baseAmount = (calculateHourlyTotal() || 0) + (parseFloat(salaryForm.fixedSalary) || 0);
    return (baseAmount * staff.commissionRatePercent) / 100;
  };

  const calculateNetPay = () => {
    const hourlyTotal = calculateHourlyTotal();
    const fixedSalary = parseFloat(salaryForm.fixedSalary) || 0;
    const commissionTotal = calculateCommissionTotal();
    const bonusSum = salaryForm.bonuses.reduce((sum, b) => sum + (b.amount || 0), 0);
    const deductionSum = salaryForm.deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    return hourlyTotal + fixedSalary + commissionTotal + bonusSum - deductionSum;
  };

  const handleCalculationChange = () => {
    // This function is called when dependent fields change
    // Calculations are done in the getter functions above
  };

  // ===== BONUS/DEDUCTION MANAGEMENT =====
  const handleAddBonus = () => {
    const label = formRef.current.bonusLabel?.value?.trim();
    const amount = parseFloat(formRef.current.bonusAmount?.value);

    if (!label || isNaN(amount) || amount <= 0) {
      alert('Please enter valid bonus label and amount');
      return;
    }

    const newBonus = { label, amount };
    setSalaryForm(prev => ({
      ...prev,
      bonuses: [...prev.bonuses, newBonus]
    }));

    // Clear input fields
    if (formRef.current.bonusLabel) formRef.current.bonusLabel.value = '';
    if (formRef.current.bonusAmount) formRef.current.bonusAmount.value = '';
  };

  const handleRemoveBonus = (index) => {
    setSalaryForm(prev => ({
      ...prev,
      bonuses: prev.bonuses.filter((_, i) => i !== index)
    }));
  };

  const handleAddDeduction = () => {
    const label = formRef.current.deductionLabel?.value?.trim();
    const amount = parseFloat(formRef.current.deductionAmount?.value);

    if (!label || isNaN(amount) || amount <= 0) {
      alert('Please enter valid deduction label and amount');
      return;
    }

    const newDeduction = { label, amount };
    setSalaryForm(prev => ({
      ...prev,
      deductions: [...prev.deductions, newDeduction]
    }));

    // Clear input fields
    if (formRef.current.deductionLabel) formRef.current.deductionLabel.value = '';
    if (formRef.current.deductionAmount) formRef.current.deductionAmount.value = '';
  };

  const handleRemoveDeduction = (index) => {
    setSalaryForm(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  // ===== FORM SUBMISSION =====
  const handleSaveSalary = async () => {
    // Basic validation
    if (!salaryForm.staffId || !salaryForm.periodStart || !salaryForm.periodEnd) {
      alert('Please fill in all required fields: Staff Member, Period Start, and Period End');
      return;
    }

    try {
      setSubmitLoading(true);

      const selectedStaff = getSelectedStaff();
      const hourlyTotal = calculateHourlyTotal();
      const commissionTotal = calculateCommissionTotal();
      const netPay = calculateNetPay();

      const payload = {
        staffId: selectedStaff.id, // Send staff database ID
        periodStart: new Date(salaryForm.periodStart).toISOString(),
        periodEnd: new Date(salaryForm.periodEnd).toISOString(),
        hoursWorked: parseFloat(salaryForm.hoursWorked) || null,
        hourlyTotal: hourlyTotal || null,
        fixedSalary: parseFloat(salaryForm.fixedSalary) || null,
        commissionTotal: commissionTotal || null,
        bonuses: salaryForm.bonuses,
        deductions: salaryForm.deductions,
        netPay: netPay,
        status: salaryForm.status
      };

      let response;

      if (selectedSalary) {
        // Update existing salary
        response = await axiosInstance.put(`/salaries/${selectedSalary.id}`, payload);
        if (response.data.success) {
          const updatedSalary = {
            ...selectedSalary,
            ...payload,
            staffName: selectedStaff.fullName,
            staffRole: selectedStaff.roleName
          };
          setSalaries(prev => prev.map(s => s.id === selectedSalary.id ? updatedSalary : s));
          alert('Salary record updated successfully!');
        }
      } else {
        // Create new salary
        response = await axiosInstance.post('/salaries', payload);
        if (response.data.success) {
          const newSalary = {
            id: response.data.data.salary?.id || Date.now(),
            salaryId: response.data.data.salary?.salaryId || `SAL${Date.now()}`,
            staffId: salaryForm.staffId,
            staffName: selectedStaff.fullName,
            staffRole: selectedStaff.roleName,
            roleId: selectedStaff.roleId,
            ...payload
          };
          setSalaries(prev => [...prev, newSalary]);
          alert('Salary record created successfully!');
        }
      }

      closeModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save salary record';
      alert(errorMessage);
      console.error('Error saving salary:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // ===== STAFF FILTERING BY ROLE =====
  const getStaffByRole = (roleId) => {
    if (!roleId) return staffList.filter(staff => staff.status === 'Active');
    return staffList.filter(staff => staff.roleId === parseInt(roleId) && staff.status === 'Active');
  };

  // When role changes in form, filter staff list
  const handleRoleChange = (roleId) => {
    handleFormChange('roleId', roleId);
    // Reset staff selection if the selected staff doesn't belong to the new role
    if (salaryForm.staffId) {
      const staff = staffList.find(s => s.staffId === salaryForm.staffId);
      if (staff && staff.roleId !== parseInt(roleId)) {
        handleFormChange('staffId', '');
      }
    }
  };

  // When staff is selected, auto-fill their role
  const handleStaffChange = (staffId) => {
    handleFormChange('staffId', staffId);
    if (staffId) {
      const staff = staffList.find(s => s.staffId === staffId);
      if (staff) {
        handleFormChange('roleId', staff.roleId.toString());
      }
    }
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
      ? Math.max(...salaries.map(s => {
          const match = s.salaryId?.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        }))
      : 0;
    return `${prefix}${String(maxId + 1).padStart(3, '0')}`;
  };

  const getSelectedStaffDetails = () => {
    return getSelectedStaff();
  };

  // ===== JSX RENDER =====
  if (loading) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading salary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-3 p-md-4">
        <div className="alert alert-danger d-flex flex-column flex-md-row align-items-center justify-content-between" role="alert">
          <div className="mb-2 mb-md-0">
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
          <h2 className="fw-bold h4 h2-md">Salary Calculator</h2>
          <p className="text-muted mb-0 small small-md">
            Calculate and manage staff salaries based on role (Fixed, Hourly, Commission).
          </p>
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
            <FaPlus size={14} className="me-2" /> Add Salary Record
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="row mb-4 g-2 g-md-3">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="input-group input-group-sm input-group-md">
            <span className="input-group-text bg-light border-end-0">
              <FaSearch className="text-muted" size={14} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search staff, role, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <div className="input-group input-group-sm input-group-md">
            <span className="input-group-text bg-light border-end-0 d-none d-md-block">
              <FaFilter className="text-muted" size={12} />
            </span>
            <select 
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Generated</option>
              <option>Approved</option>
              <option>Paid</option>
            </select>
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <select 
            className="form-control form-control-sm form-control-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>All Roles</option>
            {rolesList
              .filter(role => role.status === 'Active')
              .map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 d-flex justify-content-end">
          <div className="text-muted small">
            Showing {filteredSalaries.length} of {salaries.length} records
          </div>
        </div>
      </div>

      {/* Salary Records Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold small">SALARY ID</th>
                <th className="fw-semibold small">STAFF</th>
                <th className="fw-semibold small d-none d-md-table-cell">ROLE</th>
                <th className="fw-semibold small">PERIOD</th>
                <th className="fw-semibold small text-end">NET PAY</th>
                <th className="fw-semibold small d-none d-sm-table-cell">STATUS</th>
                <th className="fw-semibold small text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="mb-2">
                      <FaSearch size={32} className="text-muted" />
                    </div>
                    No salary records found
                    {searchTerm || statusFilter !== 'All Status' || roleFilter !== 'All Roles' ? 
                      ' matching your filters' : ''
                    }
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((salary) => (
                  <tr key={salary.salaryId}>
                    <td>
                      <strong className="small">{salary.salaryId}</strong>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium small">{salary.staffName}</div>
                        <small className="text-muted d-block d-md-none">{salary.staffRole}</small>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">
                      <span className="badge bg-primary small">{salary.staffRole}</span>
                    </td>
                    <td>
                      <div className="small">
                        {formatDate(salary.periodStart)}
                        <br className="d-none d-sm-block" />
                        <small className="text-muted d-block d-sm-none">to {formatDate(salary.periodEnd)}</small>
                      </div>
                      <small className="text-muted d-none d-sm-block">to {formatDate(salary.periodEnd)}</small>
                    </td>
                    <td className="text-end fw-bold small">{formatCurrency(salary.netPay)}</td>
                    <td className="d-none d-sm-table-cell">{getStatusBadge(salary.status)}</td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          title="View"
                          onClick={() => handleView(salary)}
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          title="Edit"
                          onClick={() => handleEdit(salary)}
                          disabled={salary.status === "Paid"}
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          title="Delete"
                          onClick={() => handleDeleteClick(salary)}
                          disabled={salary.status === "Paid"}
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

      {/* SALARY FORM MODAL */}
      {isModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold h6 h5-md">
                  {modalType === 'add' ? 'Add New Salary Record' :
                   modalType === 'edit' ? 'Edit Salary Record' : 'View Salary Record'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeModal}
                  disabled={submitLoading}
                ></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* SECTION 1: Basic Information */}
                  <h6 className="fw-bold mb-3 small small-md">
                    <FaIdCard className="me-2" />
                    Basic Information
                  </h6>
                  <div className="row g-2 g-md-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Salary ID</label>
                      <input
                        type="text"
                        className="form-control form-control-sm form-control-md"
                        value={selectedSalary?.salaryId || (modalType === 'add' ? getNextSalaryId() : '')}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Role <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-sm form-select-md"
                        disabled={modalType === 'view' || submitLoading}
                        value={salaryForm.roleId}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        required
                      >
                        <option value="">Select Role</option>
                        {rolesList
                          .filter(role => role.status === 'Active')
                          .map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small">
                        Staff Member <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-sm form-select-md"
                        disabled={modalType === 'view' || submitLoading}
                        value={salaryForm.staffId}
                        onChange={(e) => handleStaffChange(e.target.value)}
                        required
                      >
                        <option value="">Select Staff</option>
                        {getStaffByRole(salaryForm.roleId).map(staff => (
                          <option key={staff.staffId} value={staff.staffId}>
                            {staff.fullName} - {staff.roleName} ({staff.salaryType})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Staff Details Card */}
                    {salaryForm.staffId && (
                      <div className="col-12">
                        <div className="card bg-light border-0">
                          <div className="card-body p-3">
                            <div className="row g-2">
                              <div className="col-12 col-md-6">
                                <small className="text-muted d-block">Salary Type</small>
                                <strong>{getSelectedStaffDetails()?.salaryType || '—'}</strong>
                              </div>
                              <div className="col-12 col-md-6">
                                <small className="text-muted d-block">Hourly Rate</small>
                                <strong>{getSelectedStaffDetails()?.hourlyRate ? formatCurrency(getSelectedStaffDetails().hourlyRate) : '—'}</strong>
                              </div>
                              <div className="col-12 col-md-6">
                                <small className="text-muted d-block">Fixed Salary</small>
                                <strong>{getSelectedStaffDetails()?.fixedSalary ? formatCurrency(getSelectedStaffDetails().fixedSalary) : '—'}</strong>
                              </div>
                              <div className="col-12 col-md-6">
                                <small className="text-muted d-block">Commission Rate</small>
                                <strong>{getSelectedStaffDetails()?.commissionRatePercent ? `${getSelectedStaffDetails().commissionRatePercent}%` : '—'}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Period Start <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm form-control-md"
                        value={salaryForm.periodStart}
                        disabled={modalType === 'view' || submitLoading}
                        onChange={(e) => handleFormChange('periodStart', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">
                        Period End <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm form-control-md"
                        value={salaryForm.periodEnd}
                        disabled={modalType === 'view' || submitLoading}
                        onChange={(e) => handleFormChange('periodEnd', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* SECTION 2: Compensation Details */}
                  <h6 className="fw-bold mb-3 small small-md">
                    <FaUser className="me-2" />
                    Compensation Details
                  </h6>
                  <div className="row g-2 g-md-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Hours Worked</label>
                      <input
                        type="number"
                        className="form-control form-control-sm form-control-md"
                        placeholder="e.g., 160"
                        value={salaryForm.hoursWorked}
                        disabled={modalType === 'view' || submitLoading}
                        step="0.1"
                        min="0"
                        onChange={(e) => handleFormChange('hoursWorked', e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Hourly Total</label>
                      <input
                        type="number"
                        className="form-control form-control-sm form-control-md"
                        placeholder="Auto-calculated"
                        readOnly
                        value={calculateHourlyTotal()}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Fixed Salary</label>
                      <input
                        type="number"
                        className="form-control form-control-sm form-control-md"
                        placeholder="e.g., 5000"
                        value={salaryForm.fixedSalary}
                        disabled={modalType === 'view' || submitLoading}
                        min="0"
                        step="0.01"
                        onChange={(e) => handleFormChange('fixedSalary', e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Commission Total</label>
                      <input
                        type="number"
                        className="form-control form-control-sm form-control-md"
                        placeholder="Auto-calculated"
                        readOnly
                        value={calculateCommissionTotal()}
                      />
                    </div>
                  </div>

                  {/* SECTION 3: Bonuses */}
                  <h6 className="fw-bold mb-3 small small-md">Bonuses</h6>
                  <div className="mb-3">
                    {modalType !== 'view' && (
                      <div className="row g-2 mb-2">
                        <div className="col-12 col-md-5">
                          <input
                            type="text"
                            className="form-control form-control-sm form-control-md"
                            placeholder="Bonus label (e.g., Performance Bonus)"
                            disabled={submitLoading}
                            ref={input => formRef.current.bonusLabel = input}
                          />
                        </div>
                        <div className="col-12 col-md-5">
                          <input
                            type="number"
                            className="form-control form-control-sm form-control-md"
                            placeholder="Amount"
                            disabled={submitLoading}
                            min="0"
                            step="0.01"
                            ref={input => formRef.current.bonusAmount = input}
                          />
                        </div>
                        <div className="col-12 col-md-2 d-flex align-items-center">
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm w-100"
                            onClick={handleAddBonus}
                            disabled={submitLoading}
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border rounded p-2 bg-light small">
                      {salaryForm.bonuses.length > 0 ? (
                        <ul className="mb-0">
                          {salaryForm.bonuses.map((bonus, i) => (
                            <li key={i} className="d-flex justify-content-between align-items-center">
                              <span>{bonus.label}</span>
                              <div>
                                <span className="me-2">{formatCurrency(bonus.amount)}</span>
                                {modalType !== 'view' && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveBonus(i)}
                                    disabled={submitLoading}
                                  >
                                    <FaTimes size={10} />
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No bonuses added</span>
                      )}
                    </div>
                  </div>

                  {/* SECTION 4: Deductions */}
                  <h6 className="fw-bold mb-3 small small-md">Deductions</h6>
                  <div className="mb-3">
                    {modalType !== 'view' && (
                      <div className="row g-2 mb-2">
                        <div className="col-12 col-md-5">
                          <input
                            type="text"
                            className="form-control form-control-sm form-control-md"
                            placeholder="Deduction label (e.g., Tax)"
                            disabled={submitLoading}
                            ref={input => formRef.current.deductionLabel = input}
                          />
                        </div>
                        <div className="col-12 col-md-5">
                          <input
                            type="number"
                            className="form-control form-control-sm form-control-md"
                            placeholder="Amount"
                            disabled={submitLoading}
                            min="0"
                            step="0.01"
                            ref={input => formRef.current.deductionAmount = input}
                          />
                        </div>
                        <div className="col-12 col-md-2 d-flex align-items-center">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm w-100"
                            onClick={handleAddDeduction}
                            disabled={submitLoading}
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border rounded p-2 bg-light small">
                      {salaryForm.deductions.length > 0 ? (
                        <ul className="mb-0">
                          {salaryForm.deductions.map((deduction, i) => (
                            <li key={i} className="d-flex justify-content-between align-items-center">
                              <span>{deduction.label}</span>
                              <div>
                                <span className="me-2">{formatCurrency(deduction.amount)}</span>
                                {modalType !== 'view' && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveDeduction(i)}
                                    disabled={submitLoading}
                                  >
                                    <FaTimes size={10} />
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted">No deductions added</span>
                      )}
                    </div>
                  </div>

                  {/* SECTION 5: Summary */}
                  <h6 className="fw-bold mb-3 small small-md">Summary</h6>
                  <div className="row g-2 g-md-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Net Pay (auto-calculated)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm form-control-md fw-bold"
                        readOnly
                        value={calculateNetPay()}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small">Status</label>
                      <select
                        className="form-select form-select-sm form-select-md"
                        disabled={modalType === 'view' || submitLoading}
                        value={salaryForm.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                      >
                        <option value="Generated">Generated</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
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
                        type="button"
                        className="btn px-3 px-md-4 py-2 small d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: '#6EB2CC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '500',
                          minWidth: '140px'
                        }}
                        onClick={handleSaveSalary}
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
                            {modalType === 'add' ? 'Generate Salary' : 'Update Record'}
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
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5 className="h6 h5-md">Are you sure?</h5>
                <p className="text-muted small small-md">
                  This will permanently delete salary record <strong>{selectedSalary?.salaryId}</strong>.<br />
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

export default SalaryCalculator;