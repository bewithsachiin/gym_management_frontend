import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Modal, Form, Table } from 'react-bootstrap';
import { FaCheckCircle, FaEye } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';

const ViewPlans = () => {
  const [activeTab, setActiveTab] = useState('group');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({ upi: '', amount: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Data States
  const [plans, setPlans] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Filter plans by type
  const groupPlans = plans.filter(plan => plan.type === 'group');
  const personalPlans = plans.filter(plan => plan.type === 'personal');

  // Fetch all plans from API
  const fetchPlans = async () => {
    try {
      setIsLoadingPlans(true);
      console.log("%c📡 Fetching Plans Start", "color:blue;font-weight:bold;");
      
      const response = await axiosInstance.get('/members/plans');
      
      console.log("%c✅ Plans Fetched Successfully", "color:green;font-weight:bold;", response.data);
      setPlans(response.data.data || []);
    } catch (error) {
      console.log("%c❌ Plans Fetch Error", "color:red;font-weight:bold;", error);
      setError('Failed to load plans');
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      console.log("%c📡 Fetching Bookings Start", "color:blue;font-weight:bold;");
      
      const response = await axiosInstance.get('/members/bookings');
      
      console.log("%c✅ Bookings Fetched Successfully", "color:green;font-weight:bold;", response.data);
      setBookings(response.data.data || []);
    } catch (error) {
      console.log("%c❌ Bookings Fetch Error", "color:red;font-weight:bold;", error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Process payment via API
  const processPayment = async (paymentData) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("%c💰 Payment Processing Start", "color:blue;font-weight:bold;", paymentData);

      const response = await axiosInstance.post('/members/bookings', {
        planId: selectedPlan.id,
        paymentDetails: {
          upi: paymentData.upi
        }
      });

      if (response.data.success) {
        console.log("%c🎉 Payment Completed Successfully", "color:green;font-weight:bold;", response.data);
        
        setBookingStatus('success');
        setShowPaymentModal(false);
        setPaymentDetails(prev => ({ ...prev, upi: '' }));

        // Refresh bookings list
        await fetchBookings();
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (err) {
      console.log("%c💥 Payment Error", "color:red;font-weight:bold;", err);
      setError(err.response?.data?.message || err.message || 'Payment processing failed');
      setBookingStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = (plan, planType) => {
    console.log("%c📅 Book Now Clicked", "color:purple;font-weight:bold;", { plan, planType });
    setSelectedPlan({ ...plan, type: planType });
    setPaymentDetails({ ...paymentDetails, amount: `₹${parseFloat(plan.price).toLocaleString('en-IN')}`, upi: '' });
    setShowPaymentModal(true);
    setError(null);
    setBookingStatus(null);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentDetails.upi) {
      console.log("%c⚠️ UPI Validation Failed", "color:orange;font-weight:bold;");
      alert("Please enter UPI ID");
      return;
    }

    setBookingStatus('pending');
    await processPayment({
      plan: selectedPlan.name,
      amount: selectedPlan.price,
      upi: paymentDetails.upi,
      type: selectedPlan.type
    });
  };

  const handleViewBooking = (booking) => {
    console.log("%c👀 View Booking", "color:teal;font-weight:bold;", booking);
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleClosePaymentModal = () => {
    console.log("%c❌ Payment Modal Closed", "color:gray;font-weight:bold;");
    setShowPaymentModal(false);
    setError(null);
    setBookingStatus(null);
  };

  // Format price with INR symbol
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  // Responsive button styles
  const getButtonStyles = (isActive) => ({
    backgroundColor: isActive ? '#2f6a87' : 'transparent',
    borderColor: '#2f6a87',
    color: isActive ? 'white' : '#2f6a87',
    borderRadius: '12px',
    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
    transition: 'all 0.3s ease',
    boxShadow: isActive ? '0 4px 12px rgba(47, 106, 135, 0.25)' : '0 2px 6px rgba(0,0,0,0.1)',
    padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto'
  });

  const getCardButtonStyles = {
    backgroundColor: '#2f6a87',
    borderColor: '#2f6a87',
    transition: 'background-color 0.3s ease',
    borderRadius: '50px',
    padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)',
    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
    fontWeight: '600',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto'
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPlans();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (bookingStatus === 'success') {
      const timer = setTimeout(() => {
        setBookingStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bookingStatus]);

  // Helper function for responsive clamp values
  const clamp = (value, min, max) => {
    return `clamp(${min}px, ${value}vw, ${max}px)`;
  };

  return (
    <div className="bg-light md-5">
      <Container fluid="lg">
        <h1 className="mb-4 mb-md-5 fw-bold text-dark text-center text-md-start" 
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>
          Choose Your Fitness Plan
        </h1>

        {/* Button-style Tabs */}
        <div className="d-flex flex-column flex-md-row gap-3 mb-4 mb-md-5 justify-content-center justify-content-md-start">
          <Button
            variant={activeTab === 'group' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('group')}
            className="px-3 px-md-4 fw-bold d-flex align-items-center justify-content-center gap-2"
            style={getButtonStyles(activeTab === 'group')}
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
            <span>Group Classes</span>
          </Button>
          <Button
            variant={activeTab === 'personal' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('personal')}
            className="px-3 px-md-4 fw-bold d-flex align-items-center justify-content-center gap-2"
            style={getButtonStyles(activeTab === 'personal')}
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
            <span>Personal Training</span>
          </Button>
        </div>

        {/* Group Classes Tab */}
        {activeTab === 'group' && (
          <Row className="g-3 g-md-4 justify-content-center">
            {isLoadingPlans ? (
              <Col className="text-center py-5">
                <div className="spinner-border" role="status" style={{ color: '#2f6a87' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading plans...</p>
              </Col>
            ) : groupPlans.length === 0 ? (
              <Col className="text-center py-5">
                <p>No group plans available at the moment.</p>
              </Col>
            ) : (
              groupPlans.map((plan) => (
              <Col xs={12} sm={10} md={6} lg={4} xl={4} key={plan.id} className="d-flex">
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
                  <Card.Body className="d-flex flex-column p-3 p-md-4">
                    <div className="text-center mb-3 mb-md-4">
                      <div className="badge bg-primary mb-2 mb-md-3 px-3 px-md-4 py-2" style={{
                        backgroundColor: '#2f6a87',
                        color: 'white',
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                        borderRadius: '50px'
                      }}>
                        GROUP CLASS
                      </div>
                      <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: 'clamp(1.1rem, 2vw, 1.3rem)' }}>{plan.name}</h4>
                    </div>
                    <ul className="list-unstyled mb-3 mb-md-4 flex-grow-1">
                      <li className="mb-2 mb-md-3 d-flex align-items-center gap-2 gap-md-3">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" 
                             style={{ width: 'clamp(35px, 4vw, 40px)', height: 'clamp(35px, 4vw, 40px)' }}>
                          <span className="text-muted">🎯</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>{plan.sessions} Sessions</div>
                        </div>
                      </li>
                      <li className="mb-2 mb-md-3 d-flex align-items-center gap-2 gap-md-3">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" 
                             style={{ width: 'clamp(35px, 4vw, 40px)', height: 'clamp(35px, 4vw, 40px)' }}>
                          <span className="text-muted">📅</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>Validity: {plan.validity} Days</div>
                        </div>
                      </li>
                      <li className="mb-2 mb-md-3 d-flex align-items-center gap-2 gap-md-3">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" 
                             style={{ width: 'clamp(35px, 4vw, 40px)', height: 'clamp(35px, 4vw, 40px)' }}>
                          <span className="text-muted">💰</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>Price: {formatPrice(plan.price)}</div>
                        </div>
                      </li>
                    </ul>
                    <Button
                      style={getCardButtonStyles}
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
            )))}
          </Row>
        )}

        {/* Personal Training Tab */}
        {activeTab === 'personal' && (
          <Row className="g-3 g-md-4 justify-content-center">
            {isLoadingPlans ? (
              <Col className="text-center py-5">
                <div className="spinner-border" role="status" style={{ color: '#2f6a87' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading plans...</p>
              </Col>
            ) : personalPlans.length === 0 ? (
              <Col className="text-center py-5">
                <p>No personal training plans available at the moment.</p>
              </Col>
            ) : (
              personalPlans.map((plan) => (
              <Col xs={12} sm={10} md={6} lg={4} xl={4} key={plan.id} className="d-flex">
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
                  <Card.Body className="d-flex flex-column p-3 p-md-4">
                    <div className="text-center mb-3 mb-md-4">
                      <div className="badge bg-primary mb-2 mb-md-3 px-3 px-md-4 py-2" style={{
                        backgroundColor: '#2f6a87',
                        color: 'white',
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                        borderRadius: '50px'
                      }}>
                        PERSONAL TRAINING
                      </div>
                      <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: 'clamp(1.1rem, 2vw, 1.3rem)' }}>{plan.name}</h4>
                    </div>
                    <ul className="list-unstyled mb-3 mb-md-4 flex-grow-1">
                      <li className="mb-2 mb-md-3 d-flex align-items-center gap-2 gap-md-3">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" 
                             style={{ width: 'clamp(35px, 4vw, 40px)', height: 'clamp(35px, 4vw, 40px)' }}>
                          <span className="text-muted">🎯</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>{plan.sessions} Sessions</div>
                        </div>
                      </li>
                      <li className="mb-2 mb-md-3 d-flex align-items-center gap-2 gap-md-3">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" 
                             style={{ width: 'clamp(35px, 4vw, 40px)', height: 'clamp(35px, 4vw, 40px)' }}>
                          <span className="text-muted">📅</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>Validity: {plan.validity} Days</div>
                        </div>
                      </li>
                      <li className="mb-2 mb-md-3 d-flex align-items-center gap-2 gap-md-3">
                        <div className="bg-light rounded-circle p-2 d-flex align-items-center justify-content-center" 
                             style={{ width: 'clamp(35px, 4vw, 40px)', height: 'clamp(35px, 4vw, 40px)' }}>
                          <span className="text-muted">💰</span>
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>Price: {formatPrice(plan.price)}</div>
                        </div>
                      </li>
                    </ul>
                    <Button
                      style={getCardButtonStyles}
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
            )))}
          </Row>
        )}

        {/* Payment Modal */}
        <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered size="md">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '3px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: 'clamp(1.1rem, 2vw, 1.3rem)' }}>Complete Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isLoading ? (
              <div className="text-center py-4 py-md-5">
                <div className="spinner-border" role="status" style={{ color: '#333', width: 'clamp(2.5rem, 4vw, 3rem)', height: 'clamp(2.5rem, 4vw, 3rem)' }}>
                  <span className="visually-hidden">Processing...</span>
                </div>
                <p className="mt-3 mt-md-4 fw-bold" style={{ color: '#333', fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}>Processing your payment...</p>
                <p className="text-muted" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Please wait while we complete your transaction</p>
              </div>
            ) : bookingStatus === 'error' ? (
              <div className="text-center py-4 py-md-5">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h5 style={{ color: '#dc3545', marginBottom: '1rem' }}>Payment Failed</h5>
                <p className="text-muted">{error}</p>
                <Button 
                  variant="primary" 
                  onClick={() => setBookingStatus(null)}
                  style={{ backgroundColor: '#2f6a87', borderColor: '#2f6a87' }}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <Form onSubmit={handlePaymentSubmit}>
                <div className="text-center mb-3 mb-md-4 p-3 p-md-4 rounded" style={{ backgroundColor: '#f0f7fa', border: '2px dashed #2f6a87', borderRadius: '12px' }}>
                  <h5 className="mb-2 mb-md-3" style={{ color: '#333', fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>Payment Details</h5>
                  <p className="mb-1 mb-md-2" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>
                    <strong>Plan:</strong> {selectedPlan?.name} ({selectedPlan?.type === 'group' ? 'Group' : 'Personal'})
                  </p>
                  <p className="mb-0" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>
                    <strong>Amount:</strong> <span className="fw-bold" style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)', color: '#2f6a87' }}>{formatPrice(selectedPlan?.price)}</span>
                  </p>
                </div>
                <Form.Group className="mb-3 mb-md-4">
                  <Form.Label style={{ color: '#333', fontWeight: '600', fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>UPI ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="yourname@upi"
                    value={paymentDetails.upi}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, upi: e.target.value })}
                    required
                    style={{
                      padding: 'clamp(10px, 1.5vw, 12px)',
                      fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                      borderRadius: '8px',
                      borderColor: '#2f6a87'
                    }}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>
                    Enter your UPI ID (e.g., yourname@upi, yournumber@ybl, etc.)
                  </Form.Text>
                </Form.Group>
                <div className="d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="w-100 py-2 py-md-3 fw-bold rounded-pill"
                    style={{
                      backgroundColor: '#2f6a87',
                      borderColor: '#2f6a87',
                      fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                      transition: 'background-color 0.3s ease',
                      padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 2vw, 24px)',
                      maxWidth: '400px'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
                  >
                    Pay {formatPrice(selectedPlan?.price)} via UPI
                  </Button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>

        {/* Success Alert */}
        {bookingStatus === 'success' && (
          <div className="position-fixed bottom-0 start-50 translate-middle-x mb-3 mb-md-4" style={{ zIndex: 1000, width: '90%', maxWidth: '400px' }}>
            <div className="alert p-2 p-md-3 rounded-pill shadow-lg" style={{
              backgroundColor: 'rgba(93, 93, 93, 0.85)',
              color: 'white',
              border: 'none',
              animation: 'fadeInUp 0.5s ease',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <FaCheckCircle size={20} />
                <span className="fw-bold" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Booking Request Sent!</span>
              </div>
              <div className="text-center mt-1" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>
                Admin will approve your class soon.
              </div>
            </div>
          </div>
        )}

        {/* Your Bookings Table */}
        {isLoadingBookings ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" style={{ color: '#2f6a87' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading bookings...</p>
          </div>
        ) : bookings.length > 0 && (
          <div className="mt-4 mt-md-5 pt-4 pt-md-5 border-top">
            <h3 className="fw-bold mb-3 mb-md-4 text-dark text-center text-md-start" style={{ color: '#333', fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)' }}>Your Bookings</h3>
            <div className="table-responsive">
              <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Card.Body className="p-0">
                  <Table hover responsive className="align-middle mb-0">
                    <thead className="bg-light" style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th className="py-2 py-md-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600', fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>#</th>
                        <th className="py-2 py-md-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600', fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>Plan Name</th>
                        <th className="py-2 py-md-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600', fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>Type</th>
                        <th className="py-2 py-md-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600', fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>Purchased On</th>
                        <th className="py-2 py-md-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600', fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>Status</th>
                        <th className="py-2 py-md-3" style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: '600', fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking, index) => (
                        <tr key={booking.id} style={{ transition: 'background-color 0.2s ease' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                          <td className="py-2 py-md-3 fw-bold" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 0.9rem)' }}>{index + 1}</td>
                          <td className="py-2 py-md-3">
                            <strong style={{ color: '#333', fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)' }}>{booking.planName}</strong>
                          </td>
                          <td className="py-2 py-md-3">
                            {booking.type === 'group' || booking.type === 'Group' ? (
                              <span className="badge bg-primary px-2 px-md-3 py-1 py-md-2" style={{
                                backgroundColor: '#2f6a87',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: 'clamp(0.7rem, 1vw, 0.9rem)'
                              }}>Group</span>
                            ) : (
                              <span className="badge bg-primary px-2 px-md-3 py-1 py-md-2" style={{
                                backgroundColor: '#2f6a87',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: 'clamp(0.7rem, 1vw, 0.9rem)'
                              }}>Personal</span>
                            )}
                          </td>
                          <td className="py-2 py-md-3" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1.05rem)' }}>{booking.purchasedAt}</td>
                          <td className="py-2 py-md-3">
                            {booking.status === 'approved' && <span className="badge bg-success px-2 px-md-3 py-1 py-md-2" style={{ borderRadius: '20px', fontSize: 'clamp(0.7rem, 1vw, 0.9rem)' }}>Approved</span>}
                            {booking.status === 'pending' && <span className="badge bg-warning text-dark px-2 px-md-3 py-1 py-md-2" style={{ borderRadius: '20px', fontSize: 'clamp(0.7rem, 1vw, 0.9rem)' }}>Pending</span>}
                            {booking.status === 'rejected' && <span className="badge bg-danger px-2 px-md-3 py-1 py-md-2" style={{ borderRadius: '20px', fontSize: 'clamp(0.7rem, 1vw, 0.9rem)' }}>Rejected</span>}
                          </td>
                          <td className="py-2 py-md-3">
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
                                padding: 'clamp(4px, 0.8vw, 6px) clamp(12px, 1.5vw, 16px)',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                fontSize: 'clamp(0.7rem, 1vw, 0.8rem)'
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
            <Modal.Title style={{ color: '#333', fontWeight: '600', fontSize: 'clamp(1.1rem, 2vw, 1.3rem)' }}>Plan Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking && (
              <div className="p-3 p-md-4 bg-light rounded" style={{
                borderRadius: '12px'
              }}>
                <h4 className="fw-bold mb-3 mb-md-4" style={{ color: '#333', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}>
                  {selectedBooking.planName} ({selectedBooking.type})
                </h4>
                <div className="row g-3 g-md-4">
                  <div className="col-12 col-md-6">
                    <div className="p-2 p-md-3 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-1 mb-md-2">
                        <span className="me-2 me-md-3" style={{ color: '#2f6a87', fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)' }}>📅</span>
                        <h6 className="mb-0 text-muted" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Purchased On</h6>
                      </div>
                      <p className="fw-bold mb-0" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)' }}>{selectedBooking.purchasedAt}</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-2 p-md-3 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-1 mb-md-2">
                        <span className="me-2 me-md-3" style={{ color: '#2f6a87', fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)' }}>⏳</span>
                        <h6 className="mb-0 text-muted" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Validity</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge" style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                          padding: 'clamp(6px, 1vw, 8px) clamp(12px, 1.5vw, 16px)',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.validity} Days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-2 p-md-3 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-1 mb-md-2">
                        <span className="me-2 me-md-3" style={{ color: '#2f6a87', fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)' }}>🎯</span>
                        <h6 className="mb-0 text-muted" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Total Sessions</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge" style={{
                          backgroundColor: '#2f6a87',
                          color: 'white',
                          fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                          padding: 'clamp(6px, 1vw, 8px) clamp(12px, 1.5vw, 16px)',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.totalSessions}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-2 p-md-3 bg-white rounded" style={{ border: '1px solid #e9ecef' }}>
                      <div className="d-flex align-items-center mb-1 mb-md-2">
                        <span className="me-2 me-md-3" style={{ color: '#2f6a87', fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)' }}>✅</span>
                        <h6 className="mb-0 text-muted" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>Remaining Sessions</h6>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success" style={{
                          fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                          padding: 'clamp(6px, 1vw, 8px) clamp(12px, 1.5vw, 16px)',
                          borderRadius: '20px'
                        }}>
                          {selectedBooking.remainingSessions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.validity > 0 && (
                  <div className="mt-3 mt-md-4 p-3 p-md-4 bg-white rounded" style={{
                    border: '1px solid #2f6a87',
                    borderRadius: '12px',
                    backgroundColor: '#f0f7fa'
                  }}>
                    <div className="d-flex align-items-center mb-1 mb-md-2">
                      <h5 className="mb-0" style={{ color: '#333', fontSize: 'clamp(1rem, 1.5vw, 1.1rem)' }}>Plan Active</h5>
                    </div>
                    <p className="mb-0 text-muted" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1rem)' }}>
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
                padding: 'clamp(6px, 1vw, 8px) clamp(16px, 2vw, 24px)',
                transition: 'background-color 0.3s ease',
                fontSize: 'clamp(0.9rem, 1.2vw, 1rem)'
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