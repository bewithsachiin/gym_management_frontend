import React, { useState, useEffect } from 'react';
import {
  RiUserLine, RiSearchLine, RiNotificationLine, RiAddLine, RiQrScanLine
} from 'react-icons/ri';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const ReceptionistDashboard = () => {
  const [currentDate, setCurrentDate] = useState('');
  // 👇 sidebar offset (inline + responsive without external CSS)
  const [padLeft, setPadLeft] = useState(0); // px

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    updateDateTime();
    const t = setInterval(updateDateTime, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // iPad mini fix: md breakpoint (≥768px) par left padding = sidebar width
    const handle = () => setPadLeft(window.innerWidth >= 768 ? 25 : 0); // 64px ~ sidebar width
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const attendanceData = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{ label:'Attendance', data:[120,132,101,134,90,230,210],
      borderColor:'#2f6a87', backgroundColor:'rgba(47,106,135,0.1)', fill:true, tension:0.4, pointRadius:0, borderWidth:3 }]
  };
  const attendanceOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false},
      tooltip:{ backgroundColor:'rgba(255,255,255,0.9)', titleColor:'#1f2937', bodyColor:'#1f2937', borderColor:'#e5e7eb', borderWidth:1 } },
    scales:{ x:{ grid:{display:false}, ticks:{color:'#6b7280'} }, y:{ grid:{color:'#f3f4f6'}, ticks:{color:'#6b7280'} } }
  };

  const revenueData = {
    labels:['Razorpay','Card','Cash','UPI'],
    datasets:[{ data:[45,30,15,10],
      backgroundColor:['rgba(47,106,135,1)','rgba(110,178,204,1)','rgba(251,191,114,1)','rgba(252,141,98,1)'],
      borderWidth:0, borderRadius:4 }]
  };
  const revenueOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'right', labels:{ color:'#1f2937', font:{size:12} } },
      tooltip:{ backgroundColor:'rgba(255,255,255,0.9)', titleColor:'#1f2937', bodyColor:'#1f2937', borderColor:'#e5e7eb', borderWidth:1 } }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light overflow-hidden">
      {/* Header (shifted right on md+ so it doesn't go under sidebar) */}
      <header className="bg-white shadow-sm border-bottom"
              // style={{ paddingLeft: padLeft }}
              >
        <div className="container-fluid px-3 px-md-4 py-md-4">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center gap-2">
              <h1 className="mb-0 fw-bold">Dashboard</h1>
              <span className="text-muted d-none d-sm-inline">|</span>
              <span className="text-muted">{currentDate}</span>
            </div>

            <div className="col-12 col-md d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
              <div className="position-relative flex-grow-1">
                <input type="text" placeholder="Search members..." className="form-control ps-5 py-2" />
                <RiSearchLine className="position-absolute top-50 start-0 translate-middle-y text-muted ms-2"
                              style={{ pointerEvents: 'none' }} />
              </div>

              <button className="position-relative p-2 text-muted btn btn-link m-0 flex-shrink-0">
                <RiNotificationLine />
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle"></span>
              </button>

              {/* <button className="btn btn-primary d-flex align-items-center flex-shrink-0">
                <RiAddLine className="me-1" />
                <span className="d-none d-sm-inline">New Member</span>
                <span className="d-inline d-sm-none">Add</span>
              </button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Content (also shifted right on md+) */}
      <main style={{ paddingLeft: padLeft }}>
        <div className="container-fluid px-2 px-md-2 py-3 py-md-4">
          <div className="mb-3 mb-md-4">
            <h2 className="fw-bold mb-1">Good Morning, Sarah!</h2>
            <p className="text-muted mb-0">Here's what's happening at your fitness center today.</p>
          </div>

          {/* Stats Cards */}
          <div className="row g-3 mb-3 mb-md-4">
            <div className="col-12 col-md-6 col-lg-3 d-flex">
              <div className="card border-0 shadow-sm h-100 w-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Today's Check-ins</p>
                    <p className="fw-bold mb-1" style={{ fontSize: '1.75rem' }}>127</p>
                    <p className="text-success small mb-0">+12% from yesterday</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-center rounded-2"
                       style={{ backgroundColor: 'rgba(110,178,204,0.2)', width: '3rem', height: '3rem' }}>
                    <RiUserLine className="text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* duplicate more cards with same column classes */}
          </div>

          {/* Charts */}
          <div className="row g-3 mb-3 mb-md-4">
            <div className="col-12 col-lg-6 d-flex">
              <div className="card border-0 shadow-sm w-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Daily Attendance Trend</h5>
                  <div className="w-100" style={{ height: '300px' }}>
                    <Line data={attendanceData} options={attendanceOptions} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6 d-flex">
              <div className="card border-0 shadow-sm w-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Revenue by Payment Method</h5>
                  <div className="w-100" style={{ height: '300px' }}>
                    <Pie data={revenueData} options={revenueOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FAB */}
      <button
        className="position-fixed bottom-0 end-0 m-3 m-md-4 btn btn-primary rounded-circle shadow"
        style={{ width: '3.5rem', height: '3.5rem' }}
      >
        <RiQrScanLine style={{ fontSize: '1.5rem' }} />
      </button>
    </div>
  );
};

export default ReceptionistDashboard;
