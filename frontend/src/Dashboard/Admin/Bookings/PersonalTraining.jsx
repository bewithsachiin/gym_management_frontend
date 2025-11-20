// src/components/PersonalTraining/PersonalTraining.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance"; // adjust path if needed
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

/**
 * Minimal integration component (Option A)
 * - Fetches sessions (GET /api/v1/sessions)
 * - Shows a details modal
 * - Deletes session using backend (tries /api/v1/personal-training/:id then /api/v1/sessions/:id)
 */

const PersonalTraining = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch sessions from backend
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/v1/sessions");
      // API shape expected:
      // { success: true, message: "...", data: { sessions: [...] } }
      const sessionsArray = (res?.data?.data?.sessions) || (res?.data?.sessions) || [];
      // Normalize entries to safe shape for UI
      const normalized = sessionsArray.map((s) => ({
        id: s.id,
        trainer: s.trainer || (s.trainerName ?? ""),
        memberName: s.memberName || s.username || s.member || "",
        date: s.date || s.createdAt || "",
        time: s.time || "",
        price: s.price || (s.priceFormatted ?? "") || (s.price ? String(s.price) : ""),
        paymentStatus: s.paymentStatus || s.payment_status || "",
        bookingStatus: s.bookingStatus || s.booking_status || s.status || "",
        type: s.type || "",
        notes: s.notes || null,
        location: s.location || "",
        raw: s,
      }));
      setSessions(normalized);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      alert("Failed to load sessions. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show modal
  const handleShow = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Delete booking
  const handleDelete = async (session) => {
    if (!session || !session.id) return;
    const ok = window.confirm(`Delete session "${session.type || session.trainer || session.memberName}" (ID: ${session.id})?`);
    if (!ok) return;

    setDeletingId(session.id);

    // Try the most likely backend endpoints in order
    const tryEndpoints = [
      `/api/v1/personal-training/${session.id}`,
      `/api/v1/sessions/${session.id}`,
      `/api/v1/personal-training/${session.id}/delete`,
      `/api/v1/sessions/${session.id}/delete`,
    ];

    let deleted = false;
    let lastError = null;

    for (const ep of tryEndpoints) {
      try {
        const res = await axiosInstance.delete(ep);
        // Expect commonly: { success: true, message: '...' } or 204 No Content
        if (res && (res.status === 200 || res.status === 204)) {
          deleted = true;
          break;
        }
      } catch (err) {
        lastError = err;
        // try next endpoint
      }
    }

    if (deleted) {
      setSessions((prev) => prev.filter((s) => String(s.id) !== String(session.id)));
      alert("Session deleted successfully");
    } else {
      console.error("Delete failed:", lastError);
      alert("Failed to delete session. Check console for details and verify backend endpoint.");
    }

    setDeletingId(null);
  };

  // Toggle bookingStatus locally (UI-only, minimal)
  const handleBookingStatusClick = (index) => {
    setSessions((prev) => {
      const copy = [...prev];
      const curr = copy[index].bookingStatus || "Booked";
      if (curr === "Booked") copy[index].bookingStatus = "Confirmed";
      else if (curr === "Confirmed") copy[index].bookingStatus = "Cancelled";
      else if (curr === "Cancelled") copy[index].bookingStatus = "Booked";
      return copy;
    });
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-success";
      case "Cancelled":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Personal Training Details</h2>
          <small className="text-muted">Member dashboard — minimal API integration</small>
        </div>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={fetchSessions} disabled={loading}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Username</th>
              <th>Trainer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Payment Status</th>
              <th>Booking Status</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">No sessions found</td>
              </tr>
            ) : (
              sessions.map((data, index) => (
                <tr key={data.id}>
                  <td>{data.memberName || data.raw?.username || "—"}</td>
                  <td>{data.trainer || "—"} {data.type ? `(${data.type})` : ""}</td>
                  <td>{formatDate(data.date)}</td>
                  <td>{data.time || "—"}</td>
                  <td>{data.price || "—"}</td>
                  <td>
                    <span className={`badge ${data.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                      {data.paymentStatus || "—"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${getBadgeColor(data.bookingStatus)} border-0 bg-opacity-75`}
                      onClick={() => handleBookingStatusClick(index)}
                      style={{ cursor: "pointer" }}
                    >
                      {data.bookingStatus || "Booked"}
                    </button>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-info"
                        title="Show"
                        onClick={() => handleShow(data)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        title="Delete"
                        onClick={() => handleDelete(data)}
                        disabled={deletingId === data.id}
                      >
                        {deletingId === data.id ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <i className="bi bi-trash"></i>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
      {isModalOpen && selectedBooking && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Session Details</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-12"><strong>Username:</strong> {selectedBooking.memberName || selectedBooking.raw?.username || "—"}</div>
                  <div className="col-12"><strong>Trainer:</strong> {selectedBooking.trainer || "—"}</div>
                  <div className="col-12"><strong>Type:</strong> {selectedBooking.type || "N/A"}</div>
                  <div className="col-12"><strong>Date:</strong> {formatDate(selectedBooking.date) || "N/A"}</div>
                  <div className="col-12"><strong>Time:</strong> {selectedBooking.time || "N/A"}</div>
                  <div className="col-12"><strong>Price:</strong> {selectedBooking.price || "N/A"}</div>
                  <div className="col-12"><strong>Payment Status:</strong> {selectedBooking.paymentStatus || "N/A"}</div>
                  <div className="col-12"><strong>Booking Status:</strong> {selectedBooking.bookingStatus || "N/A"}</div>
                  <div className="col-12"><strong>Location:</strong> {selectedBooking.location || "N/A"}</div>
                  <div className="col-12"><strong>Notes:</strong> {selectedBooking.notes || "None"}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalTraining;
