import React, { useState, useRef } from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

const ManageStaff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedStaff, setSelectedStaff] = useState(null);
  const fileInputRef = useRef(null);

  // Sample branches for dropdown
  const branches = [
    { id: 1, name: "Downtown Branch" },
    { id: 2, name: "Uptown Fitness" },
    { id: 3, name: "Brooklyn Studio" },
    { id: 4, name: "Queens Health Hub" }
  ];

  // Sample data
  const [staff, setStaff] = useState([
    {
      id: 101,
      staff_id: "STAFF001",
      first_name: "Alex",
      last_name: "Martinez",
      gender: "Male",
      dob: "1985-03-15",
      email: "alex.martinez@gym.com",
      phone: "+1 555-123-4567",
      profile_photo: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "Active",
      role_id: "Manager",
      branch_id: 1,
      join_date: "2020-01-15",
      exit_date: null,
      salary_type: "Fixed",
      hourly_rate: null,
      fixed_salary: 60000,
      commission_rate_percent: 0,
      login_enabled: true,
      username: "alex.m",
      password: "auto-generated"
    },
    {
      id: 102,
      staff_id: "STAFF002",
      first_name: "Sarah",
      last_name: "Kim",
      gender: "Female",
      dob: "1990-07-22",
      email: "sarah.kim@gym.com",
      phone: "+1 555-987-6543",
      profile_photo: "https://randomuser.me/api/portraits/women/44.jpg",
      status: "Active",
      role_id: "Trainer",
      branch_id: 2,
      join_date: "2021-03-10",
      exit_date: null,
      salary_type: "Hourly",
      hourly_rate: 35,
      fixed_salary: null,
      commission_rate_percent: 15,
      login_enabled: true,
      username: "sarah.k",
      password: "auto-generated"
    },
    {
      id: 103,
      staff_id: "STAFF003",
      first_name: "Raj",
      last_name: "Patel",
      gender: "Male",
      dob: "1988-11-05",
      email: "raj.patel@gym.com",
      phone: "+1 555-456-7890",
      profile_photo: "",
      status: "Inactive",
      role_id: "Receptionist",
      branch_id: 3,
      join_date: "2019-08-01",
      exit_date: "2025-01-31",
      salary_type: "Fixed",
      hourly_rate: null,
      fixed_salary: 35000,
      commission_rate_percent: 0,
      login_enabled: false,
      username: "raj.p",
      password: "auto-generated"
    }
  ]);

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

  const confirmDelete = () => {
    if (selectedStaff) {
      setStaff(prev => prev.filter(s => s.id !== selectedStaff.id));
      alert(`Staff member "${selectedStaff.first_name} ${selectedStaff.last_name}" has been deleted.`);
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
      <span className={`badge rounded-pill ${roleColors[role] || 'bg-light'} px-3 py-1`}>
        {role}
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNextStaffId = () => {
    const prefix = "STAFF";
    const maxId = staff.length > 0 ? Math.max(...staff.map(s => parseInt(s.staff_id.replace(prefix, '')) || 0)) : 0;
    return `${prefix}${String(maxId + 1).padStart(3, '0')}`;
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
    <div className="container-fluid p-4">
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
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">First Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
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
                        defaultValue={selectedStaff?.dob || ''}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className="form-control rounded-3"
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
                        defaultValue={selectedStaff?.role_id || 'Receptionist'}
                        disabled={modalType === 'view'}
                        required
                      >
                       
                        <option value="Manager">Personal Trainer</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Housekeeping">Housekeeping</option>
                      </select>
                    </div>
                   
                    <div className="col-12 col-md-6">
                      <label className="form-label">Join Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        defaultValue={selectedStaff?.join_date || new Date().toISOString().split('T')[0]}
                        readOnly={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Exit Date</label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        defaultValue={selectedStaff?.exit_date || ''}
                        readOnly={modalType === 'view'}
                      />
                    </div>
                  </div>

                  {/* SECTION 3: Compensation */}
                  <h6 className="fw-bold mb-3">Compensation</h6>
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
                        onClick={() => {
                          // In real app, you'd collect all form data here
                          if (modalType === 'add') {
                            alert('New staff member added successfully!');
                          } else {
                            alert('Staff member updated successfully!');
                          }
                          closeModal();
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

export default ManageStaff;