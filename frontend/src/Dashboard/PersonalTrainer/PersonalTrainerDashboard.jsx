import React, { useState, useEffect } from 'react';
import { FaHome, FaUsers, FaCalendarAlt, FaDumbbell, FaQrcode, FaDollarSign, FaComments, FaBell, FaUserFriends, FaCalendarCheck, FaMoneyBill, FaUserCog, FaChevronRight, FaArrowUp } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const PersonalTrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Track sidebar visibility
  
  // Chart data
  const earningsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Earnings',
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        borderColor: '#6EB2CC',
        backgroundColor: 'rgba(110, 178, 204, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Updated sessions data with light colors from screenshot
  const sessionsData = {
    labels: ['Completed', 'Upcoming', 'Cancelled'],
    datasets: [
      {
        data: [28, 12, 4],
        backgroundColor: ['#A3D5E3', '#A7F3D0', '#FDE68A'], // Light blue, light green, light yellow
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 4
      },
    ],
  };
  
  // Chart options
  const earningsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
    },
  };
  
  const sessionsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          padding: 20, 
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
          // Generate labels with custom colors
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);
                
                return {
                  text: label,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  lineWidth: style.borderWidth,
                  pointStyle: 'circle',
                  hidden: !chart.getDataVisibility(i),
                  index: i
                };
              });
            }
            return [];
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} sessions`;
          }
        }
      }
    },
  };
  
  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      name: 'Sarah Johnson',
      action: 'completed her training session',
      time: '2 hours ago',
      image: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20female%20fitness%20enthusiast%20with%20a%20bright%20smile%20against%20a%20clean%20studio%20background&width=40&height=40&seq=2&orientation=squarish',
    },
    {
      id: 2,
      name: 'Mike Thompson',
      action: 'booked a new session',
      time: '4 hours ago',
      image: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20male%20fitness%20enthusiast%20with%20a%20confident%20expression%20against%20a%20clean%20studio%20background&width=40&height=40&seq=3&orientation=squarish',
    },
    {
      id: 3,
      name: 'Emily Parker',
      action: 'joined your HIIT class',
      time: '5 hours ago',
      image: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20a%20female%20fitness%20enthusiast%20with%20an%20energetic%20expression%20against%20a%20clean%20studio%20background&width=40&height=40&seq=4&orientation=squarish',
    },
  ];
  
  // Stats cards data
  const statsCards = [
    {
      title: 'Total Members',
      value: '1,247',
      icon: <FaUserFriends style={{ color: '#6EB2CC' }} />,
    },
    {
      title: "Today's Check-ins",
      value: '89',
      icon: <FaCalendarCheck style={{ color: '#6EB2CC' }} />,
    },
   
  
  ];
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className={`container-fluid bg-light min-vh-100  ${sidebarOpen ? 'ps-5' : ''}`}>
      {/* Sidebar (toggleable) */}
      <div className={`position-fixed top-0 start-0 vh-100 bg-dark p-3 ${sidebarOpen ? 'd-block' : 'd-none'}`} style={{ width: '64px' }}>
        <button className="btn btn-light" onClick={toggleSidebar}>X</button>
      </div>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ paddingLeft: sidebarOpen ? '64px' : '0' }}>
        <h1 className=" fw-bold">Dashboard</h1>
      
      </div>
      
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {statsCards.map((card, index) => (
          <div key={index} className="col-12 col-sm-6 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="card-subtitle text-muted">{card.title}</h6>
                  <div className="fs-4">{card.icon}</div>
                </div>
                <h3 className="card-title fw-bold">{card.value}</h3>
                {card.change && (
                  <p className="card-text text-success small mb-0">
                    <FaArrowUp className="me-1" />
                    {card.change} {card.period}
                  </p>
                )}
                {!card.change && (
                  <p className="card-text text-muted small mb-0">{card.period}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4">Earnings Overview</h5>
              <div style={{ height: '300px' }}>
                <Line data={earningsData} options={earningsOptions} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4">Sessions Overview</h5>
              <div style={{ height: '300px' }}>
                <Pie data={sessionsData} options={sessionsOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-4">Recent Activities</h5>
          <div className="list-group list-group-flush">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="list-group-item px-0 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <img
                      src={activity.image}
                      alt={activity.name}
                      className="rounded-circle me-3"
                      width="40"
                      height="40"
                    />
                    <div>
                      <p className="mb-0 fw-medium">
                        {activity.name} {activity.action}
                      </p>
                      <p className="mb-0 text-muted small">{activity.time}</p>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-link p-0" style={{ color: '#6EB2CC' }}>
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalTrainerDashboard;