import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Table, Button, Modal } from 'react-bootstrap';
import { FaEye, FaCalendar, FaClock, FaUser, FaDollarSign, FaEnvelope, FaPhone, FaRupeeSign } from 'react-icons/fa';

const PersonalPlansBookings = () => {
  const [selectedPlanTab, setSelectedPlanTab] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Personal Training Plans (Read-only, comes from admin)
  const personalPlans = [
    { id: 1, name: "Basic  Training", sessions: 6, validity: 30, price: "₹4,999" },
    { id: 2, name: "Advanced  Training", sessions: 12, validity: 60, price: "₹8,999" },
    { id: 3, name: "Elite  Training", sessions: 20, validity: 90, price: "₹14,999" },
  ];

  // Mock customer data for each plan (what trainer needs to see)
  const planCustomers = {
    1: [ // Basic 1:1 Training
      {
        id: 101,
        name: "Rahul Sharma",
        purchaseDate: "2025-05-15",
        expiryDate: "2025-06-14",
        sessionsBooked: 2,
        sessionsRemaining: 4,
        contact: "+91 98765 43210",
        email: "rahul.sharma@email.com"
      },
      {
        id: 102,
        name: "Priya Mehta",
        purchaseDate: "2025-05-10",
        expiryDate: "2025-06-09",
        sessionsBooked: 4,
        sessionsRemaining: 2,
        contact: "+91 98765 43211",
        email: "priya.mehta@email.com"
      }
    ],
    2: [ // Advanced 1:1 Training
      {
        id: 103,
        name: "Amit Kumar",
        purchaseDate: "2025-05-20",
        expiryDate: "2025-07-19",
        sessionsBooked: 5,
        sessionsRemaining: 7,
        contact: "+91 98765 43212",
        email: "amit.kumar@email.com"
      },
      {
        id: 104,
        name: "Neha Gupta",
        purchaseDate: "2025-05-05",
        expiryDate: "2025-07-04",
        sessionsBooked: 8,
        sessionsRemaining: 4,
        contact: "+91 98765 43213",
        email: "neha.gupta@email.com"
      }
    ],
    3: [ // Elite 1:1 Training
      {
        id: 105,
        name: "Anjali Patel",
        purchaseDate: "2025-05-25",
        expiryDate: "2025-08-23",
        sessionsBooked: 5,
        sessionsRemaining: 15,
        contact: "+91 98765 43214",
        email: "anjali.patel@email.com"
      },
      {
        id: 106,
        name: "Rajesh Verma",
        purchaseDate: "2025-05-12",
        expiryDate: "2025-08-10",
        sessionsBooked: 10,
        sessionsRemaining: 10,
        contact: "+91 98765 43215",
        email: "rajesh.verma@email.com"
      }
    ]
  };

  // Get customers for selected plan
  const getCustomersForPlan = (planId) => {
    return planCustomers[planId] || [];
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

  return (
    <div className=" bg-light py-2">
      <Container fluid className="px-3 px-md-3">
        <h1 className=" mb-5 fw-bold text-dark" style={{ color: '#2f6a87', fontSize: '2rem' }}>
           Personal Training Plans & Bookings
        </h1>

        {/* Plans as Cards */}
        <div className="mb-3">
         
          <Row className="g-4">
            {personalPlans.map((plan) => (
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
                  onClick={() => setSelectedPlanTab(plan.id)}
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
                          <FaUser size={16} className="text-muted" />
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                            {getCustomersForPlan(plan.id).length} Customer{getCustomersForPlan(plan.id).length !== 1 ? 's' : ''}
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
                          setSelectedPlanTab(plan.id);
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
                        View Customers
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Customer Details Tabs */}
        {selectedPlanTab && (
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <Card.Header className="bg-white border-0 pb-0">
              <Nav variant="tabs" className="border-bottom" >
                <Nav.Item>
                  <Nav.Link 
                    className="fs-6 px-4 py-3 fw-600"
                    style={{ 
                      color: '#2f6a87',
                      borderColor: '#2f6a87'
                    }}
                  >
                    {personalPlans.find(p => p.id === selectedPlanTab)?.name} Customers
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body>
              <div className="mb-4 p-3 bg-light rounded">
                <h5 className="fw-bold mb-2" style={{ color: '#2f6a87' }}>
                  {personalPlans.find(p => p.id === selectedPlanTab)?.name}
                </h5>
                <div className="d-flex flex-wrap gap-4 text-muted">
                  <div className="d-flex align-items-center gap-2">
                    <FaClock size={16} />
                    <span>{personalPlans.find(p => p.id === selectedPlanTab)?.sessions} Total Sessions</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FaCalendar size={16} />
                    <span>{personalPlans.find(p => p.id === selectedPlanTab)?.validity} Days Validity</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <FaUser size={16} />
                    <span>{getCustomersForPlan(selectedPlanTab).length} Customers</span>
                  </div>
                </div>
              </div>
              
              {/* Customers Table */}
              <div className="table-responsive">
                <Table hover responsive className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>#</th>
                      <th className="py-3" style={{ backgroundColor: '#f8f9fa', color: '#2f6a87' }}>Customer Name</th>
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
                      
                      if (customers.length === 0) {
                        return (
                          <tr>
                            <td colSpan="8" className="text-center py-5">
                              <div className="text-muted">No customers have purchased this plan yet.</div>
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
                            <strong style={{ color: '#2f6a87' }}>{customer.name}</strong>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendar size={14} className="text-muted" />
                              <span>{customer.purchaseDate}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center gap-2">
                              <FaCalendar size={14} className="text-muted" />
                              <span>{customer.expiryDate}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-primary" style={{ backgroundColor: '#2f6a87', color: 'white' }}>
                              {customer.sessionsBooked}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="badge bg-success">
                              {customer.sessionsRemaining}
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

        {/* Customer Details Modal */}
        <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600' }}>
              Customer Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCustomer && (
              <div className="p-4">
                <div className="row mb-4">
                  <div className="col-md-8">
                    <h4 className="fw-bold mb-3" style={{ color: '#333' }}>{selectedCustomer.name}</h4>
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
                          <div className="fw-medium">{selectedCustomer.contact}</div>
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
                    <div className="p-3 bg-light rounded">
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendar className="me-2" style={{ color: '#2f6a87' }} />
                        <h6 className="mb-0 text-muted">Purchase Date</h6>
                      </div>
                      <div className="fw-bold" style={{ fontSize: '1.2rem' }}>{selectedCustomer.purchaseDate}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded" >
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendar className="me-2" style={{ color: '#dc3545' }} />
                        <h6 className="mb-0 text-muted">Expiry Date</h6>
                      </div>
                      <div className="fw-bold" style={{ fontSize: '1.2rem' }}>{selectedCustomer.expiryDate}</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded" style={{ border: '2px solid #2f6a87', borderRadius: '12px' }}>
                  <h5 className="fw-bold mb-4" style={{ color: '#2f6a87' }}>Training Sessions</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="fw-bold" style={{ fontSize: '1.8rem', color: '#2f6a87' }}>{selectedCustomer.sessionsBooked}</div>
                        <div className="text-muted">Sessions Completed</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="fw-bold" style={{ fontSize: '1.8rem', color: '#2f6a87' }}>{selectedCustomer.sessionsRemaining}</div>
                        <div className="text-muted">Sessions Remaining</div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center p-3 bg-light rounded">
                        <div className="fw-bold" style={{ fontSize: '1.8rem', color: '#2f6a87' }}>
                          {selectedCustomer.sessionsBooked + selectedCustomer.sessionsRemaining}
                        </div>
                        <div className="text-muted">Total Sessions</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* <div className="mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Progress: {Math.round((selectedCustomer.sessionsBooked / (selectedCustomer.sessionsBooked + selectedCustomer.sessionsRemaining)) * 100)}%</span>
                      <span>{selectedCustomer.sessionsBooked}/{selectedCustomer.sessionsBooked + selectedCustomer.sessionsRemaining}</span>
                    </div>
                    <div className="progress" style={{ height: '12px', borderRadius: '6px' }}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ 
                          width: `${Math.round((selectedCustomer.sessionsBooked / (selectedCustomer.sessionsBooked + selectedCustomer.sessionsRemaining)) * 100)}%`,
                          backgroundColor: '#2f6a87',
                          borderRadius: '6px'
                        }}
                      ></div>
                    </div>
                  </div> */}
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

export default PersonalPlansBookings;