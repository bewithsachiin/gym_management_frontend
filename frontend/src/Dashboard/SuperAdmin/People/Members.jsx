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
  onSubmit = null,
  submitLabel = 'Save'
}) => {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  // Helper to format date for input fields
  const formatForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return '';
    }
  };

  // Transform API data to form structure
  const transformInitialValues = (values) => {
    if (!values) return {};
    
    // If name exists but first_name doesn't, split the name
    let firstName = values.first_name || '';
    let lastName = values.last_name || '';
    
    if (values.name && !values.first_name) {
      const nameParts = values.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    return {
      ...values,
      first_name: firstName,
      last_name: lastName,
      // Ensure all required fields have defaults
      gender: values.gender || 'male',
      type: values.type || 'Member',
      status: values.status || 'Active',
      membershipStatus: values.membershipStatus || 'Activate'
    };
  };

  const transformedValues = transformInitialValues(initialValues);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (isView) return;
        
        const form = e.target;
        const fd = new FormData(form);

        // Handle name construction
        const firstName = fd.get('first_name') || '';
        const lastName = fd.get('last_name') || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Add full name to form data for API
        if (!fd.has('name')) {
          fd.append('name', fullName);
        }

        // Set default values for required fields if not present
        if (!fd.has('gender') && transformedValues.gender) {
          fd.set('gender', transformedValues.gender);
        }
        if (!fd.has('type')) {
          fd.set('type', transformedValues.type || 'Member');
        }
        if (!fd.has('status')) {
          fd.set('status', transformedValues.status || 'Active');
        }
        if (!fd.has('membershipStatus')) {
          fd.set('membershipStatus', transformedValues.membershipStatus || 'Activate');
        }

        // Call parent's onSubmit if provided
        if (onSubmit) {
          await onSubmit(fd, mode, transformedValues);
          return;
        }

        // Default submit behavior
        try {
          if (isEdit && transformedValues?.id) {
            await axiosInstance.put(`/members/${transformedValues.id}`, fd, {
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
            defaultValue={transformedValues.memberId || ''}
            readOnly={isEdit} // Allow editing only in add mode
            disabled={isView}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">First Name *</label>
          <input
            type="text"
            name="first_name"
            className="form-control rounded-3"
            defaultValue={transformedValues.first_name || ''}
            readOnly={isView}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Middle Name</label>
          <input
            type="text"
            name="middle_name"
            className="form-control rounded-3"
            defaultValue={transformedValues.middle_name || ''}
            readOnly={isView}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Last Name *</label>
          <input
            type="text"
            name="last_name"
            className="form-control rounded-3"
            defaultValue={transformedValues.last_name || ''}
            readOnly={isView}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Gender *</label>
          <div>
            <input
              type="radio"
              name="gender"
              id={`male-${transformedValues.id || 'new'}`}
              value="male"
              defaultChecked={transformedValues.gender === 'male'}
              disabled={isView}
              required
            />{' '}
            <label htmlFor={`male-${transformedValues.id || 'new'}`} className="me-3">Male</label>
            <input
              type="radio"
              name="gender"
              id={`female-${transformedValues.id || 'new'}`}
              value="female"
              defaultChecked={transformedValues.gender === 'female'}
              disabled={isView}
            />{' '}
            <label htmlFor={`female-${transformedValues.id || 'new'}`}>Female</label>
          </div>
        </div>
        <div className="col-md-4">
          <label className="form-label">Date Of Birth *</label>
          <input 
            type="date" 
            name="dob" 
            className="form-control rounded-3" 
            defaultValue={formatForInput(transformedValues.dob)} 
            readOnly={isView} 
            required 
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Branch *</label>
          <select 
            name="branchId" 
            className="form-select rounded-3" 
            defaultValue={transformedValues.branchId || ''} 
            disabled={isView}
            required
          >
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
          <input 
            type="text" 
            name="address" 
            className="form-control rounded-3" 
            defaultValue={transformedValues.address || ''} 
            readOnly={isView} 
            required 
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">City *</label>
          <input 
            type="text" 
            name="city" 
            className="form-control rounded-3" 
            defaultValue={transformedValues.city || ''} 
            readOnly={isView} 
            required 
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">State</label>
          <input 
            type="text" 
            name="state" 
            className="form-control rounded-3" 
            defaultValue={transformedValues.state || ''} 
            readOnly={isView} 
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Mobile Number *</label>
          <div className="input-group">
            <span className="input-group-text">+61</span>
            <input 
              type="text" 
              name="phone" 
              className="form-control rounded-3" 
              defaultValue={transformedValues.phone || ''} 
              readOnly={isView} 
              required 
            />
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label">Email *</label>
          <input 
            type="email" 
            name="email" 
            className="form-control rounded-3" 
            defaultValue={transformedValues.email || ''} 
            readOnly={isView} 
            required 
          />
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
              defaultValue={transformedValues[field.name] || ''}
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
          <input 
            type="date" 
            name="joiningDate" 
            className="form-control rounded-3" 
            defaultValue={formatForInput(transformedValues.joiningDate)} 
            readOnly={isView} 
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Expire Date</label>
          <input 
            type="date" 
            name="expireDate" 
            className="form-control rounded-3" 
            defaultValue={formatForInput(transformedValues.expireDate)} 
            readOnly={isView} 
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Membership Plan</label>
          <select 
            name="planId" 
            className="form-select rounded-3" 
            defaultValue={transformedValues.planId || ''} 
            disabled={isView}
          >
            <option value="">Select a plan</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Type</label>
          <select 
            name="type" 
            className="form-select rounded-3" 
            defaultValue={transformedValues.type || 'Member'} 
            disabled={isView}
          >
            <option value="Member">Member</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Status</label>
          <select 
            name="status" 
            className="form-select rounded-3" 
            defaultValue={transformedValues.status || 'Active'} 
            disabled={isView}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Membership Status</label>
          <select 
            name="membershipStatus" 
            className="form-select rounded-3" 
            defaultValue={transformedValues.membershipStatus || 'Activate'} 
            disabled={isView}
          >
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
              <input 
                type="text" 
                name="username" 
                className="form-control rounded-3" 
                defaultValue={transformedValues.username || ''} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password {!isEdit && '*'}</label>
              <input 
                type="password" 
                name="password" 
                className="form-control rounded-3" 
                required={!isEdit} // Only required for new members
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Display Image</label>
              <input type="file" name="profile_photo" className="form-control rounded-3" accept="image/*" />
            </div>
          </div>
        </>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={onCancel}>
          {isView ? 'Close' : 'Cancel'}
        </button>
        {!isView && (
          <button type="submit" className="btn" style={{ backgroundColor: '#6EB2CC', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}>
            {submitLabel}
          </button>
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
      const response = await axiosInstance.get('/members');
      console.log('API Response:', response.data);
      
      // Handle the API response structure
      if (response.data.success) {
        setMembers(response.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch members');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch members');
      setMembers([]); // Reset members on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches for filter dropdown
  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      // Handle different response structures
      setBranches(response.data?.data || response.data?.branches || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setBranches([]);
    }
  };

  // Fetch plans for dropdown
  const fetchPlans = async () => {
    try {
      const response = await axiosInstance.get('/plans');
      // Handle different response structures
      setPlans(response.data?.data || response.data?.plans || []);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setPlans([]);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchBranches();
    fetchPlans();
  }, []);

  // Filter members based on search term
  useEffect(() => {
    if (!members || members.length === 0) {
      setFilteredMembers([]);
      return;
    }

    const filtered = members.filter(member => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (member.name && member.name.toLowerCase().includes(searchLower)) ||
        (member.memberId && member.memberId.toLowerCase().includes(searchLower)) ||
        (member.email && member.email.toLowerCase().includes(searchLower)) ||
        (member.phone && member.phone.toLowerCase().includes(searchLower)) ||
        (member.type && member.type.toLowerCase().includes(searchLower)) ||
        (member.status && member.status.toLowerCase().includes(searchLower)) ||
        (member.membershipStatus && member.membershipStatus.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  // Handle body overflow for modals
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

  // Status badge component
  const getStatusBadge = (status) => {
    const badgeClasses = {
      Activated: 'bg-success-subtle text-success-emphasis',
      Activate: 'bg-warning-subtle text-warning-emphasis',
      Expired: 'bg-danger-subtle text-danger-emphasis',
      Active: 'bg-success-subtle text-success-emphasis',
      Inactive: 'bg-secondary-subtle text-secondary-emphasis',
      Suspended: 'bg-danger-subtle text-danger-emphasis'
    };
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  // Handle membership status toggle
  const handleActivate = async (id) => {
    try {
      const member = members.find(m => m.id === id);
      if (!member) return;

      const newStatus = member.membershipStatus === 'Activate' ? 'Activated' : 'Activate';
      
      await axiosInstance.put(`/members/${id}`, { 
        membershipStatus: newStatus 
      });
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === id ? { ...m, membershipStatus: newStatus } : m
      ));
      
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.message || 'Failed to update membership status');
    }
  };

  // Delete member handlers
  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    try {
      await axiosInstance.delete(`/members/${selectedMember.id}`);
      
      // Update local state
      setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
      
      alert(`Member "${selectedMember.name}" has been deleted successfully.`);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete member');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedMember(null);
    }
  };

  // Modal handlers
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Form submission handlers
  const handleAddMember = async (formData) => {
    try {
      await axiosInstance.post('/members', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      alert('Member added successfully!');
      setShowModal(false);
      fetchMembers(); // Refresh the list
    } catch (err) {
      console.error('Add member error:', err);
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateMember = async (formData, mode, initialValues) => {
    try {
      await axiosInstance.put(`/members/${initialValues.id}`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      alert('Member updated successfully!');
      setEditModal(false);
      setSelectedMember(null);
      fetchMembers(); // Refresh the list
    } catch (err) {
      console.error('Update member error:', err);
      setError(err.response?.data?.message || 'Failed to update member');
    }
  };

  // Generate member ID for new members
  const generateMemberId = () => {
    const existingIds = members.map(m => m.memberId).filter(id => id && id.startsWith('MEM'));
    const numbers = existingIds.map(id => parseInt(id.replace('MEM', ''))).filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `MEM${String(nextNum).padStart(3, '0')}`;
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
            style={{ backgroundColor: '#6EB2CC', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '1rem', fontWeight: '500' }}
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
            <span className="input-group-text bg-light border">
              <i className="fas fa-search text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control border" 
              placeholder="Search by name, ID, email, phone..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <select 
            className="form-select" 
            value={branchFilter} 
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button 
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              // Apply branch filter
              if (branchFilter) {
                setFilteredMembers(members.filter(member => member.branchId == branchFilter));
              } else {
                setFilteredMembers(members);
              }
            }}
          >
            <i className="fas fa-filter me-1" /> Filter
          </button>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <div className="dropdown w-100">
            <button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i className="fas fa-file-export me-1" /> Export
            </button>
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
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading members...</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <div>{error}</div>
          <button 
            type="button" 
            className="btn-close ms-auto" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Members Table */}
      {!loading && !error && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-semibold">PHOTO</th>
                  <th className="fw-semibold">MEMBER NAME</th>
                  <th className="fw-semibold">MEMBER ID</th>
                  <th className="fw-semibold">EMAIL</th>
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
                          <img 
                            src={member.photo} 
                            alt={member.name} 
                            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} 
                          />
                        ) : (
                          <div 
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              backgroundColor: '#6EB2CC', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '1rem', 
                              fontWeight: 'bold', 
                              color: 'white' 
                            }}
                          >
                            {(member.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{member.name || 'Unnamed Member'}</strong>
                        <br />
                        <small className="text-muted">{member.type || 'Member'}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">{member.memberId || 'N/A'}</span>
                      </td>
                      <td>{member.email || 'N/A'}</td>
                      <td>{formatDate(member.joiningDate)}</td>
                      <td>{formatDate(member.expireDate)}</td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getStatusBadge(member.membershipStatus)}
                          <small className="text-muted">{member.status}</small>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="d-flex flex-row justify-content-center gap-1">
                          <button 
                            className="btn btn-sm btn-outline-secondary" 
                            title="View" 
                            onClick={() => openViewModal(member)}
                          >
                            <FaEye size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            title="Edit" 
                            onClick={() => openEditModal(member)}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Delete" 
                            onClick={() => handleDeleteClick(member)}
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="text-muted">
                        <i className="fas fa-users fa-2x mb-3" />
                        <p>{members.length === 0 ? 'No members found' : 'No members match your search'}</p>
                        {members.length === 0 && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                          >
                            Add Your First Member
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
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

      {/* EDIT MODAL */}
      {editModal && selectedMember && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeEditModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Member</h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <MemberForm 
                  mode="edit" 
                  initialValues={selectedMember} 
                  branches={branches} 
                  plans={plans} 
                  onCancel={closeEditModal} 
                  onSubmit={handleUpdateMember} 
                  submitLabel="Update Member" 
                />
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
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle" />
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will permanently delete <strong>{selectedMember.name}</strong>.
                  <br />This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger px-4" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Add New Member</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <MemberForm 
                  mode="add" 
                  initialValues={{ 
                    memberId: generateMemberId(),
                    type: 'Member',
                    status: 'Active',
                    membershipStatus: 'Activate'
                  }} 
                  branches={branches} 
                  plans={plans} 
                  onCancel={closeModal} 
                  onSubmit={handleAddMember} 
                  submitLabel="Add Member" 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;