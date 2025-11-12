import React, { useState } from 'react';
import { 
  FaBroom, 
  FaTools, 
  FaCheckCircle, 
  FaCircle, 
  FaPlus, 
  FaTrash,
  FaEdit,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Form, 
  Badge, 
  ListGroup,
  InputGroup,
  FormControl,
  Modal,
  Tab,
  Tabs
} from 'react-bootstrap';

// Mock data for tasks
const initialTasks = [
  // Cleaning tasks
  { id: 1, category: 'cleaning', title: 'Lobby Cleaning', description: 'Vacuum and mop the lobby area', completed: true },
  { id: 2, category: 'cleaning', title: 'Room 101 Cleaning', description: 'Clean and sanitize bathroom and bedroom', completed: false },
  { id: 3, category: 'cleaning', title: 'Hallway Cleaning', description: 'Dust and wipe down all surfaces', completed: false },
  { id: 4, category: 'cleaning', title: 'Restaurant Area', description: 'Clean tables and sanitize chairs', completed: true },
  
  // Maintenance tasks
  { id: 5, category: 'maintenance', title: 'AC Maintenance', description: 'Check and clean AC filters in Room 201', completed: false },
  { id: 6, category: 'maintenance', title: 'Plumbing Check', description: 'Inspect all bathrooms for leaks', completed: true },
  { id: 7, category: 'maintenance', title: 'Electrical Inspection', description: 'Check all light fixtures in common areas', completed: false },
  { id: 8, category: 'maintenance', title: 'Elevator Service', description: 'Schedule monthly elevator maintenance', completed: false },
];

const HouseKeepingTaskChecklist = () => {
  // State management
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('all'); // 'all', 'cleaning', 'maintenance'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({ 
    category: 'cleaning', 
    title: '', 
    description: '', 
    completed: false 
  });

  // Filter tasks based on selected filters and search term
  const filteredTasks = tasks.filter(task => {
    const matchesCategory = filter === 'all' || task.category === filter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'completed' && task.completed) || 
                          (statusFilter === 'pending' && !task.completed);
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Toggle task completion status
  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Add a new task
  const handleAddTask = () => {
    if (newTask.title.trim() === '') return;
    
    const task = {
      id: tasks.length + 1,
      category: newTask.category,
      title: newTask.title,
      description: newTask.description,
      completed: false
    };
    
    setTasks([...tasks, task]);
    setNewTask({ category: 'cleaning', title: '', description: '', completed: false });
    setShowAddModal(false);
  };

  // Update an existing task
  const handleUpdateTask = () => {
    if (!selectedTask || selectedTask.title.trim() === '') return;
    
    setTasks(tasks.map(task => 
      task.id === selectedTask.id ? selectedTask : task
    ));
    
    setShowEditModal(false);
    setSelectedTask(null);
  };

  // Delete a task
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Prepare task for editing
  const prepareEditTask = (task) => {
    setSelectedTask({ ...task });
    setShowEditModal(true);
  };

  // Get task statistics
  const getTaskStats = () => {
    const cleaningTasks = tasks.filter(t => t.category === 'cleaning');
    const maintenanceTasks = tasks.filter(t => t.category === 'maintenance');
    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    
    return {
      total: tasks.length,
      cleaning: cleaningTasks.length,
      maintenance: maintenanceTasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length
    };
  };

  const stats = getTaskStats();

  return (
    <div className="duty-roster-container">
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
          .badge.bg-primary {
            background-color: #6EB2CC !important;
          }
          .duty-roster-container .fa-broom {
            color: #6EB2CC !important;
          }
        `}
      </style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Task Checklist</h2>
          <p className="text-muted">Manage cleaning and maintenance tasks</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <FaPlus className="me-2" /> Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="mb-3">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaBroom size={30} style={{ color: '#6EB2CC' }} />
              </div>
              <div>
                <h5>Cleaning Tasks</h5>
                <h3>{stats.cleaning}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="mb-3">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaTools size={30} className="text-warning" />
              </div>
              <div>
                <h5>Maintenance Tasks</h5>
                <h3>{stats.maintenance}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="mb-3">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCheckCircle size={30} className="text-success" />
              </div>
              <div>
                <h5>Completed</h5>
                <h3>{stats.completed}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="mb-3">
            <Card.Body className="d-flex align-items-center">
              <div className="me-3">
                <FaCircle size={30} className="text-danger" />
              </div>
              <div>
                <h5>Pending</h5>
                <h3>{stats.pending}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <FormControl 
                  placeholder="Search tasks..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="cleaning">Cleaning Tasks</option>
                <option value="maintenance">Maintenance Tasks</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Task Lists */}
      <Card>
        <Card.Body>
          <Tabs defaultActiveKey="all" id="task-tabs" className="mb-3">
            <Tab eventKey="all" title="All Tasks">
              <ListGroup variant="flush">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No tasks found. Try changing your filters or add a new task.</p>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <ListGroup.Item key={task.id} className="d-flex align-items-start">
                      <div className="me-3 mt-1">
                        <Form.Check 
                          type="checkbox" 
                          checked={task.completed}
                          onChange={() => toggleTaskStatus(task.id)}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <h6 className={task.completed ? "text-decoration-line-through text-muted" : ""}>
                            {task.title}
                          </h6>
                          <div>
                            <Badge bg={task.category === 'cleaning' ? 'primary' : 'warning'} className="me-2">
                              {task.category === 'cleaning' ? 'Cleaning' : 'Maintenance'}
                            </Badge>
                            <Badge bg={task.completed ? 'success' : 'danger'}>
                              {task.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        <p className="mb-1 text-muted">{task.description}</p>
                      </div>
                      <div className="ms-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => prepareEditTask(task)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </Tab>
            
            <Tab eventKey="cleaning" title="Cleaning Tasks">
              <ListGroup variant="flush">
                {filteredTasks.filter(t => t.category === 'cleaning').length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No cleaning tasks found.</p>
                  </div>
                ) : (
                  filteredTasks
                    .filter(t => t.category === 'cleaning')
                    .map(task => (
                      <ListGroup.Item key={task.id} className="d-flex align-items-start">
                        <div className="me-3 mt-1">
                          <Form.Check 
                            type="checkbox" 
                            checked={task.completed}
                            onChange={() => toggleTaskStatus(task.id)}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <h6 className={task.completed ? "text-decoration-line-through text-muted" : ""}>
                              {task.title}
                            </h6>
                            <Badge bg={task.completed ? 'success' : 'danger'}>
                              {task.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="mb-1 text-muted">{task.description}</p>
                        </div>
                        <div className="ms-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => prepareEditTask(task)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))
                )}
              </ListGroup>
            </Tab>
            
            <Tab eventKey="maintenance" title="Maintenance Tasks">
              <ListGroup variant="flush">
                {filteredTasks.filter(t => t.category === 'maintenance').length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No maintenance tasks found.</p>
                  </div>
                ) : (
                  filteredTasks
                    .filter(t => t.category === 'maintenance')
                    .map(task => (
                      <ListGroup.Item key={task.id} className="d-flex align-items-start">
                        <div className="me-3 mt-1">
                          <Form.Check 
                            type="checkbox" 
                            checked={task.completed}
                            onChange={() => toggleTaskStatus(task.id)}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <h6 className={task.completed ? "text-decoration-line-through text-muted" : ""}>
                              {task.title}
                            </h6>
                            <Badge bg={task.completed ? 'success' : 'danger'}>
                              {task.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="mb-1 text-muted">{task.description}</p>
                        </div>
                        <div className="ms-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => prepareEditTask(task)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))
                )}
              </ListGroup>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Add Task Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
              >
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Task Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddTask}>
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Task Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select 
                  value={selectedTask.category}
                  onChange={(e) => setSelectedTask({...selectedTask, category: e.target.value})}
                >
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Task Title</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter task title"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  placeholder="Enter task description"
                  value={selectedTask.description}
                  onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox" 
                  label="Task Completed"
                  checked={selectedTask.completed}
                  onChange={(e) => setSelectedTask({...selectedTask, completed: e.target.checked})}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateTask}>
            Update Task
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HouseKeepingTaskChecklist;