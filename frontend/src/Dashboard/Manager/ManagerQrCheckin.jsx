import React, { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";
/**
 * QRCode component for gym check-in
 * Displays a QR code with member information that refreshes every 60 seconds
 */
const ManagerQrCheckin = ({ member_id, member_name }) => {
  const CODE_TTL = 60; // seconds
  const [qrNonce, setQrNonce] = useState(generateNonce(10));
  const [secondsLeft, setSecondsLeft] = useState(CODE_TTL);
  const [issuedAt, setIssuedAt] = useState(new Date());
  const [history, setHistory] = useState([]);
  
  // Generate QR code value
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
  
  // Format dates for display
  const formattedIssueDate = format(issuedAt, "MMM dd, yyyy HH:mm:ss");
  const formattedExpiryDate = format(new Date(issuedAt.getTime() + CODE_TTL * 1000), "MMM dd, yyyy HH:mm:ss");
  
  // Countdown timer
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
  
  // Initialize mock history data
  useEffect(() => {
    // Mock history data for today
    const mockHistory = [
      {
        id: 1,
        checkIn: new Date(new Date().setHours(8, 30, 0)),
        checkOut: new Date(new Date().setHours(10, 15, 0))
      },
      {
        id: 2,
        checkIn: new Date(new Date().setHours(14, 0, 0)),
        checkOut: null // Still checked in
      },
      {
        id: 3,
        checkIn: new Date(new Date().setHours(18, 45, 0)),
        checkOut: new Date(new Date().setHours(20, 30, 0))
      }
    ];
    setHistory(mockHistory);
  }, []);
  
  // Format countdown text
  const countdownText = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-qr-code text-primary" viewBox="0 0 16 16">
              <path d="M2 2h2v2H2V2Zm4 0h2v2H6V2Zm4 0h2v2h-2V2Zm4 0h2v2h-2V2Zm2 4h2v2h-2V6Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2ZM2 6h2v2H2V6Zm0 4h2v2H2v-2Zm0 4h2v2H2v-2Zm4-8h2v2H6V6Zm0 4h2v2H6v-2Zm0 4h2v2H6v-2Zm4-8h2v2h-2V6Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2Z"/>
            </svg>
          </div>
          <div>
            <h5 className="fw-bold mb-0">Gym Check-in QR Code</h5>
            <p className="text-muted mb-0">Show this QR code at the reception</p>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <div className="d-inline-block p-3 bg-white rounded-3 border shadow-sm">
            <QRCodeCanvas value={qrValue} size={200} level="M" />
          </div>
        </div>
   
        
        {/* History Table */}
        <div className="mt-4">
          <h6 className="fw-bold mb-3">Today's Check-in History</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{format(entry.checkIn, 'MMM dd, yyyy HH:mm:ss')}</td>
                    <td>
                      {entry.checkOut 
                        ? format(entry.checkOut, 'MMM dd, yyyy HH:mm:ss') 
                        : <span className="text-muted">Still in gym</span>}
                    </td>
                    <td>
                      {entry.checkOut 
                        ? <span className="badge bg-success">Completed</span> 
                        : <span className="badge bg-warning">Active</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate random nonce
function generateNonce(len = 8) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => alpha[n % alpha.length]).join("");
}

export default ManagerQrCheckin;