import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaSearch,
  FaFilter,
  FaUserAlt,
  FaHistory,
  FaFileAlt,
  FaDownload,
  FaCalendarCheck,
  FaCalendarTimes
} from 'react-icons/fa';
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Form, 
  Badge, 
  Table,
  Alert,
  InputGroup,
  FormControl,
  Dropdown,
  DropdownButton,
  Modal,
  Pagination
} from 'react-bootstrap';

// Mock data for housekeeping staff
const mockStaff = [
  { id: 1, name: "Rajesh Kumar", position: "Senior Housekeeper" },
  { id: 2, name: "Priya Sharma", position: "Housekeeper" },
  { id: 3, name: "Amit Patel", position: "Housekeeper" },
  { id: 4, name: "Sunita Reddy", position: "Senior Housekeeper" },
  { id: 5, name: "Vikram Singh", position: "Housekeeper" },
  { id: 6, name: "Meena Gupta", position: "Supervisor" },
  { id: 7, name: "Rahul Verma", position: "Housekeeper" },
];

// Mock attendance data
const mockAttendance = [
  { 
    id: 1, 
    staffId: 1, 
    date: "2023-06-01", 
    checkIn: "08:45", 
    checkOut: "17:15", 
    status: "present",
    notes: ""
  },
  { 
    id: 2, 
    staffId: 2, 
    date: "2023-06-01", 
    checkIn: "09:15", 
    checkOut: "17:30", 
    status: "late",
    notes: "Traffic delay"
  },
  { 
    id: 3, 
    staffId: 3, 
    date: "2023-06-01", 
    checkIn: "", 
    checkOut: "", 
    status: "absent",
    notes: "Sick leave"
  },
  { 
    id: 4, 
    staffId: 4, 
    date: "2023-06-01", 
    checkIn: "08:50", 
    checkOut: "17:05", 
    status: "present",
    notes: ""
  },
  { 
    id: 5, 
    staffId: 5, 
    date: "2023-06-01", 
    checkIn: "08:55", 
    checkOut: "17:20", 
    status: "present",
    notes: ""
  },
  { 
    id: 6, 
    staffId: 6, 
    date: "2023-06-01", 
    checkIn: "08:40", 
    checkOut: "17:00", 
    status: "present",
    notes: ""
  },
  { 
    id: 7, 
    staffId: 7, 
    date: "2023-06-01", 
    checkIn: "09:30", 
    checkOut: "17:45", 
    status: "late",
    notes: "Personal emergency"
  },
  { 
    id: 8, 
    staffId: 1, 
    date: "2023-05-31", 
    checkIn: "08:50", 
    checkOut: "17:10", 
    status: "present",
    notes: ""
  },
  { 
    id: 9, 
    staffId: 2, 
    date: "2023-05-31", 
    checkIn: "09:05", 
    checkOut: "17:25", 
    status: "late",
    notes: "Bus delay"
  },
  { 
    id: 10, 
    staffId: 3, 
    date: "2023-05-31", 
    checkIn: "08:45", 
    checkOut: "17:15", 
    status: "present",
    notes: ""
  },
];

