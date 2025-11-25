import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';

const Staff = () => {

  /** ==========================
   * STATE MANAGEMENT
   * ========================== */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // add | edit | view
  const [selectedStaff, setSelectedStaff] = useState(null);
  const fileInputRef = useRef(null);

  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /** ==========================
   * FETCH DATA
   * ========================== */
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/staff');
      const list = response.data?.staff ?? response.data ?? [];
      setStaff(Array.isArray(list) ? list : []);
    } catch (err) {
      setError('Failed to fetch staff data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      setBranches(response.data?.branches ?? response.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/staff-roles');
      setRoles(response.data?.roles ?? response.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchBranches();
    fetchRoles();
  }, []);

  /** ==========================
   * ACTION HANDLERS
   * ========================== */
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
    try {
      setSubmitting(true);
      await axiosInstance.delete(`/staff/${selectedStaff.id}`);
      setStaff(prev => prev.filter(s => s.id !== selectedStaff.id));
      alert(`Staff "${selectedStaff.user?.firstName} ${selectedStaff.user?.lastName}" deleted.`);
    } catch (err) {
      alert('Failed to delete staff');
      console.error(err);
    } finally {
      setSubmitting(false);
      setIsDeleteModalOpen(false);
      setSelectedStaff(null);
    }
  };

  /** Close modal & reset file input */
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
  };

  /** Stop background scroll while modal open */
  useEffect(() => {
    document.body.style.overflow = (isModalOpen || isDeleteModalOpen) ? 'hidden' : 'unset';
  }, [isModalOpen, isDeleteModalOpen]);

  /** ==========================
   * UI HELPERS
   * ========================== */
  const getNextStaffId = () => {
    const prefix = "STAFF";
    const numbers = staff.map(s => {
      const raw = s.staffId ?? '';
      const num = parseInt(raw.replace(prefix, '').replace(/^0+/, '') || '0', 10);
      return Number.isNaN(num) ? 0 : num;
    });
    return `${prefix}${String((numbers.length ? Math.max(...numbers) : 0) + 1).padStart(3, '0')}`;
  };

  const getFieldValue = (path) => {
    if (!selectedStaff) return '';
    if (path.includes(".")) {
      const [parent, child] = path.split(".");
      return selectedStaff[parent]?.[child] ?? '';
    }
    return selectedStaff[path] ?? '';
  };

  /** ==========================
   * BUILD SAFE FORMDATA (MATCH BACKEND)
   * ========================== */
  const transformForBackend = (fd) => {
    const send = new FormData();

    const userObj = {
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      username: fd.get('username') || null,
      loginEnabled: fd.get('loginEnabled') === 'true',
      gender: fd.get('gender'),
      dob: fd.get('dob')
    };

    send.append('user', JSON.stringify(userObj));
    send.append("roleId", fd.get("roleId"));
    send.append("branchId", fd.get("branchId"));
    send.append("joinDate", fd.get("joinDate"));
    send.append("staffId", fd.get("staffId"));

    ["exitDate", "salaryType", "fixedSalary", "hourlyRate", "commissionRatePercent", "status", "phone", "gender"]
      .forEach(key => {
        if (fd.get(key)) send.append(key, fd.get(key));
      });

    /** loginEnabled false = REMOVE credentials */
    if (fd.get("loginEnabled") === "true") {
      send.append("loginEnabled", "true");
      if (fd.get("username")) send.append("username", fd.get("username"));
      if (fd.get("password")) send.append("password", fd.get("password"));
    }

    const file = fd.get("profilePhoto");
    if (file instanceof File && file.size > 0) send.append("profilePhoto", file);

    return send;
  };

  /** ==========================
   * FORM SUBMIT HANDLER (ADD / UPDATE)
   * ========================== */
  const handleFormSubmit = async () => {
    try {
      setSubmitting(true);
      const form = document.querySelector("form");
      const fd = new FormData(form);

      const loginSwitch = form.querySelector('input[name="loginEnabled"]')?.checked;
      if (loginSwitch) fd.set("loginEnabled", "true");
      else fd.delete("loginEnabled");

      const payload = transformForBackend(fd);

      if (modalType === "add") {
        await axiosInstance.post("/staff", payload, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Staff created successfully!");
      } else {
        await axiosInstance.put(`/staff/${selectedStaff.id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        alert("Staff updated successfully!");
      }

      fetchStaff();
      closeModal();
    } catch (err) {
      alert("Failed to save staff");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /** ==========================================================
   * ===============  UI JSX (UNCHANGED)  ======================
   * ========================================================== */

  return (
    <div className="">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Staff Management</h2>
          <p className="text-muted mb-0">Manage all gym staff members, their roles, and compensation.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button className="btn w-100 w-lg-auto" style={{
            backgroundColor: '#6EB2CC', color: 'white', border: 'none',
            borderRadius: '8px', padding: '10px 20px', fontSize: '1rem', fontWeight: '500'
          }} onClick={handleAddNew}>
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
            <input type="text" className="form-control border" placeholder="Search staff by name or role..." />
          </div>
        </div>
        <div className="col-6 col-md-3 col-lg-2"><button className="btn btn-outline-secondary w-100"><i className="fas fa-filter me-1"></i> Filter</button></div>
        <div className="col-6 col-md-3 col-lg-2"><button className="btn btn-outline-secondary w-100"><i className="fas fa-file-export me-1"></i> Export</button></div>
      </div>

      {/* LOADING & ERROR */}
      {loading && <div className="text-center py-4"><div className="spinner-border text-primary"></div><p>Loading staff data...</p></div>}
      {error && <div className="alert alert-danger"><i className="fas fa-exclamation-triangle me-2"></i>{error}</div>}

      {/* TABLE */}
      {!loading && !error && (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light"><tr>
                <th>PHOTO</th><th>NAME</th><th>ROLE</th><th>BRANCH</th>
                <th>EMAIL</th><th>PHONE</th><th>STATUS</th><th className="text-center">ACTIONS</th>
              </tr></thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      {member.profilePhoto ? (
                        <img src={member.profilePhoto} alt="" style={{
                          width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee'
                        }} />
                      ) : (
                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: '#6EB2CC' }}>
                          {member.user?.firstName?.charAt(0)}{member.user?.lastName?.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td><strong>{member.user?.firstName} {member.user?.lastName}</strong><div><small className="text-muted">{member.staffId}</small></div></td>
                    <td><span className="badge bg-info-subtle text-info-emphasis px-3 py-1">{member.role?.name}</span></td>
                    <td>{member.branch?.name}</td>
                    <td>{member.user?.email}</td>
                    <td>{member.user?.phone}</td>
                    <td><span className={`badge rounded-pill px-3 py-1 ${member.status === 'Active' ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'}`}>{member.status}</span></td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => handleView(member)}><FaEye size={14} /></button>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(member)}><FaEdit size={14} /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(member)}><FaTrashAlt size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================== ADD / EDIT / VIEW MODAL ====================== */}
      {isModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header border-0"><h5 className="modal-title fw-bold">{modalType === 'add' ? 'Add Staff' : modalType === 'edit' ? 'Edit Staff' : 'View Staff'}</h5><button className="btn-close" onClick={closeModal}></button></div>
              <div className="modal-body p-4"><form>

                {/* BASIC INFO */}
                <h6 className="fw-bold mb-3">Basic Information</h6>
                <div className="row mb-3 g-3">
                  <div className="col-md-6"><label className="form-label">Staff ID</label><input type="text" className="form-control" name="staffId" readOnly defaultValue={getFieldValue('staffId') || (modalType === 'add' && getNextStaffId())} /></div>
                  <div className="col-md-6"><label className="form-label">Profile Photo</label><input type="file" className="form-control" name="profilePhoto" ref={fileInputRef} accept="image/*" disabled={modalType === 'view'} /></div>

                  <div className="col-md-6"><label className="form-label">First Name *</label><input name="firstName" className="form-control" required defaultValue={getFieldValue('user.firstName')} readOnly={modalType === 'view'} /></div>
                  <div className="col-md-6"><label className="form-label">Last Name *</label><input name="lastName" className="form-control" required defaultValue={getFieldValue('user.lastName')} readOnly={modalType === 'view'} /></div>

                  <div className="col-md-6"><label className="form-label">Gender *</label><select name="gender" className="form-select" required defaultValue={getFieldValue('user.gender') || 'Male'} disabled={modalType === 'view'}><option>Male</option><option>Female</option><option>Other</option></select></div>
                  <div className="col-md-6"><label className="form-label">DOB *</label><input name="dob" type="date" className="form-control" required defaultValue={getFieldValue('user.dob')?.split('T')[0]} readOnly={modalType === 'view'} /></div>

                  <div className="col-md-6"><label className="form-label">Email *</label><input name="email" type="email" className="form-control" required defaultValue={getFieldValue('user.email')} readOnly={modalType === 'view'} /></div>
                  <div className="col-md-6"><label className="form-label">Phone *</label><input name="phone" type="tel" className="form-control" required defaultValue={getFieldValue('user.phone')} readOnly={modalType === 'view'} /></div>
                </div>

                {/* JOB */}
                <h6 className="fw-bold mb-3">Job Details</h6>
                <div className="row mb-3 g-3">
                  <div className="col-md-6"><label className="form-label">Role *</label>
                    <select name="roleId" className="form-select" required defaultValue={getFieldValue('roleId')} disabled={modalType === 'view'}>
                      {roles.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                    </select></div>
                  <div className="col-md-6"><label className="form-label">Branch *</label>
                    <select name="branchId" className="form-select" required defaultValue={getFieldValue('branchId')} disabled={modalType === 'view'}>
                      {branches.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                    </select></div>

                  <div className="col-md-6"><label className="form-label">Join Date *</label><input type="date" name="joinDate" required className="form-control" defaultValue={getFieldValue('joinDate')?.split('T')[0] || new Date().toISOString().split('T')[0]} readOnly={modalType === 'view'} /></div>
                  <div className="col-md-6"><label className="form-label">Exit Date</label><input type="date" name="exitDate" className="form-control" defaultValue={getFieldValue('exitDate')?.split('T')[0]} readOnly={modalType === 'view'} /></div>
                </div>

                {/* COMPENSATION */}
                <h6 className="fw-bold mb-3">Compensation</h6>
                <div className="row mb-3 g-3">
                  <div className="col-md-6"><label className="form-label">Salary Type</label>
                    <select name="salaryType" className="form-select" defaultValue={getFieldValue('salaryType')} disabled={modalType === 'view'}>
                      <option></option><option>Fixed</option><option>Hourly</option><option>Commission</option>
                    </select></div>

                  <div className="col-md-6"><label className="form-label">Fixed Salary</label><input type="number" name="fixedSalary" className="form-control" defaultValue={getFieldValue('fixedSalary')} readOnly={modalType === 'view'} /></div>
                  <div className="col-md-6"><label className="form-label">Hourly Rate</label><input type="number" name="hourlyRate" className="form-control" defaultValue={getFieldValue('hourlyRate')} readOnly={modalType === 'view'} /></div>
                  <div className="col-md-6"><label className="form-label">Commission %</label><input type="number" name="commissionRatePercent" className="form-control" defaultValue={getFieldValue('commissionRatePercent')} readOnly={modalType === 'view'} /></div>

                  <div className="col-md-6"><label className="form-label">Status</label>
                    <select name="status" className="form-select" defaultValue={getFieldValue('status') || 'Active'} disabled={modalType === 'view'}>
                      <option>Active</option><option>Inactive</option><option>On Leave</option>
                    </select></div>
                </div>

                {/* SYSTEM ACCESS */}
                <h6 className="fw-bold mb-3">System Access</h6>
                <div className="row mb-3 g-3">
                  <div className="col-12"><div className="form-check form-switch">
                    <input type="checkbox" className="form-check-input" name="loginEnabled" defaultChecked={Boolean(getFieldValue('user.loginEnabled'))} disabled={modalType === 'view'} />
                    <label className="form-check-label">Enable Login</label></div></div>

                  <div className="col-md-6"><label className="form-label">Username</label><input name="username" className="form-control" placeholder="Enter username" defaultValue={getFieldValue('user.username')} readOnly={modalType === 'view'} /></div>
                  <div className="col-md-6"><label className="form-label">Password</label>
                    <input name="password" type="password" className="form-control" placeholder={modalType === 'edit' ? 'Leave blank to keep current' : 'Enter password'} readOnly={modalType === 'view'} />
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="d-flex justify-content-end mt-3 gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                  {modalType !== 'view' && (
                    <button type="button" className="btn" style={{ backgroundColor: '#6EB2CC', color: 'white' }} disabled={submitting} onClick={handleFormSubmit}>
                      {submitting ? 'Saving...' : modalType === 'add' ? 'Add Staff' : 'Update Staff'}
                    </button>
                  )}
                </div>
              </form></div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeDeleteModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header"><h5 className="fw-bold">Confirm Deletion</h5><button className="btn-close" onClick={closeDeleteModal}></button></div>
              <div className="modal-body text-center"><div className="text-danger display-6"><i className="fas fa-exclamation-triangle"></i></div><p>Delete <strong>{selectedStaff?.user?.firstName} {selectedStaff?.user?.lastName}</strong>?</p></div>
              <div className="modal-footer justify-content-center"><button className="btn btn-outline-secondary" onClick={closeDeleteModal}>Cancel</button><button className="btn btn-danger" onClick={confirmDelete}>Delete</button></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Staff;
