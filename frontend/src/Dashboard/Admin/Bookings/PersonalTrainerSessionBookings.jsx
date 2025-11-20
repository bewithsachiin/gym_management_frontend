// PersonalTrainerSessionBookings.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  FaCalendarAlt, FaList, FaCheck, FaTimes, FaEdit, FaTrash,
  FaSearch, FaFilter, FaUser, FaChevronLeft, FaChevronRight, FaPlus
} from 'react-icons/fa';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import axiosInstance from '../../../utils/axiosInstance';
import 'bootstrap/dist/css/bootstrap.min.css';

// /**
//  * PersonalTrainerSessionBookings
//  * - Integrates with backend endpoints:
//  *   GET   /api/v1/sessions                -> list sessions
//  *   GET   /api/v1/sessions/:id            -> single session
//  *   POST  /api/v1/sessions                -> create session
//  *   PUT   /api/v1/sessions/:id            -> update (reschedule) session
//  *   DELETE/api/v1/sessions/:id            -> delete session
//  *   GET   /api/v1/sessions/trainers/list  -> trainers list
//  *   GET   /api/v1/sessions/members/list   -> members list (supports ?search=)
//  *
//  * - Expects responses in the shape you showed:
//  *   { success: true, message: "...", data: { sessions: [...], trainers: [...], members: [...] } }
//  */

