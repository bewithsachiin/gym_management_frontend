import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';

const Staff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const fileInputRef = useRef(null);

  // API data states
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // API functions
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/staff');
      setStaff(response.data.data.staff);
      setError(null);
    } catch (err) {
      setError('Failed to fetch staff data');
      console.error('Error fetching staff:', err);
      // If unauthorized, the axios interceptor will handle logout
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      setBranches(response.data.data.branches);
    } catch (err) {
      console.error('Error fetching branches:', err);
      // If unauthorized, the axios interceptor will handle logout
    }
  };

  const fetchStaffRoles = async () => {
    try {
      const response = await axiosInstance.get('/staff-roles');
      setStaffRoles(response.data.data.roles);
    } catch (err) {
      console.error('Error fetching staff roles:', err);
      // If unauthorized, the axios interceptor will handle logout
    }
  };

  useEffect(() => {
    // Check authentication before making API calls
    if (checkAuth()) {
      fetchStaff();
      fetchBranches();
      fetchStaffRoles();
    }
  }, []);

  const handleAddNew = () => {
    setModalType('add');
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  const handleView = (staffMember) => {
    setModalType('view');
    setSelectedStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleEdit = (staffMember) => {
    setModalType('edit');
    setSelectedStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedStaff) {
      try {
        setSubmitting(true);
        await axiosInstance.delete(`/staff/${selectedStaff.id}`);
        setStaff(prev => prev.filter(s => s.id !== selectedStaff.id));
        alert(`Staff member "${selectedStaff.first_name} ${selectedStaff.last_name}" has been deleted.`);
      } catch (err) {
        alert('Failed to delete staff member');
        console.error('Error deleting staff:', err);
        // If unauthorized, the axios interceptor will handle logout
      } finally {
        setSubmitting(false);
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
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
      Active: "bg-success-subtle text-success-emphasis",
      Inactive: "bg-danger-subtle text-danger-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      Admin: "bg-primary-subtle text-primary-emphasis",
      Manager: "bg-info-subtle text-info-emphasis",
      Trainer: "bg-warning-subtle text-warning-emphasis",
      Receptionist: "bg-secondary-subtle text-secondary-emphasis",
      Housekeeping: "bg-success-subtle text-success-emphasis"
    };
    return (
      <span className={`badge rounded-pill ${roleColors[role?.name || role] || 'bg-light'} px-3 py-1`}>
        {role?.name || role}
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return 'Add New Staff Member';
      case 'edit': return 'Edit Staff Member';
      case 'view': return 'View Staff Member';
      default: return 'Staff Management';
    }
  };



  const getNextStaffId = () => {
    const prefix = "STAFF";
    const maxId = staff.length > 0 ? Math.max(...staff.map(s => parseInt(s.staff_id.replace(prefix, '')) || 0)) : 0;
    return `${prefix}${String(maxId + 1).padStart(3, '0')}`;
  };

  // Check if user is authenticated before making API calls
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getInitialColor = (initials) => {
    const colors = ['#6EB2CC', '#F4B400', '#E84A5F', '#4ECDC4', '#96CEB4', '#FFEAA7'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Staff Management</h2>
          <p className="text-muted mb-0">Manage all gym staff members, their roles, and compensation.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn w-100 w-lg-auto"
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
            <i className="fas fa-plus me-2"></i> Add Staff
          </button>
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
              placeholder="Search staff by name or role..."
            />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-filter me-1"></i> <span className="">Filter</span>
          </button>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-file-export me-1"></i> <span className="">Export</span>
          </button>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading staff data...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold">PHOTO</th>
                  <th className="fw-semibold">NAME</th>
                  <th className="fw-semibold">ROLE</th>
                  <th className="fw-semibold">BRANCH</th>
                  <th className="fw-semibold">EMAIL</th>
                  <th className="fw-semibold">PHONE</th>
                  <th className="fw-semibold">STATUS</th>
                  <th className="fw-semibold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                <tr key={member.id}>
                  <td>
                    {member.profile_photo ? (
                      <img
                        src={member.profile_photo}
                        alt={`${member.first_name} ${member.last_name}`}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #eee'
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          backgroundColor: getInitialColor(getInitials(member.first_name, member.last_name))
                        }}
                      >
                        {getInitials(member.first_name, member.last_name)}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{member.first_name} {member.last_name}</strong>
                    <div><small className="text-muted">{member.staff_id}</small></div>
                  </td>
                  <td>{getRoleBadge(member.role)}</td>
                  <td>{branches.find(b => b.id === member.branch?.id)?.name || '—'}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{getStatusBadge(member.status)}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center flex-nowrap" style={{ gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-outline-secondary action-btn"
                        title="View"
                        onClick={() => handleView(member)}
                        style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary action-btn"
                        title="Edit"
                        onClick={() => handleEdit(member)}
                        style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger action-btn"
                        title="Delete"
                        onClick={() => handleDeleteClick(member)}
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
      )}

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
                <form>
                  {/* SECTION 1: Basic Information */}
                  <h6 className="fw-bold mb-3">Basic Information</h6>
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Staff ID</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="staff_id"
                        defaultValue={selectedStaff?.staff_id || (modalType === 'add' ? getNextStaffId() : '')}
                        readOnly
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Profile Photo</label>
                      <input
                        type="file"
                        className="form-control rounded-3"
                        name="profile_photo"
                        accept="image/*"
                        ref={fileInputRef}
                        disabled={modalType === 'view'}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">First Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="first_name"
                        placeholder="Enter first name"
                        defaultValue={selectedStaff?.first_name || ''}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Last Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          name="last_name"
                          placeholder="Enter last name"
                          defaultValue={selectedStaff?.last_name || ''}
                          readOnly={modalType === 'view'}
                          required
                        />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Gender <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        name="gender"
                        defaultValue={selectedStaff?.gender || 'Male'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        name="dob"
                        defaultValue={selectedStaff?.dob ? new Date(selectedStaff.dob).toISOString().split('T')[0] : ''}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className="form-control rounded-3"
                        name="email"
                        placeholder="example@email.com"
                        defaultValue={selectedStaff?.email || ''}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className="form-control rounded-3 "
                        name="phone"
                        placeholder="+1 555-123-4567"
                        defaultValue={selectedStaff?.phone || ''}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select rounded-3"
                        name="status"
                        defaultValue={selectedStaff?.status || 'Active'}
                        disabled={modalType === 'view'}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* SECTION 2: Job Details */}
                  <h6 className="fw-bold mb-3">Job Details</h6>
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Role <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        name="role"
                        defaultValue={selectedStaff?.role?.id || (staffRoles.length > 0 ? staffRoles[0].id : '')}
                        disabled={modalType === 'view'}
                        required
                      >
                        {staffRoles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Branch <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        name="branch"
                        defaultValue={selectedStaff?.branch?.id || (branches.length > 0 ? branches[0].id : '')}
                        disabled={modalType === 'view'}
                        required
                      >
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Join Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        name="join_date"
                        defaultValue={selectedStaff?.join_date ? new Date(selectedStaff.join_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Exit Date</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        name="exit_date"
                        defaultValue={selectedStaff?.exit_date ? new Date(selectedStaff.exit_date).toISOString().split('T')[0] : ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                  </div>

                  {/* SECTION 3: Compensation */}
                  {/* <h6 className="fw-bold mb-3">Compensation</h6>
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Salary Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        defaultValue={selectedStaff?.salary_type || 'Fixed'}
                        disabled={modalType === 'view'}
                        required
                        id="salaryType"
                        onChange={(e) => {
                          if (modalType !== 'view') {
                            const hourlyInput = document.getElementById('hourlyRate');
                            const fixedInput = document.getElementById('fixedSalary');
                            if (e.target.value === 'Hourly') {
                              hourlyInput.removeAttribute('disabled');
                              fixedInput.setAttribute('disabled', 'disabled');
                            } else {
                              hourlyInput.setAttribute('disabled', 'disabled');
                              fixedInput.removeAttribute('disabled');
                            }
                          }
                        }}
                      >
                        <option value="Fixed">Fixed Salary</option>
                        <option value="Hourly">Hourly Rate</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Hourly Rate ($)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        id="hourlyRate"
                        placeholder="e.g., 25.50"
                        defaultValue={selectedStaff?.hourly_rate || ''}
                        readOnly={modalType === 'view'}
                        step="0.01"
                        min="0"
                        disabled={selectedStaff?.salary_type === 'Fixed' && modalType !== 'add'}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Fixed Salary ($)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        id="fixedSalary"
                        placeholder="e.g., 50000"
                        defaultValue={selectedStaff?.fixed_salary || ''}
                        readOnly={modalType === 'view'}
                        min="0"
                        disabled={selectedStaff?.salary_type === 'Hourly' && modalType !== 'add'}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Commission Rate (%)</label>
                      <input
                        type="number"
                        className="form-control rounded-3"
                        placeholder="e.g., 10"
                        defaultValue={selectedStaff?.commission_rate_percent || 0}
                        readOnly={modalType === 'view'}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div> */}

                  {/* SECTION 4: System Access */}
                  <h6 className="fw-bold mb-3">System Access</h6>
                  <div className="row mb-3 g-3">
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="login_enabled"
                          defaultChecked={selectedStaff?.login_enabled || false}
                          disabled={modalType === 'view'}
                        />
                        <label className="form-check-label" htmlFor="loginEnabled">
                          Enable Login Access
                        </label>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="username"
                        placeholder="Enter username"
                        defaultValue={selectedStaff?.username || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Password</label>
                      <div className="input-group">
                        <input
                          type="password"
                          className="form-control rounded-3"
                          name="password"
                          placeholder="Enter password"
                          id="passwordField"
                          defaultValue={
                            selectedStaff?.password && selectedStaff.password !== 'auto-generated'
                              ? selectedStaff.password
                              : ''
                          }
                          readOnly={modalType === 'view'}
                        />
                        {modalType !== 'view' && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            id="togglePasswordBtn"
                            style={{
                              backgroundColor: '#f8f9fa',
                              borderColor: '#ced4da',
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              const passwordField = document.getElementById('passwordField');
                              const toggleBtn = e.target;
                              if (passwordField.type === 'password') {
                                passwordField.type = 'text';
                                toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                              } else {
                                passwordField.type = 'password';
                                toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
                              }
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                      </div>
                      <small className="text-muted mt-1">Leave blank to keep existing password.</small>
                    </div>
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
                        type="button"
                        className="btn w-100 w-sm-auto"
                        style={{
                          backgroundColor: '#6EB2CC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: '500',
                        }}
                        disabled={submitting}
                        onClick={async () => {
                          try {
                            setSubmitting(true);
                            const formData = new FormData();

                            // Collect form data
                            const form = document.querySelector('form');
                            const formElements = form.elements;

                            for (let element of formElements) {
                              if (element.name && element.value && element.type !== 'submit' && element.type !== 'button') {
                                if (element.type === 'file' && element.files[0]) {
                                  formData.append(element.name, element.files[0]);
                                } else if (element.type === 'checkbox') {
                                  formData.append(element.name, element.checked);
                                } else {
                                  formData.append(element.name, element.value);
                                }
                              }
                            }

                            // Add roleId and branchId
                            const roleSelect = form.querySelector('select[name="role"]');
                            const branchSelect = form.querySelector('select[name="branch"]');
                            if (roleSelect && roleSelect.value) formData.append('roleId', roleSelect.value);
                            if (branchSelect && branchSelect.value) formData.append('branchId', branchSelect.value);

                            if (modalType === 'add') {
                              await axiosInstance.post('/staff', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              alert('New staff member added successfully!');
                            } else {
                              await axiosInstance.put(`/staff/${selectedStaff.id}`, formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });
                              alert('Staff member updated successfully!');
                            }

                            fetchStaff(); // Refresh the list
                            closeModal();
                          } catch (err) {
                            alert(`Failed to ${modalType === 'add' ? 'add' : 'update'} staff member`);
                            console.error('Error saving staff:', err);
                            // If unauthorized, the axios interceptor will handle logout
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                      >
                        {submitting ? 'Saving...' : (modalType === 'add' ? 'Add Staff' : 'Update Staff')}
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
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will permanently delete <strong>{selectedStaff?.first_name} {selectedStaff?.last_name}</strong>.<br />
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
        
        /* Make form controls responsive */
        .form-control, .form-select {
          width: 100%;
        }
        
        /* Ensure modal content is responsive */
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.5rem;
          }
          .modal-content {
            border-radius: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Staff;