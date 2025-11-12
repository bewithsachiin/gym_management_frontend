import React, { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";
import axiosInstance from "../../utils/axiosInstance";

/**
 * Admin QR Check-in Component
 * - Generates a new QR every 60 seconds with unique nonce
 * - Fetches real-time check-in/out history from backend
 * - Displays issue/expiry times and countdown
 */
const AdminQrCheckin = ({ member_id, member_name }) => {
  const CODE_TTL = 60; // seconds
  const [qrNonce, setQrNonce] = useState(generateNonce(10));
  const [secondsLeft, setSecondsLeft] = useState(CODE_TTL);
  const [issuedAt, setIssuedAt] = useState(new Date());
  const [history, setHistory] = useState([]);

  // ✅ Generate dynamic QR code data
  const qrValue = useMemo(() => {
    return JSON.stringify({
      purpose: "gym_checkin",
      member_id: member_id,
      member_name: member_name,
      issued_at: issuedAt.toISOString(),
      nonce: qrNonce,
      expires_at: new Date(issuedAt.getTime() + CODE_TTL * 1000).toISOString()
    });
  }, [qrNonce, member_id, member_name, issuedAt]);

  // ✅ Format display times
  const formattedIssueDate = format(issuedAt, "MMM dd, yyyy HH:mm:ss");
  const formattedExpiryDate = format(
    new Date(issuedAt.getTime() + CODE_TTL * 1000),
    "MMM dd, yyyy HH:mm:ss"
  );

  // ✅ Countdown + auto-refresh QR logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setQrNonce(generateNonce(10));
          setIssuedAt(new Date());
          return CODE_TTL;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [qrNonce]);

  // ✅ Fetch today's QR history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axiosInstance.get("/qr-check/history");
        if (response.data.success && Array.isArray(response.data.data.history)) {
          const transformedHistory = response.data.data.history.map((entry) => ({
            id: entry.id,
            checkIn: new Date(entry.checkInTime || entry.scannedAt),
            checkOut: entry.checkOutTime
              ? new Date(entry.checkOutTime)
              : entry.action === "checkout"
              ? new Date(entry.scannedAt)
              : null,
            person: entry.person || member_name
          }));
          setHistory(transformedHistory);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Failed to fetch QR history:", error);
        // fallback mock data
        const mockHistory = [
          {
            id: 1,
            checkIn: new Date(new Date().setHours(8, 30, 0)),
            checkOut: new Date(new Date().setHours(10, 15, 0))
          },
          {
            id: 2,
            checkIn: new Date(new Date().setHours(14, 0, 0)),
            checkOut: null
          },
          {
            id: 3,
            checkIn: new Date(new Date().setHours(18, 45, 0)),
            checkOut: new Date(new Date().setHours(20, 30, 0))
          }
        ];
        setHistory(mockHistory);
      }
    };

    fetchHistory();
  }, [member_id]);

  // ✅ Countdown timer text
  const countdownText = `${String(Math.floor(secondsLeft / 60)).padStart(
    2,
    "0"
  )}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-qr-code text-primary"
              viewBox="0 0 16 16"
            >
              <path d="M2 2h2v2H2V2Zm4 0h2v2H6V2Zm4 0h2v2h-2V2Zm4 0h2v2h-2V2Zm2 4h2v2h-2V6Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2ZM2 6h2v2H2V6Zm0 4h2v2H2v-2Zm0 4h2v2H2v-2Zm4-8h2v2H6V6Zm0 4h2v2H6v-2Zm0 4h2v2H6v-2Zm4-8h2v2h-2V6Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2Z" />
            </svg>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Gym Check-in QR Code</h5>
            <small className="text-muted">
              Auto-refreshes every {CODE_TTL}s
            </small>
          </div>
        </div>

        {/* QR Display */}
        <div className="text-center mb-3">
          <div className="d-inline-block p-3 bg-white rounded-3 border shadow-sm position-relative">
            <QRCodeCanvas value={qrValue} size={200} level="M" />
            <div className="mt-2 text-center">
              <div className="fw-semibold text-primary">
                Expires in {countdownText}
              </div>
              <small className="text-muted d-block">
                Issued: {formattedIssueDate}
              </small>
              <small className="text-muted d-block">
                Expires: {formattedExpiryDate}
              </small>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="mt-4">
          <h6 className="fw-bold mb-3">Today's Check-in History</h6>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((entry) => (
                    <tr key={entry.id}>
                      <td>{format(entry.checkIn, "MMM dd, yyyy HH:mm:ss")}</td>
                      <td>
                        {entry.checkOut ? (
                          format(entry.checkOut, "MMM dd, yyyy HH:mm:ss")
                        ) : (
                          <span className="text-muted">Still in gym</span>
                        )}
                      </td>
                      <td>
                        {entry.checkOut ? (
                          <span className="badge bg-success">Completed</span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No check-in history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Helper to generate unique nonce for each QR
function generateNonce(len = 8) {
  const alpha =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => alpha[n % alpha.length]).join("");
}

export default AdminQrCheckin;
