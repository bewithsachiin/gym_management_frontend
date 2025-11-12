import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaList, FaCheck, FaTimes, FaEdit, FaTrash, FaSearch, FaFilter, FaClock, FaUser, FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';

// Register Chart.js components including Filler
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const PersonalTrainerSessionBookings = () => {
  // Mock data for demonstration
  const mockSessions = [
    {
      id: 1,
      trainerId: 1,
      trainerName: "John Smith",
      memberId: 1,
      memberName: "Sarah Johnson",
      date: "2023-11-15",
      time: "10:00 AM",
      duration: 60,
      status: "Upcoming",
      type: "Personal Training",
      notes: "Focus on upper body strength",
      location: "Gym Floor"
    },
    {
      id: 2,
      trainerId: 1,
      trainerName: "John Smith",
      memberId: 2,
      memberName: "Mike Thompson",
      date: "2023-11-15",
      time: "2:00 PM",
      duration: 60,
      status: "Upcoming",
      type: "Personal Training",
      notes: "Cardio and core workout",
      location: "Studio A"
    },
    {
      id: 3,
      trainerId: 1,
      trainerName: "John Smith",
      memberId: 3,
      memberName: "Emily Parker",
      date: "2023-11-16",
      time: "9:00 AM",
      duration: 60,
      status: "Completed",
      type: "HIIT Class",
      notes: "High intensity interval training",
      location: "Studio B"
    },
    {
      id: 4,
      trainerId: 1,
      trainerName: "John Smith",
      memberId: 1,
      memberName: "Sarah Johnson",
      date: "2023-11-17",
      time: "11:00 AM",
      duration: 60,
      status: "Upcoming",
      type: "Personal Training",
      notes: "Lower body focus",
      location: "Gym Floor"
    },
    {
      id: 5,
      trainerId: 1,
      trainerName: "John Smith",
      memberId: 4,
      memberName: "David Wilson",
      date: "2023-11-18",
      time: "1:00 PM",
      duration: 60,
      status: "Cancelled",
      type: "Flexibility Training",
      notes: "Cancelled by member",
      location: "Studio C"
    },
    {
      id: 6,
      trainerId: 1,
      trainerName: "John Smith",
      memberId: 2,
      memberName: "Mike Thompson",
      date: "2023-11-20",
      time: "3:00 PM",
      duration: 60,
      status: "Upcoming",
      type: "Personal Training",
      notes: "Strength training",
      location: "Gym Floor"
    }
  ];

  // State management
  const [sessions, setSessions] = useState(mockSessions);
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [userRole, setUserRole] = useState('trainer'); // 'trainer' or 'member'
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [newSession, setNewSession] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'Personal Training',
    notes: '',
    location: 'Gym Floor'
  });

  // Custom color for all blue elements
  const customColor = '#6EB2CC';

  // Filter sessions based on status and search
  const filteredSessions = sessions.filter(session => {
    const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      session.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.trainerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get sessions for a specific date
  const getSessionsForDate = (date) => {
    return sessions.filter(session => isSameDay(parseISO(session.date), date));
  };

  // Get sessions for the current week
  const getWeekSessions = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
    const days = eachDayOfInterval({ start, end });

    return days.map(day => ({
      date: day,
      sessions: getSessionsForDate(day)
    }));
  };

  // Handle session actions
  const handleAcceptSession = (id) => {
    setSessions(sessions.map(session =>
      session.id === id ? { ...session, status: 'Upcoming' } : session
    ));
  };

  const handleRejectSession = (id) => {
    setSessions(sessions.map(session =>
      session.id === id ? { ...session, status: 'Cancelled' } : session
    ));
  };

  const handleCancelSession = (id) => {
    setSessions(sessions.map(session =>
      session.id === id ? { ...session, status: 'Cancelled' } : session
    ));
  };

  const handleRescheduleSession = () => {
    if (selectedSession && newDate && newTime) {
      setSessions(sessions.map(session =>
        session.id === selectedSession.id
          ? { ...session, date: newDate, time: newTime }
          : session
      ));
      setShowRescheduleModal(false);
      setSelectedSession(null);
      setNewDate('');
      setNewTime('');
    }
  };

  const openRescheduleModal = (session) => {
    setSelectedSession(session);
    setNewDate(session.date);
    setNewTime(session.time);
    setShowRescheduleModal(true);
  };

  const handleAddSession = () => {
    if (newSession.date && newSession.time) {
      const newId = Math.max(...sessions.map(s => s.id), 0) + 1;
      const sessionToAdd = {
        id: newId,
        trainerId: 1,
        trainerName: "John Smith",
        memberId: 1,
        memberName: "New Member",
        date: newSession.date,
        time: newSession.time,
        duration: newSession.duration,
        status: "Upcoming",
        type: newSession.type,
        notes: newSession.notes,
        location: newSession.location
      };

      setSessions([...sessions, sessionToAdd]);
      setShowAddSessionModal(false);
      setNewSession({
        date: '',
        time: '',
        duration: 60,
        type: 'Personal Training',
        notes: '',
        location: 'Gym Floor'
      });
    }
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Render calendar view
  const renderCalendarView = () => {
    const weekSessions = getWeekSessions();

    return (
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={goToPreviousWeek}>
              <FaChevronLeft />
            </button>
            <h5 className="mb-0 me-2">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </h5>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={goToNextWeek}>
              <FaChevronRight />
            </button>
            <button className="btn btn-sm" style={{ borderColor: customColor, color: customColor }} onClick={goToToday}>
              Today
            </button>
          </div>
          {userRole === 'trainer' && (
            <button className="btn btn-sm" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={() => setShowAddSessionModal(true)}>
              <FaPlus className="me-1" /> Add Session
            </button>
          )}
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '100px' }}>Time</th>
                  {weekSessions.map((day, index) => (
                    <th key={index} className={`text-center ${isSameDay(day.date, new Date()) ? '' : ''}`} style={isSameDay(day.date, new Date()) ? { backgroundColor: customColor, color: 'white' } : {}}>
                      <div>{format(day.date, 'EEE')}</div>
                      <div>{format(day.date, 'MMM d')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM',
                  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
                  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'

                ].map((time, timeIndex) => (
                  <tr key={timeIndex}>
                    <td className="text-center align-middle">{time}</td>
                    {weekSessions.map((day, dayIndex) => {
                      const sessionsAtTime = day.sessions.filter(session => session.time === time);
                      return (
                        <td key={dayIndex} className="align-middle" style={{ height: '80px' }}>
                          {sessionsAtTime.map(session => (
                            <div
                              key={session.id}
                              className={`p-2 mb-1 rounded small ${session.status === 'Completed' ? 'bg-success text-white' :
                                session.status === 'Cancelled' ? 'bg-danger text-white' :
                                  ''
                                }`}
                              style={session.status === 'Upcoming' ? { backgroundColor: customColor, color: 'white', cursor: 'pointer' } : { cursor: 'pointer' }}
                              onClick={() => setSelectedSession(session)}
                            >
                              <div className="fw-bold">{session.memberName}</div>
                              <div>{session.type}</div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap">
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <div className="input-group me-2" style={{ width: '250px' }}>
            <span className="input-group-text"><FaSearch /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ width: '200px' }}>
            <span className="input-group-text"><FaFilter /></span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {userRole === 'trainer' && (
          <button className=" col-12" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={() => setShowAddSessionModal(true)}>
            <FaPlus className="me-1" /> Add Session
          </button>
        )}
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Date & Time</th>
                <th>Member</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length > 0 ? (
                filteredSessions.map(session => (
                  <tr key={session.id} className="clickable-row" onClick={() => setSelectedSession(session)}>
                    <td>
                      <div>{format(parseISO(session.date), 'MMM d, yyyy')}</div>
                      <div className="text-muted small">{session.time}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle me-2">
                          <FaUser style={{ color: customColor }} />
                        </div>
                        <span>{session.memberName}</span>
                      </div>
                    </td>
                    <td>{session.type}</td>
                    <td>{session.duration} min</td>
                    <td>{session.location}</td>
                    <td>
                      <span className={`badge ${session.status === 'Completed' ? 'bg-success' :
                        session.status === 'Cancelled' ? 'bg-danger' :
                          ''
                        }`} style={session.status === 'Upcoming' ? { backgroundColor: customColor } : {}}>
                        {session.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="btn-group" role="group">
                        {userRole === 'trainer' && session.status === 'Upcoming' && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success"
                              title="Accept"
                              onClick={() => handleAcceptSession(session.id)}
                            >
                              <FaCheck />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Reject"
                              onClick={() => handleRejectSession(session.id)}
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-sm"
                          style={{ borderColor: customColor, color: customColor }}
                          title="Reschedule"
                          onClick={() => openRescheduleModal(session)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Cancel"
                          onClick={() => handleCancelSession(session.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No sessions found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render session details
  const renderSessionDetails = () => {
    if (!selectedSession) return null;

    return (
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Session Details</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedSession(null)}>
            Close
          </button>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="text-muted">Session Information</h6>
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td style={{ width: '150px' }}>Date & Time:</td>
                    <td>
                      <strong>{format(parseISO(selectedSession.date), 'EEEE, MMMM d, yyyy')}</strong> at {selectedSession.time}
                    </td>
                  </tr>
                  <tr>
                    <td>Duration:</td>
                    <td>{selectedSession.duration} minutes</td>
                  </tr>
                  <tr>
                    <td>Type:</td>
                    <td>{selectedSession.type}</td>
                  </tr>
                  <tr>
                    <td>Location:</td>
                    <td>{selectedSession.location}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td>
                      <span className={`badge ${selectedSession.status === 'Completed' ? 'bg-success' :
                        selectedSession.status === 'Cancelled' ? 'bg-danger' :
                          ''
                        }`} style={selectedSession.status === 'Upcoming' ? { backgroundColor: customColor } : {}}>
                        {selectedSession.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h6 className="text-muted">People</h6>
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td style={{ width: '150px' }}>Trainer:</td>
                    <td>{selectedSession.trainerName}</td>
                  </tr>
                  <tr>
                    <td>Member:</td>
                    <td>{selectedSession.memberName}</td>
                  </tr>
                </tbody>
              </table>

              <h6 className="text-muted mt-3">Notes</h6>
              <p>{selectedSession.notes || 'No notes available'}</p>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            {userRole === 'trainer' && selectedSession.status === 'Upcoming' && (
              <>
                <button className="btn btn-success me-2" onClick={() => handleAcceptSession(selectedSession.id)}>
                  <FaCheck className="me-1" /> Accept
                </button>
                <button className="btn btn-danger me-2" onClick={() => handleRejectSession(selectedSession.id)}>
                  <FaTimes className="me-1" /> Reject
                </button>
              </>
            )}
            <button className="btn me-2" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={() => openRescheduleModal(selectedSession)}>
              <FaEdit className="me-1" /> Reschedule
            </button>
            <button className="btn btn-outline-danger" onClick={() => handleCancelSession(selectedSession.id)}>
              <FaTrash className="me-1" /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render reschedule modal
  const renderRescheduleModal = () => {
    if (!showRescheduleModal) return null;

    return (
      <>
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title">Reschedule Session</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRescheduleModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Current Date & Time</label>
                  <div className="form-control">
                    {selectedSession ? format(parseISO(selectedSession.date), 'MMMM d, yyyy') + ' at ' + selectedSession.time : 'Loading...'}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">New Time</label>
                  <select
                    className="form-select"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  >
                    <option value="">Select a time</option>
                    {[
                      '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM',
                      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
                      '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
                    ].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRescheduleModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={handleRescheduleSession}>
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
      </>
    );
  };

  // Render add session modal
  const renderAddSessionModal = () => {
    if (!showAddSessionModal) return null;

    return (
      <>
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title">Add New Session</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddSessionModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Time</label>
                  <select
                    className="form-select"
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                  >
                    <option value="">Select a time</option>
                    {[
                      '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM',
                      '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
                      '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
                    ].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) || 60 })}
                    min="30"
                    max="180"
                    step="30"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Classes</label>
                  <select
                    className="form-select"
                    value={newSession.type}
                    onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                  >
                    <option value="Personal Training">Personal Training</option>
                    <option value="HIIT Class">HIIT Class</option>
                    <option value="Yoga Class">Yoga Class</option>
                    <option value="Strength Training">Strength Training</option>
                    <option value="Flexibility Training">Flexibility Training</option>
                  </select>
                </div>

                {/* 👇 NEW: Trainer Dropdown Added Here */}
                <div className="mb-3">
                  <label className="form-label">Trainer</label>
                  <select
                    className="form-select"
                    value={newSession.trainerId || 1}
                    onChange={(e) => {
                      const trainerId = parseInt(e.target.value);
                      const trainerMap = {
                        1: "John Smith",
                        2: "Lisa Ray",
                        3: "Mark Lee",
                        4: "Anna Kim"
                      };
                      setNewSession({
                        ...newSession,
                        trainerId: trainerId,
                        trainerName: trainerMap[trainerId]
                      });
                    }}
                  >
                    <option value="1">John Smith</option>
                    <option value="2">Lisa Ray</option>
                    <option value="3">Mark Lee</option>
                    <option value="4">Anna Kim</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <select
                    className="form-select"
                    value={newSession.location}
                    onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                  >
                    <option value="Gym Floor">Gym Floor</option>
                    <option value="Studio A">Studio A</option>
                    <option value="Studio B">Studio B</option>
                    <option value="Studio C">Studio C</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newSession.notes}
                    onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSessionModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn mx-3 " style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={handleAddSession}>
                  Add Session
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
      </>
    );
  };

  return (
    <div className="SessionBookings container-fluid ">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Session Bookings</h2>
        <div className="btn-group" role="group">
          <button
            className={`btn ${view === 'calendar' ? '' : 'btn-outline'}`}
            style={view === 'calendar' ? { backgroundColor: customColor, borderColor: customColor, color: 'white' } : { color: customColor, borderColor: customColor }}
            onClick={() => setView('calendar')}
          >
            <FaCalendarAlt className="me-1" /> Calendar
          </button>
          <button
            className={`btn ${view === 'list' ? '' : 'btn-outline'}`}
            style={view === 'list' ? { backgroundColor: customColor, borderColor: customColor, color: 'white' } : { color: customColor, borderColor: customColor }}
            onClick={() => setView('list')}
          >
            <FaList className="me-1" /> List
          </button>
        </div>
      </div>
      {view === 'calendar' ? renderCalendarView() : renderListView()}

      {selectedSession && renderSessionDetails()}
      {renderRescheduleModal()}
      {renderAddSessionModal()}
    </div>
  );
};

export default PersonalTrainerSessionBookings;