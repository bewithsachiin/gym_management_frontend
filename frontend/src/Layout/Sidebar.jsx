import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faUsers,
  faCalendarAlt,
  faClipboardCheck,
  faDollarSign,
  faComments,
  faChalkboardTeacher, // Group Classes
  faGear,
  faChevronDown,
  faUserTag,
  faFileAlt,
  faUserGear,
  faCalculator,
  faChartLine,
  faAddressBook,
  faCalendarDays,
  faClapperboard,
  faStarOfDavid,
  faMoneyBillAlt,
  faNetworkWired,
  faChartArea,
  faCaretRight,
  faEye,
  faBookAtlas,
  faUserGroup
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null); // for dropdown toggle
  const [userRole, setUserRole] = useState("admin");

  // Load user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole") || "admin";
    setUserRole(role);
  }, []);

  const toggleMenu = (menuKey) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };

  const isActive = (path) => {
    // normalize and compare
    if (!path) return false;
    return location.pathname === path || location.pathname === `/${path.replace(/^\//, "")}`;
  };

  const handleNavigate = (path) => {
    if (!path) return;
    // ensure leading slash for react-router
    const normalized = path.startsWith("/") ? path : `/${path}`;
    navigate(normalized);
    // auto collapse on small screens
    if (window.innerWidth <= 768) setCollapsed(true);
  };

  // Role-based menu definitions — every imported icon is used at least once
  const allMenus = {
    superadmin: [
      { name: "Dashboard", icon: faChartBar, path: "/superadmin/dashboard" },
      { name: "Branches", icon: faUsers, path: "/superadmin/branches" },
      {
        name: "Reports",
        icon: faChartLine,
        key: "reports",
        subItems: [
          { label: "Sales", path: "/superadmin/reports/sales" },
          { label: "Attendance", path: "/superadmin/reports/attendance" },
          { label: "Memberships", path: "/superadmin/reports/memberships" },
        ],
      },
      {
        name: "People",
        icon: faUsers,
        key: "people",
        subItems: [
          { label: "Staff", path: "/superadmin/people/staff" },
          { label: "Members", path: "/superadmin/people/members" },
          { label: "Contacts", path: "/superadmin/people/contacts", icon: faAddressBook },
        ],
      },
      { name: "Plans", icon: faBookAtlas, path: "/superadmin/plans" },
      {
        name: "Payments",
        icon: faMoneyBillAlt,
        key: "payments",
        subItems: [
          { label: "Invoices", path: "/superadmin/payments/invoices" },
          { label: "Razorpay Reports", path: "/superadmin/payments/razorpayReports" },
        ],
      },
      { name: "Integrations", icon: faNetworkWired, path: "/superadmin/integrations" },
      {
        name: "Settings",
        icon: faUserGear,
        key: "settings",
        subItems: [
          { label: "Role Management", path: "/superadmin/settings/roles" },
          { label: "Branch Management", path: "/superadmin/settings/branches" },
        ],
      },
    ],

    admin: [
      { name: "Dashboard", icon: faChartBar, path: "/admin/admin-dashboard" },
      { name: "QR Check-in", icon: faGear, path: "/admin/qrcheckin" },

      // Group classes uses chalkboard icon
      { name: "Group Classes", icon: faChalkboardTeacher, path: "/admin/group" },

      { name: "Create Plan", icon: faBookAtlas, path: "/admin/createplan" },

      { name: "Classes Schedule", icon: faClapperboard, path: "/admin/classesSchedule" },
      { name: "Session Bookings", icon: faCalendarAlt, path: "/admin/bookings" },

      {
        name: "Members",
        icon: faUsers,
        key: "members",
        subItems: [
          { label: "Manage Members", path: "/admin/members/manage-members" },
          { label: "QR Code Attendance", path: "/admin/members/qr-code-attendance" },
          { label: "Walk-in Registration", path: "/admin/members/walk-in-registration" },
        ],
      },

      {
        name: "Staff",
        icon: faUserGroup,
        key: "staff",
        subItems: [
          { label: "Manage Staff", path: "/admin/staff/manage-staff" },
          { label: "Roles & Permissions", path: "/admin/staff/roles-permissions", icon: faUserGear },
          { label: "Attendance", path: "/admin/staff/attendance", icon: faClipboardCheck },
          { label: "Duty Roster", path: "/admin/staff/duty-roster", icon: faCalendarDays },
          { label: "Salary Calculator", path: "/admin/staff/salary-calculator", icon: faCalculator },
        ],
      },

      { name: "Personal Training Details", icon: faFileAlt, path: "/admin/booking/personal-training" },

      {
        name: "Payments",
        icon: faDollarSign,
        key: "payment",
        subItems: [
          { label: "Membership Payment", path: "/admin/payments/membership", icon: faMoneyBillAlt },
          { label: "Refunds", path: "/admin/payments/refunds", icon: faDollarSign },
        ],
      },

      {
        name: "Reports",
        icon: faChartArea,
        key: "reports",
        subItems: [
          { label: "Sales Report", path: "/admin/reports/sales", icon: faChartLine },
          { label: "Attendance Report", path: "/admin/reports/attendance", icon: faClipboardCheck },
          { label: "Class Utilization", path: "/admin/reports/classes", icon: faChartArea },
        ],
      },

      {
        name: "Settings",
        icon: faGear,
        key: "settings",
        subItems: [
          { label: "Role Management", path: "/admin/settings/role-management", icon: faUserGear },
          { label: "Branch Management", path: "/admin/settings/branch-management", icon: faAddressBook },
          { label: "Integrations", path: "/admin/settings/integrations", icon: faNetworkWired },
        ],
      },
    ],

    housekeeping: [
      { name: "Dashboard", icon: faChartBar, path: "/housekeeping/dashboard" },
      { name: "QR Check-in", icon: faGear, path: "/housekeeping/qrcheckin" },
      { name: "Duty Roster", icon: faCalendarDays, path: "/housekeeping/duty-roster" },
      { name: "Attendance Marking", icon: faUserTag, path: "/housekeeping/attendance" },
      { name: "Task Checklist", icon: faClipboardCheck, path: "/housekeeping/task-checklist" },
      { name: "Notifications", icon: faComments, path: "/housekeeping/notifications" },
    ],

    generaltrainer: [
      { name: "Dashboard", icon: faChartBar, path: "/generaltrainer/dashboard" },
      { name: "QR Check-in", icon: faGear, path: "/generaltrainer/qrcheckin" },
      { name: "Group Plans & Bookings", icon: faUserGroup, path: "/generaltrainer/groupplansbookings" },
      { name: "Daily Schedule", icon: faChartArea, path: "/generaltrainer/daily-schedule" },
      { name: "Attendance", icon: faClipboardCheck, path: "/generaltrainer/attendance" },
      { name: "Reports Classes", icon: faFileAlt, path: "/generaltrainer/reports" },
      { name: "Coach Chat", icon: faComments, path: "/generaltrainer/chat" },
      { name: "Rewards & Badges", icon: faStarOfDavid, path: "/generaltrainer/rewards" },
    ],

    personaltrainer: [
      { name: "Dashboard", icon: faChartBar, path: "/personaltrainer/dashboard" },
      { name: "QR Check-in", icon: faGear, path: "/personaltrainer/qrcheckin" },
      { name: "Plans & Bookings", icon: faBookAtlas, path: "/personaltrainer/personal-plans-bookings" },
      { name: "Assigned Members", icon: faUsers, path: "/personaltrainer/members" },
      { name: "Session Bookings", icon: faCalendarAlt, path: "/personaltrainer/bookings" },
      { name: "Group Classes", icon: faChalkboardTeacher, path: "/personaltrainer/group-classes" },
      { name: "Attendance", icon: faClipboardCheck, path: "/personaltrainer/attendance" },
      { name: "Salary Overview", icon: faCalculator, path: "/personaltrainer/salary" },
      { name: "Messages", icon: faComments, path: "/personaltrainer/messages" },
    ],

    receptionist: [
      { name: "Dashboard", icon: faChartBar, path: "/receptionist/dashboard" },
      { name: "QR Check-in", icon: faGear, path: "/receptionist/qrcheckin" },
      { name: "Walk-in Registration", icon: faFileAlt, path: "/receptionist/walk-in-registration" },
      { name: "New Sign-ups", icon: faUserTag, path: "/receptionist/new-signups" },
      { name: "QR Attendance", icon: faClipboardCheck, path: "/receptionist/qr-attendance" },
      { name: "Book Classes & Sessions", icon: faClapperboard, path: "/receptionist/book-classes-sessions" },
      { name: "Payments", icon: faMoneyBillAlt, path: "/receptionist/payments" },
    ],

    member: [
      { name: "Dashboard", icon: faChartBar, path: "/member/dashboard" },
      { name: "QR Check-in", icon: faGear, path: "/member/qrcheckin" },
      { name: "View Plan", icon: faEye, path: "/member/viewplan" },
      { name: "Class Schedule", icon: faClapperboard, path: "/member/classSchedule" },
      { name: "Book Classes", icon: faNetworkWired, path: "/member/memberbooking" },
      { name: "My Account", icon: faMoneyBillAlt, path: "/member/account" },
      { name: "Support / Contact", icon: faAddressBook, path: "/member/support" },
    ],
  };

  const userMenus = allMenus[userRole] || allMenus.admin;

  return (
    <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar">
        <ul className="menu">
          {userMenus.map((menu, index) => {
            // If no subItems → direct link
            if (!menu.subItems) {
              return (
                <li key={index} className="menu-item">
                  <div
                    className={`menu-link ${isActive(menu.path) ? "active" : ""}`}
                    onClick={() => handleNavigate(menu.path)}
                    style={{ cursor: "pointer" }}
                  >
                    <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                    {!collapsed && <span className="menu-text">{menu.name}</span>}
                  </div>
                </li>
              );
            }

            // If has subItems → show dropdown
            return (
              <li key={index} className="menu-item">
                <div
                  className="menu-link mb-2"
                  onClick={() => toggleMenu(menu.key)}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                  {!collapsed && <span className="menu-text">{menu.name}</span>}
                  {!collapsed && (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`arrow-icon ${activeMenu === menu.key ? "rotate" : ""}`}
                    />
                  )}
                </div>

                {/* Show submenu only if menu is active and not collapsed */}
                {!collapsed && activeMenu === menu.key && (
                  <ul className="submenu">
                    {menu.subItems.map((sub, subIndex) => (
                      <li
                        key={subIndex}
                        className={`submenu-item mb-2 ${isActive(sub.path) ? "active-sub" : ""}`}
                        onClick={() => handleNavigate(sub.path)}
                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                      >
                        {/* optional icon per sub-item if provided, otherwise caret */}
                        <FontAwesomeIcon icon={sub.icon || faCaretRight} className="submenu-icon" />
                        <span>{sub.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
