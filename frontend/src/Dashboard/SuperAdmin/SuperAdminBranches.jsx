import React, { useState, useEffect, useMemo } from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';

const SuperAdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'view' | 'edit'
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered branches based on search
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      return searchTerm === '' ||
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [branches, searchTerm]);

  // --- Handlers
  const handleAddNew = () => {
    setModalType('add');
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleView = (branch) => {
    setModalType('view');
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleEdit = (branch) => {
    setModalType('edit');
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (branch) => {
    setSelectedBranch(branch);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedBranch) {
      try {
        await deleteBranch(selectedBranch.id);
        alert(`Branch "${selectedBranch.name}" has been deleted.`);
        fetchBranches();
      } catch (err) {
        alert('Failed to delete branch: ' + err.message);
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedBranch(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedBranch(null);
  };

  // Fetch branches
  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isModalOpen || isDeleteModalOpen) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen, isDeleteModalOpen]);

  // --- API functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/branches', { headers: getAuthHeaders() });
      if (response.data.success) setBranches(response.data.data.branches);
      else throw new Error(response.data.message || 'Failed to fetch branches');
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createBranch = async (payload) => {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('code', payload.code);
    formData.append('address', payload.address);
    formData.append('phone', payload.phone || '');
    formData.append('email', payload.email || '');
    formData.append('status', payload.status);
    formData.append('hours', JSON.stringify(payload.hours));
    if (payload.avatar && payload.avatar[0]) formData.append('branch_image', payload.avatar[0]);

    const response = await axiosInstance.post('/branches', formData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    if (!response.data.success) throw new Error(response.data.message || 'Failed to create branch');
    return response.data.data.branch;
  };

  const updateBranch = async (id, payload) => {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('code', payload.code);
    formData.append('address', payload.address);
    formData.append('phone', payload.phone || '');
    formData.append('email', payload.email || '');
    formData.append('status', payload.status);
    formData.append('hours', JSON.stringify(payload.hours));
    if (payload.avatar && payload.avatar[0]) formData.append('branch_image', payload.avatar[0]);

    const response = await axiosInstance.put(`/branches/${id}`, formData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    if (!response.data.success) throw new Error(response.data.message || 'Failed to update branch');
    return response.data.data.branch;
  };

  const deleteBranch = async (id) => {
    const response = await axiosInstance.delete(`/branches/${id}`, { headers: getAuthHeaders() });
    if (!response.data.success) throw new Error(response.data.message || 'Failed to delete branch');
  };

  // --- UI helpers
  const getStatusBadge = (status) => {
    const badgeClasses = {
      ACTIVE: "bg-success-subtle text-success-emphasis",
      INACTIVE: "bg-danger-subtle text-danger-emphasis",
      MAINTENANCE: "bg-warning-subtle text-warning-emphasis",
    };
    return <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</span>;
  };



  return (
    <div className="p-3 p-md-2">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8 mb-3 mb-lg-0">
          <h2 className="fw-bold h3 h2-md">Branch Management</h2>
          <p className="text-muted mb-0">Manage all gym branches, their information, and operational details.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end">
          <button className="btn w-100 w-lg-auto" style={{ backgroundColor: '#6EB2CC', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '1rem', fontWeight: '500' }} onClick={handleAddNew}>
            <i className="fas fa-plus me-2"></i> Add New Branch
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group">
            <span className="input-group-text bg-light border"><i className="fas fa-search text-muted"></i></span>
            <input type="text" className="form-control border" placeholder="Search branches..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          {loading && <p className="text-center py-4">Loading branches...</p>}
          {error && <div className="alert alert-danger mx-3" role="alert">{error}</div>}
          {!loading && !error && (
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>IMAGE</th>
                  <th>BRANCH NAME</th>
                  <th>CODE</th>
                  <th>ADDRESS</th>
                  <th>STATUS</th>
                  <th className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover-row" style={{ cursor: 'pointer' }}>
                    <td onClick={() => handleView(branch)}>{branch.branch_image ? <img src={branch.branch_image} alt="Branch" width="50" height="50" className="rounded" /> : 'No Image'}</td>
                    <td onClick={() => handleView(branch)}>{branch.name}</td>
                    <td onClick={() => handleView(branch)}>{branch.code}</td>
                    <td onClick={() => handleView(branch)}>{branch.address}</td>
                    <td onClick={() => handleView(branch)}>{getStatusBadge(branch.status)}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => handleView(branch)}><FaEye /></button>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(branch)}><FaEdit /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(branch)}><FaTrashAlt /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <BranchModal mode={modalType} branch={selectedBranch} onCancel={closeModal} onSubmit={async (payload) => {
          try {
            if (modalType === 'add') await createBranch(payload);
            else if (modalType === 'edit') await updateBranch(selectedBranch.id, payload);
            fetchBranches();
            closeModal();
          } catch (err) {
            alert(err.message);
          }
        }} />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeDeleteModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body text-center py-4">
                <p>This will permanently delete <strong>{selectedBranch?.name}</strong>.</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-outline-secondary" onClick={closeDeleteModal}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal Form
const BranchModal = ({ mode, branch, onCancel, onSubmit }) => {
  const isView = mode === 'view';
  const initialActive = (branch?.status || 'INACTIVE') === 'ACTIVE';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isView) return onCancel();

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    if (!payload.name || !payload.code || !payload.address) {
      alert('Please fill all required fields.');
      return;
    }

    payload.status = fd.get('statusToggle') ? 'Active' : 'Inactive';
    payload.hours = {
      weekdays: { from: payload.wdFrom, to: payload.wdTo },
      saturday: { from: payload.satFrom, to: payload.satTo },
      sunday: { from: payload.sunFrom, to: payload.sunTo },
    };
    if (fd.get('avatar')) payload.avatar = fd.getAll('avatar');

    onSubmit(payload);
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onCancel}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title">{mode === 'add' ? 'Add Branch' : mode === 'edit' ? 'Edit Branch' : 'Branch Details'}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Branch Name *</label>
                <input name="name" type="text" className="form-control" defaultValue={branch?.name || ''} readOnly={isView} />
              </div>
              <div className="col-md-6">
                <label>Code *</label>
                <input name="code" type="text" className="form-control" defaultValue={branch?.code || ''} readOnly={isView} />
              </div>
            </div>
            <div className="mb-3">
              <label>Address *</label>
              <input name="address" type="text" className="form-control" defaultValue={branch?.address || ''} readOnly={isView} />
            </div>
            {!isView && (
              <div className="mb-3">
                <label>Branch Image</label>
                <input name="avatar" type="file" className="form-control" accept="image/*" />
              </div>
            )}
            {isView && branch?.branch_image && (
              <div className="mb-3">
                <label>Branch Image</label>
                <div>
                  <img src={branch.branch_image} alt="Branch Image" className="img-fluid rounded" style={{ maxWidth: '200px' }} />
                </div>
              </div>
            )}
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Phone</label>
                <input name="phone" type="tel" className="form-control" defaultValue={branch?.phone || ''} readOnly={isView} />
              </div>
              <div className="col-md-6">
                <label>Email</label>
                <input name="email" type="email" className="form-control" defaultValue={branch?.email || ''} readOnly={isView} />
              </div>
            </div>

            {/* Operating Hours */}
            <div className="mb-3">
              <h6>Operating Hours</h6>
              <div className="row g-3">
                <div className="col-12">
                  <label>Weekdays</label>
                  <div className="d-flex gap-2">
                    <input name="wdFrom" type="time" className="form-control" defaultValue={branch?.hours?.weekdays?.from || '06:00'} readOnly={isView} />
                    <span>to</span>
                    <input name="wdTo" type="time" className="form-control" defaultValue={branch?.hours?.weekdays?.to || '22:00'} readOnly={isView} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Saturday</label>
                  <div className="d-flex gap-2">
                    <input name="satFrom" type="time" className="form-control" defaultValue={branch?.hours?.saturday?.from || '07:00'} readOnly={isView} />
                    <span>to</span>
                    <input name="satTo" type="time" className="form-control" defaultValue={branch?.hours?.saturday?.to || '21:00'} readOnly={isView} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Sunday</label>
                  <div className="d-flex gap-2">
                    <input name="sunFrom" type="time" className="form-control" defaultValue={branch?.hours?.sunday?.from || '08:00'} readOnly={isView} />
                    <span>to</span>
                    <input name="sunTo" type="time" className="form-control" defaultValue={branch?.hours?.sunday?.to || '20:00'} readOnly={isView} />
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-3 form-check form-switch">
              <input name="statusToggle" type="checkbox" className="form-check-input" defaultChecked={initialActive} disabled={isView} />
              <label className="form-check-label">Active</label>
            </div>

            {!isView && <button type="submit" className="btn btn-primary">Save</button>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminBranches;
