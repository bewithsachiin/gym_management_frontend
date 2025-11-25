import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaClock, FaUser, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';

const ClassSchedule = () => {
  // State for group classes
  const [groupClasses, setGroupClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch weekly classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/members/group-classes');
        setGroupClasses(response.data.data.classes);
      } catch (err) {
        setError(err.message || 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Helper functions
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTrainer = (cls) => {
    return cls.trainer || { name: 'Unknown', specialty: '' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Modal handlers
  const openBookingModal = (cls) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  // Booking handler
  const handleBooking = async () => {
    if (!selectedClass) return;
    try {
      setBookingLoading(true);
      await axiosInstance.post(`/members/group-classes/${selectedClass.id}/book`);
      // Update booked seats locally
      setGroupClasses(prev =>
        prev.map(cls =>
          cls.id === selectedClass.id
            ? { ...cls, booked_seats: cls.booked_seats + 1 }
            : cls
        )
      );
      alert(`Successfully booked ${selectedClass.name}!`);
      closeBookingModal();
    } catch (err) {
      alert(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  // Prevent background scroll when modal open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (loading) {
    return (
      <div className="mt-3 text-center" style={{ backgroundColor: '#f8f9fa' }}>
        <h1 className="fw-bold">Weekly Class Schedule</h1>
        <p>Loading classes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 text-center" style={{ backgroundColor: '#f8f9fa' }}>
        <h1 className="fw-bold">Weekly Class Schedule</h1>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-3" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="row mb-3 ">
        <div className="col-12 text-center text-md-start">
          <h1 className="fw-bold ">Weekly Class Schedule</h1>
          <p className="text-muted mb-0">Book your favorite classes for the week</p>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="row g-4">
        {groupClasses.map(cls => {
          const trainer = getTrainer(cls);
          const isFull = cls.booked_seats >= cls.capacity;

          return (
            <div key={cls.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                {/* Card Header */}
                <div 
                  className="p-4 text-white" 
                  style={{ 
                    background: '#2f6a87',
                    minHeight: '60px'
                  }}
                >
                  <h5 className="mb-0 fw-bold">{cls.name}</h5>
                </div>

                {/* Card Body */}
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <FaClock size={16} className="me-2 text-primary" />
                    <small>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</small>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FaUser size={16} className="me-2 text-primary" />
                    <small>{trainer.name}</small>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FaRupeeSign size={16} className="me-2 text-success" />
                    <strong className="text-success">{formatPrice(cls.price)}</strong>
                  </div>

                  <div className="mt-4">
                    <button
                      className="btn w-100 py-2 fw-medium"
                      style={{
                        backgroundColor: isFull ? '#6c757d' : '#2f6a87',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={isFull}
                      onClick={() => !isFull && openBookingModal(cls)}
                    >
                      {isFull ? 'Class Full' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKING MODAL */}
      {isModalOpen && selectedClass && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeBookingModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h3 className="modal-title fw-bold">Book Your Class</h3>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeBookingModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="card border-0 shadow-sm mb-4">
                  <div 
                    className="card-header p-4 text-white" 
                    style={{ 
                      background: '#2f6a87',
                      borderRadius: '12px 12px 0 0'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4 className="mb-2 fw-bold">{selectedClass.name}</h4>
                        <div className="d-flex align-items-center mb-2">
                          <FaCalendarAlt size={16} className="me-2" />
                          <small>{formatDate(selectedClass.date)}</small>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <FaClock size={16} className="me-2" />
                          <small>{formatTime(selectedClass.start_time)} - {formatTime(selectedClass.end_time)}</small>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaUser size={16} className="me-2" />
                          <small>{getTrainer(selectedClass.trainer_id).name} • {getTrainer(selectedClass.trainer_id).specialty}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">Class Details</h5>
                    <div className="row g-4 mb-4">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <FaUser size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">Trainer</div>
                            <div>{getTrainer(selectedClass.trainer_id).name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <FaClock size={16} className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">Duration</div>
                            <div>
                              {Math.round((new Date(`2024-01-01T${selectedClass.end_time}`) - new Date(`2024-01-01T${selectedClass.start_time}`)) / 60000)} minutes
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3">
                            <FaRupeeSign size={16} className="text-success" />
                          </div>
                          <div>
                            <div className="fw-medium">Price</div>
                            <div className="text-success fw-bold">{formatPrice(selectedClass.price)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="alert alert-info mb-4">
                      <strong>Booking Confirmation:</strong> You'll receive an email and SMS confirmation after booking.
                    </div>

                    <div className="text-center">
                      <button
                        className="btn btn-lg px-5 py-3 fw-bold"
                        style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '1.1rem'
                        }}
                        onClick={handleBooking}
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSchedule;