const PersonalTrainerSessionBookings = () => {
  const [sessions, setSessions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);

  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Add session modal state
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [newSession, setNewSession] = useState({
    trainerId: null,
    memberId: null,
    date: '',
    time: '',
    duration: 60,
    type: 'Personal Training',
    notes: '',
    location: 'Gym Floor'
  });

  // Small UI color
  const customColor = '#6EB2CC';

  // -------------------------
  // Helpers: map backend -> UI
  // -------------------------
  const normalizeSession = (s) => {
    // Backend sometimes provides flattened fields (trainer, username, branchName...) as in your sample.
    // We return consistent fields used by the UI:
    return {
      id: s.id,
      trainerId: s.trainerId ?? s.trainer_id ?? (s.trainer && s.trainer.id),
      trainerName:
        s.trainer ??
        (s.trainerName) ??
        (s.trainer && (s.trainer.firstName + ' ' + s.trainer.lastName)) ??
        (s.trainer?.name) ??
        'Unknown',
      memberId: s.memberId ?? s.member_id ?? (s.member && s.member.id),
      memberName:
        s.memberName ??
        s.username ??
        (s.member && (s.member.firstName + ' ' + s.member.lastName)) ??
        'Unknown',
      date: s.date, // expected yyyy-mm-dd
      time: s.time ?? '',
      duration: s.duration ?? 60,
      status: s.bookingStatus ?? s.status ?? s.booking_status ?? 'Booked',
      type: s.type ?? '',
      notes: s.notes ?? '',
      location: s.location ?? '',
      price: s.price ?? null,
      raw: s // keep original for debugging if needed
    };
  };

  const getMemberDisplayNameFromApi = (member) => {
    if (!member) return 'Unknown';
    return (member.name ?? `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim()) || 'Unknown';
  };

  // -------------------------
  // API calls
  // -------------------------
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await axiosInstance.get('/sessions'); // expects data.data.sessions
      const apiSessions = res?.data?.data?.sessions ?? res?.data?.sessions ?? [];
      setSessions(apiSessions.map(normalizeSession));
    } catch (err) {
      console.error('Error fetching sessions', err);
      // optional: show toast or alert
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchTrainers = async () => {
    setLoadingTrainers(true);
    try {
      const res = await axiosInstance.get('/sessions/trainers/list');
      const apiTrainers = res?.data?.data?.trainers ?? [];
      // normalize to { id, name }
      setTrainers(apiTrainers.map(t => ({
        id: t.id,
        name: t.name ?? `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim()
      })));
    } catch (err) {
      console.error('Error fetching trainers', err);
    } finally {
      setLoadingTrainers(false);
    }
  };

  const fetchMembers = async (search = '') => {
    setLoadingMembers(true);
    try {
      const res = await axiosInstance.get('/sessions/members/list', { params: { search } });
      const apiMembers = res?.data?.data?.members ?? [];
      setMembers(apiMembers.map(m => ({
        id: m.id,
        name: getMemberDisplayNameFromApi(m),
        email: m.email ?? null
      })));
    } catch (err) {
      console.error('Error fetching members', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // create session
  const apiCreateSession = async (payload) => {
    // payload should match backend: trainerId, memberId, date, time, duration, type, notes, location, price etc.
    const body = {
      trainerId: payload.trainerId,
      memberId: payload.memberId,
      branchId: payload.branchId, // optional for superadmin
      date: payload.date,
      time: payload.time,
      duration: payload.duration,
      type: payload.type,
      notes: payload.notes,
      location: payload.location,
      price: payload.price
    };
    const res = await axiosInstance.post('/sessions', body);
    return res?.data?.data?.session ?? res?.data?.session ?? null;
  };

  // update/reschedule session
  const apiUpdateSession = async (id, payload) => {
    const res = await axiosInstance.put(`/sessions/${id}`, payload);
    return res?.data?.data?.session ?? res?.data?.session ?? null;
  };

  // delete session
  const apiDeleteSession = async (id) => {
    const res = await axiosInstance.delete(`/sessions/${id}`);
    return res?.data ?? null;
  };

  // -------------------------
  // Effects
  // -------------------------
  useEffect(() => {
    fetchSessions();
    fetchTrainers();
    // members are fetched on demand when opening add modal or when typing search
  }, []);

  // -------------------------
  // Derived lists + filters
  // -------------------------
  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sessions.filter(s => {
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesSearch = !q || (
        (s.memberName && s.memberName.toLowerCase().includes(q)) ||
        (s.trainerName && s.trainerName.toLowerCase().includes(q)) ||
        (s.type && s.type.toLowerCase().includes(q)) ||
        (s.location && s.location.toLowerCase().includes(q))
      );
      return matchesStatus && matchesSearch;
    });
  }, [sessions, statusFilter, searchQuery]);

  const getSessionsForDate = (date) => sessions.filter(session => {
    if (!session.date) return false;
    try {
      return isSameDay(parseISO(session.date), date);
    } catch {
      return false;
    }
  });

  const getWeekSessions = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    return days.map(day => ({ date: day, sessions: getSessionsForDate(day) }));
  };

  // -------------------------
  // UI Actions
  // -------------------------
  const goToPreviousWeek = () => setCurrentDate(d => addDays(d, -7));
  const goToNextWeek = () => setCurrentDate(d => addDays(d, 7));
  const goToToday = () => { setCurrentDate(new Date()); setSelectedSession(null); };

  // Accept / Reject / Cancel actions only affect UI first; optionally call backend update
  const handleAcceptSession = async (id) => {
    // set bookingStatus to Upcoming in UI and call backend update
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Upcoming' } : s));
    try {
      await apiUpdateSession(id, { status: 'Upcoming' });
      await fetchSessions(); // refresh authoritative data
    } catch (err) {
      console.error('Accept session error', err);
    }
  };

  const handleRejectSession = async (id) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Cancelled' } : s));
    try {
      await apiUpdateSession(id, { status: 'Cancelled' });
      await fetchSessions();
    } catch (err) {
      console.error('Reject session error', err);
    }
  };

  const handleCancelSession = async (id) => {
    const confirmed = window.confirm('Cancel this session?');
    if (!confirmed) return;
    try {
      await apiDeleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete session error', err);
      alert('Failed to delete session');
    }
  };

  // Open reschedule modal
  const openRescheduleModal = (session) => {
    setSelectedSession(session);
    setRescheduleDate(session.date || '');
    setRescheduleTime(session.time || '');
    setShowRescheduleModal(true);
  };

  // Reschedule -> call PUT update
  const handleRescheduleSession = async () => {
    if (!selectedSession) return;
    if (!rescheduleDate || !rescheduleTime) {
      alert('Please select new date and time');
      return;
    }
    try {
      const payload = { date: rescheduleDate, time: rescheduleTime };
      const updated = await apiUpdateSession(selectedSession.id, payload);
      // normalized object
      const normalized = normalizeSession(updated ?? { ...selectedSession, ...payload });
      setSessions(prev => prev.map(s => s.id === normalized.id ? normalized : s));
      setShowRescheduleModal(false);
      setSelectedSession(null);
    } catch (err) {
      console.error('Reschedule error', err);
      alert('Failed to reschedule session');
    }
  };

  // Open add session modal
  const openAddSessionModal = () => {
    setNewSession({
      trainerId: trainers?.[0]?.id ?? null,
      memberId: members?.[0]?.id ?? null,
      date: '',
      time: '',
      duration: 60,
      type: 'Personal Training',
      notes: '',
      location: 'Gym Floor'
    });
    // prefetch members
    fetchMembers('');
    setShowAddSessionModal(true);
  };

  // Create session
  const handleAddSession = async () => {
    if (!newSession.trainerId || !newSession.memberId || !newSession.date || !newSession.time) {
      alert('Please fill trainer, member, date and time');
      return;
    }
    try {
      const created = await apiCreateSession({
        trainerId: newSession.trainerId,
        memberId: newSession.memberId,
        date: newSession.date,
        time: newSession.time,
        duration: newSession.duration,
        type: newSession.type,
        notes: newSession.notes,
        location: newSession.location
      });
      const normalized = normalizeSession(created ?? {
        id: Math.max(0, ...sessions.map(s => s.id)) + 1,
        trainerId: newSession.trainerId,
        trainerName: trainers.find(t => t.id === newSession.trainerId)?.name ?? '',
        memberId: newSession.memberId,
        memberName: members.find(m => m.id === newSession.memberId)?.name ?? '',
        date: newSession.date,
        time: newSession.time,
        duration: newSession.duration,
        status: created?.bookingStatus ?? 'Booked',
        type: newSession.type,
        notes: newSession.notes,
        location: newSession.location
      });
      setSessions(prev => [normalized, ...prev]); // prepend
      setShowAddSessionModal(false);
    } catch (err) {
      console.error('Add session error', err);
      alert('Failed to create session');
    }
  };

  // Quick helper to display empty-state
  const EmptyRow = ({ colSpan, message = 'No records' }) => (
    <tr><td colSpan={colSpan} className="text-center py-4 text-muted">{message}</td></tr>
  );

  // -------------------------
  // Render helpers
  // -------------------------
  const renderCalendarView = () => {
    const weekSessions = getWeekSessions();
    const hours = [
      '12:00 AM','1:00 AM','2:00 AM','3:00 AM','4:00 AM','5:00 AM','6:00 AM','7:00 AM',
      '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM',
      '4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM'
    ];

    return (
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={goToPreviousWeek}><FaChevronLeft /></button>
            <h5 className="mb-0 me-2">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </h5>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={goToNextWeek}><FaChevronRight /></button>
            <button className="btn btn-sm" style={{ borderColor: customColor, color: customColor }} onClick={goToToday}>Today</button>
          </div>
          <div>
            <button className="btn btn-sm" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={openAddSessionModal}>
              <FaPlus className="me-1" /> Add Session
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '110px' }}>Time</th>
                  {weekSessions.map((day, i) => (
                    <th key={i} className="text-center" style={isSameDay(day.date, new Date()) ? { backgroundColor: customColor, color: 'white' } : {}}>
                      <div>{format(day.date, 'EEE')}</div>
                      <div>{format(day.date, 'MMM d')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((time, ti) => (
                  <tr key={ti}>
                    <td className="text-center align-middle">{time}</td>
                    {weekSessions.map((day, di) => {
                      // match exact time string — note: backend times may be different formats
                      const sessionsAtTime = day.sessions.filter(s => (s.time || '').trim() === time.trim());
                      return (
                        <td key={di} className="align-middle" style={{ height: '80px' }}>
                          {sessionsAtTime.length === 0 ? null : sessionsAtTime.map(session => (
                            <div
                              key={session.id}
                              className={`p-2 mb-1 rounded small ${session.status === 'Completed' ? 'bg-success text-white' : session.status === 'Cancelled' ? 'bg-danger text-white' : ''}`}
                              style={session.status === 'Upcoming' ? { backgroundColor: customColor, color: 'white', cursor: 'pointer' } : { cursor: 'pointer' }}
                              onClick={() => setSelectedSession(session)}
                            >
                              <div className="fw-bold">{session.memberName}</div>
                              <div className="small">{session.type || session.trainerName}</div>
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

  const renderListView = () => (
    <div className="card shadow-sm">
      <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap">
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <div className="input-group me-2" style={{ width: '260px' }}>
            <span className="input-group-text"><FaSearch /></span>
            <input className="form-control" placeholder="Search sessions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="input-group" style={{ width: '200px' }}>
            <span className="input-group-text"><FaFilter /></span>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Booked">Booked</option>
            </select>
          </div>
        </div>

        <div>
          <button className="btn" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={openAddSessionModal}><FaPlus className="me-1" /> Add Session</button>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Date & Time</th>
                <th>Member</th>
                <th>Trainer</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loadingSessions ? (
                <EmptyRow colSpan={8} message="Loading sessions..." />
              ) : filteredSessions.length === 0 ? (
                <EmptyRow colSpan={8} message="No sessions found" />
              ) : filteredSessions.map(session => (
                <tr key={session.id} className="clickable-row" onClick={() => setSelectedSession(session)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div>{session.date ? format(parseISO(session.date), 'MMM d, yyyy') : '—'}</div>
                    <div className="text-muted small">{session.time}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div style={{ width: 32, height: 32, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef6f8', marginRight: 8 }}>
                        <FaUser style={{ color: customColor }} />
                      </div>
                      <div>{session.memberName}</div>
                    </div>
                  </td>
                  <td>{session.trainerName}</td>
                  <td>{session.type}</td>
                  <td>{session.duration} min</td>
                  <td>{session.location || '—'}</td>
                  <td>
                    <span className={`badge ${session.status === 'Completed' ? 'bg-success' : session.status === 'Cancelled' ? 'bg-danger' : ''}`} style={session.status === 'Upcoming' ? { backgroundColor: customColor, color: 'white' } : {}}>
                      {session.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="btn-group" role="group">
                      {session.status === 'Upcoming' && (
                        <>
                          <button className="btn btn-sm btn-outline-success" title="Accept" onClick={() => handleAcceptSession(session.id)}><FaCheck /></button>
                          <button className="btn btn-sm btn-outline-danger" title="Reject" onClick={() => handleRejectSession(session.id)}><FaTimes /></button>
                        </>
                      )}
                      <button className="btn btn-sm" style={{ borderColor: customColor, color: customColor }} title="Reschedule" onClick={() => openRescheduleModal(session)}><FaEdit /></button>
                      <button className="btn btn-sm btn-outline-danger" title="Cancel" onClick={() => handleCancelSession(session.id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // -------------------------
  // Render details and modals
  // -------------------------
  const renderSessionDetails = () => {
    if (!selectedSession) return null;
    return (
      <div className="card shadow-sm mt-3">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Session Details</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedSession(null)}>Close</button>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="text-muted">Session</h6>
              <table className="table table-borderless">
                <tbody>
                  <tr><td style={{ width: 150 }}>Date & Time</td><td><strong>{selectedSession.date ? format(parseISO(selectedSession.date), 'EEEE, MMMM d, yyyy') : '—'}</strong> at {selectedSession.time}</td></tr>
                  <tr><td>Duration</td><td>{selectedSession.duration} minutes</td></tr>
                  <tr><td>Type</td><td>{selectedSession.type || '—'}</td></tr>
                  <tr><td>Location</td><td>{selectedSession.location || '—'}</td></tr>
                  <tr><td>Status</td><td><span className={`badge ${selectedSession.status === 'Completed' ? 'bg-success' : selectedSession.status === 'Cancelled' ? 'bg-danger' : ''}`} style={selectedSession.status === 'Upcoming' ? { backgroundColor: customColor, color: 'white' } : {}}>{selectedSession.status}</span></td></tr>
                </tbody>
              </table>
            </div>

            <div className="col-md-6">
              <h6 className="text-muted">People</h6>
              <table className="table table-borderless">
                <tbody>
                  <tr><td style={{ width: 120 }}>Trainer</td><td>{selectedSession.trainerName}</td></tr>
                  <tr><td>Member</td><td>{selectedSession.memberName}</td></tr>
                </tbody>
              </table>

              <h6 className="text-muted mt-3">Notes</h6>
              <p>{selectedSession.notes || 'No notes available'}</p>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            {selectedSession.status === 'Upcoming' && (
              <>
                <button className="btn btn-success me-2" onClick={() => handleAcceptSession(selectedSession.id)}><FaCheck className="me-1" /> Accept</button>
                <button className="btn btn-danger me-2" onClick={() => handleRejectSession(selectedSession.id)}><FaTimes className="me-1" /> Reject</button>
              </>
            )}
            <button className="btn me-2" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={() => openRescheduleModal(selectedSession)}><FaEdit className="me-1" /> Reschedule</button>
            <button className="btn btn-outline-danger" onClick={() => handleCancelSession(selectedSession.id)}><FaTrash className="me-1" /> Cancel</button>
          </div>
        </div>
      </div>
    );
  };

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
                  <label className="form-label">Current</label>
                  <div className="form-control">{selectedSession ? `${selectedSession.date} ${selectedSession.time}` : '—'}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">New Date</label>
                  <input type="date" className="form-control" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">New Time</label>
                  <select className="form-select" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)}>
                    <option value="">Select a time</option>
                    {['12:00 AM','1:00 AM','2:00 AM','3:00 AM','4:00 AM','5:00 AM','6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRescheduleModal(false)}>Cancel</button>
                <button className="btn" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={handleRescheduleSession}>Reschedule</button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
      </>
    );
  };

  const renderAddSessionModal = () => {
    if (!showAddSessionModal) return null;
    return (
      <>
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: customColor, color: 'white' }}>
                <h5 className="modal-title">Add New Session</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddSessionModal(false)}></button>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Trainer</label>
                    <select className="form-select" value={newSession.trainerId ?? ''} onChange={(e) => setNewSession(ns => ({ ...ns, trainerId: Number(e.target.value) }))}>
                      <option value="">Select trainer</option>
                      {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Member</label>
                    <select className="form-select" value={newSession.memberId ?? ''} onChange={(e) => setNewSession(ns => ({ ...ns, memberId: Number(e.target.value) }))}>
                      <option value="">Select member</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={newSession.date} onChange={(e) => setNewSession(ns => ({ ...ns, date: e.target.value }))} />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Time</label>
                    <select className="form-select" value={newSession.time} onChange={(e) => setNewSession(ns => ({ ...ns, time: e.target.value }))}>
                      <option value="">Select time</option>
                      {['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Duration (minutes)</label>
                    <input type="number" className="form-control" min="30" max="180" step="15" value={newSession.duration} onChange={(e) => setNewSession(ns => ({ ...ns, duration: Number(e.target.value) }))} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={newSession.type} onChange={(e) => setNewSession(ns => ({ ...ns, type: e.target.value }))}>
                      <option>Personal Training</option>
                      <option>HIIT Class</option>
                      <option>Yoga Class</option>
                      <option>Strength Training</option>
                      <option>Flexibility Training</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <select className="form-select" value={newSession.location} onChange={(e) => setNewSession(ns => ({ ...ns, location: e.target.value }))}>
                      <option>Gym Floor</option>
                      <option>Studio A</option>
                      <option>Studio B</option>
                      <option>Studio C</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows="3" value={newSession.notes} onChange={(e) => setNewSession(ns => ({ ...ns, notes: e.target.value }))}></textarea>
                  </div>

                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAddSessionModal(false)}>Cancel</button>
                <button className="btn" style={{ backgroundColor: customColor, borderColor: customColor, color: 'white' }} onClick={handleAddSession}>Add Session</button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
      </>
    );
  };

  // -------------------------
  // Component render
  // -------------------------
  return (
    <div className="SessionBookings container-fluid py-4">
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
