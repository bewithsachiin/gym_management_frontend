import React, { useEffect, useRef } from 'react';
import { 
  RiCalendarEventLine, 
  RiGroupLine, 
  RiMessage2Line, 
  RiTrophyLine,
  RiCheckLine,
  RiTimeLine,
  RiClipboardLine,
  RiChat3Line,
  RiBarChartLine
} from 'react-icons/ri';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as echarts from 'echarts';

const GeneralTrainerDashboard = () => {
  const attendanceChartRef = useRef(null);
  const engagementChartRef = useRef(null);

  useEffect(() => {
    // Initialize Attendance Trend Chart
    const attendanceChart = echarts.init(attendanceChartRef.current);
    const attendanceOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#eee',
        borderWidth: 1,
        textStyle: {
          color: '#1f2937'
        }
      },
      grid: {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40,
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
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#1f2937'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      series: [{
        name: 'Attendance',
        type: 'line',
        smooth: true,
        data: [85, 92, 78, 94, 88, 76, 82],
        lineStyle: {
          color: 'rgba(87, 181, 231, 1)'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(87, 181, 231, 0.2)'
          }, {
            offset: 1,
            color: 'rgba(87, 181, 231, 0.05)'
          }])
        },
        symbol: 'none'
      }]
    };
    attendanceChart.setOption(attendanceOption);

    // Initialize Class Distribution Chart
    const engagementChart = echarts.init(engagementChartRef.current);
    const engagementOption = {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#eee',
        borderWidth: 1,
        textStyle: {
          color: '#1f2937'
        }
      },
      legend: {
        bottom: '0',
        left: 'center',
        textStyle: {
          color: '#1f2937'
        }
      },
      series: [{
        name: 'Class Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: 'Cardio', itemStyle: { color: 'rgba(87, 181, 231, 1)' } },
          { value: 25, name: 'Strength', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
          { value: 20, name: 'Yoga', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
          { value: 20, name: 'HIIT', itemStyle: { color: 'rgba(252, 141, 98, 1)' } }
        ]
      }]
    };
    engagementChart.setOption(engagementOption);

    // Handle window resize
    const handleResize = () => {
      attendanceChart.resize();
      engagementChart.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      attendanceChart.dispose();
      engagementChart.dispose();
    };
  }, []);

  // Handle class block click
  const handleClassClick = (className, time) => {
    alert(`Class Details:\n${className}\n${time}\n\nClick to view full details or mark attendance.`);
  };

  return (
    <div className=" bg-light p-0">
      <div className=" p-md-2">
        {/* Header */}
        <header className="bg-white border-bottom border-gray-200  p-md-4 mb-4 rounded shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="mb-3 mb-md-0 text-center text-md-start">
              <h1 className="h2 h4-md fw-bold text-dark">Welcome, Rahul!</h1>
              <p className="text-secondary">Your schedule and tasks for today</p>
            </div>
          </div>
        </header>

        {/* Statistics Section */}
        <div className="row mb-4">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="bg-white rounded shadow-sm p-3 p-md-4 border">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                <h3 className="h5 h6-md fw-semibold text-dark mb-2 mb-md-0">Weekly Attendance Trend</h3>
                <select className="form-select form-select-sm w-auto">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <div ref={attendanceChartRef} style={{ height: '300px', minWidth: '400px' }}></div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="bg-white rounded shadow-sm p-3 p-md-4 border">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                <h3 className="h5 h6-md fw-semibold text-dark mb-2 mb-md-0">Class Distribution</h3>
                <select className="form-select form-select-sm w-auto">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Quarter</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <div ref={engagementChartRef} style={{ height: '300px', minWidth: '400px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-6 col-lg-3 mb-3 mb-lg-0">
            <div className="bg-white rounded shadow-sm p-3 p-md-4 border h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-secondary small fw-medium">Classes Today</p>
                  <p className="h4 h3-md fw-bold text-dark mt-2">4</p>
                  <p className="text-primary small mt-1">Next: Zumba at 6:00 PM</p>
                </div>
                <div className="bg-primary bg-opacity-10 rounded p-2">
                  <RiCalendarEventLine className="text-primary fs-4 fs-3-md" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3 mb-3 mb-lg-0">
            <div className="bg-white rounded shadow-sm p-3 p-md-4 border h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-secondary small fw-medium">Members to Train</p>
                  <p className="h4 h3-md fw-bold text-dark mt-2">28</p>
                  <p className="text-success small mt-1">Active members</p>
                </div>
                <div className="bg-success bg-opacity-10 rounded p-2">
                  <RiGroupLine className="text-success fs-4 fs-3-md" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3 mb-3 mb-lg-0">
            <div className="bg-white rounded shadow-sm p-3 p-md-4 border h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-secondary small fw-medium">Pending Feedback</p>
                  <p className="h4 h3-md fw-bold text-dark mt-2">5</p>
                  <p className="text-warning small mt-1">Requires attention</p>
                </div>
                <div className="bg-warning bg-opacity-10 rounded p-2">
                  <RiMessage2Line className="text-warning fs-4 fs-3-md" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="bg-white rounded shadow-sm p-3 p-md-4 border h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-secondary small fw-medium">Classes This Week</p>
                  <p className="h4 h3-md fw-bold text-dark mt-2">12</p>
                  <p className="text-info small mt-1">Completed classes</p>
                </div>
                <div className="bg-info bg-opacity-10 rounded p-2">
                  <RiTrophyLine className="text-info fs-4 fs-3-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Class Schedule */}
        <div className="bg-white rounded shadow-sm border overflow-hidden">
          <div className="p-3 p-md-4 border-bottom">
            <h2 className="h4 h5-md fw-semibold text-dark">Daily Class Schedule</h2>
            <p className="text-secondary small">Weekly view - January 15-21, 2025</p>
          </div>
          <div className="p-3 p-md-4">
            <div className="overflow-x-auto">
              {/* Calendar Header */}
              <div className="d-grid border border-gray-200" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', gap: '1px', minWidth: '800px' }}>
                <div className="bg-light p-2 text-center fw-medium text-secondary">Time</div>
                <div className="bg-light p-2 text-center fw-medium text-secondary">Mon<br/><span className="text-muted small">15</span></div>
                <div className="bg-light p-2 text-center fw-medium text-secondary">Tue<br/><span className="text-muted small">16</span></div>
                <div className="bg-light p-2 text-center fw-medium text-secondary">Wed<br/><span className="text-muted small">17</span></div>
                <div className="bg-light p-2 text-center fw-medium text-secondary">Thu<br/><span className="text-muted small">18</span></div>
                <div className="bg-light p-2 text-center fw-medium text-secondary">Fri<br/><span className="text-muted small">19</span></div>
                <div className="bg-light p-2 text-center fw-medium text-secondary">Sat<br/><span className="text-muted small">20</span></div>
                <div className="bg-light p-2 text-center fw-medium text-secondary">Sun<br/><span className="text-muted small">21</span></div>
              </div>
              
              {/* Calendar Body */}
              <div className="d-grid border border-gray-200 mt-1" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', gap: '1px', minWidth: '800px' }}>
                {/* 6:00 AM Row */}
                <div className="bg-light p-2 d-flex align-items-center justify-content-center small fw-medium text-secondary">6:00</div>
                <div className="bg-white"></div>
                <div className="bg-white p-2">
                  <div 
                    className=" text-light p-2 rounded cursor-pointer"
                    style={{backgroundColor: "#2f6a87"}}
                    onClick={() => handleClassClick('Morning Cardio', '6:00-7:00 AM')}
                  >
                    <div className="small fw-semibold">Morning Cardio</div>
                    <div className="small opacity-90">6:00-7:00 AM</div>
                    <div className="small opacity-90">Studio A • 12/15</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiCheckLine className="me-1" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                <div className="bg-white p-2">
                  <div 
                    className=" text-white p-2 rounded cursor-pointer"
                    style={{backgroundColor: "#2f6a87"}}
                    onClick={() => handleClassClick('HIIT Training', '6:00-7:00 AM')}
                  >
                    <div className="small fw-semibold">HIIT Training</div>
                    <div className="small opacity-90">6:00-7:00 AM</div>
                    <div className="small opacity-90">Studio B • 8/12</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiCheckLine className="me-1" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                <div className="bg-white p-2">
                  <div 
                    className=" text-white p-2 rounded cursor-pointer"
                    style={{backgroundColor: "#2f6a87"}}
                    onClick={() => handleClassClick('Yoga Flow', '6:00-7:00 AM')}
                  >
                    <div className="small fw-semibold">Yoga Flow</div>
                    <div className="small opacity-90">6:00-7:00 AM</div>
                    <div className="small opacity-90">Studio C • 15/20</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiCheckLine className="me-1" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                
                {/* 7:00 AM Row */}
                <div className="bg-light p-2 d-flex align-items-center justify-content-center small fw-medium text-secondary">7:00</div>
                <div className="bg-white p-2">
                  <div 
                    className=" text-white p-2 rounded cursor-pointer"
                    style={{backgroundColor: "#2f6a87"}}
                    onClick={() => handleClassClick('Strength Training', '7:00-8:00 AM')}
                  >
                    <div className="small fw-semibold">Strength Training</div>
                    <div className="small opacity-90">7:00-8:00 AM</div>
                    <div className="small opacity-90">Gym Floor • 10/12</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiCheckLine className="me-1" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                <div className="bg-white p-2">
                  <div 
                    className=" text-white p-2 rounded cursor-pointer"
                    style={{backgroundColor: "#2f6a87"}}
                    onClick={() => handleClassClick('Pilates', '7:00-8:00 AM')}
                  >
                    <div className="small fw-semibold">Pilates</div>
                    <div className="small opacity-90">7:00-8:00 AM</div>
                    <div className="small opacity-90">Studio A • 14/16</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiCheckLine className="me-1" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                
                {/* 8:00 AM Row */}
                <div className="bg-light p-2 d-flex align-items-center justify-content-center small fw-medium text-secondary">8:00</div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white p-2">
                  <div 
                    className=" text-white p-2 rounded cursor-pointer"
                    style={{backgroundColor: "#2f6a87"}}
                    onClick={() => handleClassClick('CrossFit', '8:00-9:00 AM')}
                  >
                    <div className="small fw-semibold">CrossFit</div>
                    <div className="small opacity-90">8:00-9:00 AM</div>
                    <div className="small opacity-90">Studio B • 6/10</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiCheckLine className="me-1" />
                        Completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                
                {/* 6:00 PM Row */}
                <div className="bg-light p-2 d-flex align-items-center justify-content-center small fw-medium text-secondary">18:00</div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white p-2">
                  <div 
                    className="bg-warning text-white p-2 rounded cursor-pointer"
                    onClick={() => handleClassClick('Zumba', '6:00-7:00 PM')}
                  >
                    <div className="small fw-semibold">Zumba</div>
                    <div className="small opacity-90">6:00-7:00 PM</div>
                    <div className="small opacity-90">Studio A • 18/25</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiTimeLine className="me-1" />
                        Upcoming
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                
                {/* 7:00 PM Row */}
                <div className="bg-light p-2 d-flex align-items-center justify-content-center small fw-medium text-secondary">19:00</div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white p-2">
                  <div 
                    className="bg-warning text-white p-2 rounded cursor-pointer"
                    onClick={() => handleClassClick('Boxing', '7:00-8:00 PM')}
                  >
                    <div className="small fw-semibold">Boxing</div>
                    <div className="small opacity-90">7:00-8:00 PM</div>
                    <div className="small opacity-90">Studio B • 8/12</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiTimeLine className="me-1" />
                        Upcoming
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                <div className="bg-white p-2">
                  <div 
                    className="bg-warning text-white p-2 rounded cursor-pointer"
                    onClick={() => handleClassClick('Evening Yoga', '7:00-8:00 PM')}
                  >
                    <div className="small fw-semibold">Evening Yoga</div>
                    <div className="small opacity-90">7:00-8:00 PM</div>
                    <div className="small opacity-90">Studio C • 12/20</div>
                    <div className="small mt-1">
                      <span className="d-flex align-items-center">
                        <RiTimeLine className="me-1" />
                        Upcoming
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralTrainerDashboard;