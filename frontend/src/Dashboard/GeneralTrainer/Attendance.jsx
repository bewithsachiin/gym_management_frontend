import React, { useState } from "react";
import { Form, Button, Table, Badge, Modal, Row, Col } from "react-bootstrap";
import { FaEye, FaTrash } from "react-icons/fa";

const Attendance = () => {
  const [search, setSearch] = useState("");
  // 👇 naya state for view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  // 👇 filter states
  const [filters, setFilters] = useState({
    memberId: "",
    memberName: "",
    status: "",
  });
  const [attendance, setAttendance] = useState([
    {
      attendance_id: 1,
      member_id: 101,
      name: "Rahul Sharma",
      status: "Present",
      checkin_time: "07:00",
      checkout_time: "08:00",
      mode: "QR",
      notes: "",
    },
    {
      attendance_id: 2,
      member_id: 102,
      name: "Sneha Patel",
      status: "Absent",
      checkin_time: "",
      checkout_time: "",
      mode: "",
      notes: "",
    },
    {
      attendance_id: 3,
      member_id: 103,
      name: "Vidhya Sharma",
      status: "Late",
      checkin_time: "07:30",
      checkout_time: "08:30",
      mode: "Manual",
      notes: "Came late due to traffic",
    },
  ]);

  // Delete member
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setAttendance(attendance.filter((m) => m.attendance_id !== id));
    }
  };

  // Apply filters
  const filteredAttendance = attendance.filter((m) => {
    return (
      (filters.memberId
        ? m.member_id.toString().includes(filters.memberId)
        : true) &&
      (filters.memberName
        ? m.name.toLowerCase().includes(filters.memberName.toLowerCase())
        : true) &&
      (filters.status ? m.status === filters.status : true) &&
      (search ? m.name.toLowerCase().includes(search.toLowerCase()) : true)
    );
  });

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="mb-2 fw-bold">Attendance Management</h2>
      <p className="text-muted mb-4">
        Manage and track attendance records for gym members.
      </p>
      
      {/* 🔍 Filters Row */}
      <Row className="mb-5 g-2">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filter by Member ID"
            value={filters.memberId}
            onChange={(e) =>
              setFilters({ ...filters, memberId: e.target.value })
            }
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Filter by Member Name"
            value={filters.memberName}
            onChange={(e) =>
              setFilters({ ...filters, memberName: e.target.value })
            }
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Filter by Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </Form.Select>
        </Col>
        <Col md={3} >
          <Button variant="outline-secondary me-2 ms-5">Filter</Button>
          <Button variant="outline-secondary">Export</Button>
        </Col>
      </Row>
    
      {/* Attendance Table */}
      <Table bordered hover responsive className="align-middle">
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th>Attendance ID</th>
            <th>Member ID</th>
            <th>Member Name</th>
            <th>Status</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Mode</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttendance.map((member) => (
            <tr key={member.attendance_id}>
              <td>{member.attendance_id}</td>
              <td>{member.member_id}</td>
              <td>{member.name}</td>
              <td>
                {member.status === "Present" && (
                  <Badge bg="success">Present</Badge>
                )}
                {member.status === "Absent" && (
                  <Badge bg="danger">Absent</Badge>
                )}
                {member.status === "Late" && (
                  <Badge bg="warning" text="dark">
                    Late
                  </Badge>
                )}
                {!member.status && <Badge bg="secondary">Not Marked</Badge>}
              </td>
              <td>{member.checkin_time || "--"}</td>
              <td>{member.checkout_time || "--"}</td>
              <td>{member.mode || "--"}</td>
              <td>{member.notes || "--"}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => {
                      setViewMember(member);
                      setShowViewModal(true);
                    }}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(member.attendance_id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Attendance Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewMember && (
            <>
              <p>
                <b>Attendance ID:</b> {viewMember.attendance_id}
              </p>
              <p>
                <b>Member ID:</b> {viewMember.member_id}
              </p>
              <p>
                <b>Name:</b> {viewMember.name}
              </p>
              <p>
                <b>Status:</b> {viewMember.status}
              </p>
              <p>
                <b>Check-in:</b> {viewMember.checkin_time || "--"}
              </p>
              <p>
                <b>Check-out:</b> {viewMember.checkout_time || "--"}
              </p>
              <p>
                <b>Mode:</b> {viewMember.mode || "--"}
              </p>
              <p>
                <b>Notes:</b> {viewMember.notes || "--"}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Attendance;