const HouseKeepingAttendance = () => {
  // State management
  const [attendanceData, setAttendanceData] = useState(mockAttendance);
  const [staffList, setStaffList] = useState(mockStaff);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceForm, setAttendanceForm] = useState({});
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    staffId: '',
    status: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // Pagination states for Daily Attendance table
  const [dailyCurrentPage, setDailyCurrentPage] = useState(1);
  const [dailyEntriesPerPage] = useState(5); // Show 5 staff per page

  // Pagination states for Attendance History table
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyEntriesPerPage] = useState(5); // Show 5 records per page

  // Initialize attendance form with all staff
  useEffect(() => {
    const todayAttendance = attendanceData.filter(att => att.date === selectedDate);
    const formState = {};
    
    staffList.forEach(staff => {
      const staffAttendance = todayAttendance.find(att => att.staffId === staff.id);
      formState[staff.id] = {
        status: staffAttendance ? staffAttendance.status : '',
        checkIn: staffAttendance ? staffAttendance.checkIn : '',
        checkOut: staffAttendance ? staffAttendance.checkOut : '',
        notes: staffAttendance ? staffAttendance.notes : ''
      };
    });
    
    setAttendanceForm(formState);
  }, [selectedDate, attendanceData, staffList]);

  // Handle form input changes
  const handleFormChange = (staffId, field, value) => {
    setAttendanceForm(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value
      }
    }));
  };

  // Submit attendance
  const handleSubmitAttendance = () => {
    // Create new attendance records
    const newAttendance = [];
    
    Object.keys(attendanceForm).forEach(staffId => {
      const staffAttendance = attendanceForm[staffId];
      
      // Only add if status is set
      if (staffAttendance.status) {
        // Check if attendance record already exists for this staff and date
        const existingIndex = attendanceData.findIndex(
          att => att.staffId === parseInt(staffId) && att.date === selectedDate
        );
        
        const attendanceRecord = {
          id: existingIndex >= 0 ? attendanceData[existingIndex].id : attendanceData.length + 1,
          staffId: parseInt(staffId),
          date: selectedDate,
          checkIn: staffAttendance.checkIn || '',
          checkOut: staffAttendance.checkOut || '',
          status: staffAttendance.status,
          notes: staffAttendance.notes || ''
        };
        
        if (existingIndex >= 0) {
          // Update existing record
          attendanceData[existingIndex] = attendanceRecord;
        } else {
          // Add new record
          newAttendance.push(attendanceRecord);
        }
      }
    });
    
    // Update state
    setAttendanceData([...attendanceData, ...newAttendance]);
    
    // Show success message
    alert('Attendance has been saved successfully!');
  };

  // Filter attendance data
  const getFilteredAttendance = () => {
    return attendanceData.filter(att => {
      // Date filter
      if (filter.startDate && att.date < filter.startDate) return false;
      if (filter.endDate && att.date > filter.endDate) return false;
      
      // Staff filter
      if (filter.staffId && att.staffId !== parseInt(filter.staffId)) return false;
      
      // Status filter
      if (filter.status && att.status !== filter.status) return false;
      
      return true;
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge bg="success">Present</Badge>;
      case 'absent':
        return <Badge bg="danger">Absent</Badge>;
      case 'late':
        return <Badge bg="warning">Late</Badge>;
      case 'leave':
        return <Badge bg="info">On Leave</Badge>;
      default:
        return <Badge bg="secondary">Not Marked</Badge>;
    }
  };

  // Show attendance details
  const showAttendanceDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setShowDetailsModal(true);
  };

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const filtered = getFilteredAttendance();
    const total = filtered.length;
    const present = filtered.filter(att => att.status === 'present').length;
    const absent = filtered.filter(att => att.status === 'absent').length;
    const late = filtered.filter(att => att.status === 'late').length;
    const leave = filtered.filter(att => att.status === 'leave').length;
    
    return { total, present, absent, late, leave };
  };

  const stats = getAttendanceStats();

  // Get current staff for daily attendance table
  const indexOfLastDailyStaff = dailyCurrentPage * dailyEntriesPerPage;
  const indexOfFirstDailyStaff = indexOfLastDailyStaff - dailyEntriesPerPage;
  const currentDailyStaff = staffList.slice(indexOfFirstDailyStaff, indexOfLastDailyStaff);
  const totalDailyPages = Math.ceil(staffList.length / dailyEntriesPerPage);

  // Get current attendance records for history table
  const filteredAttendance = getFilteredAttendance();
  const indexOfLastHistoryRecord = historyCurrentPage * historyEntriesPerPage;
  const indexOfFirstHistoryRecord = indexOfLastHistoryRecord - historyEntriesPerPage;
  const currentHistoryRecords = filteredAttendance.slice(indexOfFirstHistoryRecord, indexOfLastHistoryRecord);
  const totalHistoryPages = Math.ceil(filteredAttendance.length / historyEntriesPerPage);

  // Pagination change handlers
  const paginateDaily = (pageNumber) => setDailyCurrentPage(pageNumber);
  const paginateHistory = (pageNumber) => setHistoryCurrentPage(pageNumber);

  return (
    <div className="housekeeping-attendance-container">
      {/* Custom styles for blue color replacement */}
      <style>
        {`
          .btn-primary {
            background-color: #6EB2CC !important;
            border-color: #6EB2CC !important;
          }
          .btn-outline-primary {
            color: #6EB2CC !important;
            border-color: #6EB2CC !important;
          }
          .btn-outline-primary:hover {
            background-color: #6EB2CC !important;
            color: white !important;
          }
          .text-primary {
            color: #6EB2CC !important;
          }
          .housekeeping-attendance-container .fa-user-alt {
            color: #6EB2CC !important;
          }
          /* Pagination active item color */
          .pagination .page-item.active .page-link {
            background-color: #6EB2CC !important;
            border-color: #6EB2CC !important;
          }
          .pagination .page-link:hover {
            background-color: #6EB2CC !important;
            color: white !important;
          }
        `}
      </style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Housekeeping Attendance</h2>
          <p className="text-muted">Mark and track daily attendance</p>
        </div>
        <div>
          <Button variant="outline-primary">
            <FaDownload className="me-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="mb-3">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaUserAlt size={30} style={{ color: '#6EB2CC' }} />
              </div>
              <div>
                <h5>Total Staff</h5>
                <h3>{staffList.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="mb-3">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCalendarCheck size={30} className="text-success" />
              </div>
              <div>
                <h5>Present</h5>
                <h3>{stats.present}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="mb-3">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCalendarTimes size={30} className="text-danger" />
              </div>
              <div>
                <h5>Absent</h5>
                <h3>{stats.absent}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="mb-3">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaClock size={30} className="text-warning" />
              </div>
              <div>
                <h5>Late</h5>
                <h3>{stats.late}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Mark Daily Attendance Section */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Mark Daily Attendance</h5>
          <div className="d-flex align-items-center">
            <Form.Control 
              type="date" 
              className="me-2" 
              style={{ width: 'auto' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Position</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {currentDailyStaff.map(staff => (
                <tr key={staff.id}>
                  <td>{staff.name}</td>
                  <td>{staff.position}</td>
                  <td>
                    <Form.Select 
                      value={attendanceForm[staff.id]?.status || ''}
                      onChange={(e) => handleFormChange(staff.id, 'status', e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="leave">On Leave</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control 
                      type="time" 
                      value={attendanceForm[staff.id]?.checkIn || ''}
                      onChange={(e) => handleFormChange(staff.id, 'checkIn', e.target.value)}
                      disabled={!attendanceForm[staff.id]?.status || attendanceForm[staff.id]?.status === 'absent'}
                    />
                  </td>
                  <td>
                    <Form.Control 
                      type="time" 
                      value={attendanceForm[staff.id]?.checkOut || ''}
                      onChange={(e) => handleFormChange(staff.id, 'checkOut', e.target.value)}
                      disabled={!attendanceForm[staff.id]?.status || attendanceForm[staff.id]?.status === 'absent'}
                    />
                  </td>
                  <td>
                    <Form.Control 
                      type="text" 
                      placeholder="Notes"
                      value={attendanceForm[staff.id]?.notes || ''}
                      onChange={(e) => handleFormChange(staff.id, 'notes', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {/* Pagination for Daily Attendance Table */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Showing {indexOfFirstDailyStaff + 1} to {Math.min(indexOfLastDailyStaff, staffList.length)} of {staffList.length} staff
            </div>
            <Pagination className="mb-0">
              <Pagination.First onClick={() => paginateDaily(1)} disabled={dailyCurrentPage === 1} />
              <Pagination.Prev onClick={() => paginateDaily(dailyCurrentPage - 1)} disabled={dailyCurrentPage === 1} />
              {[...Array(totalDailyPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === dailyCurrentPage}
                  onClick={() => paginateDaily(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => paginateDaily(dailyCurrentPage + 1)} disabled={dailyCurrentPage === totalDailyPages} />
              <Pagination.Last onClick={() => paginateDaily(totalDailyPages)} disabled={dailyCurrentPage === totalDailyPages} />
            </Pagination>
          </div>
          
          <div className="d-flex justify-content-end mt-3">
            <Button variant="primary" onClick={handleSubmitAttendance}>
              <FaCheckCircle className="me-2" /> Save Attendance
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Attendance History Section */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaHistory className="me-2" size={18} />
            <span className="fw-bold">Attendance History</span>
          </div>
          <div className="d-flex align-items-center">
            <InputGroup className="me-2" style={{ width: '250px' }}>
              <FormControl placeholder="Search attendance..." />
              <Button variant="outline-secondary">
                {/* <FaSearch /> */}
              </Button>
            </InputGroup>
            <DropdownButton variant="outline-secondary" title="Filter">
              <Dropdown.Item onClick={() => setFilter({ startDate: '', endDate: '', staffId: '', status: '' })}>
                Clear Filters
              </Dropdown.Item>
            </DropdownButton>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filter Controls */}
          <Row className="mb-3">
            <Col xs={12} md={3} className="mb-3">
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filter.startDate}
                  onChange={(e) => setFilter({...filter, startDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={3} className="mb-3">
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={filter.endDate}
                  onChange={(e) => setFilter({...filter, endDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={3} className="mb-3">
              <Form.Group>
                <Form.Label>Staff</Form.Label>
                <Form.Select 
                  value={filter.staffId}
                  onChange={(e) => setFilter({...filter, staffId: e.target.value})}
                >
                  <option value="">All Staff</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={3} className="mb-3">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={filter.status}
                  onChange={(e) => setFilter({...filter, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="leave">On Leave</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Attendance Table */}
          <Table responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Staff Name</th>
                <th>Position</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentHistoryRecords.map(attendance => {
                const staff = staffList.find(s => s.id === attendance.staffId);
                return (
                  <tr key={attendance.id}>
                    <td>{formatDate(attendance.date)}</td>
                    <td>{staff.name}</td>
                    <td>{staff.position}</td>
                    <td>{getStatusBadge(attendance.status)}</td>
                    <td>{attendance.checkIn || '-'}</td>
                    <td>{attendance.checkOut || '-'}</td>
                    <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {attendance.notes || '-'}
                    </td>
                    <td>
                      {/* ✅ Enhanced for Mobile: Wrap button in flex container */}
                      <div className="d-flex justify-content-center">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => showAttendanceDetails(attendance)}
                        >
                          <FaFileAlt />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          
          {/* Pagination for Attendance History Table */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Showing {indexOfFirstHistoryRecord + 1} to {Math.min(indexOfLastHistoryRecord, filteredAttendance.length)} of {filteredAttendance.length} records
            </div>
            <Pagination className="mb-0">
              <Pagination.First onClick={() => paginateHistory(1)} disabled={historyCurrentPage === 1} />
              <Pagination.Prev onClick={() => paginateHistory(historyCurrentPage - 1)} disabled={historyCurrentPage === 1} />
              {[...Array(totalHistoryPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === historyCurrentPage}
                  onClick={() => paginateHistory(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => paginateHistory(historyCurrentPage + 1)} disabled={historyCurrentPage === totalHistoryPages} />
              <Pagination.Last onClick={() => paginateHistory(totalHistoryPages)} disabled={historyCurrentPage === totalHistoryPages} />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      {/* Attendance Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Attendance Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAttendance && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Date:</strong> {formatDate(selectedAttendance.date)}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Status:</strong> {getStatusBadge(selectedAttendance.status)}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Check In:</strong> {selectedAttendance.checkIn || 'Not recorded'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Check Out:</strong> {selectedAttendance.checkOut || 'Not recorded'}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <p><strong>Notes:</strong> {selectedAttendance.notes || 'No notes'}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HouseKeepingAttendance;