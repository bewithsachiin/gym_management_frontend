import React, { useState } from 'react';
import { FaEye, FaEdit, FaTimes, FaPlus, FaCalendarAlt, FaClock, FaUser, FaChalkboardTeacher, FaMoneyBillWave, FaTrash } from 'react-icons/fa';

const ReceptionistBookGroupClasses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'add', 'edit', 'view', 'cancel'
  const [bookingType, setBookingType] = useState('group'); // 'group' or 'pt'
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Pagination states
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sample data
  const [members] = useState([
    { id: 1, name: "Alex Johnson", phone: "+91 98765 43210" },
    { id: 2, name: "Priya Patel", phone: "+91 91234 56789" },
    { id: 3, name: "Amit Verma", phone: "+91 88888 77777" },
    { id: 4, name: "Sarah Kim", phone: "+91 77777 66666" },
    { id: 5, name: "Michael Brown", phone: "+91 66666 55555" }
  ]);

  const [trainers] = useState([
    { id: 1, name: "John Smith", specialty: "Strength Training" },
    { id: 2, name: "Emma Wilson", specialty: "Yoga & Pilates" },
    { id: 3, name: "David Lee", specialty: "Cardio & HIIT" },
    { id: 4, name: "Lisa Chen", specialty: "Weight Loss" }
  ]);

  const [groupClasses] = useState([
    { id: 1, name: "Morning Yoga", start_time: "07:00", end_time: "08:00", max_capacity: 15 },
    { id: 2, name: "HIIT Workout", start_time: "18:00", end_time: "19:00", max_capacity: 20 },
    { id: 3, name: "Zumba Dance", start_time: "19:30", end_time: "20:30", max_capacity: 25 },
    { id: 4, name: "Pilates Class", start_time: "10:00", end_time: "11:00", max_capacity: 12 }
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 1,
      member_id: 1,
      member_name: "Alex Johnson",
      type: "group",
      class_schedule_id: 1,
      class_name: "Morning Yoga",
      trainer_id: null,
      trainer_name: null,
      date: "2025-04-10",
      start_time: "07:00",
      end_time: "08:00",
      booking_status: "Booked",
      payment_status: "Paid",
      notes: "Prefers front row position"
    },
    {
      id: 2,
      member_id: 3,
      member_name: "Amit Verma",
      type: "pt",
      class_schedule_id: null,
      class_name: null,
      trainer_id: 2,
      trainer_name: "Emma Wilson",
      date: "2025-04-11",
      start_time: "17:00",
      end_time: "18:00",
      booking_status: "Booked",
      payment_status: "Pending",
      notes: "Focus on flexibility and core strength"
    },
    {
      id: 3,
      member_id: 2,
      member_name: "Priya Patel",
      type: "group",
      class_schedule_id: 3,
      class_name: "Zumba Dance",
      trainer_id: null,
      trainer_name: null,
      date: "2025-04-12",
      start_time: "19:30",
      end_time: "20:30",
      booking_status: "Completed",
      payment_status: "Paid",
      notes: "First time trying Zumba"
    },
    {
      id: 4,
      member_id: 4,
      member_name: "Sarah Kim",
      type: "pt",
      class_schedule_id: null,
      class_name: null,
      trainer_id: 1,
      trainer_name: "John Smith",
      date: "2025-04-09",
      start_time: "16:00",
      end_time: "17:00",
      booking_status: "Canceled",
      payment_status: "Refunded",
      notes: "Had to reschedule due to work conflict"
    }
  ]);

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentBookings = bookings.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(bookings.length / entriesPerPage);
  
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

  const handleAddNew = () => {
    setModalType('add');
    setSelectedBooking(null);
    setBookingType('group'); // Default to group classes
    setIsModalOpen(true);
  };

  const handleView = (booking) => {
    setModalType('view');
    setSelectedBooking(booking);
    setBookingType(booking.type);
    setIsModalOpen(true);
  };

  const handleEdit = (booking) => {
    setModalType('edit');
    setSelectedBooking(booking);
    setBookingType(booking.type);
    setIsModalOpen(true);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    if (selectedBooking) {
      setBookings(prev => 
        prev.map(b => 
          b.id === selectedBooking.id 
            ? { ...b, booking_status: "Canceled", payment_status: "Refunded" } 
            : b
        )
      );
      alert(`Booking for ${selectedBooking.member_name} has been canceled.`);
    }
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
  };

  // Prevent background scroll
  React.useEffect(() => {
    if (isModalOpen || isCancelModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isCancelModalOpen]);

  const getStatusBadge = (status, type) => {
    let badgeClasses = "";
    
    if (type === 'booking') {
      badgeClasses = {
        Booked: "bg-primary-subtle text-primary-emphasis",
        Completed: "bg-success-subtle text-success-emphasis",
        Canceled: "bg-danger-subtle text-danger-emphasis"
      };
    } else {
      badgeClasses = {
        Paid: "bg-success-subtle text-success-emphasis",
        Pending: "bg-warning-subtle text-warning-emphasis",
        Refunded: "bg-info-subtle text-info-emphasis"
      };
    }
    
    return (
      <span className={`badge rounded-pill ${badgeClasses[status] || 'bg-secondary'} px-3 py-1`}>
        {status}
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'add': return `Book New ${bookingType === 'group' ? 'Group Class' : 'PT Session'}`;
      case 'edit': return `Edit ${bookingType === 'group' ? 'Group Class' : 'PT Session'} Booking`;
      case 'view':
      default: return `View ${bookingType === 'group' ? 'Group Class' : 'PT Session'} Booking`;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Generate next ID for new booking
  const getNextId = () => {
    return bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
  };

  // Handle form submission
  const handleSubmit = () => {
    const formData = {
      member_id: parseInt(document.querySelector('[name="member_id"]').value),
      member_name: members.find(m => m.id === parseInt(document.querySelector('[name="member_id"]').value))?.name || '',
      type: bookingType,
      date: document.querySelector('[name="date"]').value,
      start_time: document.querySelector('[name="start_time"]').value,
      end_time: document.querySelector('[name="end_time"]').value,
      booking_status: document.querySelector('[name="booking_status"]').value,
      payment_status: document.querySelector('[name="payment_status"]').value,
      notes: document.querySelector('[name="notes"]').value
    };

    if (bookingType === 'group') {
      formData.class_schedule_id = parseInt(document.querySelector('[name="class_schedule_id"]').value);
      formData.class_name = groupClasses.find(c => c.id === parseInt(document.querySelector('[name="class_schedule_id"]').value))?.name || '';
      formData.trainer_id = null;
      formData.trainer_name = null;
    } else {
      formData.trainer_id = parseInt(document.querySelector('[name="trainer_id"]').value);
      formData.trainer_name = trainers.find(t => t.id === parseInt(document.querySelector('[name="trainer_id"]').value))?.name || '';
      formData.class_schedule_id = null;
      formData.class_name = null;
    }

    if (modalType === 'add') {
      const newBooking = {
        id: getNextId(),
        ...formData
      };
      setBookings(prev => [...prev, newBooking]);
      alert(`${bookingType === 'group' ? 'Group class' : 'PT session'} booked successfully!`);
    } else if (modalType === 'edit' && selectedBooking) {
      const updatedBooking = {
        ...selectedBooking,
        ...formData
      };
      setBookings(prev =>
        prev.map(b => b.id === selectedBooking.id ? updatedBooking : b)
      );
      alert(`${bookingType === 'group' ? 'Group class' : 'PT session'} booking updated successfully!`);
    }
    closeModal();
  };

  return (
    <div className="">
      {/* Header */}
      <div className="row mb-4 align-items-center">
        <div className="col-12 col-lg-8">
          <h2 className="fw-bold">Book Group Classes & PT Sessions</h2>
          <p className="text-muted mb-0">Manage bookings for group classes and personal training sessions.</p>
        </div>
        <div className="col-12 col-lg-4 text-lg-end mt-3 mt-lg-0">
          <button
            className="btn d-flex align-items-center ms-auto col-lg-6 col-12"
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
            <FaPlus className="me-2 " /> New Booking
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="row mb-4 g-3">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group">
            <input
              type="text"
              className="form-control border"
              placeholder="Search by member name..."
            />
          </div>
        </div>
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
                <th className="fw-semibold">MEMBER</th>
                <th className="fw-semibold">TYPE</th>
                <th className="fw-semibold">CLASS/TRAINER</th>
                <th className="fw-semibold">DATE</th>
                <th className="fw-semibold">TIME</th>
                <th className="fw-semibold">BOOKING STATUS</th>
                <th className="fw-semibold">PAYMENT STATUS</th>
                <th className="fw-semibold text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div>
                      <strong>{booking.member_name}</strong>
                      <div className="small text-muted">{members.find(m => m.id === booking.member_id)?.phone}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${
                      booking.type === 'group' ? 'bg-info-subtle text-info-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'
                    } px-2 py-1`}>
                      {booking.type === 'group' ? 'Group Class' : 'PT Session'}
                    </span>
                  </td>
                  <td>
                    {booking.type === 'group' ? booking.class_name : booking.trainer_name}
                  </td>
                  <td>{formatDate(booking.date)}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaClock className="text-muted me-1" size={12} />
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </td>
                  <td>{getStatusBadge(booking.booking_status, 'booking')}</td>
                  <td>{getStatusBadge(booking.payment_status, 'payment')}</td>
                  <td className="text-center">
                    <div className="d-flex flex-row gap-1 justify-content-center align-items-center">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        title="View"
                        onClick={() => handleView(booking)}
                        // disabled={modalType === 'view'}
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="Edit"
                        onClick={() => handleEdit(booking)}
                        // disabled={booking.booking_status === 'Completed' || booking.booking_status === 'Canceled'}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Cancel"
                        onClick={() => handleCancelClick(booking)}
                        // disabled={booking.booking_status === 'Completed' || booking.booking_status === 'Canceled'}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="row mt-3">
        <div className="col-12 col-md-5">
          <div className="d-flex align-items-center">
            <span>
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, bookings.length)} of {bookings.length} entries
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
                  <button className="page-link" onClick={() => paginate(1)}>
                    1
                  </button>
                </li>
                {totalPages > 1 && (
                  <li className={`page-item ${currentPage === 2 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(2)}>
                      2
                    </button>
                  </li>
                )}
                {totalPages > 2 && (
                  <li className={`page-item ${currentPage === 3 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(3)}>
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
                {modalType === 'add' && (
                  <div className="mb-4">
                    <label className="form-label fw-bold mb-3">Booking Type</label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${bookingType === 'group' ? 'btn-info' : 'btn-outline-secondary'}`}
                        onClick={() => setBookingType('group')}
                      >
                        Group Class
                      </button>
                      <button
                        type="button"
                        className={`btn ${bookingType === 'pt' ? 'btn-info' : 'btn-outline-secondary'}`}
                        onClick={() => setBookingType('pt')}
                      >
                        Personal Training
                      </button>
                    </div>
                  </div>
                )}

                <form>
                  {/* Member Selection */}
                  <div className="mb-3">
                    <label className="form-label d-flex align-items-center">
                      <FaUser className="me-2 text-muted" /> Member <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select rounded-3"
                      name="member_id"
                      defaultValue={selectedBooking?.member_id || ''}
                      disabled={modalType === 'view'}
                      required
                    >
                      <option value="">Select a member</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class/Trainer Selection */}
                  {bookingType === 'group' ? (
                    <div className="mb-3">
                      <label className="form-label d-flex align-items-center">
                        <FaChalkboardTeacher className="me-2 text-muted" /> Group Class <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        name="class_schedule_id"
                        defaultValue={selectedBooking?.class_schedule_id || ''}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="">Select a class</option>
                        {groupClasses.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.start_time} - {cls.end_time})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label d-flex align-items-center">
                        <FaChalkboardTeacher className="me-2 text-muted" /> Trainer <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        name="trainer_id"
                        defaultValue={selectedBooking?.trainer_id || ''}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="">Select a trainer</option>
                        {trainers.map(trainer => (
                          <option key={trainer.id} value={trainer.id}>
                            {trainer.name} ({trainer.specialty})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label d-flex align-items-center">
                        <FaCalendarAlt className="me-2 text-muted" /> Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control rounded-3"
                        name="date"
                        defaultValue={selectedBooking?.date || ''}
                        min={new Date().toISOString().split('T')[0]}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label d-flex align-items-center">
                        <FaClock className="me-2 text-muted" /> Start Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className="form-control rounded-3"
                        name="start_time"
                        defaultValue={selectedBooking?.start_time || ''}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label d-flex align-items-center">
                        <FaClock className="me-2 text-muted" /> End Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className="form-control rounded-3"
                        name="end_time"
                        defaultValue={selectedBooking?.end_time || ''}
                        disabled={modalType === 'view'}
                        required
                      />
                    </div>
                  </div>

                  {/* Status Fields */}
                  <div className="row mb-3 g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Booking Status <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        name="booking_status"
                        defaultValue={selectedBooking?.booking_status || 'Booked'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="Booked">Booked</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label d-flex align-items-center">
                        <FaMoneyBillWave className="me-2 text-muted" /> Payment Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select rounded-3"
                        name="payment_status"
                        defaultValue={selectedBooking?.payment_status || 'Pending'}
                        disabled={modalType === 'view'}
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control rounded-3"
                      name="notes"
                      rows="3"
                      placeholder="Any additional information..."
                      defaultValue={selectedBooking?.notes || ''}
                      disabled={modalType === 'view'}
                    ></textarea>
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
                        type="button"
                        className="btn"
                        style={{
                          backgroundColor: '#2598c5ff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontWeight: '500',
                        }}
                        onClick={handleSubmit}
                      >
                        {modalType === 'add' ? 'Book Now' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {isCancelModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeCancelModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Confirm Cancellation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeCancelModal}
                ></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="display-6 text-danger mb-3">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h5>Are you sure?</h5>
                <p className="text-muted">
                  This will cancel the {selectedBooking?.type === 'group' ? 'group class' : 'PT session'} booking for <strong>{selectedBooking?.member_name}</strong> on <strong>{selectedBooking ? formatDate(selectedBooking.date) : ''}</strong>.<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 justify-content-center pb-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={closeCancelModal}
                >
                  Don't Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={confirmCancel}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistBookGroupClasses;