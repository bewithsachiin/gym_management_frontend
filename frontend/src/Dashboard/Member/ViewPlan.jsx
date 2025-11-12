import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Modal, Form, Table } from 'react-bootstrap';
import { FaCheckCircle, FaEye } from 'react-icons/fa';

const ViewPlans = () => {
  const [activeTab, setActiveTab] = useState('group');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({ upi: '', amount: '' });

  // Mock Plans
  const groupPlans = [
    { id: 1, name: "Starter Pack", sessions: 8, validity: 30, price: "₹2,499" },
    { id: 2, name: "Pro Pack", sessions: 16, validity: 60, price: "₹4,499" },
    { id: 3, name: "Unlimited", sessions: 30, validity: 90, price: "₹7,999" },
  ];

  const personalPlans = [
    { id: 4, name: "Basic 1:1", sessions: 6, validity: 30, price: "₹4,999" },
    { id: 5, name: "Advanced 1:1", sessions: 12, validity: 60, price: "₹8,999" },
    { id: 6, name: "Elite 1:1", sessions: 20, validity: 90, price: "₹14,999" },
  ];

  // State for Bookings (Mock — in real app, this comes from API after admin approval)
  const [bookings, setBookings] = useState([
    {
      id: 101,
      planName: "Pro Pack",
      type: "Group",
      purchasedAt: "2025-05-20",
      validity: 60,
      totalSessions: 16,
      remainingSessions: 15,
      status: "approved",
    },
    {
      id: 102,
      planName: "Advanced 1:1",
      type: "Personal",
      purchasedAt: "2025-05-15",
      validity: 60,
      totalSessions: 12,
      remainingSessions: 10,
      status: "approved",
    },
  ]);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleBookNow = (plan, planType) => {
    setSelectedPlan({ ...plan, type: planType });
    setPaymentDetails({ ...paymentDetails, amount: plan.price, upi: '' }); // Reset UPI
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentDetails.upi) {
      alert("Please enter UPI ID");
      return;
    }

    setBookingStatus('pending');

    // Simulate payment processing
    setTimeout(() => {
      setBookingStatus('success');
      setShowPaymentModal(false);

      // Clear UPI field after payment
      setPaymentDetails(prev => ({ ...prev, upi: '' }));

      // Add to bookings (mock — real app: send to backend)
      const newBooking = {
        id: Date.now(),
        planName: selectedPlan.name,
        type: selectedPlan.type === 'group' ? 'Group' : 'Personal',
        purchasedAt: new Date().toLocaleDateString('en-CA'),
        validity: selectedPlan.validity,
        totalSessions: selectedPlan.sessions,
        remainingSessions: selectedPlan.sessions,
        status: "pending", // Will change to "approved" when admin approves
      };

      setBookings([newBooking, ...bookings]);

      alert("✅ Payment Successful! Booking request sent to admin for approval.");
    }, 2000);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  return (
    <div className=" bg-light  md-5">
      <Container>
        <h1 className=" mb-5 fw-bold text-dark" style={{ fontSize: '2.2rem' }}>
          Choose Your Fitness Plan
        </h1>

        {/* Button-style Tabs */}
        <div className="d-flex flex-column flex-md-row  gap-3 mb-5">
          <Button
            variant={activeTab === 'group' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('group')}
            className="px-4  fw-bold d-flex align-items-center justify-content-center gap-2 flex-grow-2"
            style={{
              backgroundColor: activeTab === 'group' ? '#2f6a87' : 'transparent',
              borderColor: '#2f6a87',
              color: activeTab === 'group' ? 'white' : '#2f6a87',
              borderRadius: '12px',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'group' ? '0 4px 12px rgba(47, 106, 135, 0.25)' : '0 2px 6px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'group') {
                e.target.style.backgroundColor = 'rgba(47, 106, 135, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'group') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span> Group Classes</span>
          </Button>
          <Button
            variant={activeTab === 'personal' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('personal')}
            className="px-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 flex-grow-2"
            style={{
              backgroundColor: activeTab === 'personal' ? '#2f6a87' : 'transparent',
              borderColor: '#2f6a87',
              color: activeTab === 'personal' ? 'white' : '#2f6a87',
              borderRadius: '12px',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'personal' ? '0 4px 12px rgba(47, 106, 135, 0.25)' : '0 2px 6px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              if (activeTab !== 'personal') {
                e.target.style.backgroundColor = 'rgba(47, 106, 135, 0.1)';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== 'personal') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span> Personal Training</span>
          </Button>
        </div>

        {/* Group Classes Tab */}
        {activeTab === 'group' && (
          <Row className="g-4">
            {groupPlans.map((plan) => (
              <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex">
                <Card className="h-100 shadow-sm border-0 flex-fill" style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  border: '1px solid #e9ecef'
                }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    height: '8px',
                    backgroundColor: '#2f6a87',
                    width: '100%'
                  }}></div>
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="text-center mb-4">
                      <div className="badge bg-primary mb-3 px-4 py-2" style={{
                        backgroundColor: '#2f6a87',
                        color: 'white',
                        fontSize: '0.9rem',
                        borderRadius: '50px'
                      }}>
                        GROUP CLASS
                      </div>
                      <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: '1.3rem' }}>{plan.name}</h4>
                    </div>
                    <ul className="list-unstyled mb-4 flex-grow-1">
                      <li className="mb-3 d-flex align-items-center gap-3">
                        <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                          <span className="text-muted">🎯</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{plan.sessions} Sessions</div>
                        </div>
                      </li>
                      <li className="mb-3 d-flex align-items-center gap-3">
                        <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                          <span className="text-muted">📅</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.1rem' }}>Validity: {plan.validity} Days</div>
                        </div>
                      </li>
                      <li className="mb-3 d-flex align-items-center gap-3">
                        <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                          <span className="text-muted">💰</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.1rem' }}>Price: {plan.price}</div>
                        </div>
                      </li>
                    </ul>
                    <Button
                      style={{
                        backgroundColor: '#2f6a87',
                        borderColor: '#2f6a87',
                        transition: 'background-color 0.3s ease',
                        borderRadius: '50px',
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
                      onClick={() => handleBookNow(plan, 'group')}
                      className="mt-auto fw-bold"
                    >
                      📅 Book Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Personal Training Tab */}
        {activeTab === 'personal' && (
          <Row className="g-4">
            {personalPlans.map((plan) => (
              <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex">
                <Card className="h-100 shadow-sm border-0 flex-fill" style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  border: '1px solid #e9ecef'
                }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    height: '8px',
                    backgroundColor: '#2f6a87',
                    width: '100%'
                  }}></div>
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="text-center mb-4">
                      <div className="badge bg-primary mb-3 px-4 py-2" style={{
                        backgroundColor: '#2f6a87',
                        color: 'white',
                        fontSize: '0.9rem',
                        borderRadius: '50px'
                      }}>
                        PERSONAL TRAINING
                      </div>
                      <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: '1.3rem' }}>{plan.name}</h4>
                    </div>
                    <ul className="list-unstyled mb-4 flex-grow-1">
                      <li className="mb-3 d-flex align-items-center gap-3">
                        <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                          <span className="text-muted">🎯</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{plan.sessions} Sessions</div>
                        </div>
                      </li>
                      <li className="mb-3 d-flex align-items-center gap-3">
                        <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                          <span className="text-muted">📅</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.1rem' }}>Validity: {plan.validity} Days</div>
                        </div>
                      </li>
                      <li className="mb-3 d-flex align-items-center gap-3">
                        <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                          <span className="text-muted">💰</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.1rem' }}>Price: {plan.price}</div>
                        </div>
                      </li>
                    </ul>
                    <Button
                      style={{
                        backgroundColor: '#2f6a87',
                        borderColor: '#2f6a87',
                        transition: 'background-color 0.3s ease',
                        borderRadius: '50px',
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
                      onClick={() => handleBookNow(plan, 'personal')}
                      className="mt-auto fw-bold"
                    >
                      📅 Book Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Payment Modal */}
        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered size="md">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '3px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.3rem' }}>Complete Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {bookingStatus === 'pending' ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status" style={{ color: '#333', width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Processing...</span>
                </div>
                <p className="mt-4 fw-bold" style={{ color: '#333', fontSize: '1.2rem' }}>Processing your payment...</p>
                <p className="text-muted">Please wait while we complete your transaction</p>
              </div>
            ) : (
              <Form onSubmit={handlePaymentSubmit}>
                <div className="text-center mb-4 p-4 rounded" style={{ backgroundColor: '#f0f7fa', border: '2px dashed #2f6a87', borderRadius: '12px' }}>
                  <h5 className="mb-3" style={{ color: '#333' }}>Payment Details</h5>
                  <p className="mb-2">
                    <strong>Plan:</strong> {selectedPlan?.name} ({selectedPlan?.type === 'group' ? 'Group' : 'Personal'})
                  </p>
                  <p className="mb-0">
                    <strong>Amount:</strong> <span className="fw-bold" style={{ fontSize: '1.3rem', color: '#2f6a87' }}>{selectedPlan?.price}</span>
                  </p>
                </div>
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: '#333', fontWeight: '600', fontSize: '1.1rem' }}>UPI ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="yourname@upi"
                    value={paymentDetails.upi}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, upi: e.target.value })}
                    required
                    style={{
                      padding: '12px',
                      fontSize: '1.1rem',
                      borderRadius: '8px',
                      borderColor: '#2f6a87'
                    }}
                  />
                  <Form.Text className="text-muted">
                    Enter your UPI ID (e.g., yourname@upi, yournumber@ybl, etc.)
                  </Form.Text>
                </Form.Group>
               <div className="d-flex justify-content-center">
  <Button
    type="submit"
    className="w-100 py-3 fw-bold rounded-pill"
    style={{
      backgroundColor: '#2f6a87',
      borderColor: '#2f6a87',
      fontSize: '1.2rem',
      transition: 'background-color 0.3s ease',
      padding: '12px 24px',
      maxWidth: '400px' // Optional: prevents button from being too wide on large screens
    }}
    onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
    onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
  >
    Pay {selectedPlan?.price} via UPI
  </Button>
</div>
              </Form>
            )}
          </Modal.Body>
        </Modal>

        {/* Success Alert */}
        {bookingStatus === 'success' && (
          <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 1000 }}>
            <div className="alert p-3 rounded-pill shadow-lg" style={{
              backgroundColor: 'rgba(93, 93, 93, 0.85)', // Gray with 85% opacity
              color: 'white',
              border: 'none',
              minWidth: '300px',
              animation: 'fadeInUp 0.5s ease',
              backdropFilter: 'blur(10px)' 
            }}>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <FaCheckCircle size={24} />
                <span className="fw-bold">Booking Request Sent!</span>
              </div>
              <div className="text-center mt-1" style={{ fontSize: '0.9rem' }}>
                Admin will approve your class soon.
              </div>
            </div>
          </div>
        )}

        {/* Your Bookings Table */}
        {bookings.length > 0 && (
          <div className="mt-5 pt-5 border-top" >
            <h3 className="fw-bold mb-4 text-dark" style={{ color: '#333', fontSize: '1.6rem' }}> Your Bookings</h3>
            <div className="table-responsive">
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Card.Body className="p-0">
                  <Table hover responsive className="align-middle mb-0">
                    <thead className="bg-light" style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600' }}>#</th>
                        <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600' }}>Plan Name</th>
                        <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600' }}>Type</th>
                        <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600' }}>Purchased On</th>
                        <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600' }}>Status</th>
                        <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking, index) => (
                        <tr key={booking.id} style={{ transition: 'background-color 0.2s ease' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                          <td className="py-3 fw-bold">{index + 1}</td>
                          <td className="py-3">
                            <strong style={{ color: '#333', fontSize: '1.1rem' }}>{booking.planName}</strong>
                          </td>
                          <td className="py-3">
                            {booking.type === 'Group' ? (
                              <span className="badge bg-primary px-3 py-2" style={{
                                backgroundColor: '#2f6a87',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: '0.9rem'
                              }}>Group</span>
                            ) : (
                              <span className="badge bg-primary px-3 py-2" style={{
                                backgroundColor: '#2f6a87',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: '0.9rem'
                              }}>Personal</span>
                            )}
                          </td>
                          <td className="py-3" style={{ fontSize: '1.05rem' }}>{booking.purchasedAt}</td>
                          <td className="py-3">
                            {booking.status === 'approved' && <span className="badge bg-success px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.9rem' }}>Approved</span>}
                            {booking.status === 'pending' && <span className="badge bg-warning text-dark px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.9rem' }}>Pending</span>}
                            {booking.status === 'rejected' && <span className="badge bg-danger px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.9rem' }}>Rejected</span>}
                          </td>
                          <td className="py-3">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleViewBooking(booking)}
                              disabled={booking.status !== 'approved'}
                              style={{
                                borderColor: '#2f6a87',
                                color: booking.status === 'approved' ? '#2f6a87' : '#ccc',
                                cursor: booking.status === 'approved' ? 'pointer' : 'not-allowed',
                                borderRadius: '20px',
                                padding: '6px 16px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => {
                                if (booking.status === 'approved') {
                                  e.target.style.backgroundColor = 'rgba(47, 106, 135, 0.1)';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (booking.status === 'approved') {
                                  e.target.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <FaEye className="me-1" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}

        {/* View Booking Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: '1.3rem' }}>Plan Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking && (
              <div className="p-4 bg-light rounded" style={{
                borderRadius: '12px'
              }}>
                <h4 className="fw-bold mb-4" style={{ color: '#333', fontSize: '1.4rem' }}>
                  {selectedBooking.planName} ({selectedBooking.type})
                </h4>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-3" style={{ color: '#2f6a87', fontSize: '1.4rem' }}>📅</span>
                        <h6 className="mb-0 text-muted">Purchased On</h6>
                      </div>
                      <p className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>{selectedBooking.purchasedAt}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-3" style={{ color: '#2f6a87', fontSize: '1.4rem' }}>⏳</span>
                        <h6 className="mb-0 text-muted">Validity</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge" style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          fontSize: '1.1rem',
                          padding: '8px 16px',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.validity} Days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-3" style={{ color: '#2f6a87', fontSize: '1.4rem' }}>🎯</span>
                        <h6 className="mb-0 text-muted">Total Sessions</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge" style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          fontSize: '1.1rem',
                          padding: '8px 16px',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.totalSessions}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-3" style={{ color: '#2f6a87', fontSize: '1.4rem' }}>✅</span>
                        <h6 className="mb-0 text-muted">Remaining Sessions</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success" style={{
                          fontSize: '1.1rem',
                          padding: '8px 16px',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.remainingSessions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.validity > 0 && (
                  <div className="mt-4 p-4 bg-white rounded" style={{
                    border: '1px solid #2f6a87',
                    borderRadius: '12px',
                    backgroundColor: '#f0f7fa'
                  }}>
                    <div className="d-flex align-items-center mb-2">
                      <h5 className="mb-0" style={{ color: '#333' }}> Plan Active</h5>
                    </div>
                    <p className="mb-0 text-muted">
                      You can book sessions until your validity expires or sessions run out.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #eee' }}>
            <Button
              variant="secondary"
              onClick={() => setShowViewModal(false)}
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                color: 'white',
                borderRadius: '50px',
                padding: '8px 24px',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      {/* Add animation CSS */}
      <style jsx="true">{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ViewPlans;