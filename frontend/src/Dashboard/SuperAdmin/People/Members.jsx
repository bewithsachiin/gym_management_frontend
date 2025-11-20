import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';

// Reusable member form. mode = 'add' | 'edit' | 'view'
const MemberForm = ({
  mode = 'add',
  initialValues = {},
  branches = [],
  plans = [],
  onCancel = () => {},
  onSubmit = null, // if provided, parent will handle submit. Otherwise the form will call default axios actions passed via props
  submitLabel = 'Save'
}) => {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const formatForInput = (dateString) => {
    if (!dateString) return '';
    // try to produce YYYY-MM-DD
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (isView) return;
        const form = e.target;
        const fd = new FormData(form);

        // normalize radio values if absent
        if (!fd.has('gender') && initialValues.gender) fd.set('gender', initialValues.gender);

        // Call parent's onSubmit if provided (they might want to manage axios)
        if (onSubmit) {
          await onSubmit(fd, mode, initialValues);
          return;
        }

        // Default submit behavior (should be replaced by parent in most apps)
        try {
          if (isEdit && initialValues?.id) {
            await axiosInstance.put(`/members/${initialValues.id}`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Member updated successfully');
          } else {
            await axiosInstance.post('/members', fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Member added successfully');
          }
        } catch (err) {
          console.error(err);
          alert(err?.response?.data?.message || 'Server error');
        }
      }}
    >
      {/* Personal Information */}
      <h6 className="mb-3 fw-semibold">Personal Information</h6>
      <div className="row mb-3 g-3">
        <div className="col-md-4">
          <label className="form-label">Member ID</label>
          <input
            type="text"
            name="memberId"
            className="form-control rounded-3"
            defaultValue={initialValues.memberId || ''}
            readOnly
            disabled={isView}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">First Name *</label>
          <input
            type="text"
            name="first_name"
            className="form-control rounded-3"
            defaultValue={initialValues.first_name || ''}
            readOnly={isView}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Middle Name</label>
          <input
            type="text"
            name="middle_name"
            className="form-control rounded-3"
            defaultValue={initialValues.middle_name || ''}
            readOnly={isView}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Last Name *</label>
          <input
            type="text"
            name="last_name"
            className="form-control rounded-3"
            defaultValue={initialValues.last_name || ''}
            readOnly={isView}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Gender *</label>
          <div>
            <input
              type="radio"
              name="gender"
              id={`male-${initialValues.id || 'new'}`}
              value="male"
              defaultChecked={initialValues.gender === 'male'}
              disabled={isView}
            />{' '}
            <label htmlFor={`male-${initialValues.id || 'new'}`} className="me-3">Male</label>
            <input
              type="radio"
              name="gender"
              id={`female-${initialValues.id || 'new'}`}
              value="female"
              defaultChecked={initialValues.gender === 'female'}
              disabled={isView}
            />{' '}
            <label htmlFor={`female-${initialValues.id || 'new'}`}>Female</label>
          </div>
        </div>
        <div className="col-md-4">
          <label className="form-label">Date Of Birth *</label>
          <input type="date" name="dob" className="form-control rounded-3" defaultValue={formatForInput(initialValues.dob)} readOnly={isView} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Branch *</label>
          <select name="branchId" className="form-select rounded-3" defaultValue={initialValues.branch?.id || initialValues.branchId || ''} disabled={isView}>
            <option value="">Select an option</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact Information */}
      <h6 className="mb-3 fw-semibold">Contact Information</h6>
      <div className="row mb-3 g-3">
        <div className="col-md-6">
          <label className="form-label">Address *</label>
          <input type="text" name="address" className="form-control rounded-3" defaultValue={initialValues.address || ''} readOnly={isView} />
        </div>
        <div className="col-md-3">
          <label className="form-label">City *</label>
          <input type="text" name="city" className="form-control rounded-3" defaultValue={initialValues.city || ''} readOnly={isView} />
        </div>
        <div className="col-md-3">
          <label className="form-label">State</label>
          <input type="text" name="state" className="form-control rounded-3" defaultValue={initialValues.state || ''} readOnly={isView} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Mobile Number *</label>
          <div className="input-group">
            <span className="input-group-text">+61</span>
            <input type="text" name="phone" className="form-control rounded-3" defaultValue={initialValues.phone || ''} readOnly={isView} />
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label">Email *</label>
          <input type="email" name="email" className="form-control rounded-3" defaultValue={initialValues.email || ''} readOnly={isView} />
        </div>
      </div>

      {/* Physical Information */}
      <h6 className="mb-3 fw-semibold">Physical Information</h6>
      <div className="row mb-3 g-3">
        {[
          { name: 'weight', label: 'Weight', placeholder: 'KG' },
          { name: 'height', label: 'Height', placeholder: 'Centimeter' },
          { name: 'chest', label: 'Chest', placeholder: 'Inches' },
          { name: 'waist', label: 'Waist', placeholder: 'Inches' },
          { name: 'thigh', label: 'Thigh', placeholder: 'Inches' },
          { name: 'arms', label: 'Arms', placeholder: 'Inches' },
          { name: 'fat', label: 'Fat', placeholder: 'Percentage' }
        ].map((field, idx) => (
          <div className="col-md-3" key={idx}>
            <label className="form-label">{field.label}</label>
            <input
              type="text"
              name={field.name}
              className="form-control rounded-3"
              placeholder={field.placeholder}
              defaultValue={initialValues[field.name] || ''}
              readOnly={isView}
            />
          </div>
        ))}
      </div>

      {/* Membership Information */}
      <h6 className="mb-3 fw-semibold">Membership Information</h6>
      <div className="row mb-3 g-3">
        <div className="col-md-4">
          <label className="form-label">Joining Date</label>
          <input type="date" name="joiningDate" className="form-control rounded-3" defaultValue={formatForInput(initialValues.joiningDate)} readOnly={isView} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Expire Date</label>
          <input type="date" name="expireDate" className="form-control rounded-3" defaultValue={formatForInput(initialValues.expireDate)} readOnly={isView} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Membership Plan</label>
          <select name="planId" className="form-select rounded-3" defaultValue={initialValues.plan?.id || initialValues.planId || ''} disabled={isView}>
            <option value="">Select a plan</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Type</label>
          <select name="type" className="form-select rounded-3" defaultValue={initialValues.type || 'Member'} disabled={isView}>
            <option value="Member">Member</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Status</label>
          <select name="status" className="form-select rounded-3" defaultValue={initialValues.status || 'Active'} disabled={isView}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Membership Status</label>
          <select name="membershipStatus" className="form-select rounded-3" defaultValue={initialValues.membershipStatus || 'Activate'} disabled={isView}>
            <option value="Activate">Activate</option>
            <option value="Activated">Activated</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Login Information (hide in VIEW) */}
      {!isView && (
        <>
          <h6 className="mb-3 fw-semibold">Login Information</h6>
          <div className="row mb-3 g-3">
            <div className="col-md-6">
              <label className="form-label">Username *</label>
              <input type="text" name="username" className="form-control rounded-3" defaultValue={initialValues.username || ''} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password *</label>
              <input type="password" name="password" className="form-control rounded-3" />
            </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Display Image</label>
                                            <input type="file" name="profile_photo" className="form-control rounded-3" />
                                        </div>
          </div>
        </>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={onCancel}>Cancel</button>
        {!isView && (
          <button type="submit" className="btn" style={{ backgroundColor: '#6EB2CC', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}>{submitLabel}</button>
        )}
      </div>
    </form>
  );
};

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [branchFilter, setBranchFilter] = useState('');
  const [branches, setBranches] = useState([]);
  const [plans, setPlans] = useState([]);

  // Fetch members from API
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (branchFilter) params.branchId = branchFilter;
      const response = await axiosInstance.get('/members', { params });
      setMembers(response.data?.data?.members || []);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches for filter dropdown
  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      setBranches(response.data?.data?.branches || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  // Fetch plans for dropdown
  const fetchPlans = async () => {
    try {
      const response = await axiosInstance.get('/plans');
      setPlans(response.data?.data?.plans || []);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchBranches();
    fetchPlans();
  }, []);

  useEffect(() => {
    setFilteredMembers(
      (members || []).filter(member =>
        (member.name || `${member.first_name || ''} ${member.last_name || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.memberId && member.memberId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.phone && member.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.type && member.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.status && member.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.membershipStatus && member.membershipStatus.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.branch && member.branch.name && member.branch.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.plan && member.plan.name && member.plan.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, members]);

  useEffect(() => {
    if (showModal || isDeleteModalOpen || viewModal || editModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, isDeleteModalOpen, viewModal, editModal]);

  const getStatusBadge = (status) => {
    const badgeClasses = {
      Activated: 'bg-success-subtle text-success-emphasis',
      Activate: 'bg-warning-subtle text-warning-emphasis',
      Expired: 'bg-danger-subtle text-danger-emphasis'
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>{status}</span>
    );
  };

  const handleActivate = async (id) => {
    try {
      const member = members.find(m => m.id === id);
      const newStatus = member.membershipStatus === 'Activate' ? 'Activated' : 'Activate';
      await axiosInstance.put(`/members/${id}`, { membershipStatus: newStatus });
      setMembers(prev => prev.map(m => (m.id === id ? { ...m, membershipStatus: newStatus } : m)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update membership status');
    }
  };

  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedMember) {
      try {
        await axiosInstance.delete(`/members/${selectedMember.id}`);
        setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
        alert(`Member "${selectedMember.name || selectedMember.first_name}" has been deleted.`);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete member');
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedMember(null);
  };

  const closeModal = () => setShowModal(false);
  const closeViewModal = () => {
    setViewModal(false);
    setSelectedMember(null);
  };
  const closeEditModal = () => {
    setEditModal(false);
    setSelectedMember(null);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedMember(null);
  };

  const openViewModal = (member) => {
    setSelectedMember(member);
    setViewModal(true);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setEditModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Parent handlers for form submit so we can refetch and close modals
  const handleAddMember = async (formData) => {
    try {
      await axiosInstance.post('/members', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Member added successfully!');
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateMember = async (formData, mode, initialValues) => {
    try {
      await axiosInstance.put(`/members/${initialValues.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Member updated successfully!');
      setEditModal(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update member');
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8 mb-3 mb-lg-0">
          <h2 className="fw-bold h3 h2-md">Members List</h2>
          <p className="text-muted mb-0">Manage all gym members, their information, and membership status.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end">
          <button
            className="btn w-100 w-lg-auto"
            style={{ backgroundColor: '#6EB2CC', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '1rem', fontWeight: '500', transition: 'all 0.2s ease' }}
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus me-2" /> Add Member
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group">
            <span className="input-group-text bg-light border"><i className="fas fa-search text-muted" /></span>
            <input type="text" className="form-control border" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <select className="form-select" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100"><i className="fas fa-filter me-1" /> Filter</button>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <div className="dropdown w-100">
            <button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="fas fa-file-export me-1" /> Export</button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item">PDF</button></li>
              <li><button className="dropdown-item">CSV</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold">PHOTO</th>
                  <th className="fw-semibold">MEMBER NAME</th>
                  <th className="fw-semibold">MEMBER ID</th>
                  <th className="fw-semibold">BRANCH</th>
                  <th className="fw-semibold">JOINING DATE</th>
                  <th className="fw-semibold">EXPIRE DATE</th>
                  <th className="fw-semibold">STATUS</th>
                  <th className="fw-semibold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td>
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', backgroundColor: '#ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>{(member.name || (member.first_name || '')).charAt(0)?.toUpperCase()}</div>
                        )}
                      </td>
                      <td><strong>{member.name || `${member.first_name || ''} ${member.last_name || ''}`}</strong></td>
                      <td>{member.memberId || 'N/A'}</td>
                      <td>{member.branch ? member.branch.name : 'N/A'}</td>
                      <td>{formatDate(member.joiningDate)}</td>
                      <td>{formatDate(member.expireDate)}</td>
                      <td>
                        <button className="btn btn-sm border-0" onClick={() => handleActivate(member.id)}>{getStatusBadge(member.membershipStatus)}</button>
                      </td>
                      <td className="text-center">
                        <div className="d-flex flex-row justify-content-center gap-1">
                          <button className="btn btn-sm btn-outline-secondary" title="View" onClick={() => openViewModal(member)}><FaEye size={14} /></button>
                          <button className="btn btn-sm btn-outline-primary" title="Edit" onClick={() => openEditModal(member)}><FaEdit size={14} /></button>
                          <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeleteClick(member)}><FaTrashAlt size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="text-muted"><i className="fas fa-users fa-2x mb-3" />
                        <p>No members found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODAL (re-uses MemberForm in view mode) */}
      {viewModal && selectedMember && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeViewModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">View Member</h5>
                <button type="button" className="btn-close" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <MemberForm
                  mode="view"
                  initialValues={selectedMember}
                  branches={branches}
                  plans={plans}
                  onCancel={closeViewModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL (re-uses MemberForm in edit mode) */}
      {editModal && selectedMember && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeEditModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Member</h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <MemberForm mode="edit" initialValues={selectedMember} branches={branches} plans={plans} onCancel={closeEditModal} onSubmit={handleUpdateMember} submitLabel="Save" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedMember && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeDeleteModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3"><i className="fas fa-exclamation-triangle" /></div>
                <h5>Are you sure?</h5>
                <p className="text-muted">This will permanently delete <strong>{selectedMember.name || selectedMember.first_name}</strong>.<br />This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={closeDeleteModal}>Cancel</button>
                <button type="button" className="btn btn-danger px-4" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL (re-uses MemberForm in add mode) */}
      {showModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Add Member</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <MemberForm mode="add" initialValues={{ memberId: 'M' + Math.floor(Math.random() * 90000 + 10000) }} branches={branches} plans={plans} onCancel={closeModal} onSubmit={(fd) => handleAddMember(fd)} submitLabel="Save Member" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;