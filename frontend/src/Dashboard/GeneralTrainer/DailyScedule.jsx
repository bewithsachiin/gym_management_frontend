import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Badge, Row, Col, Spinner, Alert, ListGroup, Card } from "react-bootstrap";
import { FaEye, FaTrash, FaUsers } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const DailyClassSchedule = () => {
  const [search, setSearch] = useState("");
  const [viewClass, setViewClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMembers, setViewMembers] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [filters, setFilters] = useState({
    className: "",
    time: "",
  });

  // Fetch daily classes on component mount
  useEffect(() => {
    const fetchDailyClasses = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/classes/daily');
        setClasses(response.data.classes);
        setError(null);
      } catch (err) {
        setError("Failed to load daily classes. Please try again.");
        console.error("Error fetching daily classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyClasses();
  }, []);

  // Get trainer name from trainer object
  const getTrainerName = (trainer) => {
    if (!trainer) return "Unknown";
    return `${trainer.firstName} ${trainer.lastName}`;
  };

  // delete class
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await axiosInstance.delete(`/classes/${id}`);
        setClasses(classes.filter((c) => c.class_schedule_id !== id));
      } catch (err) {
        alert("Failed to delete class. Please try again.");
        console.error("Error deleting class:", err);
      }
    }
  };

  // fetch members for a class
  const fetchClassMembers = async (classId) => {
    setMembersLoading(true);
    try {
      const response = await axiosInstance.get(`/classes/${classId}/members`);
      setMembers(response.data.members || []);
    } catch (err) {
      console.error("Error fetching class members:", err);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  // handle view members
  const handleViewMembers = (cls) => {
    setViewMembers(cls);
    fetchClassMembers(cls.class_schedule_id);
  };

  // apply filters
  const filteredClasses = classes.filter((c) => {
    const className = c.class_name.toLowerCase();
    const time = `${c.start_time}-${c.end_time}`;

    return (
      (filters.className ? className.includes(filters.className.toLowerCase()) : true) &&
      (filters.time ? time.includes(filters.time) : true) &&
      (search ? className.includes(search.toLowerCase()) : true)
    );
  });
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="mb-2 fw-bold">Today's Class Schedule</h2>
      <p className="text-muted mb-4">
        View today's fitness classes with timings and availability
      </p>
      
      {/* Filters */}
      <Row className="mb-3 g-2">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Filter by Class Name"
            value={filters.className}
            onChange={(e) =>
              setFilters({ ...filters, className: e.target.value })
            }
          />
        </Col>
      
      <Col md={3} >
              <Button variant="outline-secondary me-2 ms-5">Filter</Button>
              <Button variant="outline-secondary">Export</Button>
            </Col>
        <Col md={3}>
          {/* Empty column to maintain layout */}
        </Col>
      </Row>
      
      {/* Table */}
      <Table bordered hover responsive className="align-middle">
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th>Class Name</th>
            <th>Time</th>
            <th>Room/Location</th>
            <th>Booked/Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClasses.map((cls) => {
            const remaining = cls.capacity - cls.booked_seats;
            return (
              <tr key={cls.class_schedule_id}>
                <td className="fw-semibold">{cls.class_name}</td>
                <td>
                  <span className="badge bg-primary me-1">{cls.start_time}</span>
                  <span>to</span>
                  <span className="badge bg-primary ms-1">{cls.end_time}</span>
                </td>
                <td>{cls.room_name || "--"}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="me-2">{cls.booked_seats}/{cls.capacity}</span>
                    <div className="progress flex-grow-1" style={{ height: '10px' }}>
                      <div 
                        className={`progress-bar ${remaining > 5 ? 'bg-success' : remaining > 0 ? 'bg-warning' : 'bg-danger'}`}
                        role="progressbar"
                        style={{ width: `${(cls.booked_seats / cls.capacity) * 100}%` }}
                        aria-valuenow={cls.booked_seats}
                        aria-valuemin={0}
                        aria-valuemax={cls.capacity}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  {cls.status === "Scheduled" && (
                    <Badge bg="success">Scheduled</Badge>
                  )}
                  {cls.status === "Completed" && (
                    <Badge bg="secondary">Completed</Badge>
                  )}
                  {cls.status === "Canceled" && (
                    <Badge bg="danger">Canceled</Badge>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      onClick={() => setViewClass(cls)}
                    >
                      <FaEye />
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleViewMembers(cls)}
                    >
                      <FaUsers />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(cls.class_schedule_id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      
      {/* View Modal */}
      <Modal show={!!viewClass} onHide={() => setViewClass(null)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>Class Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewClass && (
            <div>
              <p><strong>Class Name:</strong> {viewClass.class_name}</p>
              <p><strong>Trainer:</strong> {getTrainerName(viewClass.trainer_id)}</p>
              <p><strong>Time:</strong> {viewClass.start_time} - {viewClass.end_time}</p>
              <p><strong>Room:</strong> {viewClass.room_name || "--"}</p>
              <p><strong>Capacity:</strong> {viewClass.capacity}</p>
              <p><strong>Booked Seats:</strong> {viewClass.booked_seats}</p>
              <p><strong>Remaining Seats:</strong> {viewClass.capacity - viewClass.booked_seats}</p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  bg={
                    viewClass.status === "Scheduled"
                      ? "success"
                      : viewClass.status === "Completed"
                      ? "secondary"
                      : "danger"
                  }
                >
                  {viewClass.status}
                </Badge>
              </p>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* View Members Modal */}
      <Modal show={!!viewMembers} onHide={() => setViewMembers(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Class Members - {viewMembers?.class_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {membersLoading ? (
            <div className="text-center">
              <Spinner animation="border" />
              <p>Loading members...</p>
            </div>
          ) : members.length > 0 ? (
            <ListGroup variant="flush">
              {members.map((member) => (
                <ListGroup.Item key={member.id}>
                  <Card>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{member.firstName} {member.lastName}</h6>
                          <small className="text-muted">Member ID: {member.memberId}</small>
                        </div>
                        <Badge bg="success">Present</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-center text-muted">No members enrolled in this class.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DailyClassSchedule;