import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';

const ManageMember = () => {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [plans, setPlans] = useState([]);

    // Fetch members from API
    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/members');
            if (response.data.success) {
                setMembers(response.data.data);
            } else {
                setError('Failed to fetch members');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch members');
        } finally {
            setLoading(false);
        }
    };

    // Fetch plans from API
    const fetchPlans = async () => {
        console.log('fetchPlans called');
        try {
            const response = await axiosInstance.get('/plans');
            console.log('Plans API response:', response.data);
            if (response.data.success) {
                setPlans(response.data.data.plans);
                console.log('Plans set:', response.data.data.plans);
            }
        } catch (err) {
            console.error('Failed to fetch plans', err);
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchPlans();
    }, []);

    // Filter members based on search term
    useEffect(() => {
        const filtered = members.filter(member =>
            member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.memberId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.plan?.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
            Activated: "bg-success-subtle text-success-emphasis",
            Activate: "bg-warning-subtle text-warning-emphasis",
            Expired: "bg-danger-subtle text-danger-emphasis",
            Active: "bg-success-subtle text-success-emphasis",
            Inactive: "bg-secondary-subtle text-secondary-emphasis"
        };
        return (
            <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
                {status}
            </span>
        );
    };

    // Activate member
    const handleActivate = async (id) => {
        try {
            await axiosInstance.put(`/members/${id}/activate`);
            fetchMembers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update member status');
        }
    };

    // Add new member
    const handleAddMember = async (formData) => {
        setFormLoading(true);
        try {
            const memberData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                memberId: formData.memberId,
                email: formData.email,
                phone: formData.phone,
                joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
                expireDate: formData.expireDate,
                type: "Member",
                status: "Active",
                membershipStatus: "Activate",
                plan: formData.plan,
                photo: formData.photo,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                gender: formData.gender,
                dob: formData.dob
            };

            const response = await axiosInstance.post('/members', memberData);
            
            if (response.data.success) {
                alert('Member added successfully!');
                fetchMembers();
                setShowModal(false);
            } else {
                throw new Error(response.data.message || 'Failed to add member');
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to add member');
        } finally {
            setFormLoading(false);
        }
    };

    // Update member
    const handleUpdateMember = async (formData) => {
        setFormLoading(true);
        try {
            const updateData = {
                name: formData.name,
                memberId: formData.memberId,
                email: formData.email,
                phone: formData.phone,
                joiningDate: formData.joiningDate,
                expireDate: formData.expireDate,
                plan: formData.plan,
                status: formData.status,
                membershipStatus: formData.membershipStatus
            };

            const response = await axiosInstance.put(`/members/${selectedMember.id}`, updateData);
            
            if (response.data.success) {
                alert('Member updated successfully!');
                fetchMembers();
                setEditModal(false);
            } else {
                throw new Error(response.data.message || 'Failed to update member');
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to update member');
        } finally {
            setFormLoading(false);
        }
    };

    // Delete member
    const handleDeleteClick = (member) => {
        setSelectedMember(member);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedMember) {
            try {
                const response = await axiosInstance.delete(`/members/${selectedMember.id}`);
                
                if (response.data.success) {
                    alert(`Member "${selectedMember.name}" has been deleted.`);
                    fetchMembers();
                } else {
                    throw new Error(response.data.message || 'Failed to delete member');
                }
            } catch (err) {
                alert(err.response?.data?.message || err.message || 'Failed to delete member');
            }
        }
        setIsDeleteModalOpen(false);
        setSelectedMember(null);
    };

    // Modal handlers
    const closeModal = () => {
        setShowModal(false);
        setSelectedMember(null);
    };

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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Generate member ID
    const generateMemberId = () => {
        return `M${Math.floor(10000 + Math.random() * 90000)}`;
    };

    // Consistent modal style
    const modalStyle = {
        display: 'block',
        backgroundColor: 'rgba(0,0,0,0.5)'
    };

    const modalContentStyle = {
        maxHeight: '85vh',
        overflowY: 'auto'
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4 align-items-center">
                <div className="col-12 col-lg-8 mb-3 mb-lg-0">
                    <h2 className="fw-bold h3 h2-md">Members List</h2>
                    <p className="text-muted mb-0">Manage all gym members, their information, and membership plan.</p>
                </div>
                <div className="col-12 col-lg-4 text-lg-end">
                    <button
                        className="btn btn-primary d-inline-flex align-items-center"
                        onClick={() => setShowModal(true)}
                    >
                        <FaPlus className="me-2" />
                        Add Member
                    </button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> {error}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setError(null)}
                    ></button>
                </div>
            )}

            {/* Search & Actions */}
            <div className="row mb-4 g-3">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search members by name, ID, email, or plan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                    <button className="btn btn-outline-secondary w-100">
                        <i className="fas fa-filter me-1"></i> Filter
                    </button>
                </div>
                <div className="col-6 col-md-3 col-lg-2">
                    <div className="dropdown w-100">
                        <button
                            className="btn btn-outline-secondary w-100 dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className="fas fa-file-export me-1"></i> Export
                        </button>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item">PDF</button></li>
                            <li><button className="dropdown-item">CSV</button></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Members Table */}
            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="fw-semibold">PHOTO</th>
                                <th className="fw-semibold">MEMBER NAME</th>
                                <th className="fw-semibold">MEMBER ID</th>
                                <th className="fw-semibold">JOINING DATE</th>
                                <th className="fw-semibold">EXPIRE DATE</th>
                                <th className="fw-semibold">TYPE</th>
                                <th className="fw-semibold">STATUS</th>
                                <th className="fw-semibold">PLAN</th>
                                <th className="fw-semibold text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4 text-muted">
                                        {searchTerm ? 'No members found matching your search.' : 'No members available.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map(member => (
                                    <tr key={member.id}>
                                        <td>
                                            {member.photo ? (
                                                <img
                                                    src={member.photo}
                                                    alt={member.name}
                                                    className="rounded-circle"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        border: '2px solid #eee'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    backgroundColor: '#6EB2CC',
                                                    color: 'white',
                                                    fontSize: '1rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {member.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{member.name}</strong>
                                                {member.email && (
                                                    <div className="text-muted small">{member.email}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{member.memberId || 'N/A'}</td>
                                        <td>{formatDate(member.joiningDate)}</td>
                                        <td>{formatDate(member.expireDate)}</td>
                                        <td>{member.type}</td>
                                        <td>
                                            <button
                                                className='btn btn-sm border-0 p-0'
                                                onClick={() => handleActivate(member.id)}
                                                title="Click to change status"
                                            >
                                                {getStatusBadge(member.membershipStatus)}
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill ${
                                                member.plan === 'Premium' ? 'bg-primary' :
                                                member.plan === 'Gold' ? 'bg-warning text-dark' :
                                                member.plan === 'Basic' ? 'bg-secondary' :
                                                'bg-light text-dark'
                                            } px-3 py-1`}>
                                                {member.plan || 'Not Set'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex flex-row justify-content-center gap-2">
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
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Consistent Modal Structure for View, Edit, Add */}
            
            {/* VIEW MODAL */}
            {viewModal && selectedMember && (
                <div className="modal fade show" style={modalStyle} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content" style={modalContentStyle}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Member Details</h5>
                                <button type="button" className="btn-close" onClick={closeViewModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row">
                                    <div className="col-12 text-center mb-4">
                                        {selectedMember.photo ? (
                                            <img
                                                src={selectedMember.photo}
                                                alt={selectedMember.name}
                                                className="rounded-circle mb-3"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    backgroundColor: '#6EB2CC',
                                                    color: 'white',
                                                    fontSize: '2rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {selectedMember.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <h4 className="fw-bold">{selectedMember.name}</h4>
                                        <p className="text-muted">{selectedMember.email}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold text-muted">Member ID</label>
                                        <p className="form-control-plaintext">{selectedMember.memberId || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold text-muted">Joining Date</label>
                                        <p className="form-control-plaintext">{formatDate(selectedMember.joiningDate)}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold text-muted">Expire Date</label>
                                        <p className="form-control-plaintext">{formatDate(selectedMember.expireDate)}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold text-muted">Type</label>
                                        <p className="form-control-plaintext">{selectedMember.type}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold text-muted">Status</label>
                                        <div className="form-control-plaintext">{getStatusBadge(selectedMember.status)}</div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold text-muted">Membership Status</label>
                                        <div className="form-control-plaintext">{getStatusBadge(selectedMember.membershipStatus)}</div>
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label className="form-label fw-semibold text-muted">Plan</label>
                                        <div className="form-control-plaintext">
                                            <span className={`badge rounded-pill ${
                                                selectedMember.plan === 'Premium' ? 'bg-primary' :
                                                selectedMember.plan === 'Gold' ? 'bg-warning text-dark' :
                                                selectedMember.plan === 'Basic' ? 'bg-secondary' :
                                                'bg-light text-dark'
                                            } px-3 py-2`}>
                                                {selectedMember.plan || 'Not Set'}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedMember.phone && (
                                        <div className="col-12 mb-3">
                                            <label className="form-label fw-semibold text-muted">Phone</label>
                                            <p className="form-control-plaintext">{selectedMember.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editModal && selectedMember && (
                <div className="modal fade show" style={modalStyle} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content" style={modalContentStyle}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Edit Member</h5>
                                <button type="button" className="btn-close" onClick={closeEditModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const data = {
                                        name: formData.get('name'),
                                        memberId: formData.get('memberId'),
                                        email: formData.get('email'),
                                        phone: formData.get('phone'),
                                        joiningDate: formData.get('joiningDate'),
                                        expireDate: formData.get('expireDate'),
                                        plan: formData.get('plan'),
                                        status: formData.get('status'),
                                        membershipStatus: formData.get('membershipStatus')
                                    };
                                    handleUpdateMember(data);
                                }}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Name *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="name" 
                                                defaultValue={selectedMember.name} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Member ID</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="memberId" 
                                                defaultValue={selectedMember.memberId} 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email *</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                name="email" 
                                                defaultValue={selectedMember.email} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="phone" 
                                                defaultValue={selectedMember.phone} 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Joining Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                name="joiningDate" 
                                                defaultValue={selectedMember.joiningDate} 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Expire Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                name="expireDate" 
                                                defaultValue={selectedMember.expireDate} 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Plan</label>
                                            <select
                                                className="form-select"
                                                name="plan"
                                                defaultValue={selectedMember.plan}
                                            >
                                                <option value="">Select Plan</option>
                                                {plans.map(plan => (
                                                    <option key={plan.id} value={plan.plan_name}>{plan.plan_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Membership Status</label>
                                            <select 
                                                className="form-select" 
                                                name="membershipStatus" 
                                                defaultValue={selectedMember.membershipStatus}
                                            >
                                                <option value="Activate">Activate</option>
                                                <option value="Activated">Activated</option>
                                                <option value="Expired">Expired</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary" 
                                            onClick={closeEditModal}
                                            disabled={formLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={formLoading}
                                        >
                                            {formLoading ? 'Updating...' : 'Update Member'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD MEMBER MODAL */}
            {showModal && (
                <div className="modal fade show" style={modalStyle} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content" style={modalContentStyle}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Add New Member</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const data = Object.fromEntries(formData.entries());
                                    handleAddMember(data);
                                }}>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Member ID</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="memberId" 
                                                defaultValue={generateMemberId()} 
                                                readOnly 
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">First Name *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="firstName" 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Last Name *</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="lastName" 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email *</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                name="email" 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="phone" 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Joining Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                name="joiningDate" 
                                                defaultValue={new Date().toISOString().split('T')[0]} 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Expire Date</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                name="expireDate" 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Gender</label>
                                            <select className="form-select" name="gender">
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Date of Birth</label>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                name="dob" 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Address</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="address" 
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">City</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="city" 
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label">State</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                name="state" 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Membership Plan *</label>
                                            <select className="form-select" name="plan" required style={{color: 'black'}}>
                                                <option value="">-- Select Plan --</option>
                                                {plans.map(plan => (
                                                    <option key={plan.id} value={plan.plan_name} style={{color: 'black'}}>{plan.plan_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Profile Photo</label>
                                            <input 
                                                type="file" 
                                                className="form-control" 
                                                name="photo" 
                                                accept="image/*" 
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary px-4" 
                                            onClick={closeModal}
                                            disabled={formLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary px-4"
                                            disabled={formLoading}
                                        >
                                            {formLoading ? 'Adding...' : 'Add Member'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {isDeleteModalOpen && selectedMember && (
                <div className="modal fade show" style={modalStyle} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-danger">Confirm Deletion</h5>
                                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
                            </div>
                            <div className="modal-body text-center py-4">
                                <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>
                                    <FaTrashAlt />
                                </div>
                                <h5>Are you sure?</h5>
                                <p className="text-muted">
                                    This will permanently delete <strong>{selectedMember.name}</strong>.<br />
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

export default ManageMember;