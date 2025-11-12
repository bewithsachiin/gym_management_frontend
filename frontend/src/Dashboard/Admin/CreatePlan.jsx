import React, { useState } from 'react';
import { Container, Row, Col, Nav, Tab, Button, Card, Alert, Modal, Form, Table } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const CreatePlan = () => {
  const [activeTab, setActiveTab] = useState('group');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState({ id: null, type: null });
  const [newPlan, setNewPlan] = useState({
    name: '',
    sessions: '',
    validity: '',
    price: '',
    type: 'group'
  });

  // Plans (Admin-created only)
  const [groupPlans, setGroupPlans] = useState([
    { id: 1, name: "Starter Pack", sessions: 8, validity: 30, price: "₹2,499", active: true },
    { id: 2, name: "Pro Pack", sessions: 16, validity: 60, price: "₹4,499", active: true },
    { id: 3, name: "Unlimited", sessions: 30, validity: 90, price: "₹7,999", active: true },
  ]);

  const [personalPlans, setPersonalPlans] = useState([
    { id: 4, name: "Basic 1:1", sessions: 6, validity: 30, price: "₹4,999", active: true },
    { id: 5, name: "Advanced 1:1", sessions: 12, validity: 60, price: "₹8,999", active: true },
    { id: 6, name: "Elite 1:1", sessions: 20, validity: 90, price: "₹14,999", active: true },
  ]);

  // Mock Booking Requests from Members
  const [bookingRequests, setBookingRequests] = useState([
    {
      id: 101,
      memberName: "Rahul Sharma",
      planName: "Pro Pack",
      planType: "Group",
      sessions: 16,
      validity: 60,
      sessionsUsed: 1,
      requestedAt: "2025-05-20 10:30 AM",
      status: "pending"
    },
    {
      id: 102,
      memberName: "Priya Patel",
      planName: "Advanced 1:1",
      planType: "Personal",
      sessions: 12,
      validity: 60,
      sessionsUsed: 1,
      requestedAt: "2025-05-20 11:15 AM",
      status: "approved"
    },
    {
      id: 103,
      memberName: "Amit Kumar",
      planName: "Starter Pack",
      planType: "Group",
      sessions: 8,
      validity: 30,
      sessionsUsed: 1,
      requestedAt: "2025-05-19 03:45 PM",
      status: "rejected"
    },
    {
      id: 104,
      memberName: "Neha Gupta",
      planName: "Elite 1:1",
      planType: "Personal",
      sessions: 20,
      validity: 90,
      sessionsUsed: 1,
      requestedAt: "2025-05-21 09:00 AM",
      status: "pending"
    },
  ]);

  // Handle Plan Creation
  const handleCreatePlan = () => {
    if (!newPlan.name || !newPlan.sessions || !newPlan.validity || !newPlan.price) {
      alert("Please fill all fields");
      return;
    }

    const plan = {
      id: Date.now(),
      name: newPlan.name,
      sessions: parseInt(newPlan.sessions),
      validity: parseInt(newPlan.validity),
      price: `₹${newPlan.price}`,
      active: true
    };

    if (newPlan.type === 'group') {
      setGroupPlans([...groupPlans, plan]);
    } else {
      setPersonalPlans([...personalPlans, plan]);
    }

    setNewPlan({ name: '', sessions: '', validity: '', price: '', type: activeTab === 'personal' ? 'personal' : 'group' });
    setShowCreateModal(false);
    alert(`✅ ${newPlan.type === 'group' ? 'Group' : 'Personal'} Plan Created: ${plan.name}`);
  };

  // Handle Plan Edit
  const handleEditPlan = (plan, planType) => {
    setSelectedPlan({ ...plan, type: planType });
    setNewPlan({
      name: plan.name,
      sessions: plan.sessions.toString(),
      validity: plan.validity.toString(),
      price: plan.price.replace('₹', ''),
      type: planType
    });
    setShowEditModal(true);
  };

  // Handle Plan Update
  const handleUpdatePlan = () => {
    if (!newPlan.name || !newPlan.sessions || !newPlan.validity || !newPlan.price) {
      alert("Please fill all fields");
      return;
    }

    const updatedPlan = {
      ...selectedPlan,
      name: newPlan.name,
      sessions: parseInt(newPlan.sessions),
      validity: parseInt(newPlan.validity),
      price: `₹${newPlan.price}`
    };

    if (selectedPlan.type === 'group') {
      setGroupPlans(groupPlans.map(p => p.id === selectedPlan.id ? updatedPlan : p));
    } else {
      setPersonalPlans(personalPlans.map(p => p.id === selectedPlan.id ? updatedPlan : p));
    }

    setNewPlan({ name: '', sessions: '', validity: '', price: '', type: 'group' });
    setShowEditModal(false);
    setSelectedPlan(null);
    alert(`✅ Plan Updated: ${updatedPlan.name}`);
  };

  // Handle Plan Delete
  const handleDeletePlan = (planId, planType) => {
    setPlanToDelete({ id: planId, type: planType });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    const { id, type } = planToDelete;
    if (type === 'group') {
      setGroupPlans(groupPlans.filter(p => p.id !== id));
    } else {
      setPersonalPlans(personalPlans.filter(p => p.id !== id));
    }
    setShowDeleteModal(false);
    alert("✅ Plan Deleted!");
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlanToDelete({ id: null, type: null });
  };

  // Handle Plan Toggle (Activate/Deactivate)
  const handleTogglePlan = (planId, planType) => {
    if (planType === 'group') {
      setGroupPlans(groupPlans.map(p =>
        p.id === planId ? { ...p, active: !p.active } : p
      ));
    } else {
      setPersonalPlans(personalPlans.map(p =>
        p.id === planId ? { ...p, active: !p.active } : p
      ));
    }
    alert(`✅ Plan ${planType === 'group' ? 'Group' : 'Personal'} updated!`);
  };

  // Handle Request Approval
  const handleApproveRequest = (requestId) => {
    setBookingRequests(
      bookingRequests.map(req =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      )
    );
    alert("✅ Booking Approved! Member will be notified.");
  };

  // Handle Request Rejection
  const handleRejectRequest = (requestId) => {
    setBookingRequests(
      bookingRequests.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
    alert("❌ Booking Rejected. Member will be notified.");
  };

  // Filter requests by status
  const pendingRequests = bookingRequests.filter(r => r.status === 'pending');
  const approvedRequests = bookingRequests.filter(r => r.status === 'approved');
  const rejectedRequests = bookingRequests.filter(r => r.status === 'rejected');

  return (
    <div className=" bg-light  md-5">
      <Container  className=" px-md-5">
        <h1 className=" mb-md-5 fw-bold text-dark" style={{ fontSize: '2.2rem' }}>
          Plan & Booking Management
        </h1>

        {/* Button-style Tabs */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 p-3 bg-white rounded shadow-sm border">
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'group' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('group')}
              className="px-4 py-2 fw-medium d-flex align-items-center gap-2"
              style={{
                backgroundColor: activeTab === 'group' ? '#2f6a87' : 'transparent',
                borderColor: '#2f6a87',
                color: activeTab === 'group' ? 'white' : '#2f6a87',
                transition: 'all 0.3s ease'
              }}
            >
              <span>Group Class Plans</span>
            </Button>
            <Button
              variant={activeTab === 'personal' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('personal')}
              className="px-4 py-2 fw-medium d-flex align-items-center gap-2"
              style={{
                backgroundColor: activeTab === 'personal' ? '#2f6a87' : 'transparent',
                borderColor: '#2f6a87',
                color: activeTab === 'personal' ? 'white' : '#2f6a87',
                transition: 'all 0.3s ease'
              }}
            >
              <span>Personal Training Plans</span>
            </Button>
          </div>
          <Button
            variant="outline-primary"
            onClick={() => {
              setNewPlan(prev => ({
                ...prev,
                type: activeTab === "personal" ? "personal" : "group",
              }));
              setShowCreateModal(true);
            }}
            className="px-4 py-2 d-flex align-items-center gap-2 fw-medium"
            style={{
              borderColor: "#2f6a87",
              color: "#2f6a87",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#2f6a87";
              e.currentTarget.style.color = "white";
              const icon = e.currentTarget.querySelector("i");
              if (icon) {
                icon.style.transform = " scale(1.2)";
                icon.style.transition = "all 0.3s ease";
                icon.style.color = "white"; 
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#2f6a87";
              const icon = e.currentTarget.querySelector("i");
              if (icon) {
                icon.style.transform = "rotate(0deg) scale(1)";
                icon.style.color = "inherit"; // back to same as text
              }
            }}
          >
            <i className="bi bi-plus me-2"></i>
            Create New Plan
          </Button>

        </div>

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Row>
            <Col md={12}>
              <Tab.Content>

                {/* Group Plans Tab */}
                <Tab.Pane eventKey="group">
                  <Row className="g-4">
                    {groupPlans.map((plan) => (
                      <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex">
                        <Card className="h-100 shadow-sm border-0 w-100" style={{ borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                          <div style={{
                            height: '6px',
                            backgroundColor: plan.active ? '#2f6a87' : '#ccc',
                            width: '100%'
                          }}></div>
                          <Card.Body className="d-flex flex-column p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <div className="badge bg-primary mb-2 px-3 py-2" style={{ backgroundColor: '#2f6a87', color: 'white' }}>GROUP</div>
                                <h5 className="fw-bold mb-0" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>{plan.name}</h5>
                              </div>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-2 rounded-circle"
                                  style={{
                                    color: '#6c757d',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#6c757d'}
                                  onMouseOut={(e) => e.target.style.color = '#6c757d'}
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setShowViewModal(true);
                                  }}
                                >
                                  <FaEye size={16} />
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-2 rounded-circle"
                                  style={{
                                    color: '#0d6efd',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#0d6efd'}
                                  onMouseOut={(e) => e.target.style.color = '#0d6efd'}
                                  onClick={() => handleEditPlan(plan, 'group')}
                                >
                                  <FaEdit size={16} />
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-2 rounded-circle"
                                  style={{
                                    color: '#dc3545',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#dc3545'}
                                  onMouseOut={(e) => e.target.style.color = '#dc3545'}
                                  onClick={() => handleDeletePlan(plan.id, 'group')}
                                >
                                  <FaTrash size={16} />
                                </Button>
                              </div>
                            </div>
                            <ul className="list-unstyled mb-4 flex-grow-1">
                              <li className="mb-3 d-flex align-items-center gap-2">
                                <span className="text-muted">🎯</span>
                                <strong>{plan.sessions} Sessions</strong>
                              </li>
                              <li className="mb-3 d-flex align-items-center gap-2">
                                <span className="text-muted">📅</span>
                                <strong>Validity: {plan.validity} Days</strong>
                              </li>
                              <li className="mb-3 d-flex align-items-center gap-2">
                                <span className="text-muted">💰</span>
                                <strong>Price: {plan.price}</strong>
                              </li>
                            </ul>
                            <div className="d-flex gap-2 mt-auto">
                              {plan.active ? (
                                <Button
                                  size="sm"
                                  className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-medium"
                                  onClick={() => handleTogglePlan(plan.id, 'group')}
                                  style={{
                                    backgroundColor: '#2f6a87',
                                    borderColor: '#2f6a87',
                                    color: 'white',
                                    transition: 'background-color 0.3s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
                                >
                                  <FaToggleOn size={14} /> Active
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-medium"
                                  onClick={() => handleTogglePlan(plan.id, 'group')}
                                  style={{
                                    backgroundColor: '#6c757d',
                                    borderColor: '#6c757d',
                                    color: 'white',
                                    transition: 'background-color 0.3s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                                >
                                  <FaToggleOff size={14} /> Inactive
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>

                {/* Personal Plans Tab */}
                <Tab.Pane eventKey="personal">
                  <Row className="g-4">
                    {personalPlans.map((plan) => (
                      <Col xs={12} sm={6} lg={4} key={plan.id} className="d-flex">
                        <Card className="h-100 shadow-sm border-0 w-100" style={{ borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                          <div style={{
                            height: '6px',
                            backgroundColor: plan.active ? '#2f6a87' : '#ccc',
                            width: '100%'
                          }}></div>
                          <Card.Body className="d-flex flex-column p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <div className="badge bg-primary mb-2 px-3 py-2" style={{ backgroundColor: '#2f6a87', color: 'white' }}>PERSONAL</div>
                                <h5 className="fw-bold mb-0" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>{plan.name}</h5>
                              </div>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-2 rounded-circle"
                                  style={{
                                    color: '#6c757d',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#6c757d'}
                                  onMouseOut={(e) => e.target.style.color = '#6c757d'}
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setShowViewModal(true);
                                  }}
                                >
                                  <FaEye size={16} />
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-2 rounded-circle"
                                  style={{
                                    color: '#0d6efd',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#0d6efd'}
                                  onMouseOut={(e) => e.target.style.color = '#0d6efd'}
                                  onClick={() => handleEditPlan(plan, 'personal')}
                                >
                                  <FaEdit size={16} />
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-2 rounded-circle"
                                  style={{
                                    color: '#dc3545',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.color = '#dc3545'}
                                  onMouseOut={(e) => e.target.style.color = '#dc3545'}
                                  onClick={() => handleDeletePlan(plan.id, 'personal')}
                                >
                                  <FaTrash size={16} />
                                </Button>
                              </div>
                            </div>
                            <ul className="list-unstyled mb-4 flex-grow-1">
                              <li className="mb-3 d-flex align-items-center gap-2">
                                <span className="text-muted">🎯</span>
                                <strong>{plan.sessions} Sessions</strong>
                              </li>
                              <li className="mb-3 d-flex align-items-center gap-2">
                                <span className="text-muted">📅</span>
                                <strong>Validity: {plan.validity} Days</strong>
                              </li>
                              <li className="mb-3 d-flex align-items-center gap-2">
                                <span className="text-muted">💰</span>
                                <strong>Price: {plan.price}</strong>
                              </li>
                            </ul>
                            <div className="d-flex gap-2 mt-auto">
                              {plan.active ? (
                                <Button
                                  size="sm"
                                  className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-medium"
                                  onClick={() => handleTogglePlan(plan.id, 'personal')}
                                  style={{
                                    backgroundColor: '#2f6a87',
                                    borderColor: '#2f6a87',
                                    color: 'white',
                                    transition: 'background-color 0.3s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
                                >
                                  <FaToggleOn size={14} /> Active
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-medium"
                                  onClick={() => handleTogglePlan(plan.id, 'personal')}
                                  style={{
                                    backgroundColor: '#6c757d',
                                    borderColor: '#6c757d',
                                    color: 'white',
                                    transition: 'background-color 0.3s ease'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                                >
                                  <FaToggleOff size={14} /> Inactive
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>

        {/* Booking Requests Section */}
        <div className="mt-5 pt-4 border-top" style={{ borderColor: '#2f6a87' }}>
          <h3 className="fw-bold mb-4 text-dark" style={{ fontSize: '1.4rem' }}>Member Booking Requests</h3>

          {/* Summary Cards */}
          <Row className="mb-4 g-3">
            <Col xs={12} sm={4}>
              <Card className="text-center border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', transition: 'transform 0.3s ease' }}>
                <Card.Body className="py-4">
                  <div className="d-flex justify-content-center align-items-center mb-2" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff3cd', margin: '0 auto' }}>
                    <span className="fw-bold" style={{ color: '#856404', fontSize: '1.5rem' }}>{pendingRequests.length}</span>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: '#2f6a87' }}>Pending Requests</h5>
                  <p className="mb-0 text-muted">Awaiting your approval</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={4}>
              <Card className="text-center border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', transition: 'transform 0.3s ease' }}>
                <Card.Body className="py-4">
                  <div className="d-flex justify-content-center align-items-center mb-2" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#d1ecf1', margin: '0 auto' }}>
                    <span className="fw-bold" style={{ color: '#0c5460', fontSize: '1.5rem' }}>{approvedRequests.length}</span>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: '#2f6a87' }}>Approved Bookings</h5>
                  <p className="mb-0 text-muted">Successfully processed</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={4}>
              <Card className="text-center border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', transition: 'transform 0.3s ease' }}>
                <Card.Body className="py-4">
                  <div className="d-flex justify-content-center align-items-center mb-2" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f8d7da', margin: '0 auto' }}>
                    <span className="fw-bold" style={{ color: '#721c24', fontSize: '1.5rem' }}>{rejectedRequests.length}</span>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: '#2f6a87' }}>Rejected Requests</h5>
                  <p className="mb-0 text-muted">Declined by admin</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Requests Table */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <Card.Header className="bg-light border-0 pb-3" style={{ borderBottom: '3px solid #2f6a87', borderRadius: '12px 12px 0 0' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0 text-dark" style={{ fontWeight: '600' }}>All Booking Requests</h5>
                  <small className="text-muted">Total: {bookingRequests.length} requests</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {bookingRequests.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <div className="display-4 mb-3">📭</div>
                  <p className="fs-5">No booking requests yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover responsive className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3">#</th>
                        <th className="py-3">Member</th>
                        <th className="py-3">Plan</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Sessions</th>
                        <th className="py-3">Validity</th>
                        <th className="py-3">Requested At</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingRequests.map((req, index) => (
                        <tr key={req.id} style={{ transition: 'background-color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}>
                          <td className="py-3">{index + 1}</td>
                          <td className="py-3"><strong>{req.memberName}</strong></td>
                          <td className="py-3">{req.planName}</td>
                          <td className="py-3">
                            {req.planType === 'Group' ? (
                              <span className="badge bg-primary px-3 py-2" style={{ backgroundColor: '#2f6a87', color: 'white', borderRadius: '20px' }}>Group</span>
                            ) : (
                              <span className="badge bg-primary px-3 py-2" style={{ backgroundColor: '#2f6a87', color: 'white', borderRadius: '20px' }}>Personal</span>
                            )}
                          </td>
                          <td className="py-3">{req.sessions} total</td>
                          <td className="py-3">{req.validity} days</td>
                          <td className="py-3">{req.requestedAt}</td>
                          <td className="py-3">
                            {req.status === 'pending' && <span className="badge bg-warning text-dark px-3 py-2" style={{ borderRadius: '20px' }}>Pending</span>}
                            {req.status === 'approved' && <span className="badge px-3 py-2" style={{ backgroundColor: '#2f6a87', color: 'white', borderRadius: '20px' }}>Approved</span>}
                            {req.status === 'rejected' && <span className="badge bg-danger px-3 py-2" style={{ borderRadius: '20px' }}>Rejected</span>}
                          </td>
                          <td className="py-3">
                            {req.status === 'pending' && (
                              <div className="d-flex gap-2 align-items-center flex-nowrap" style={{ minWidth: 'fit-content' }}>
                                <Button
                                  size="sm"
                                  className="d-flex align-items-center gap-1 fw-medium"
                                  onClick={() => handleApproveRequest(req.id)}
                                  style={{
                                    backgroundColor: '#2f6a87',
                                    borderColor: '#2f6a87',
                                    color: 'white',
                                    transition: 'background-color 0.3s ease',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
                                >
                                  ✅ Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  className="d-flex align-items-center gap-1 fw-medium"
                                  onClick={() => handleRejectRequest(req.id)}
                                  style={{
                                    transition: 'background-color 0.3s ease',
                                    borderColor: '#dc3545',
                                    color: '#dc3545',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#f8d7da';
                                    e.target.style.color = '#721c24';
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#dc3545';
                                  }}
                                >
                                  ❌ Reject
                                </Button>
                              </div>
                            )}
                            {req.status !== 'pending' && <span className="text-muted">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Create Plan Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600' }}>Create New {newPlan.type === 'group' ? 'Group' : 'Personal'} Plan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium" style={{ color: '#333' }}>Plan Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Premium Pack"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  required
                  style={{ padding: '12px', fontSize: '1rem' }}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Number of Sessions</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 12"
                      value={newPlan.sessions}
                      onChange={(e) => setNewPlan({ ...newPlan, sessions: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Validity (Days)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 60"
                      value={newPlan.validity}
                      onChange={(e) => setNewPlan({ ...newPlan, validity: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium" style={{ color: '#333' }}>Price (₹)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 5999"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  required
                  style={{ padding: '12px', fontSize: '1rem' }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #eee' }}>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlan}
              style={{
                backgroundColor: '#2f6a87',
                borderColor: '#2f6a87',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#25556e'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
            >
              <span className="fw-medium">Create Plan</span>
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Plan Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600' }}>Edit {selectedPlan?.type === 'group' ? 'Group' : 'Personal'} Plan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium" style={{ color: '#333' }}>Plan Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Premium Pack"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  required
                  style={{ padding: '12px', fontSize: '1rem' }}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Number of Sessions</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 12"
                      value={newPlan.sessions}
                      onChange={(e) => setNewPlan({ ...newPlan, sessions: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium" style={{ color: '#333' }}>Validity (Days)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g., 60"
                      value={newPlan.validity}
                      onChange={(e) => setNewPlan({ ...newPlan, validity: e.target.value })}
                      required
                      style={{ padding: '12px', fontSize: '1rem' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium" style={{ color: '#333' }}>Price (₹)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 5999"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  required
                  style={{ padding: '12px', fontSize: '1rem' }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #eee' }}>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Cancel
            </Button>
            <Button
              variant="info"
              onClick={handleUpdatePlan}
              style={{
                backgroundColor: '#2f6a87',
                borderColor: '#fff',
                color: '#fff',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2f6a87'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2f6a87'}
            >
              <span className="fw-medium">Update Plan</span>
            </Button>
          </Modal.Footer>
        </Modal>

        {/* View Plan Modal */}
        <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
          <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #2f6a87' }}>
            <Modal.Title style={{ color: '#333', fontWeight: '600' }}> Plan Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPlan && (
              <div className="p-4 bg-light rounded" >
                <h5 className="fw-bold mb-4" style={{ color: '#333', fontSize: '1.3rem' }}>{selectedPlan.name} ({selectedPlan.type === 'group' ? 'Group' : 'Personal'})</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <span className="me-3" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>🎯</span>
                      <div>
                        <div className="text-muted small">Sessions</div>
                        <div className="fw-bold">{selectedPlan.sessions}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <span className="me-3" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>📅</span>
                      <div>
                        <div className="text-muted small">Validity</div>
                        <div className="fw-bold">{selectedPlan.validity} days</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <span className="me-3" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>💰</span>
                      <div>
                        <div className="text-muted small">Price</div>
                        <div className="fw-bold">{selectedPlan.price}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3 d-flex align-items-center">
                      <span className="me-3" style={{ color: '#2f6a87', fontSize: '1.2rem' }}>⚡</span>
                      <div>
                        <div className="text-muted small">Status</div>
                        <div>
                          {selectedPlan.active ? (
                            <span className="badge px-3 py-2" style={{ backgroundColor: '#2f6a87', color: 'white', borderRadius: '20px' }}>Active</span>
                          ) : (
                            <span className="badge bg-secondary px-3 py-2" style={{ borderRadius: '20px' }}>Inactive</span>
                          )}
                        </div>
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
              onClick={() => setShowViewModal(false)}
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>


        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#333' }}>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-center fw-medium" style={{ fontSize: '1.1rem' }}>
              Are you sure you want to delete this plan?
            </p>
            <p className="text-center text-muted small">
              This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button
              variant="secondary"
              onClick={handleCancelDelete}
              style={{
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                minWidth: '100px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              style={{
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                minWidth: '100px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default CreatePlan;