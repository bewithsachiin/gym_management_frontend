import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaSpinner } from 'react-icons/fa'; // Added FaSpinner for loading
import axiosInstance from '../../../utils/axiosInstance';
import { useUser } from '../../../UserContext';

const Members = () => {
    const { user } = useUser();
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false); // Add Member Modal
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [branches, setBranches] = useState([]);
    const [staff, setStaff] = useState([]);

    // --- Data Fetching Logic (Effect 1: Members) ---
    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await axiosInstance.get('/members', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMembers(response.data.data.members);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch members:', err);
                setError('Failed to fetch members. Please try again.');
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    // --- Data Fetching Logic (Effect 2: Branches and Staff) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [branchesRes, staffRes] = await Promise.all([
                    axiosInstance.get('/branches', { headers: { Authorization: `Bearer ${token}` } }),
                    axiosInstance.get('/staff', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                setBranches(branchesRes.data.data.branches);
                setStaff(staffRes.data.data.staff);
            } catch (err) {
                console.error('Failed to fetch auxiliary data (branches/staff):', err);
                // Note: Not setting loading/error for the main table as members were fetched
            }
        };
        fetchData();
    }, []);

    // --- Filtering Logic ---
    useEffect(() => {
        setFilteredMembers(
            members.filter(member =>
                (member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email?.toLowerCase().includes(searchTerm.toLowerCase())) ?? true // Null-check properties
            )
        );
    }, [searchTerm, members]);

    // --- Modal Scroll Lock Logic ---
    useEffect(() => {
        const isModalOpen = showModal || isDeleteModalOpen || viewModal || editModal;
        document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal, isDeleteModalOpen, viewModal, editModal]);

    // --- Helper Function ---
    const getStatusBadge = (status) => {
        const badgeClasses = {
            Activated: "bg-success-subtle text-success-emphasis",
            Activate: "bg-warning-subtle text-warning-emphasis",
            Expired: "bg-danger-subtle text-danger-emphasis"
        };
        // Use a default status if the incoming status is null/undefined
        const effectiveStatus = status || 'Activate'; 

        return (
            <span className={`badge rounded-pill ${badgeClasses[effectiveStatus] || 'bg-secondary'} px-3 py-1`}>
                {effectiveStatus}
            </span>
        );
    };

    // --- Action Handlers (Kept logic as per original) ---
    const handleActivate = async (id) => {
        // For now, just toggle locally; in future, implement API call to update status
        setMembers(prev =>
            prev.map(m =>
                m.id === id ? { 
                    ...m, 
                    // Safely toggle between 'Activate' and 'Activated'
                    membershipStatus: m.membershipStatus === 'Activate' ? 'Activated' : 'Activate' 
                } : m
            )
        );
    };

    const handleDeleteClick = (member) => {
        setSelectedMember(member);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedMember) {
            try {
                const token = localStorage.getItem('token');
                await axiosInstance.delete(`/members/${selectedMember.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
                alert(`Member "${selectedMember.first_name} ${selectedMember.last_name}" has been deleted.`);
            } catch (err) {
                console.error('Error deleting member:', err);
                alert('Failed to delete member');
            }
        }
        setIsDeleteModalOpen(false);
        setSelectedMember(null);
    };

    // --- Modal Closers ---
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

    // --- Modal Openers ---
    const openViewModal = (member) => {
        setSelectedMember(member);
        setViewModal(true);
    };

    const openEditModal = (member) => {
        setSelectedMember(member);
        setEditModal(true);
    };

    // --- Main Render ---
    return (
        <div className="p-3 p-md-4"> {/* Added padding for auto-fit on smaller screens */}
            {/* Header */}
            <div className="row mb-4 align-items-center">
                <div className="col-12 col-lg-8 mb-3 mb-lg-0">
                    <h2 className="fw-bold h3 h2-md">Members List</h2>
                    <p className="text-muted mb-0">Manage all gym members, their information, and membership status.</p>
                </div>
                <div className="col-12 col-lg-4 text-lg-end">
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
                        onClick={() => setShowModal(true)}
                    >
                        <i className="fas fa-plus me-2"></i> Add Member
                    </button>
                </div>
            </div>

            {/* Search & Actions - Responsive Grid (g-3 provides gutters) */}
            <div className="row mb-4 g-3">
                <div className="col-12 col-md-6 col-lg-5">
                    <div className="input-group">
                        <span className="input-group-text bg-light border">
                            <i className="fas fa-search text-muted"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border"
                            placeholder="Search members..."
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

            {/* Table Area */}
            <div className="card shadow-sm border-0">
                {/* Conditional Rendering: Loading, Error, or Data */}
                {loading ? (
                    <div className="text-center p-5">
                        <FaSpinner className="fa-spin text-primary" size={32} />
                        <p className="mt-3 text-muted">Loading members...</p>
                    </div>
                ) : error ? (
                    <div className="text-center p-5 text-danger">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        <p className="mt-2">{error}</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="text-center p-5 text-muted">
                        <i className="fas fa-info-circle me-2"></i>
                        <p className="mt-2">No members found matching your search term.</p>
                    </div>
                ) : (
                    <div className="table-responsive"> {/* Ensures horizontal scroll on small screens */}
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="fw-semibold">PHOTO</th>
                                    <th className="fw-semibold">MEMBER NAME</th>
                                    <th className="fw-semibold">EMAIL</th>
                                    <th className="fw-semibold">BRANCH</th>
                                    <th className="fw-semibold">CREATED AT</th>
                                    <th className="fw-semibold">STAFF</th>
                                    <th className="fw-semibold">STATUS</th>
                                    <th className="fw-semibold text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map(member => (
                                    <tr key={member.id}>
                                        <td>
                                            <div
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    backgroundColor: '#ddd',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1rem',
                                                    fontWeight: 'bold',
                                                    color: '#666'
                                                }}
                                            >
                                                {member.first_name?.charAt(0).toUpperCase()}
                                            </div>
                                        </td>
                                        <td><strong>{member.first_name} {member.last_name}</strong></td>
                                        <td>{member.email}</td>
                                        <td>{member.branch?.name}</td>
                                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                                        <td>{member.staff ? `${member.staff.first_name} ${member.staff.last_name}` : 'N/A'}</td>
                                        <td>
                                            {member.membershipStatus === 'Activate' ? (
                                                <span onClick={() => handleActivate(member.id)} style={{ cursor: 'pointer' }}>
                                                    {getStatusBadge(member.membershipStatus)}
                                                </span>
                                            ) : (
                                                getStatusBadge(member.membershipStatus)
                                            )}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* VIEW MODAL (Logic and structure unchanged) */}
            {viewModal && selectedMember && (
                <div
                    className="modal fade show"
                    tabIndex="-1"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={closeViewModal}
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">View Member</h5>
                                <button type="button" className="btn-close" onClick={closeViewModal}></button>
                            </div>
                            <div className="modal-body p-3 p-md-4">
                                {/* Personal Information */}
                                <h6 className="mb-3 fw-semibold">Personal Information</h6>
                                <div className="row mb-3 g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">First Name</label>
                                        <input type="text" className="form-control rounded-3" value={selectedMember.first_name} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Last Name</label>
                                        <input type="text" className="form-control rounded-3" value={selectedMember.last_name} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control rounded-3" value={selectedMember.email} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Mobile Number</label>
                                        <input type="tel" className="form-control rounded-3" value={selectedMember.phone || ''} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Branch</label>
                                        <input type="text" className="form-control rounded-3" value={selectedMember.branch?.name || 'N/A'} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Staff</label>
                                        <input type="text" className="form-control rounded-3" value={selectedMember.staff ? `${selectedMember.staff.first_name} ${selectedMember.staff.last_name}` : 'N/A'} readOnly />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Created At</label>
                                        <input type="text" className="form-control rounded-3" value={new Date(selectedMember.createdAt).toLocaleDateString()} readOnly />
                                    </div>
                                </div>
                                <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 py-2"
                                        onClick={closeViewModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL (Logic and structure unchanged, form completed) */}
            {editModal && selectedMember && (
                <div
                    className="modal fade show"
                    tabIndex="-1"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={closeEditModal}
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Edit Member</h5>
                                <button type="button" className="btn-close" onClick={closeEditModal}></button>
                            </div>
                            <div className="modal-body p-3 p-md-4">
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const data = Object.fromEntries(formData);
                                    try {
                                        const token = localStorage.getItem('token');
                                        await axiosInstance.put(`/members/${selectedMember.id}`, data, {
                                            headers: { Authorization: `Bearer ${token}` },
                                        });
                                        alert('Member updated!');
                                        // Refresh members list
                                        const response = await axiosInstance.get('/members', {
                                            headers: { Authorization: `Bearer ${token}` },
                                        });
                                        setMembers(response.data.data.members);
                                        closeEditModal();
                                    } catch (error) {
                                        console.log('Error updating member:', error);
                                        alert('Failed to update member');
                                    }
                                }}>
                                    {/* Personal Information */}
                                    <h6 className="mb-3 fw-semibold">Personal Information</h6>
                                    <div className="row mb-3 g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">First Name *</label>
                                            <input type="text" name="first_name" className="form-control rounded-3" defaultValue={selectedMember.first_name} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Last Name *</label>
                                            <input type="text" name="last_name" className="form-control rounded-3" defaultValue={selectedMember.last_name} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email *</label>
                                            <input type="email" name="email" className="form-control rounded-3" defaultValue={selectedMember.email} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Mobile Number</label>
                                            <input type="tel" name="phone" className="form-control rounded-3" defaultValue={selectedMember.phone || ''} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Branch *</label>
                                            <select name="branchId" className="form-select rounded-3" defaultValue={selectedMember.branch?.id} required>
                                                <option value="">Select Branch</option>
                                                {branches.map(branch => (
                                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Staff</label>
                                            <select name="staffId" className="form-select rounded-3" defaultValue={selectedMember.staff?.id || ''}>
                                                <option value="">Select Staff</option>
                                                {staff.map(s => (
                                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Active Status</label>
                                            <select name="status" className="form-select rounded-3" defaultValue={selectedMember.status || 'Active'}>
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Profile Photo</label>
                                            <input type="file" name="profile_photo" className="form-control rounded-3" />
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary px-4 py-2"
                                            onClick={closeEditModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{
                                                backgroundColor: '#6EB2CC',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 20px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL (Logic and structure unchanged) */}
            {isDeleteModalOpen && selectedMember && (
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
                                    This will permanently delete <strong>{selectedMember.first_name} {selectedMember.last_name}</strong>.<br />
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer border-0 justify-content-center pb-4">
                                <button type="button" className="btn btn-outline-secondary px-4" onClick={closeDeleteModal}>Cancel</button>
                                <button type="button" className="btn btn-danger px-4" onClick={confirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD MEMBER MODAL (Logic and structure unchanged, form completed) */}
            {showModal && (
                <div
                    className="modal fade show"
                    tabIndex="-1"
                    style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={closeModal}
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Add Member</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                ></button>
                            </div>
                            <div className="modal-body p-3 p-md-4">
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const data = Object.fromEntries(formData);
                                    try {
                                        const token = localStorage.getItem('token');
                                        await axiosInstance.post('/members', data, {
                                            headers: { Authorization: `Bearer ${token}` },
                                        });
                                        alert('Member added successfully!');
                                        // Refresh members list
                                        const response = await axiosInstance.get('/members', {
                                            headers: { Authorization: `Bearer ${token}` },
                                        });
                                        setMembers(response.data.data.members);
                                        closeModal();
                                    } catch (error) {
                                        console.error('Error adding member:', error);
                                        alert('Failed to add member');
                                    }
                                }}>
                                    {/* Personal Information */}
                                    <h6 className="mb-3 fw-semibold">Personal Information</h6>
                                    <div className="row mb-3 g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">First Name *</label>
                                            <input type="text" name="first_name" className="form-control rounded-3" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Last Name *</label>
                                            <input type="text" name="last_name" className="form-control rounded-3" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Email *</label>
                                            <input type="email" name="email" className="form-control rounded-3" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Password *</label>
                                            <input type="password" name="password" className="form-control rounded-3" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Mobile Number</label>
                                            <input type="tel" name="phone" className="form-control rounded-3" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Branch *</label>
                                            <select name="branchId" className="form-select rounded-3" required>
                                                <option value="">Select Branch</option>
                                                {branches.map(branch => (
                                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Staff</label>
                                            <select name="staffId" className="form-select rounded-3">
                                                <option value="">Select Staff</option>
                                                {staff.map(s => (
                                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Active Status</label>
                                            <select name="status" className="form-select rounded-3" defaultValue="Active">
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Profile Photo</label>
                                            <input type="file" name="profile_photo" className="form-control rounded-3" />
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary px-4 py-2"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{
                                                backgroundColor: '#6EB2CC',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '10px 20px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            Add Member
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;