import React, { useState } from "react";
import { Form, Button, Row, Col, Card, ProgressBar } from "react-bootstrap";
import { FaUsers, FaChartBar, FaStar, FaFilter, FaDownload } from "react-icons/fa";

const Report = () => {
  const [filters, setFilters] = useState({
    className: "",
    fromDate: "",
    toDate: "",
  });
  
  const [classes, setClasses] = useState([
    {
      id: 101,
      className: "Morning Yoga",
      date: "2025-09-01",
      totalStudents: 30,
      presentStudents: 25,
      avgRating: 4.5,
    },
    {
      id: 102,
      className: "Evening Zumba",
      date: "2025-09-02",
      totalStudents: 25,
      presentStudents: 18,
      avgRating: 4.2,
    },
    {
      id: 103,
      className: "HIIT Training",
      date: "2025-09-03",
      totalStudents: 20,
      presentStudents: 15,
      avgRating: 4.7,
    },
    {
      id: 104,
      className: "Pilates",
      date: "2025-09-04",
      totalStudents: 15,
      presentStudents: 12,
      avgRating: 4.8,
    },
  ]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleGenerateReport = () => {
    console.log("Filters Applied:", filters);
  };

  const handleReset = () => {
    setFilters({ className: "", fromDate: "", toDate: "" });
  };

  // Calculate overall statistics
  const totalStudents = classes.reduce((sum, cls) => sum + cls.totalStudents, 0);
  const totalPresent = classes.reduce((sum, cls) => sum + cls.presentStudents, 0);
  const avgAttendance = totalStudents > 0 ? (totalPresent / totalStudents * 100).toFixed(1) : 0;
  const avgRating = classes.reduce((sum, cls) => sum + cls.avgRating, 0) / classes.length;

  return (
    <div className="trainer-dashboard">
      <div className="dashboard-header ">
        
        <p className="text-center text-muted">
          Student Performance Overview
        </p>
      </div>
      
      {/* Filters Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center mb-3">
            <Col>
              <h5 className="mb-0"><FaFilter className="me-2" />Filter Reports</h5>
            </Col>
            <Col className="text-end">
              <Button variant="outline-primary" size="sm">
                <FaDownload className="me-1" /> Export
              </Button>
            </Col>
          </Row>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Class Type</Form.Label>
                <Form.Select
                  name="className"
                  value={filters.className}
                  onChange={handleChange}
                >
                  <option value="">All Classes</option>
                  <option value="Morning Yoga">Morning Yoga</option>
                  <option value="Evening Zumba">Evening Zumba</option>
                  <option value="HIIT Training">HIIT Training</option>
                  <option value="Pilates">Pilates</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={handleGenerateReport}>
              Apply Filters
            </Button>
            <Button variant="outline-secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </Card.Body>
      </Card>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body>
              <div className="icon-circle bg-primary bg-opacity-10 text-primary mb-3">
                <FaUsers className="fs-2" />
              </div>
              <Card.Title>Total Students</Card.Title>
              <h2 className="my-2">{totalStudents}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body>
              <div className="icon-circle bg-success bg-opacity-10 text-success mb-3">
                <FaUsers className="fs-2" />
              </div>
              <Card.Title>Present Students</Card.Title>
              <h2 className="my-2">{totalPresent}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body>
              <div className="icon-circle bg-info bg-opacity-10 text-info mb-3">
                <FaChartBar className="fs-2" />
              </div>
              <Card.Title>Avg. Attendance</Card.Title>
              <h2 className="my-2">{avgAttendance}%</h2>
              <ProgressBar now={avgAttendance} variant="info" className="mt-2" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm text-center">
            <Card.Body>
              <div className="icon-circle bg-warning bg-opacity-10 text-warning mb-3">
                <FaStar className="fs-2" />
              </div>
              <Card.Title>Avg. Rating</Card.Title>
              <h2 className="my-2">{avgRating.toFixed(1)}</h2>
              <ProgressBar now={avgRating * 20} variant="warning" className="mt-2" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Graphical Report */}
      <Card className="mb-4 shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          <FaChartBar className="me-2" /> Class Performance Report
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col>
              <h5>Student Attendance by Class</h5>
            </Col>
          </Row>
          
          {classes.map((cls) => (
            <Card key={cls.id} className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <h6>{cls.className}</h6>
                    <small className="text-muted">{cls.date}</small>
                  </Col>
                  <Col md={8}>
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ width: '120px' }}>
                        {cls.presentStudents}/{cls.totalStudents}
                      </div>
                      <div className="flex-grow-1">
                        <ProgressBar 
                          now={(cls.presentStudents / cls.totalStudents) * 100} 
                          variant={(cls.presentStudents / cls.totalStudents) * 100 >= 80 ? "success" : 
                                 (cls.presentStudents / cls.totalStudents) * 100 >= 60 ? "warning" : "danger"}
                        />
                      </div>
                      <div className="ms-3" style={{ width: '50px' }}>
                        {((cls.presentStudents / cls.totalStudents) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
          
          <Row className="mt-4 mb-3">
            <Col>
              <h5>Class Ratings</h5>
            </Col>
          </Row>
          
          {classes.map((cls) => (
            <Card key={cls.id} className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <h6>{cls.className}</h6>
                    <small className="text-muted">{cls.date}</small>
                  </Col>
                  <Col md={8}>
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ width: '50px' }}>
                        {cls.avgRating.toFixed(1)}
                      </div>
                      <div className="flex-grow-1">
                        <ProgressBar 
                          now={cls.avgRating * 20} 
                          variant={cls.avgRating >= 4.5 ? "success" : 
                                 cls.avgRating >= 3.5 ? "warning" : "danger"}
                        />
                      </div>
                      <div className="ms-3">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < Math.floor(cls.avgRating) ? "text-warning" : "text-muted"} 
                          />
                        ))}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
      
      <style jsx>{`
        .trainer-dashboard {
          padding: 20px;
          background-color: #f8f9fa;
          min-height: 100vh;
        }
        
        .icon-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default Report;