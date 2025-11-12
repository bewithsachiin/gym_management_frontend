import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PersonalTraining = () => {
  const [trainingData, setTrainingData] = useState([
    {
      trainer: "John Smith",
      type: "Strength Training",
      date: "2023-06-20",
      time: "10:00 - 11:00",
      price: "$50",
      paymentStatus: "Paid",
      bookingStatus: "Booked",
      username: "john_doe"
    },
    {
      trainer: "Mike Williams",
      type: "Cardio & HIIT",
      date: "2023-06-22",
      time: "14:00 - 15:00",
      price: "$60",
      paymentStatus: "Paid",
      bookingStatus: "Booked",
      username: "mike_w"
    },
    {
      trainer: "Mike Williams",
      type: "Cardio & HIIT",
      date: "2025-09-18",
      time: "23:34 - 03:04",
      price: "$70",
      paymentStatus: "Paid",
      bookingStatus: "Booked",
      username: "mike_w"
    },
    {
      trainer: "Unknown",
      type: "",
      date: "",
      time: "",
      price: "",
      paymentStatus: "Paid",
      bookingStatus: "Booked",
      username: "guest_user"
    }
  ]);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Button click handlers
  const handleShow = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDelete = (username) => {
    if (window.confirm(`Are you sure you want to delete the booking for ${username}?`)) {
      alert(`Booking for ${username} has been deleted`);
    }
  };

  const handleBookingStatusClick = (index) => {
    const newData = [...trainingData];
    const currentStatus = newData[index].bookingStatus;
    
    if (currentStatus === "Booked") {
      newData[index].bookingStatus = "Confirmed";
    } else if (currentStatus === "Confirmed") {
      newData[index].bookingStatus = "Cancelled";
    } else if (currentStatus === "Cancelled") {
      newData[index].bookingStatus = "Booked";
    }
    
    setTrainingData(newData);
  };

  // Get badge color based on booking status
  const getBadgeColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-success";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="p-3">
      {/* Personal Training Heading */}
      <h2 className="mb-3 text-start">Personal Training Details </h2>
      <p className='text-muted'> In Member Dashboard</p>
      
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Username</th>
              <th>Trainer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Payment Status</th>
              <th>Booking Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainingData.map((data, index) => (
              <tr key={index}>
                <td>{data.username}</td>
                <td>
                  {data.trainer} {data.type && `(${data.type})`}
                </td>
                <td>{data.date}</td>
                <td>{data.time}</td>
                <td>{data.price}</td>
                <td>
                  <span className={`badge ${data.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                    {data.paymentStatus}
                  </span>
                </td>
                <td>
                  <button 
                    className={`badge ${getBadgeColor(data.bookingStatus)} border-0 bg-opacity-75`}
                    onClick={() => handleBookingStatusClick(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    {data.bookingStatus}
                  </button>
                </td>
                <td>
                  <div className="btn-group" role="group">
                    <button 
                      className="btn btn-sm btn-info" 
                      title="Show"
                      onClick={() => handleShow(data)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      title="Delete"
                      onClick={() => handleDelete(data.username)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FOR VIEW DETAILS — ADDED ONLY THIS SECTION */}
      {isModalOpen && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Personal Training Booking Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedBooking ? (
                  <div className="row g-3">
                    <div className="col-12">
                      <strong>Username:</strong> {selectedBooking.username}
                    </div>
                    <div className="col-12">
                      <strong>Trainer:</strong> {selectedBooking.trainer}
                    </div>
                    <div className="col-12">
                      <strong>Type:</strong> {selectedBooking.type || 'N/A'}
                    </div>
                    <div className="col-12">
                      <strong>Date:</strong> {selectedBooking.date || 'N/A'}
                    </div>
                    <div className="col-12">
                      <strong>Time:</strong> {selectedBooking.time || 'N/A'}
                    </div>
                    <div className="col-12">
                      <strong>Price:</strong> {selectedBooking.price || 'N/A'}
                    </div>
                    <div className="col-12">
                      <strong>Payment Status:</strong> {selectedBooking.paymentStatus}
                    </div>
                    <div className="col-12">
                      <strong>Booking Status:</strong> {selectedBooking.bookingStatus}
                    </div>
                  </div>
                ) : (
                  <p>No booking selected.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalTraining;