import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaClock, FaUser, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';

const ClassSchedule = () => {
  // Mock data for trainers
  const trainers = [
    { id: 1, name: 'John Smith', specialty: 'Strength Training' },
    { id: 2, name: 'Sarah Johnson', specialty: 'Yoga & Pilates' },
    { id: 3, name: 'Mike Williams', specialty: 'Cardio & HIIT' },
    { id: 4, name: 'Emily Davis', specialty: 'Weight Loss' },
  ];
  
  // State for group classes
  const [groupClasses, setGroupClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize classes
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const mockClasses = [
      { id: 1, name: 'Aerobics Class', trainer_id: 4, date: dates[0], start_time: '05:15', end_time: '06:15', capacity: 20, booked_seats: 12, price: 300 },
      { id: 2, name: 'HIT Class', trainer_id: 3, date: dates[0], start_time: '07:30', end_time: '08:45', capacity: 15, booked_seats: 10, price: 400 },
      { id: 3, name: 'Yoga Class', trainer_id: 2, date: dates[1], start_time: '08:00', end_time: '10:00', capacity: 18, booked_seats: 15, price: 350 },
      { id: 4, name: 'Pilates', trainer_id: 2, date: dates[1], start_time: '12:00', end_time: '15:15', capacity: 12, booked_seats: 8, price: 450 },
      { id: 5, name: 'Yoga Class', trainer_id: 2, date: dates[2], start_time: '08:00', end_time: '10:00', capacity: 18, booked_seats: 14, price: 350 },
      { id: 6, name: 'Pilates', trainer_id: 2, date: dates[2], start_time: '12:00', end_time: '15:15', capacity: 12, booked_seats: 9, price: 450 },
      { id: 7, name: 'Yoga Class', trainer_id: 2, date: dates[3], start_time: '08:00', end_time: '10:00', capacity: 18, booked_seats: 16, price: 350 },
      { id: 8, name: 'Pilates', trainer_id: 2, date: dates[3], start_time: '12:00', end_time: '15:15', capacity: 12, booked_seats: 10, price: 450 },
      { id: 9, name: 'Yoga Class', trainer_id: 2, date: dates[4], start_time: '08:00', end_time: '10:00', capacity: 18, booked_seats: 13, price: 350 },
      { id: 10, name: 'Pilates', trainer_id: 2, date: dates[4], start_time: '12:00', end_time: '15:15', capacity: 12, booked_seats: 7, price: 450 },
      { id: 11, name: 'Yoga Class', trainer_id: 2, date: dates[5], start_time: '08:00', end_time: '10:00', capacity: 18, booked_seats: 17, price: 350 },
      { id: 12, name: 'Pilates', trainer_id: 2, date: dates[5], start_time: '12:00', end_time: '15:15', capacity: 12, booked_seats: 11, price: 450 },
      { id: 13, name: 'HIT Class', trainer_id: 3, date: dates[6], start_time: '07:30', end_time: '08:45', capacity: 15, booked_seats: 12, price: 400 },
      { id: 14, name: 'Zumba Class', trainer_id: 4, date: dates[6], start_time: '08:30', end_time: '10:30', capacity: 25, booked_seats: 20, price: 250 },
    ];
    setGroupClasses(mockClasses);
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

  const getTrainer = (trainerId) => {
    return trainers.find(t => t.id === trainerId) || { name: 'Unknown', specialty: '' };
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
          const trainer = getTrainer(cls.trainer_id);
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
                        onClick={() => {
                          alert(`Successfully booked ${selectedClass.name} for ${formatPrice(selectedClass.price)}!`);
                          closeBookingModal();
                        }}
                      >
                        Confirm Booking
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