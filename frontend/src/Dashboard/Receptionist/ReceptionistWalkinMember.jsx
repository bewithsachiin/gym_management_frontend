import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaUserPlus } from 'react-icons/fa';
const ReceptionistWalkinMember = () => {
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'add', 'edit', 'view'
  const [selectedItem, setSelectedItem] = useState(null); // Unified for both staff and member
  // View Mode: staff | member
  const [viewMode, setViewMode] = useState('staff'); // Default to Staff
  // Search Term State
  const [searchTerm, setSearchTerm] = useState('');
  // Mock Staff Data — Updated with all new fields
  const [staffData, setStaffData] = useState([
    {
      id: 101,
      name: "Sanjay Kumar",
      phone: "+91 98765 12345",
      email: "sanjay@gymspa.com",
      role: "Trainer",
      department: "Fitness",
      joined_at: "2024-01-15T09:00:00",
      dob: "1990-05-10",
      status: "Active",
      gender: "Male",
      salary_type: "Fixed Salary",
      fixed_salary: 50000,
      hourly_rate: 0,
      commission_rate: 0,
      enable_login: true,
      username: "sanjay",
      password: "secure123",
      exit_date: "",
      profile_photo: ""
    },
    {
      id: 102,
      name: "Neha Sharma",
      phone: "+91 91234 98765",
      email: "neha@gymspa.com",
      role: "Receptionist",
      department: "Front Office",
      joined_at: "2024-02-20T10:30:00",
      dob: "1995-08-22",
      status: "Active",
      gender: "Female",
      salary_type: "Fixed Salary",
      fixed_salary: 35000,
      hourly_rate: 0,
      commission_rate: 0,
      enable_login: true,
      username: "neha",
      password: "neha@2024",
      exit_date: "",
      profile_photo: ""
    }
  ]);
  // Mock Member Data — Unchanged
  const [membersData, setMembersData] = useState([
    {
      id: 201,
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      email: "rahul@example.com",
      membership_plan: "Premium Annual",
      start_date: "2025-01-01",
      expiry_date: "2026-01-01",
      status: "Active"
    },
    {
      id: 202,
      name: "Priya Patel",
      phone: "+91 91234 56789",
      email: "priya@example.com",
      membership_plan: "Basic Monthly",
      start_date: "2025-03-01",
      expiry_date: "2025-04-01",
      status: "Active"
    },
    {
      id: 203,
      name: "Ankit Mehta",
      phone: "+91 88888 11111",
      email: "ankit@example.com",
      membership_plan: "Student Plan",
      start_date: "2024-12-01",
      expiry_date: "2025-01-01",
      status: "Expired"
    }
  ]);
  // ✅ FIXED: MOVED FILTERED DATA LOGIC HERE ✅
  // Filtered data must be declared BEFORE it's used in pagination
  const filteredStaffData = staffData.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone.includes(searchTerm) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMembersData = membersData.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Pagination States
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const totalPages = Math.ceil(
    (viewMode === 'staff' ? filteredStaffData.length : filteredMembersData.length) / entriesPerPage
  );
  // Current data to display based on pagination
  const currentData = viewMode === 'staff' 
    ? filteredStaffData.slice(indexOfFirstEntry, indexOfLastEntry)
    : filteredMembersData.slice(indexOfFirstEntry, indexOfLastEntry);
  // Mock plans for dropdown (only used in Add/Edit modal)
  const membershipPlans = [
    "Basic Monthly",
    "Premium Annual",
    "Student Plan",
    "Weekend Warrior",
    "Corporate Package"
  ];
  // Handle entries per page change
  const handleEntriesChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when entries per page changes
  };
  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // Navigation functions
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  // Handlers
  const handleAddNew = () => {
    setModalType('add');
    setSelectedItem(null);
    setIsModalOpen(true);
  };
  const handleView = (item) => {
    setModalType('view');
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const handleEdit = (item) => {
    setModalType('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    if (selectedItem) {
      if (viewMode === 'staff') {
        setStaffData(prev => prev.filter(s => s.id !== selectedItem.id));
        alert(`Staff record for ${selectedItem.name} has been deleted.`);
      } else if (viewMode === 'member') {
        setMembersData(prev => prev.filter(m => m.id !== selectedItem.id));
        alert(`Member record for ${selectedItem.name} has been deleted.`);
      }
    }
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
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
  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return `New ${viewMode === 'staff' ? 'Staff' : 'Member'} Registration`;
      case 'edit': return `Edit ${viewMode === 'staff' ? 'Staff' : 'Member'} Record`;
      case 'view': return `View ${viewMode === 'staff' ? 'Staff' : 'Member'} Details`;
      default: return `${viewMode === 'staff' ? 'Staff' : 'Member'} Record`;
    }
  };
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "—";
    const date = new Date(dateTimeString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };
  const getNextId = () => {
    const allItems = [...staffData, ...membersData];
    return allItems.length > 0 ? Math.max(...allItems.map(i => i.id)) + 1 : 1;
  };
  const handleSubmit = (actionType) => {
    // ✅ CORRECTED: Use actual placeholder values from the modal
    const formData = {
      name: document.querySelector('input[placeholder="Enter first name"]')?.value || '',
      phone: document.querySelector('input[placeholder="+1 555-123-4567"]')?.value || '',
      email: document.querySelector('input[placeholder="example@email.com"]')?.value || '',
      preferred_membership_plan: document.querySelector('select')?.value || '',
      interested_in: document.querySelector('input[name="interested_in"]:checked')?.value || '',
      preferred_time: document.querySelector('input[type="datetime-local"]')?.value || '',
      notes: document.querySelector('textarea')?.value || '',
      registered_at: new Date().toISOString()
    };
    // Staff-specific fields — NO CHANGE NEEDED
    const staffFields = {
      id: selectedItem?.id || getNextId(),
      dob: document.querySelector('input[type="date"][aria-label="Date of Birth"]')?.value || '',
      status: document.querySelector('select[aria-label="Status"]')?.value || 'Active',
      gender: document.querySelector('select[aria-label="Gender"]')?.value || 'Male',
      salary_type: document.querySelector('select[aria-label="Salary Type"]')?.value || 'Fixed Salary',
      fixed_salary: parseFloat(document.querySelector('input[placeholder="e.g., 50000"]')?.value) || 0,
      hourly_rate: parseFloat(document.querySelector('input[placeholder="e.g., 25.50"]')?.value) || 0,
      commission_rate: parseFloat(document.querySelector('input[placeholder="0"]')?.value) || 0,
      enable_login: document.getElementById('enableLogin')?.checked || false,
      username: document.querySelector('input[placeholder="Enter username"]')?.value || '',
      password: document.querySelector('input[placeholder="Enter password"]')?.value || '',
      exit_date: document.querySelector('input[type="date"][aria-label="Exit Date"]')?.value || '',
      profile_photo: ''
    };
    // For Member-specific fields — NO CHANGE
    const memberFields = {
      membership_plan: formData.preferred_membership_plan,
      start_date: formData.registered_at.split('T')[0],
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Active"
    };
    if (modalType === 'add') {
      let newItem;
      if (viewMode === 'staff') {
        newItem = {
          ...staffFields,
          name: formData.name,         // ✅ Now correctly populated!
          phone: formData.phone,       // ✅ Now correctly populated!
          email: formData.email,
          role: document.querySelector('select[aria-label="Role"]')?.value || 'Receptionist',
          department: document.querySelector('select[aria-label="Department"]')?.value || 'Fitness',
          joined_at: document.querySelector('input[type="date"][aria-label="Join Date"]')?.value
            ? `${document.querySelector('input[type="date"][aria-label="Join Date"]')?.value}T00:00:00`
            : new Date().toISOString()
        };
        setStaffData(prev => [...prev, newItem]);
        alert(`New staff member ${newItem.name} added successfully!`);
      } else if (viewMode === 'member') {
        newItem = {
          id: getNextId(),
          ...formData,
          ...memberFields
        };
        setMembersData(prev => [...prev, newItem]);
        alert(`New member ${newItem.name} registered successfully!`);
      }
    } else if (modalType === 'edit' && selectedItem) {
      let updatedItem;
      if (viewMode === 'staff') {
        updatedItem = {
          ...selectedItem,
          ...staffFields,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          role: document.querySelector('select[aria-label="Role"]')?.value || selectedItem.role,
          department: document.querySelector('select[aria-label="Department"]')?.value || selectedItem.department,
          joined_at: document.querySelector('input[type="date"][aria-label="Join Date"]')?.value
            ? `${document.querySelector('input[type="date"][aria-label="Join Date"]')?.value}T00:00:00`
            : selectedItem.joined_at
        };
        setStaffData(prev => prev.map(s => s.id === selectedItem.id ? updatedItem : s));
        alert(`Staff record for ${updatedItem.name} updated successfully!`);
      } else if (viewMode === 'member') {
        updatedItem = {
          ...selectedItem,
          ...formData,
          ...memberFields
        };
        setMembersData(prev => prev.map(m => m.id === selectedItem.id ? updatedItem : m));
        alert(`Member record for ${updatedItem.name} updated successfully!`);
      }
    }
    closeModal();
  };
  return (
    <div className="">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">{viewMode === 'staff' ? 'Staff Management' : 'Member Management'}</h2>
          <p className="text-muted mb-0">Manage {viewMode === 'staff' ? 'staff members' : 'members'} and their details.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          {/* ✅ MOBILE RESPONSIVE ADD BUTTON */}
          <button
            className="btn d-flex align-items-center col-6 w-md-auto ms-md-auto px-3 py-2 btn-sm"
            style={{
              backgroundColor: '#6EB2CC',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              minWidth: '120px', // Ensures minimum width even on tiny screens
            }}
            onClick={handleAddNew}
          >
            <FaUserPlus className="me-3" /> Add {viewMode === 'staff' ? 'Staff' : 'Member'}
          </button>
        </div>
      </div>
      {/* Search & Actions - STAFF & MEMBER ONLY */}
      <div className="row mb-4 g-3">
        {/* Toggle Buttons: Staff / Member — MOBILE RESPONSIVE */}
        <div className="col-12 col-md-6 col-lg-3 d-flex flex-wrap gap-2 mb-2">
          <button
            className={`btn btn-sm flex-grow-1 px-3 py-2`}
            style={{
              backgroundColor: viewMode === 'staff' ? '#6EB2CC' : 'transparent',
              borderColor: viewMode === 'staff' ? '#6EB2CC' : '#ced4da',
              borderWidth: '1px',
              borderStyle: 'solid',
              color: viewMode === 'staff' ? 'white' : '#495057',
              minWidth: '100px', // Ensures button doesn't shrink too much on mobile
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setViewMode('staff')}
          >
            Staff
          </button>
          <button
            className={`btn btn-sm flex-grow-1 px-3 py-2`}
            style={{
              backgroundColor: viewMode === 'member' ? '#6EB2CC' : 'transparent',
              borderColor: viewMode === 'member' ? '#6EB2CC' : '#ced4da',
              borderWidth: '1px',
              borderStyle: 'solid',
              color: viewMode === 'member' ? 'white' : '#495057',
              minWidth: '100px',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setViewMode('member')}
          >
            Member
          </button>
        </div>
        {/* Search Bar — Now WORKING */}
        <div className="col-12 col-md-3 col-lg-3 ms-auto">
          <div className="input-group">
            <input
              type="text"
              className="form-control border"
              placeholder={`Search by name or phone...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* Filter & Export Buttons */}
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-filter me-1"></i> Filter
          </button>
        </div>
        <div className="col-6 col-md-3 col-lg-2">
          <button className="btn btn-outline-secondary w-100">
            <i className="fas fa-file-export me-1"></i> Export
          </button>
        </div>
      </div>
      {/* Show Entries Dropdown */}
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center">
            <span className="me-2">Show</span>
            <select 
              className="form-select form-select-sm w-auto" 
              value={entriesPerPage}
              onChange={handleEntriesChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ms-2">entries</span>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                {/* Staff Columns */}
                {viewMode === 'staff' && (
                  <>
                    <th className="fw-semibold">NAME</th>
                    <th className="fw-semibold">PHONE</th>
                    <th className="fw-semibold">EMAIL</th>
                    <th className="fw-semibold">ROLE</th>
                    <th className="fw-semibold">DEPARTMENT</th>
                    <th className="fw-semibold">JOINED</th>
                    <th className="fw-semibold text-center">ACTIONS</th>
                  </>
                )}
                {/* Member Columns */}
                {viewMode === 'member' && (
                  <>
                    <th className="fw-semibold">NAME</th>
                    <th className="fw-semibold">PHONE</th>
                    <th className="fw-semibold">EMAIL</th>
                    <th className="fw-semibold">MEMBERSHIP PLAN</th>
                    <th className="fw-semibold">START DATE</th>
                    <th className="fw-semibold">EXPIRY DATE</th>
                    <th className="fw-semibold text-center">STATUS</th>
                    <th className="fw-semibold text-center">ACTIONS</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Staff Data — Filtered and Paginated */}
              {viewMode === 'staff' && currentData.length > 0 ? (
                currentData.map((staff) => (
                  <tr key={staff.id}>
                    <td><strong>{staff.name}</strong></td>
                    <td>{staff.phone}</td>
                    <td>{staff.email || <span className="text-muted">—</span>}</td>
                    <td>{staff.role}</td>
                    <td>{staff.department}</td>
                    <td>{formatDateTime(staff.joined_at)}</td>
                    <td className="text-center">
                      {/* ✅ HORIZONTAL RESPONSIVE ACTION BUTTONS */}
                      <div className="d-flex flex-row justify-content-center gap-1">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="View"
                          onClick={() => handleView(staff)}
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                          onClick={() => handleEdit(staff)}
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDeleteClick(staff)}
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : viewMode === 'staff' && currentData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    {searchTerm ? 'No matching staff found.' : 'No staff records found.'}
                  </td>
                </tr>
              ) : null}
              {/* Member Data — Filtered and Paginated */}
              {viewMode === 'member' && currentData.length > 0 ? (
                currentData.map((member) => (
                  <tr key={member.id}>
                    <td><strong>{member.name}</strong></td>
                    <td>{member.phone}</td>
                    <td>{member.email || <span className="text-muted">—</span>}</td>
                    <td>{member.membership_plan}</td>
                    <td>{member.start_date}</td>
                    <td>{member.expiry_date}</td>
                    <td className="text-center ">
                      <span className={`badge ${
                        member.status === 'Active' ? 'bg-success' : 'bg-danger'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {/* ✅ HORIZONTAL RESPONSIVE ACTION BUTTONS */}
                      <div className="d-flex flex-row justify-content-center gap-1">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="View"
                          onClick={() => handleView(member)}
                        >
                          <FaEye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit"
                          onClick={() => handleEdit(member)}
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
              ) : viewMode === 'member' && currentData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    {searchTerm ? 'No matching member found.' : 'No member records found.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      <div className="row mt-3">
        <div className="col-12 col-md-5">
          <div className="d-flex align-items-center">
            <span>
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, viewMode === 'staff' ? filteredStaffData.length : filteredMembersData.length)} of {viewMode === 'staff' ? filteredStaffData.length : filteredMembersData.length} entries
            </span>
          </div>
        </div>
        <div className="col-12 col-md-7">
          <div className="d-flex justify-content-md-end justify-content-center mt-2 mt-md-0">
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={prevPage}>
                    Previous
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => paginate(1)}
                    style={{
                      backgroundColor: currentPage === 1 ? '#2f6a87' : 'transparent',
                      borderColor: currentPage === 1 ? '#2f6a87' : '#dee2e6',
                      color: currentPage === 1 ? 'white' : '#2f6a87',
                    }}
                  >
                    1
                  </button>
                </li>
                {totalPages > 1 && (
                  <li className={`page-item ${currentPage === 2 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(2)}
                      style={{
                        backgroundColor: currentPage === 2 ? '#2f6a87' : 'transparent',
                        borderColor: currentPage === 2 ? '#2f6a87' : '#dee2e6',
                        color: currentPage === 2 ? 'white' : '#2f6a87',
                      }}
                    >
                      2
                    </button>
                  </li>
                )}
                {totalPages > 2 && (
                  <li className={`page-item ${currentPage === 3 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(3)}
                      style={{
                        backgroundColor: currentPage === 3 ? '#2f6a87' : 'transparent',
                        borderColor: currentPage === 3 ? '#2f6a87' : '#dee2e6',
                        color: currentPage === 3 ? 'white' : '#2f6a87',
                      }}
                    >
                      3
                    </button>
                  </li>
                )}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={nextPage}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      {/* MAIN MODAL (Add/Edit/View) — Now only for Staff or Member */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered"
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
                  {/* STAFF FORM — FULLY UPDATED WITH ALL FIELDS */}
                  {viewMode === 'staff' && (
                    <>
                      {/* Basic Information Section */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="mb-3 fw-bold text-dark">Basic Information</h6>
                        </div>
                        {/* Staff ID & Profile Photo */}
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Staff ID</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            placeholder="STAFF004"
                            defaultValue={selectedItem?.id || ''}
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Profile Photo</label>
                          <input
                            type="file"
                            className="form-control rounded-3"
                            accept="image/*"
                            disabled={modalType === 'view'}
                          />
                        </div>
                        {/* First Name & Last Name */}
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">First Name *</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            placeholder="Enter first name"
                            defaultValue={selectedItem?.name?.split(' ')[0] || ''}
                            required
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Last Name *</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            placeholder="Enter last name"
                            defaultValue={selectedItem?.name?.split(' ').slice(1).join(' ') || ''}
                            required
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        {/* Gender & Date of Birth */}
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Gender *</label>
                          <select
                            className="form-select rounded-3"
                            aria-label="Gender"
                            defaultValue={selectedItem?.gender || 'Male'}
                            disabled={modalType === 'view'}
                            required
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Date of Birth *</label>
                          <input
                            type="date"
                            className="form-control rounded-3"
                            aria-label="Date of Birth"
                            defaultValue={selectedItem?.dob || ''}
                            required
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        {/* Email & Phone */}
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            className="form-control rounded-3"
                            placeholder="example@email.com"
                            defaultValue={selectedItem?.email || ''}
                            required
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Phone *</label>
                          <input
                            type="tel"
                            className="form-control rounded-3"
                            placeholder="+1 555-123-4567"
                            defaultValue={selectedItem?.phone || ''}
                            required
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        {/* Status */}
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select rounded-3"
                            aria-label="Status"
                            defaultValue={selectedItem?.status || 'Active'}
                            disabled={modalType === 'view'}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                      {/* Job Details Section */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="mb-3 fw-bold text-dark">Job Details</h6>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Role *</label>
                          <select
                            className="form-select rounded-3"
                            aria-label="Role"
                            defaultValue={selectedItem?.role || 'Receptionist'}
                            disabled={modalType === 'view'}
                            required
                          >
                            <option value="Receptionist">Receptionist</option>
                            <option value="Trainer">Trainer</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Department</label>
                          <select
                            className="form-select rounded-3"
                            aria-label="Department"
                            defaultValue={selectedItem?.department || 'Fitness'}
                            disabled={modalType === 'view'}
                          >
                            <option value="Fitness">Fitness</option>
                            <option value="Yoga">Yoga</option>
                            <option value="Nutrition">Nutrition</option>
                            <option value="Front Office">Front Office</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Join Date *</label>
                          <input
                            type="date"
                            className="form-control rounded-3"
                            aria-label="Join Date"
                            defaultValue={selectedItem?.joined_at ? selectedItem.joined_at.split('T')[0] : ''}
                            required
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Exit Date</label>
                          <input
                            type="date"
                            className="form-control rounded-3"
                            aria-label="Exit Date"
                            defaultValue={selectedItem?.exit_date || ''}
                            readOnly={modalType === 'view'}
                          />
                        </div>
                      </div>
                      {/* Compensation Section */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="mb-3 fw-bold text-dark">Compensation</h6>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Salary Type *</label>
                          <select
                            className="form-select rounded-3"
                            aria-label="Salary Type"
                            defaultValue={selectedItem?.salary_type || 'Fixed Salary'}
                            disabled={modalType === 'view'}
                            required
                          >
                            <option value="Fixed Salary">Fixed Salary</option>
                            <option value="Hourly Rate">Hourly Rate</option>
                            <option value="Commission">Commission</option>
                          </select>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Hourly Rate ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control rounded-3"
                            placeholder="e.g., 25.50"
                            defaultValue={selectedItem?.hourly_rate || ''}
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Fixed Salary ($)</label>
                          <input
                            type="number"
                            className="form-control rounded-3"
                            placeholder="e.g., 50000"
                            defaultValue={selectedItem?.fixed_salary || ''}
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Commission Rate (%)</label>
                          <input
                            type="number"
                            className="form-control rounded-3"
                            placeholder="0"
                            defaultValue={selectedItem?.commission_rate || '0'}
                            readOnly={modalType === 'view'}
                          />
                        </div>
                      </div>
                      {/* System Access Section */}
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="mb-3 fw-bold text-dark">System Access</h6>
                        </div>
                        <div className="col-12 mb-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="enableLogin"
                              defaultChecked={selectedItem?.enable_login || false}
                              disabled={modalType === 'view'}
                            />
                            <label className="form-check-label" htmlFor="enableLogin">
                              Enable Login Access
                            </label>
                          </div>
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Username</label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            placeholder="Enter username"
                            defaultValue={selectedItem?.username || ''}
                            readOnly={modalType === 'view'}
                          />
                        </div>
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control rounded-3"
                            placeholder="Enter password"
                            defaultValue={selectedItem?.password || ''}
                            readOnly={modalType === 'view'}
                          />
                          <small className="text-muted">Leave blank to keep existing password.</small>
                        </div>
                      </div>
                      {/* Action Buttons — MOBILE RESPONSIVE (already good!) */}
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
                            onClick={() => handleSubmit('save')}
                          >
                            {modalType === 'add' ? 'Add Staff' : 'Save Staff'}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                  {/* MEMBER FORM — */}
                  {viewMode === 'member' && (
                    <>
                      {/* Name & Phone */}
                      <div className="row mb-3 g-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label">Full Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control rounded-3"
                            placeholder="Enter full name"
                            defaultValue={selectedItem?.name || ''}
                            readOnly={modalType === 'view'}
                            required
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                          <input
                            type="tel"
                            className="form-control rounded-3"
                            placeholder="+91 98765 43210"
                            defaultValue={selectedItem?.phone || ''}
                            readOnly={modalType === 'view'}
                            required
                          />
                        </div>
                      </div>
                      {/* Email */}
                      <div className="mb-3">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control rounded-3"
                          placeholder="example@email.com"
                          defaultValue={selectedItem?.email || ''}
                          readOnly={modalType === 'view'}
                        />
                      </div>
                      {/* Preferred Membership Plan */}
                      <div className="mb-3">
                        <label className="form-label">Preferred Membership Plan</label>
                        <select
                          className="form-select rounded-3"
                          defaultValue={selectedItem?.membership_plan || ''}
                          disabled={modalType === 'view'}
                        >
                          <option value="">Select a plan</option>
                          {membershipPlans.map(plan => (
                            <option key={plan} value={plan}>{plan}</option>
                          ))}
                        </select>
                      </div>
                      {/* Interested In */}
                      <div className="mb-3">
                        <label className="form-label">Interested In</label>
                        <div className="d-flex flex-wrap gap-3">
                          {['Personal Training', 'Group Classes', 'Both'].map(option => (
                            <div className="form-check" key={option}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name="interested_in"
                                id={`interested_${option.replace(/\s+/g, '_')}`}
                                value={option}
                                defaultChecked={selectedItem?.interested_in === option}
                                disabled={modalType === 'view'}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`interested_${option.replace(/\s+/g, '_')}`}
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Preferred Time */}
                      <div className="mb-3">
                        <label className="form-label">Preferred Time</label>
                        <input
                          type="datetime-local"
                          className="form-control rounded-3"
                          defaultValue={selectedItem?.preferred_time ? selectedItem.preferred_time.slice(0, 16) : ''}
                          readOnly={modalType === 'view'}
                        />
                      </div>
                      {/* Notes — Optional field */}
                      <div className="mb-4">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control rounded-3"
                          rows="3"
                          placeholder="Any additional information..."
                          defaultValue={selectedItem?.notes || ''}
                          readOnly={modalType === 'view'}
                        ></textarea>
                      </div>
                      {/* Action Buttons — MOBILE RESPONSIVE (already good!) */}
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
                            onClick={() => handleSubmit('save')}
                          >
                            {modalType === 'add' ? 'Register Member' : 'Update Member'}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION MODAL —  */}
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
                  This will permanently delete the {viewMode === 'staff' ? 'staff' : 'member'} record for <strong>{selectedItem?.name}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 w-100 w-sm-auto"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 py-2 w-100 w-sm-auto"
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
export default ReceptionistWalkinMember;