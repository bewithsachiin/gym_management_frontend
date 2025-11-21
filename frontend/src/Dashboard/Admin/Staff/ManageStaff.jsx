import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';
import { useUser } from '../../../UserContext';

const ManageStaff = () => {
  const { user } = useUser();
  const branchId = user?.branchId;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch roles from API
  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await axiosInstance.get('/staff-roles');
      if (response.data.success) {
        setRoles(response.data.data.roles);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to fetch roles data');
    } finally {
      setRolesLoading(false);
    }
  };

  // Fetch staff data from API
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/staff');
      if (response.data.success) {
        const mappedStaff = response.data.data.staff.map(staffMember => ({
          id: staffMember.id,
          staff_id: staffMember.staffId,
          first_name: staffMember.user.firstName,
          last_name: staffMember.user.lastName,
          gender: staffMember.gender,
          dob: staffMember.dob ? staffMember.dob.split('T')[0] : '',
          email: staffMember.user.email,
          phone: staffMember.phone,
          profile_photo: staffMember.profilePhoto,
          status: staffMember.status,
          role_id: staffMember.role.id,
          role_name: staffMember.role.name,
          branch_id: staffMember.branchId,
          branch_name: staffMember.branch?.name || 'Unknown Branch',
          join_date: staffMember.joinDate ? staffMember.joinDate.split('T')[0] : '',
          exit_date: staffMember.exitDate ? staffMember.exitDate.split('T')[0] : null,
          salary_type: staffMember.salaryType,
          hourly_rate: staffMember.hourlyRate,
          fixed_salary: staffMember.fixedSalary,
          commission_rate_percent: staffMember.commissionRatePercent,
          login_enabled: staffMember.loginEnabled,
          username: staffMember.username,
          password: staffMember.password
        }));
        setStaff(mappedStaff);
      }
    } catch (err) {
      setError('Failed to fetch staff data');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff and roles on component mount
  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  // Create new staff
  const createStaff = async (staffData) => {
    try {
      const response = await axiosInstance.post('/staff', staffData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        fetchStaff();
        return { success: true, data: response.data.data.staff };
      }
      return { success: false, error: response.data.message };
    } catch (err) {
      console.error('Error creating staff:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to create staff' };
    }
  };

  // Update staff
  const updateStaff = async (staffId, staffData) => {
    try {
      const response = await axiosInstance.put(`/staff/${staffId}`, staffData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        fetchStaff();
        return { success: true, data: response.data.data.staff };
      }
      return { success: false, error: response.data.message };
    } catch (err) {
      console.error('Error updating staff:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update staff' };
    }
  };

  // Delete staff
  const deleteStaff = async (staffId) => {
    try {
      const response = await axiosInstance.delete(`/staff/${staffId}`);
      if (response.data.success) {
        fetchStaff();
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (err) {
      console.error('Error deleting staff:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to delete staff' };
    }
  };

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
      const result = await deleteStaff(selectedStaff.id);
      if (result.success) {
        alert(`Staff member "${selectedStaff.first_name} ${selectedStaff.last_name}" has been deleted.`);
      } else {
        alert(`Failed to delete staff: ${result.error}`);
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Prepare data for API - match backend expectations
    const apiData = {
      branchId: branchId, // Force to user's branch
      roleId: parseInt(formData.get('role_id')),
      staffId: formData.get('staff_id'),
      gender: formData.get('gender'),
      dob: formData.get('dob'),
      phone: formData.get('phone'),
      status: formData.get('status'),
      joinDate: formData.get('join_date'),
      exitDate: formData.get('exit_date') || null,
      salaryType: formData.get('salary_type'),
      hourlyRate: formData.get('hourly_rate') ? parseFloat(formData.get('hourly_rate')) : null,
      fixedSalary: formData.get('fixed_salary') ? parseFloat(formData.get('fixed_salary')) : null,
      commissionRatePercent: formData.get('commission_rate_percent') ? parseFloat(formData.get('commission_rate_percent')) : 0,
      loginEnabled: formData.get('login_enabled') === 'true',
      username: formData.get('username'),
      password: formData.get('password'),
      user: {
        firstName: formData.get('first_name'),
        lastName: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        dob: formData.get('dob'),
        loginEnabled: formData.get('login_enabled') === 'true',
        username: formData.get('username')
      }
    };

    // Handle file upload
    const file = fileInputRef.current?.files[0];
    if (file) {
      // File will be handled by multer middleware automatically
      // We need to use FormData to send the file
      const formDataToSend = new FormData();
      
      // Append the file
      formDataToSend.append('profilePhoto', file);
      
      // Append all other data as JSON string
      formDataToSend.append('data', JSON.stringify(apiData));
      
      if (modalType === 'add') {
        const result = await createStaff(formDataToSend);
        if (result.success) {
          alert('New staff member added successfully!');
          closeModal();
        } else {
          alert(`Failed to add staff: ${result.error}`);
        }
      } else if (modalType === 'edit') {
        const result = await updateStaff(selectedStaff.id, formDataToSend);
        if (result.success) {
          alert('Staff member updated successfully!');
          closeModal();
        } else {
          alert(`Failed to update staff: ${result.error}`);
        }
      }
    } else {
      // No file, send as JSON
      if (modalType === 'add') {
        const result = await createStaff(apiData);
        if (result.success) {
          alert('New staff member added successfully!');
          closeModal();
        } else {
          alert(`Failed to add staff: ${result.error}`);
        }
      } else if (modalType === 'edit') {
        const result = await updateStaff(selectedStaff.id, apiData);
        if (result.success) {
          alert('Staff member updated successfully!');
          closeModal();
        } else {
          alert(`Failed to update staff: ${result.error}`);
        }
      }
    }
  };

  // Helper function to get role name by ID
  const getRoleNameById = (roleId) => {
    const role = roles.find(r => r.id === parseInt(roleId));
    return role ? role.name : 'Unknown';
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

  const getRoleBadge = (roleId) => {
    const roleColors = {
      1: "bg-primary-subtle text-primary-emphasis",
      2: "bg-warning-subtle text-warning-emphasis",
      3: "bg-info-subtle text-info-emphasis",
      4: "bg-success-subtle text-success-emphasis",
      5: "bg-secondary-subtle text-secondary-emphasis"
    };
    
    const roleName = getRoleNameById(roleId);
    return (
      <span className={`badge rounded-pill ${roleColors[roleId] || 'bg-light'} px-3 py-1`}>
        {roleName}
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
    const prefix = "STF";
    const maxId = staff.length > 0 ? Math.max(...staff.map(s => {
      const idNum = parseInt(s.staff_id.replace(prefix, '')) || 0;
      return idNum;
    })) : 0;
    return `${prefix}-${String(maxId + 1).padStart(3, '0')}`;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getInitialColor = (initials) => {
    const colors = ['#6EB2CC', '#F4B400', '#E84A5F', '#4ECDC4', '#96CEB4', '#FFEAA7'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchStaff}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Staff Management</h2>
          <p className="text-muted mb-0">Manage staff members in your branch, their roles, and compensation.</p>
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
            }}
            onClick={handleAddNew}
          >
            <i className="fas fa-plus me-2"></i> Add Staff
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-semibold">PHOTO</th>
                <th className="fw-semibold">NAME</th>
                <th className="fw-semibold">ROLE</th>
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
                  <td>{getRoleBadge(member.role_id)}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td>{getStatusBadge(member.status)}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center flex-nowrap" style={{ gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-outline-secondary action-btn"
                        title="View"
                        onClick={() => handleView(member)}
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary action-btn"
                        title="Edit"
                        onClick={() => handleEdit(member)}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger action-btn"
                        title="Delete"
                        onClick={() => handleDeleteClick(member)}
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
                        accept="image/*"
                        ref={fileInputRef}
                        disabled={modalType === 'view'}
                        name="profilePhoto"
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
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        name="dob"
                        defaultValue={selectedStaff?.dob || ''}
                        readOnly={modalType === 'view'}
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
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control rounded-3"
                        name="phone"
                        placeholder="+1 555-123-4567"
                        defaultValue={selectedStaff?.phone || ''}
                        readOnly={modalType === 'view'}
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
                      {rolesLoading ? (
                        <div className="form-control rounded-3 d-flex align-items-center">
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Loading roles...
                        </div>
                      ) : (
                        <select
                          className="form-select rounded-3"
                          name="role_id"
                          defaultValue={selectedStaff?.role_id || ''}
                          disabled={modalType === 'view'}
                          required
                        >
                          <option value="">Select a role</option>
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Join Date</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        name="join_date"
                        defaultValue={selectedStaff?.join_date || new Date().toISOString().split('T')[0]}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Exit Date</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        name="exit_date"
                        defaultValue={selectedStaff?.exit_date || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                  </div>

                  {/* SECTION 3: Compensation */}
                  <h6 className="fw-bold mb-3">Compensation</h6>
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Salary Type</label>
                      <select
                        className="form-select rounded-3"
                        name="salary_type"
                        defaultValue={selectedStaff?.salary_type || 'Fixed'}
                        disabled={modalType === 'view'}
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
                        name="hourly_rate"
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
                        name="fixed_salary"
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
                        name="commission_rate_percent"
                        placeholder="e.g., 10"
                        defaultValue={selectedStaff?.commission_rate_percent || 0}
                        readOnly={modalType === 'view'}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* SECTION 4: System Access */}
                  <h6 className="fw-bold mb-3">System Access</h6>
                  <div className="row mb-3 g-3">
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="loginEnabled"
                          name="login_enabled"
                          defaultChecked={selectedStaff?.login_enabled || false}
                          disabled={modalType === 'view'}
                          value="true"
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
                          placeholder="Enter password"
                          id="passwordField"
                          name="password"
                          defaultValue={modalType === 'add' ? '' : '********'}
                          readOnly={modalType === 'view'}
                        />
                        {modalType !== 'view' && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={(e) => {
                              const passwordField = document.getElementById('passwordField');
                              if (passwordField.type === 'password') {
                                passwordField.type = 'text';
                                e.target.innerHTML = '<i class="fas fa-eye-slash"></i>';
                              } else {
                                passwordField.type = 'password';
                                e.target.innerHTML = '<i class="fas fa-eye"></i>';
                              }
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                      </div>
                      <small className="text-muted mt-1">
                        {modalType === 'add' ? 'Set password for login' : 'Leave blank to keep existing password'}
                      </small>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    {modalType !== 'view' && (
                      <button
                        type="submit"
                        className="btn px-4 py-2"
                        style={{
                          backgroundColor: '#6EB2CC',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '500',
                        }}
                      >
                        {modalType === 'add' ? 'Add Staff' : 'Update Staff'}
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
      )}
    </div>
  );
};

export default ManageStaff;