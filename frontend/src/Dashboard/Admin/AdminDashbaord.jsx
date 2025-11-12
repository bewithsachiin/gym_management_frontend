import React, { useEffect, useRef } from 'react';
import { 
  RiUserLine, 
  RiMoneyDollarCircleLine, 
  RiCalendarCheckLine, 
  RiTeamLine,
  RiUserAddLine,
  RiCalendarLine,
  RiBarChartLine,
  RiMegaphoneLine
} from 'react-icons/ri';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as echarts from 'echarts';

const AdminDashboard = () => {
  const memberGrowthChartRef = useRef(null);
  const revenueChartRef = useRef(null);

  useEffect(() => {
    // Initialize Member Growth Chart
    const memberGrowthChart = echarts.init(memberGrowthChartRef.current);
    const memberGrowthOption = {
      animation: false,
      grid: { top: 0, right: 0, bottom: 0, left: 0 },
      xAxis: {
        type: 'category',
        data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#6B7280', fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#6B7280', fontSize: 12 },
        splitLine: { lineStyle: { color: '#F3F4F6' } }
      },
      series: [{
        data: [1180, 1205, 1230, 1247],
        type: 'line',
        smooth: true,
        lineStyle: { color: '#2f6a87', width: 3 },
        itemStyle: { color: '#2f6a87' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(47, 106, 135, 0.1)' },
              { offset: 1, color: 'rgba(47, 106, 135, 0.01)' }
            ]
          }
        },
        showSymbol: false
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E7EB',
        textStyle: { color: '#1F2937' }
      }
    };
    memberGrowthChart.setOption(memberGrowthOption);

    // Initialize Revenue Chart
    const revenueChart = echarts.init(revenueChartRef.current);
    const revenueOption = {
      animation: false,
      grid: { top: 20, right: 20, bottom: 20, left: 20 },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 15680, name: 'Memberships', itemStyle: { color: '#2f6a87' } },
          { value: 5200, name: 'Personal Training', itemStyle: { color: '#6eb2cc' } },
          { value: 2400, name: 'Classes', itemStyle: { color: '#9ac7da' } },
          { value: 1300, name: 'Merchandise', itemStyle: { color: '#c5dde8' } }
        ],
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        },
        label: { color: '#1F2937', fontSize: 12 }
      }],
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#E5E7EB',
        textStyle: { color: '#1F2937' },
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      }
    };
    revenueChart.setOption(revenueOption);

    // Handle window resize
    const handleResize = () => {
      memberGrowthChart.resize();
      revenueChart.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      memberGrowthChart.dispose();
      revenueChart.dispose();
    };
  }, []);

  return (
    <div className="w-100 min-vh-100  p-0">
      <div className="">
        <div className="mb-4">
          <h1 className="fw-bold " >Dashboard Overview</h1>
          <p className="text-muted">Welcome back, John! Here's what's happening at your gym today.</p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-6 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                      <RiUserLine className="text-primary fs-4 fs-md-5" />
                    </div>
                   
                  </div>
                  <h3 className="h2 fw-bold mb-1"> ₹1,247</h3>
                  <p className="text-muted small mb-0">Total Members</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 p-2 rounded me-2">
                      <RiMoneyDollarCircleLine className="text-success fs-4 fs-md-5" />
                    </div>
                 
                  </div>
                  <h3 className="h2 fw-bold mb-1">₹24,580</h3>
                  <p className="text-muted small mb-0">Monthly Revenue</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning bg-opacity-10 p-2 rounded me-2">
                      <RiCalendarCheckLine className="text-warning fs-4 fs-md-5" />
                    </div>
                   
                  </div>
                  <h3 className="h2 fw-bold mb-1">₹89</h3>
                  <p className="text-muted small mb-0">Today's Check-ins</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6 col-lg-3">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info bg-opacity-10 p-2 rounded me-2">
                      <RiTeamLine className="text-info fs-4 fs-md-5" />
                    </div>
                  
                  </div>
                  <h3 className="h2 fw-bold mb-1">₹24</h3>
                  <p className="text-muted small mb-0">Active Staff</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                  <h3 className="h5 fw-semibold mb-2 mb-md-0">Member Growth</h3>
                
                </div>
              </div>
              <div className="card-body">
                <div ref={memberGrowthChartRef} style={{ height: '250px' }} className="w-100"></div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                  <h3 className="h5 fw-semibold mb-2 mb-md-0">Revenue Distribution</h3>
                
                </div>
              </div>
              <div className="card-body">
                <div ref={revenueChartRef} style={{ height: '250px' }} className="w-100"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities and Quick Actions */}
        <div className="row g-3">
          <div className="col-12 col-lg-12">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                  <h3 className="h5 fw-semibold mb-2 mb-md-0">Recent Activities</h3>
                  <button className="btn btn-sm btn-link text-primary p-0">View All</button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center p-3 border rounded">
                    <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                      <RiUserAddLine className="text-success" />
                    </div>
                    <div className="flex-grow-1">
                      <p className="fw-medium mb-0">New member registration</p>
                      <p className="text-muted small mb-0">Sarah Johnson joined Premium Plan</p>
                    </div>
                    <span className="text-muted small">2 min ago</span>
                  </div>

                  <div className="d-flex align-items-center p-3 border rounded">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                      <RiMoneyDollarCircleLine className="text-primary" />
                    </div>
                    <div className="flex-grow-1">
                      <p className="fw-medium mb-0">Payment received</p>
                      <p className="text-muted small mb-0">Michael Brown - Monthly membership $89</p>
                    </div>
                    <span className="text-muted small">15 min ago</span>
                  </div>

                  <div className="d-flex align-items-center p-3 border rounded">
                    <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                      <RiCalendarLine className="text-warning" />
                    </div>
                    <div className="flex-grow-1">
                      <p className="fw-medium mb-0">Class booking</p>
                      <p className="text-muted small mb-0">Emma Davis booked Yoga Class for tomorrow</p>
                    </div>
                    <span className="text-muted small">32 min ago</span>
                  </div>

                  <div className="d-flex align-items-center p-3 border rounded">
                    <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                      <RiUserLine className="text-info" />
                    </div>
                    <div className="flex-grow-1">
                      <p className="fw-medium mb-0">Staff check-in</p>
                      <p className="text-muted small mb-0">Alex Thompson started morning shift</p>
                    </div>
                    <span className="text-muted small">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;