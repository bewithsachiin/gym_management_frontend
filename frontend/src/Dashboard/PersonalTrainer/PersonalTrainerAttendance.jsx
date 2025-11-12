import React, { useState, useEffect } from 'react';
import { FaQrcode, FaUserCheck, FaCalendarAlt, FaFileCsv, FaFilePdf, FaSearch, FaFilter, FaCheck, FaTimes, FaClock, FaUser, FaChevronLeft, FaChevronRight, FaDownload, FaEllipsisV } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';

const PersonalTrainerAttendance = () => {
  // Mock data for demonstration
  const mockMembers = [
    { id: 1, name: "Sarah Johnson", email: "sarah@example.com", phone: "555-1234" },
    { id: 2, name: "Mike Thompson", email: "mike@example.com", phone: "555-5678" },
    { id: 3, name: "Emily Parker", email: "emily@example.com", phone: "555-9012" },
    { id: 4, name: "David Wilson", email: "david@example.com", phone: "555-3456" },
    { id: 5, name: "Lisa Anderson", email: "lisa@example.com", phone: "555-7890" },
    { id: 6, name: "Robert Johnson", email: "robert@example.com", phone: "555-2345" },
    { id: 7, name: "Jennifer Lee", email: "jennifer@example.com", phone: "555-6789" },
    { id: 8, name: "Michael Davis", email: "michael@example.com", phone: "555-0123" },
    { id: 9, name: "Amanda Wilson", email: "amanda@example.com", phone: "555-4567" },
    { id: 10, name: "Chris Taylor", email: "chris@example.com", phone: "555-8901" }
  ];
  const mockAttendanceRecords = [
    { id: 1, memberId: 1, date: "2023-11-15", checkIn: "08:45 AM", checkOut: "10:00 AM", verifiedBy: "John Smith" },
    { id: 2, memberId: 2, date: "2023-11-15", checkIn: "09:15 AM", checkOut: "10:30 AM", verifiedBy: "John Smith" },
    { id: 3, memberId: 3, date: "2023-11-15", checkIn: "09:30 AM", checkOut: null, verifiedBy: null },
    { id: 4, memberId: 4, date: "2023-11-15", checkIn: "08:30 AM", checkOut: "09:45 AM", verifiedBy: "John Smith" },
    { id: 5, memberId: 1, date: "2023-11-14", checkIn: "08:50 AM", checkOut: "10:05 AM", verifiedBy: "John Smith" },
    { id: 6, memberId: 2, date: "2023-11-14", checkIn: "09:05 AM", checkOut: "10:20 AM", verifiedBy: "John Smith" },
    { id: 7, memberId: 5, date: "2023-11-14", checkIn: "09:20 AM", checkOut: "10:35 AM", verifiedBy: "John Smith" },
    { id: 8, memberId: 6, date: "2023-11-13", checkIn: "08:40 AM", checkOut: "09:55 AM", verifiedBy: "John Smith" },
    { id: 9, memberId: 7, date: "2023-11-13", checkIn: "09:10 AM", checkOut: "10:25 AM", verifiedBy: "John Smith" },
    { id: 10, memberId: 8, date: "2023-11-13", checkIn: "09:25 AM", checkOut: null, verifiedBy: null }
  ];
  
  // State management
  const [members, setMembers] = useState(mockMembers);
  const [attendanceRecords, setAttendanceRecords] = useState(mockAttendanceRecords);
  const [activeTab, setActiveTab] = useState('scan'); // 'scan', 'verify', 'reports'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportType, setReportType] = useState('daily'); // 'daily' or 'monthly'
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('trainer'); // 'trainer' or 'admin'
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [scannedMember, setScannedMember] = useState(null);
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
  const [showCheckOutSuccess, setShowCheckOutSuccess] = useState(false);
  
  // Custom color for all blue elements
  const customColor = '#6EB2CC';
  
  // Filter attendance records based on selected date
  const filteredAttendanceRecords = attendanceRecords.filter(record => 
    isSameDay(parseISO(record.date), selectedDate)
  );
  
  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery)
  );
  
  // Get member by ID
  const getMemberById = (id) => {
    return members.find(member => member.id === id);
  };
  
  // Get attendance records for a member in a month
  const getMonthlyAttendanceForMember = (memberId, date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    return attendanceRecords.filter(record => {
      const recordDate = parseISO(record.date);
      return record.memberId === memberId && 
             recordDate >= monthStart && 
             recordDate <= monthEnd;
    });
  };
  
  // Handle QR code scan (simulated)
  const handleScanQRCode = () => {
    // In a real app, this would be triggered by actual QR code scanning
    // For demo, we'll randomly select a member
    const randomMember = members[Math.floor(Math.random() * members.length)];
    setScannedMember(randomMember);
    
    // Check if member already checked in today
    const todayRecord = attendanceRecords.find(record => 
      record.memberId === randomMember.id && 
      isSameDay(parseISO(record.date), new Date())
    );
    
    if (todayRecord) {
      // Member already checked in, so check out
      handleCheckOut(todayRecord.id);
      setShowCheckOutSuccess(true);
      setTimeout(() => setShowCheckOutSuccess(false), 3000);
    } else {
      // Member hasn't checked in today, so check in
      handleCheckIn(randomMember.id);
      setShowCheckInSuccess(true);
      setTimeout(() => setShowCheckInSuccess(false), 3000);
    }
  };
  
  // Handle check-in
  const handleCheckIn = (memberId) => {
    const now = new Date();
    const timeString = format(now, 'hh:mm a');
    
    const newRecord = {
      id: attendanceRecords.length + 1,
      memberId: memberId,
      date: format(now, 'yyyy-MM-dd'),
      checkIn: timeString,
      checkOut: null,
      verifiedBy: null
    };
    
    setAttendanceRecords([...attendanceRecords, newRecord]);
  };
  
  // Handle check-out
  const handleCheckOut = (recordId) => {
    const now = new Date();
    const timeString = format(now, 'hh:mm a');
    
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === recordId 
        ? { ...record, checkOut: timeString } 
        : record
    ));
  };
  
  // Handle verification
  const handleVerifyAttendance = (recordId) => {
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === recordId 
        ? { ...record, verifiedBy: "John Smith" } // In a real app, this would be the logged-in trainer
        : record
    ));
  };
  
  // Handle export
  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
    setShowExportModal(false);
  };
  
  // Export to CSV
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'daily') {
      csvContent += "Member Name,Check In,Check Out,Verified By\n";
      
      filteredAttendanceRecords.forEach(record => {
        const member = getMemberById(record.memberId);
        csvContent += `${member.name},${record.checkIn || 'N/A'},${record.checkOut || 'N/A'},${record.verifiedBy || 'N/A'}\n`;
      });
    } else {
      csvContent += "Member Name,Total Check-ins,Total Check-outs,Attendance Rate\n";
      
      members.forEach(member => {
        const records = getMonthlyAttendanceForMember(member.id, selectedDate);
        const totalCheckIns = records.length;
        const totalCheckOuts = records.filter(r => r.checkOut).length;
        const attendanceRate = totalCheckIns > 0 ? Math.round((totalCheckOuts / totalCheckIns) * 100) : 0;
        
        csvContent += `${member.name},${totalCheckIns},${totalCheckOuts},${attendanceRate}%\n`;
      });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_attendance_${format(selectedDate, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export to PDF (simulated with alert)
  const exportToPDF = () => {
    alert(`Exporting ${reportType} attendance report to PDF format. In a real application, this would generate and download a PDF file.`);
  };
  
  // Navigation functions
  const goToPreviousDay = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
  };
  
  const goToNextDay = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  const goToPreviousMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };
  
  const goToNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };
  
  // Render QR code scanner
  const renderQRScanner = () => (
    <div className="card shadow-sm">
      <div className="card-header text-white" style={{ backgroundColor: customColor }}>
        <h5 className="mb-0">QR Code Check-In/Check-Out</h5>
      </div>
      <div className="card-body text-center">
        <div className="mb-4">
          <div className="bg-light p-4 rounded d-flex justify-content-center align-items-center" style={{ minHeight: '250px' }}>
            <div className="text-center">
              <FaQrcode className="fs-1 mb-3" style={{ color: customColor }} />
              <p className="d-none d-sm-block">Point your camera at the QR code to scan</p>
              <p className="d-sm-none">Scan QR code</p>
              <button 
                className="btn mt-2" 
                style={{ backgroundColor: customColor, color: 'white' }}
                onClick={handleScanQRCode}
              >
                Simulate QR Scan
              </button>
            </div>
          </div>
        </div>
        
        {showCheckInSuccess && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <FaCheck className="me-2 flex-shrink-0" />
            <div className="text-break">
              Check-in successful for {scannedMember?.name} at {format(new Date(), 'hh:mm a')}
            </div>
          </div>
        )}
        
        {showCheckOutSuccess && (
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <FaCheck className="me-2 flex-shrink-0" />
            <div className="text-break">
              Check-out successful for {scannedMember?.name} at {format(new Date(), 'hh:mm a')}
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <h6>Recent Check-Ins</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendanceRecords.slice(0, 5).map(record => {
                  const member = getMemberById(record.memberId);
                  return (
                    <tr key={record.id}>
                      <td>{member.name}</td>
                      <td>{record.checkIn}</td>
                      <td>
                        {record.checkOut ? (
                          <span className="badge bg-info">Checked Out</span>
                        ) : (
                          <span className="badge bg-success">Checked In</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render attendance verification
  const renderAttendanceVerification = () => (
    <div className="card shadow-sm">
      <div className="card-header text-white" style={{ backgroundColor: customColor }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <h5 className="mb-2 mb-md-0">Attendance Verification</h5>
          <div className="d-flex align-items-center">
            <button className="btn btn-light btn-sm me-2" onClick={goToPreviousDay}>
              <FaChevronLeft />
            </button>
            <span className="text-nowrap">{format(selectedDate, 'MMM d, yyyy')}</span>
            <button className="btn btn-light btn-sm ms-2" onClick={goToNextDay}>
              <FaChevronRight />
            </button>
            <button className="btn btn-light btn-sm ms-2 d-none d-md-block" onClick={goToToday}>
              Today
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="input-group mb-3">
          <span className="input-group-text"><FaSearch /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Member</th>
                <th className="d-none d-sm-table-cell">Contact</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th className="d-none d-md-table-cell">Verified By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => {
                const attendanceRecord = filteredAttendanceRecords.find(record => record.memberId === member.id);
                return (
                  <tr key={member.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle me-2">
                          <FaUser />
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td className="d-none d-sm-table-cell">
                      <div>{member.email}</div>
                      <div className="text-muted small">{member.phone}</div>
                    </td>
                    <td>{attendanceRecord?.checkIn || '-'}</td>
                    <td>{attendanceRecord?.checkOut || '-'}</td>
                    <td>
                      {attendanceRecord ? (
                        attendanceRecord.checkOut ? (
                          <span className="badge bg-info">Checked Out</span>
                        ) : (
                          <span className="badge bg-success">Checked In</span>
                        )
                      ) : (
                        <span className="badge bg-secondary">Not Checked In</span>
                      )}
                    </td>
                    <td className="d-none d-md-table-cell">{attendanceRecord?.verifiedBy || '-'}</td>
                    <td>
                      <div className="btn-group" role="group">
                        {!attendanceRecord && (
                          <button 
                            className="btn btn-sm"
                            style={{ backgroundColor: '#198754', color: 'white' }}
                            onClick={() => handleCheckIn(member.id)}
                          >
                            <FaCheck /> <span className="d-none d-lg-inline-block">Check In</span>
                          </button>
                        )}
                        {attendanceRecord && !attendanceRecord.checkOut && (
                          <button 
                            className="btn btn-sm"
                            style={{ backgroundColor: '#0dcaf0', color: 'white' }}
                            onClick={() => handleCheckOut(attendanceRecord.id)}
                          >
                            <FaTimes /> <span className="d-none d-lg-inline-block">Check Out</span>
                          </button>
                        )}
                        {attendanceRecord && !attendanceRecord.verifiedBy && (
                          <button 
                            className="btn btn-sm"
                            style={{ backgroundColor: customColor, color: 'white' }}
                            onClick={() => handleVerifyAttendance(attendanceRecord.id)}
                          >
                            <FaUserCheck /> <span className="d-none d-lg-inline-block">Verify</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // Render reports
  const renderReports = () => (
    <div className="card shadow-sm">
      <div className="card-header text-white" style={{ backgroundColor: customColor }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
            <div className="btn-group w-100" role="group">
              <button 
                className={`btn ${reportType === 'daily' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setReportType('daily')}
              >
                Daily Report
              </button>
              <button 
                className={`btn ${reportType === 'monthly' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setReportType('monthly')}
              >
                Monthly Summary
              </button>
            </div>
            
            {reportType === 'daily' ? (
              <div className="d-flex align-items-center w-100">
                <button className="btn btn-light btn-sm me-2" onClick={goToPreviousDay}>
                  <FaChevronLeft />
                </button>
                <span className="text-nowrap text-truncate">{format(selectedDate, 'MMM d, yyyy')}</span>
                <button className="btn btn-light btn-sm ms-2" onClick={goToNextDay}>
                  <FaChevronRight />
                </button>
                <button className="btn btn-light btn-sm ms-2 d-none d-md-block" onClick={goToToday}>
                  Today
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center w-100">
                <button className="btn btn-light btn-sm me-2" onClick={goToPreviousMonth}>
                  <FaChevronLeft />
                </button>
                <span className="text-nowrap text-truncate">{format(selectedDate, 'MMMM yyyy')}</span>
                <button className="btn btn-light btn-sm ms-2" onClick={goToNextMonth}>
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
          
          {userRole === 'admin' && (
            <button className="btn btn-light btn-sm w-100 w-md-auto" onClick={() => setShowExportModal(true)}>
              <FaDownload className="me-1" /> Export
            </button>
          )}
        </div>
      </div>
      <div className="card-body">
        {reportType === 'daily' ? (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Member</th>
                  <th className="d-none d-sm-table-cell">Check In</th>
                  <th className="d-none d-md-table-cell">Check Out</th>
                  <th className="d-none d-lg-table-cell">Duration</th>
                  <th className="d-none d-md-table-cell">Verified By</th>
                  <th className="d-lg-none">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendanceRecords.length > 0 ? (
                  filteredAttendanceRecords.map(record => {
                    const member = getMemberById(record.memberId);
                    let duration = '-';
                    
                    if (record.checkIn && record.checkOut) {
                      const checkInTime = new Date(`${record.date} ${record.checkIn}`);
                      const checkOutTime = new Date(`${record.date} ${record.checkOut}`);
                      const diffMs = checkOutTime - checkInTime;
                      const diffMins = Math.floor(diffMs / 60000);
                      const hours = Math.floor(diffMins / 60);
                      const mins = diffMins % 60;
                      duration = `${hours}h ${mins}m`;
                    }
                    
                    return (
                      <tr key={record.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle me-2">
                              <FaUser />
                            </div>
                            <span>{member.name}</span>
                          </div>
                        </td>
                        <td className="d-none d-sm-table-cell">{record.checkIn || '-'}</td>
                        <td className="d-none d-md-table-cell">{record.checkOut || '-'}</td>
                        <td className="d-none d-lg-table-cell">{duration}</td>
                        <td className="d-none d-md-table-cell">{record.verifiedBy || '-'}</td>
                        <td className="d-lg-none">
                          <div className="dropdown">
                            <button className="btn btn-sm" type="button" data-bs-toggle="dropdown">
                              <FaEllipsisV />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              <li className="dropdown-item-text">
                                <strong>{member.name}</strong>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><span className="dropdown-item-text">Check In: {record.checkIn || '-'}</span></li>
                              <li><span className="dropdown-item-text">Check Out: {record.checkOut || '-'}</span></li>
                              <li><span className="dropdown-item-text">Duration: {duration}</span></li>
                              <li><span className="dropdown-item-text">Verified By: {record.verifiedBy || '-'}</span></li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No attendance records found for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Member</th>
                  <th className="d-none d-sm-table-cell">Check-ins</th>
                  <th className="d-none d-md-table-cell">Check-outs</th>
                  <th className="d-none d-lg-table-cell">Attendance Rate</th>
                  <th className="d-none d-xl-table-cell">Avg. Duration</th>
                  <th className="d-xl-none">Details</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => {
                  const records = getMonthlyAttendanceForMember(member.id, selectedDate);
                  const totalCheckIns = records.length;
                  const totalCheckOuts = records.filter(r => r.checkOut).length;
                  const attendanceRate = totalCheckIns > 0 ? Math.round((totalCheckOuts / totalCheckIns) * 100) : 0;
                  
                  // Calculate average duration
                  let totalDuration = 0;
                  let validRecords = 0;
                  
                  records.forEach(record => {
                    if (record.checkIn && record.checkOut) {
                      const checkInTime = new Date(`${record.date} ${record.checkIn}`);
                      const checkOutTime = new Date(`${record.date} ${record.checkOut}`);
                      const diffMs = checkOutTime - checkInTime;
                      totalDuration += diffMs;
                      validRecords++;
                    }
                  });
                  
                  const avgDurationMs = validRecords > 0 ? totalDuration / validRecords : 0;
                  const avgMins = Math.floor(avgDurationMs / 60000);
                  const hours = Math.floor(avgMins / 60);
                  const mins = avgMins % 60;
                  const avgDuration = validRecords > 0 ? `${hours}h ${mins}m` : '-';
                  
                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle me-2">
                            <FaUser />
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="d-none d-sm-table-cell">{totalCheckIns}</td>
                      <td className="d-none d-md-table-cell">{totalCheckOuts}</td>
                      <td className="d-none d-lg-table-cell">
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ backgroundColor: customColor, width: `${attendanceRate}%` }}
                            ></div>
                          </div>
                          <span>{attendanceRate}%</span>
                        </div>
                      </td>
                      <td className="d-none d-xl-table-cell">{avgDuration}</td>
                      <td className="d-xl-none">
                        <div className="dropdown">
                          <button className="btn btn-sm" type="button" data-bs-toggle="dropdown">
                            <FaEllipsisV />
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li className="dropdown-item-text">
                              <strong>{member.name}</strong>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><span className="dropdown-item-text">Check-ins: {totalCheckIns}</span></li>
                            <li><span className="dropdown-item-text">Check-outs: {totalCheckOuts}</span></li>
                            <li><span className="dropdown-item-text">Attendance Rate: {attendanceRate}%</span></li>
                            <li><span className="dropdown-item-text">Avg. Duration: {avgDuration}</span></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  
  // Render export modal
  const renderExportModal = () => (
    <div className={`modal fade ${showExportModal ? 'show d-block' : ''}`} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header text-white" style={{ backgroundColor: customColor }}>
            <h5 className="modal-title">Export Report</h5>
            <button type="button" className="btn-close btn-close-white" onClick={() => setShowExportModal(false)}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Report Type</label>
              <div className="form-control">{reportType === 'daily' ? 'Daily Attendance List' : 'Monthly Attendance Summary'}</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Date Range</label>
              <div className="form-control">
                {reportType === 'daily' 
                  ? format(selectedDate, 'MMMM d, yyyy')
                  : `${format(startOfMonth(selectedDate), 'MMMM d')} - ${format(endOfMonth(selectedDate), 'MMMM d, yyyy')}`}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Export Format</label>
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="exportFormat" 
                  id="csvFormat" 
                  value="csv" 
                  checked={exportFormat === 'csv'} 
                  onChange={() => setExportFormat('csv')}
                />
                <label className="form-check-label" htmlFor="csvFormat">
                  <FaFileCsv className="me-1" /> CSV
                </label>
              </div>
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="radio" 
                  name="exportFormat" 
                  id="pdfFormat" 
                  value="pdf" 
                  checked={exportFormat === 'pdf'} 
                  onChange={() => setExportFormat('pdf')}
                />
                <label className="form-check-label" htmlFor="pdfFormat">
                  <FaFilePdf className="me-1" /> PDF
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{ backgroundColor: customColor, color: 'white' }}
              onClick={handleExport}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="Attendance container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold">Attendance Management</h2>
      </div>
      <div className="mb-4">
        <ul className="nav nav-tabs flex-wrap">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'scan' ? 'active' : ''}`}
              style={activeTab === 'scan' ? { color: customColor, borderBottom: `2px solid ${customColor}` } : {}}
              onClick={() => setActiveTab('scan')}
            >
              <FaQrcode className="me-1" /> <span className="d-none d-sm-inline-block">QR Scanner</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'verify' ? 'active' : ''}`}
              style={activeTab === 'verify' ? { color: customColor, borderBottom: `2px solid ${customColor}` } : {}}
              onClick={() => setActiveTab('verify')}
            >
              <FaUserCheck className="me-1" /> <span className="d-none d-sm-inline-block">Verification</span>
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
              style={activeTab === 'reports' ? { color: customColor, borderBottom: `2px solid ${customColor}` } : {}}
              onClick={() => setActiveTab('reports')}
            >
              <FaCalendarAlt className="me-1" /> <span className="d-none d-sm-inline-block">Reports</span>
            </button>
          </li>
        </ul>
      </div>
      {activeTab === 'scan' && renderQRScanner()}
      {activeTab === 'verify' && renderAttendanceVerification()}
      {activeTab === 'reports' && renderReports()}
      {renderExportModal()}
    </div>
  );
};

export default PersonalTrainerAttendance;
