import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Table, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaCalendar, FaClock, FaUsers, FaRupeeSign, FaEnvelope, FaPhone } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance'; // Adjust the import path as needed

const GroupPlansBookings = () => {
  const [selectedPlanTab, setSelectedPlanTab] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [groupPlans, setGroupPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planMembers, setPlanMembers] = useState({});
  const [membersLoading, setMembersLoading] = useState({});

  // Fetch group plans from API
  useEffect(() => {
    const fetchGroupPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosInstance.get('/group-plans'); // Adjust API endpoint as needed
        
        // Handle API response according to the provided structure
        if (response.data.success) {
          const plans = response.data.data.plans;
          
          // Transform API data to match component structure
          const transformedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.name,
            type: plan.type,
            sessions: plan.sessions,
            validity: plan.validity,
            price: `₹${(plan.priceCents / 100).toLocaleString('en-IN')}`,
            priceCents: plan.priceCents,
            currency: plan.currency,
            active: plan.active,
            branch: plan.branch,
            createdBy: plan.createdBy,
            memberCount: plan._count.memberPlans
          }));
          
          setGroupPlans(transformedPlans);
        } else {
          throw new Error(response.data.message || 'Failed to fetch group plans');
        }
      } catch (err) {
        console.error('Error fetching group plans:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load group plans');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupPlans();
  }, []);

  // Fetch members for a specific plan
  const fetchPlanMembers = async (planId) => {
    try {
      setMembersLoading(prev => ({ ...prev, [planId]: true }));
      
      const response = await axiosInstance.get(`/group-plans/${planId}/members`); // Adjust API endpoint as needed
      
      if (response.data.success) {
        setPlanMembers(prev => ({
          ...prev,
          [planId]: response.data.data.members || []
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch plan members');
      }
    } catch (err) {
      console.error(`Error fetching members for plan ${planId}:`, err);
      setPlanMembers(prev => ({
        ...prev,
        [planId]: []
      }));
    } finally {
      setMembersLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  // Handle plan selection
  const handlePlanSelect = (planId) => {
    setSelectedPlanTab(planId);
    
    // Fetch members if not already loaded
    if (!planMembers[planId] && !membersLoading[planId]) {
      fetchPlanMembers(planId);
    }
  };

  // Get customers for selected plan
  const getCustomersForPlan = (planId) => {
    return planMembers[planId] || [];
  };

  // Handle view customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  // Get status indicator
  const getStatusIndicator = (sessionsRemaining, expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (sessionsRemaining === 0) {
      return <span className="badge bg-secondary">Sessions Completed</span>;
    }
    
    if (expiry < today) {
      return <span className="badge bg-danger">Expired</span>;
    }
    
    return <span className="badge bg-success">Active</span>;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <Container className="text-center">
          <Spinner animation="border" role="status" style={{ color: '#2f6a87', width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading group plans...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-light min-vh-100">
        <Container className="px-md-5 py-5">
          <Alert variant="danger" className="text-center">
            <h5>Error Loading Group Plans</h5>
            <p className="mb-0">{error}</p>
            <Button 
              variant="outline-danger" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-light">
      <Container className="px-md-5">
        <h1 className="mb-5 fw-bold text-dark" style={{ color: '#2f6a87', fontSize: '2.2rem' }}>
          Group Training Plans & Bookings
        </h1>

        {/* Plans as Cards */}
        <div className="mb-5">
          {groupPlans.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">No group plans available.</div>
            </div>
          ) : (
            <Row className="g-4">
              {groupPlans.map((plan) => (
                <Col xs={12} sm={6} lg={4} key={plan.id}>
                  <Card 
                    className="h-100 shadow-sm border-0"
                    style={{ 
                      borderRadius: '16px', 
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                      border: selectedPlanTab === plan.id ? '3px solid #2f6a87' : '1px solid #e9ecef'
                    }}
                    onClick={() => handlePlanSelect(plan.id)}
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
                          {plan.type?.toUpperCase() || 'GROUP'} PLAN
                        </div>
                        <h4 className="fw-bold mb-1" style={{ color: '#2f6a87', fontSize: '1.3rem' }}>{plan.name}</h4>
                        <small className="text-muted">Branch: {plan.branch?.name || 'N/A'}</small>
                      </div>
                      <ul className="list-unstyled mb-4 flex-grow-1">
                        <li className="mb-3 d-flex align-items-center gap-3">
                          <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                            <FaClock size={16} className="text-muted" />
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{plan.sessions} Sessions</div>
                          </div>
                        </li>
                        <li className="mb-3 d-flex align-items-center gap-3">
                          <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                            <FaCalendar size={16} className="text-muted" />
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: '1.1rem' }}>Validity: {plan.validity} Days</div>
                          </div>
                        </li>
                        <li className="mb-3 d-flex align-items-center gap-3">
                          <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                            <FaUsers size={16} className="text-muted" />
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                              {plan.memberCount} Member{plan.memberCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </li>
                        <li className="mb-3 d-flex align-items-center gap-3">
                          <div className="bg-light rounded-circle p-2" style={{ width: '40px', height: '40px' }}>
                            <FaRupeeSign size={16} className="text-muted" />
                          </div>
                          <div>
                            <div className="fw-bold" style={{ fontSize: '1.1rem' }}>Price: {plan.price}</div>
                          </div>
                        </li>
                      </ul>
                      <div className="text-center">
                        <Button
                          variant="outline-primary"
                          size="md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlanSelect(plan.id);
                          }}
                          style={{
                            borderColor: '#2f6a87',
                            color: '#2f6a87',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#2f6a87';
                            e.target.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#2f6a87';
                          }}
                        >
                          View Members
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Customer Details Tabs */}
        {selectedPlanTab && (
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <Card.Header className="bg-white border-0 pb-0">
              <Nav variant="tabs" className="border-bottom" style={{ borderColor: '#2f6a87' }}>
                <Nav.Item>
                  <Nav.Link 
                    className="fs-6 px-4 py-3 fw-medium"
                    style={{ 
                      color: '#2f6a87',
                      borderColor: '#2f6a87',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    {groupPlans.find(p => p.id === selectedPlanTab)?.name} Members
                    {membersLoading[selectedPlanTab] && (
                      <Spinner animation="border" size="sm" className="ms-2" />
                    )}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body>
              <div className="mb-4 p-3 bg-light rounded" style={{ borderLeft: '4px solid #2f6a87' }}>
                <h5 className="fw-bold mb-2" style={{ color: '#2f6a87' }}>
                  {groupPlans.find(p => p.id === selectedPlanTab)?.name}
                </h5>
                <div className="d-flex flex-wrap gap-4 text-muted">
                  <div className="d-flex align-items-center gap-2">
                    <FaClock size={16} />
                    <span>{groupPlans.find(p => p.id === selectedPlanTab)?.sessions} Total Sessions</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FaCalendar size={16} />
                    <span>{groupPlans.find(p => p.id === selectedPlanTab)?.validity} Days Validity</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FaUsers size={16} />
                    <span>{getCustomersForPlan(selectedPlanTab).length} Members</span>
                  </div>
                </div>
              </div>
              
              {/* Members Table */}
              <div className="table-responsive">
                <Table hover responsive className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>#</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Member Name</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Purchase Date</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Expiry Date</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Sessions Booked</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Sessions Remaining</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Status</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const customers = getCustomersForPlan(selectedPlanTab);
                      
                      if (membersLoading[selectedPlanTab]) {
                        return (
                          <tr>
                            <td colSpan="8" className="text-center py-5">
                              <Spinner animation="border" role="status" style={{ color: '#2f6a87' }}>
                                <span className="visually-hidden">Loading members...</span>
                              </Spinner>
                              <p className="mt-2 text-muted">Loading members...</p>
                            </td>
                          </tr>
                        );
                      }
                      
                      if (customers.length === 0) {
                        return (
                          <tr>
                            <td colSpan="8" className="text-center py-5">
                              <div className="text-muted">No members have purchased this group plan yet.</div>
                            </td>
                          </tr>
                        );
                      }
                      
                      return customers.map((customer, index) => (
                        <tr key={customer.id} style={{ transition: 'background-color 0.2s ease' }} 
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                          <td className="py-3 fw-bold">{index + 1}</td>
                          <td className="py-3">
                            <strong style={{ color: '#2f6a87' }}>
                              {customer.firstName} {customer.lastName}
                            </strong>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendar size={14} className="text-muted" />
                              <span>{formatDate(customer.purchaseDate)}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendar size={14} className="text-muted" />
                              <span>{formatDate(customer.expiryDate)}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-primary" style={{ backgroundColor: '#2f6a87', color: 'white' }}>
                              {customer.sessionsAttended || 0}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-success">
                              {customer.sessionsRemaining || 0}
                            </span>
                          </td>
                          <td className="py-3">
                            {getStatusIndicator(customer.sessionsRemaining, customer.expiryDate)}
                          </td>
                          <td className="py-3">
                            <Button
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                              style={{
                                backgroundColor: 'transparent',
                                borderColor: 'transparent',
                                color: '#2f6a87',
                                padding: '6px 10px',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#f0f7fa';
                                e.target.style.color = '#2f6a87';
                                e.target.style.transform = 'scale(1.1)';
                                e.target.style.boxShadow = '0 4px 8px rgba(47, 106, 135, 0.2)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#2f6a87';
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}
                            >
                              <FaEye size={18} />
                            </Button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Member Details Modal */}
        <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600' }}>
              Member Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCustomer && (
              <div className="p-4">
                <div className="row mb-4">
                  <div className="col-md-8">
                    <h4 className="fw-bold mb-3" style={{ color: '#333' }}>
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h4>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-3 rounded" style={{ width: '50px', height: '50px' }}>
                          <FaEnvelope size={24} className="text-muted" />
                        </div>
                        <div>
                          <div className="text-muted small">Email</div>
                          <div className="fw-medium">{selectedCustomer.email}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-3 rounded" style={{ width: '50px', height: '50px' }}>
                          <FaPhone size={24} className="text-muted" />
                        </div>
                        <div>
                          <div className="text-muted small">Phone</div>
                          <div className="fw-medium">{selectedCustomer.phone || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-center">
                    <div className="p-4 rounded" style={{ 
                      backgroundColor: selectedCustomer.sessionsRemaining > 0 ? '#d4edda' : '#f8d7da',
                      color: selectedCustomer.sessionsRemaining > 0 ? '#155724' : '#721c24',
                      border: `2px solid ${selectedCustomer.sessionsRemaining > 0 ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                      <div className="fw-bold text-uppercase">
                        {selectedCustomer.sessionsRemaining > 0 ? 'Active' : 'Expired'}
                      </div>
                      <div className="small">Status</div>
                    </div>
                  </div>
                </div>
                
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded" style={{ borderLeft: '4px solid #2f6a87' }}>
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendar className="me-2" style={{ color: '#2f6a87' }} />
                        <h6 className="mb-0 text-muted">Purchase Date</h6>
                      </div>
                      <div className="fw-bold" style={{ fontSize: '1.2rem' }}>
                        {formatDate(selectedCustomer.purchaseDate)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded">
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendar className="me-2" style={{ color: '#dc3545' }} />
                        <h6 className="mb-0 text-muted">Expiry Date</h6>
                      </div>
                      <div className="fw-bold" style={{ fontSize: '1.2rem' }}>
                        {formatDate(selectedCustomer.expiryDate)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded" style={{ border: '2px solid #2f6a87', borderRadius: '12px' }}>
                  <h5 className="fw-bold mb-4" style={{ color: '#2f6a87' }}>Group Class Sessions</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="fw-bold" style={{ fontSize: '1.8rem', color: '#2f6a87' }}>
                          {selectedCustomer.sessionsAttended || 0}
                        </div>
                        <div className="text-muted">Sessions Attended</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="fw-bold" style={{ fontSize: '1.8rem', color: '#2f6a87' }}>
                          {selectedCustomer.sessionsRemaining || 0}
                        </div>
                        <div className="text-muted">Sessions Remaining</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="fw-bold" style={{ fontSize: '1.8rem', color: '#2f6a87' }}>
                          {(selectedCustomer.sessionsAttended || 0) + (selectedCustomer.sessionsRemaining || 0)}
                        </div>
                        <div className="text-muted">Total Sessions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #eee' }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowCustomerModal(false)}
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
    </div>
  );
};

export default GroupPlansBookings;