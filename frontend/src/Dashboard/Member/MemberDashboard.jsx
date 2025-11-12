import React, { useState, useEffect, useRef } from 'react';
import { 
  RiDashboardLine, 
  RiUserLine, 
  RiVipCrownLine, 
  RiUserHeartLine, 
  RiTeamLine, 
  RiCalendarCheckLine, 
  RiGiftLine, 
  RiNotificationLine, 
  RiCheckLine, 
  RiTimeLine, 
  RiRefreshLine, 
  RiRocketLine, 
  RiStarFill, 
  RiStarLine, 
  RiInformationLine, 
  RiCloseLine, 
  RiLogoutBoxLine,
  RiQrCodeLine
} from 'react-icons/ri';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as echarts from 'echarts';

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState('Priya Singh');
  const [selectedDate, setSelectedDate] = useState('5');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  const workoutChartRef = useRef(null);
  const chartInstance = useRef(null);

  // Initialize chart
  useEffect(() => {
    if (workoutChartRef.current) {
      chartInstance.current = echarts.init(workoutChartRef.current);
      
      const option = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#eee',
          borderWidth: 1,
          textStyle: {
            color: '#1f2937'
          },
          padding: [8, 12]
        },
        grid: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          },
          axisLabel: {
            color: '#1f2937'
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#f3f4f6'
            }
          },
          axisLabel: {
            color: '#1f2937'
          }
        },
        series: [
          {
            name: 'Workout Duration',
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {
              width: 3,
              color: 'rgba(87, 181, 231, 1)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(87, 181, 231, 0.2)'
                },
                {
                  offset: 1,
                  color: 'rgba(87, 181, 231, 0.02)'
                }
              ])
            },
            data: [75, 90, 60, 85, 95, 70, 80]
          },
          {
            name: 'Calories Burned',
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {
              width: 3,
              color: 'rgba(141, 211, 199, 1)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(141, 211, 199, 0.2)'
                },
                {
                  offset: 1,
                  color: 'rgba(141, 211, 199, 0.02)'
                }
              ])
            },
            data: [450, 520, 380, 490, 550, 420, 480]
          }
        ]
      };
      
      chartInstance.current.setOption(option);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  // Handle trainer selection
  const handleTrainerSelect = (trainerName) => {
    setSelectedTrainer(trainerName);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Handle payment
  const handlePayment = () => {
    setShowPaymentModal(false);
    setTimeout(() => setShowSuccessModal(true), 500);
  };

  // Render dashboard section
  const renderDashboard = () => (
    <div>
      <div className="">
        <h1 className="display-6 fw-bold ">Welcome, Rahul!</h1>
        <p className="text-muted">Your fitness journey at a glance</p>
      </div>
      
      {/* Summary Widgets */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 fw-semibold">Workout Progress</h3>
                <div className="btn-group" role="group">
                  <button type="button" className="btn btn-primary btn-sm">Week</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm">Month</button>
                </div>
              </div>
              <div ref={workoutChartRef} style={{ height: '256px' }}></div>
            </div>
          </div>
        </div>
        
        {/* Membership Status Card */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-start border-primary border-4 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="h6 fw-semibold mb-1">Membership Status</h3>
                  <p className="text-success fw-medium">Active</p>
                  <p className="small text-muted">Expires: 15 Apr 2025</p>
                </div>
                <div className="d-flex align-items-center justify-center bg-primary bg-opacity-10 rounded-circle p-3" style={{ width: '60px', height: '60px' }}>
                  <RiVipCrownLine className="text-primary fs-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Classes This Week Card */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-start border-success border-4 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="h6 fw-semibold mb-1">Classes This Week</h3>
                  <p className="text-primary fw-medium d-flex align-items-center">
                    6 <RiCheckLine className="ms-2 text-success" />
                  </p>
                  <p className="small text-muted">Great progress!</p>
                </div>
                <div className="d-flex align-items-center justify-center bg-success bg-opacity-10 rounded-circle p-3" style={{ width: '60px', height: '60px' }}>
                  <RiCalendarCheckLine className="text-success fs-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Next Session Card */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-start border-warning border-4 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="h6 fw-semibold mb-1">Next Session</h3>
                  <p className="text-warning fw-medium">Zumba</p>
                  <p className="small text-muted">Tomorrow, 6:00 PM</p>
                </div>
                <div className="d-flex align-items-center justify-center bg-warning bg-opacity-10 rounded-circle p-3" style={{ width: '60px', height: '60px' }}>
                  <RiTimeLine className="text-warning fs-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
     
      </div>
    </div>
  );

  // Navigation tabs
  // const renderNavigation = () => (
  //   <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-2">
  //     {[
  //       { id: 'dashboard', label: 'Dashboard', icon: <RiDashboardLine /> },
  //       { id: 'profile', label: 'Profile Management', icon: <RiUserLine /> },
  //       { id: 'membership', label: 'Membership Renewal', icon: <RiVipCrownLine /> },
  //       { id: 'personal-training', label: 'Personal Training', icon: <RiUserHeartLine /> },
  //       { id: 'group-classes', label: 'Group Classes', icon: <RiTeamLine /> },
  //       { id: 'attendance', label: 'Attendance History', icon: <RiCalendarCheckLine /> },
  //       { id: 'offers', label: 'Offers & Promotions', icon: <RiGiftLine /> },
  //       { id: 'notifications', label: 'Notifications', icon: <RiNotificationLine /> }
  //     ].map(tab => (
  //       <button
  //         key={tab.id}
  //         className={`btn d-flex align-items-center gap-2 ${activeTab === tab.id ? 'btn-primary' : 'btn-light'}`}
  //         onClick={() => setActiveTab(tab.id)}
  //       >
  //         {tab.icon}
  //         <span>{tab.label}</span>
  //       </button>
  //     ))}
  //   </div>
  // );

  // Payment Modal
  const renderPaymentModal = () => (
    showPaymentModal && (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <h3 className="h5 fw-bold mb-2">Complete Payment</h3>
              <p className="text-muted">Secure payment via Razorpay</p>
              
              <div className="my-4">
                <div className="mb-3">
                  <label className="form-label small fw-medium">Payment Method</label>
                  <div className="d-flex flex-column gap-2">
                    <label className="d-flex align-items-center">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="upi" 
                        className="me-2" 
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                      />
                      <span>UPI Payment</span>
                    </label>
                    <label className="d-flex align-items-center">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card" 
                        className="me-2" 
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <span>Credit/Debit Card</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="form-label small fw-medium">Amount</label>
                  <div className="h2 fw-bold text-primary">₹4,500</div>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-secondary flex-grow-1"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary flex-grow-1"
                  onClick={handlePayment}
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Success Modal
  const renderSuccessModal = () => (
    showSuccessModal && (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <div className="d-flex justify-content-center mb-3">
                <div className="d-flex align-items-center justify-center bg-success bg-opacity-10 rounded-circle" style={{ width: '64px', height: '64px' }}>
                  <RiCheckLine className="text-success fs-2" />
                </div>
              </div>
              
              <h3 className="h5 fw-bold mb-2">Payment Successful!</h3>
              <p className="text-muted mb-4">Your membership has been renewed successfully.</p>
              
              <button 
                className="btn btn-primary"
                onClick={() => setShowSuccessModal(false)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // Placeholder functions for other tabs
  const renderProfile = () => <div>Profile Management Content</div>;
  const renderMembership = () => <div>Membership Renewal Content</div>;
  const renderPersonalTraining = () => <div>Personal Training Content</div>;
  const renderGroupClasses = () => <div>Group Classes Content</div>;
  const renderAttendanceHistory = () => <div>Attendance History Content</div>;
  const renderOffers = () => <div>Offers & Promotions Content</div>;
  const renderNotifications = () => <div>Notifications Content</div>;

  return (
    <div className="container-fluid bg-light p-0 min-vh-100" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="p-4">
        {/* Navigation Tabs */}
        {/* {renderNavigation()} */}
        
        {/* Content Sections */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}      
          {/* {activeTab === 'profile' && renderProfile()}
          {activeTab === 'membership' && renderMembership()}
          {activeTab === 'personal-training' && renderPersonalTraining()}
          {activeTab === 'group-classes' && renderGroupClasses()}
          {activeTab === 'attendance' && renderAttendanceHistory()}
          {activeTab === 'offers' && renderOffers()}
          {activeTab === 'notifications' && renderNotifications()} */}
        </div>
        
        {/* Modals */}
        {/* {renderPaymentModal()}
        {renderSuccessModal()} */}
      </div>
    </div>
  );
};

export default MemberDashboard;