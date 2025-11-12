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
  faChalkboardTeacher,  // ✅ नया आइकन: Group Classes के लिए
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
import { icon } from "@fortawesome/fontawesome-svg-core";


const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null); // ✅ Added: for dropdown toggle
  const [userRole, setUserRole] = useState("admin");

  // Load user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole") || "admin";
    setUserRole(role);
  }, []);

  const toggleMenu = (menuKey) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setCollapsed(true);
  };

  // Define menus for each role
  const allMenus = {


    superadmin: [
      {
        name: "Dashboard",
        icon: faChartBar,
        path: "/superadmin/dashboard",
      },
      {
        name: "Branches",
        icon: faUsers,
        path: "/superadmin/branches",
      },
      {
        name: "Reports",
        icon: faChartLine,
        key: "reports",
        subItems: [
          { label: "Sales", path: "/superadmin/reports/sales" },
          { label: "Attendance", path: "/superadmin/reports/attendance" },
          { label: "Memberships", path: "/superadmin/reports/membership" }, // from Payments

        ],
      },

      {
        name: "People",
        icon: faUsers,
        key: "people",
        subItems: [
          { label: "Staff", path: "superadmin/people/staff" },
          { label: "Members", path: "superadmin/people/members" },

        ],
      },
      {
        name: "Plans",
        icon: faUsers,
        path: "/superadmin/plans",
      },
      {
        name: "Payments",
        icon: faUsers,
        key: "Payments",
        subItems: [
          { label: "Invoices", path: "superadmin/payments/invoices" },
          { label: "Razorpay Reports", path: "superadmin/payments/razorpayReports" },

        ],
      },



    ],




    admin: [
      {
        name: "Dashboard",
        icon: faChartBar,
        path: "admin/admin-dashboard",
      },
      {
        name: "Qr Check-in",
        icon: faGear,
        path: "/admin/qrcheckin",
      },

      {
        name: "Group  Classes",
        icon: faUsers,
        path: "admin/group",
      },

      {
        name: "Create Plan",
        icon: faUsers,
        path: "admin/createplan"
      },


      {
        name: "Classes Schedule",
        icon: faUsers,
        path: "/admin/classesSchedule",
      },
       {
        name: "Session Bookings",
        icon: faCalendarAlt,
        path: "/admin/bookings",
      },


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
        icon: faUsers,
        key: "Staff",
        subItems: [
          { label: "Manage Staff", path: "/admin/staff/manage-staff" },
          { label: "Roles & Permissions", path: "/admin/staff/roles-permissions" },
          { label: "Attendance", path: "/admin/staff/attendance" },
          { label: "Duty Roster", path: "/admin/staff/duty-roster" },

          { label: "Salary Calculator", path: "/admin/staff/salary-calculator" },

        ],
      },



      {
        name: "Personal Training Details",
        icon: faFileAlt,
        path: "/admin/booking/personal-training",
      },




      {
        name: "Payments",
        icon: faCalculator,
        key: "payment",

        subItems: [
          { label: "Membership Payment", path: "/admin/payments/membership" },

        ],
      },



      {
        name: "Reports",
        icon: faChartLine,
        key: "reports",
        subItems: [
          { label: "Sales Report", path: "/admin/reports/sales" },
          { label: "Attendance Report", path: "/admin/reports/AttendanceReport" },
        ],
      },

      {
        name: "Settings",
        icon: faGear,
        key: "settings",
        subItems: [
          { label: "Role Management", path: "admin/settings/RoleManagement" },
          { label: "Branch Management", path: "admin/settings/BranchManagement" },
        ],
      },

    ],


    // manager: [
    //   {
    //     name: "Dashboard",
    //     icon: faChartBar,
    //     path: "/manager/dashboard",
    //   },
    //   {
    //    name: "Member Management",
    //    icon: faUsers,
    //    path: "/manager/members",
    //   },
    //   {
    //     name: "Membership Plan Assignment",
    //     icon: faUserTag,
    //     path: "/manager/membership-plan",
    //   },
    //   {
    //     name: "Staff Management",
    //     icon: faCalendarAlt,
    //     path: "/manager/duty-roster",
    //   },
    //   {
    //     name: "Class Scheduling",
    //     icon: faCalendarDays,
    //     path: "/manager/class-schedule",
    //   },
    //   {
    //     name: "Sales & Revenue Reports",
    //     icon: faDollarSign,
    //     path: "/manager/reports",
    //   },
    //   {
    //     name: "Communication",
    //     icon: faComments,
    //     path: "/manager/communication",
    //   },
    // ],


    housekeeping: [
      {
        name: "Dashboard",
        icon: faChartBar,
        path: "/housekeeping/dashboard",
      },
      {
        name: "QR Check-in",
        icon: faGear,
        path: "/housekeeping/qrcheckin",
      },
      {
        name: "Duty Roster",
        icon: faUsers,
        path: "/housekeeping/members",
      },
      {
        name: "Attendance Marking",
        icon: faUserTag,
        path: "/housekeeping/membership-plan",
      },
      {
        name: "Task Checklist",
        icon: faCalendarAlt,
        path: "/housekeeping/duty-roster",
      },
      {
        name: "Notifications",
        icon: faCalendarDays,
        path: "/housekeeping/class-schedule",
      },

    ],



    generaltrainer: [
      {
        name: "Dashboard",
        icon: faChartBar,
        path: "/generaltrainer/dashboard",
      },
      {
        name: "Qr Check-in",
        icon: faGear,
        path: "/generaltrainer/qrcheckin",
      },
      {
        name: "GroupPlans & Bookings",
        icon: faUserGroup,
        path: "/generaltrainer/groupplansbookings"
      },
      {
        name: "Daily Schedule",
        icon: faChartArea,
        path: "/generaltrainer/DailyScedule",
      },
      {
        name: "Attendance",
        icon: faClipboardCheck,
        path: "/generaltrainer/attendance",
      },
      // {
      //   name: "Member Interaction",
      //   icon: faComments,
      //   path: "/generaltrainer/MemberInteraction",
      // },
      {
        name: "Reports Classes",
        icon: faFileAlt,
        path: "/generaltrainer/Reports",
      },

    ],



    personaltrainer: [
      {
        name: "Dashboard",
        icon: faChartBar,
        path: "/personaltrainer/dashboard",

      },
      {
        name: "QR Check-in",
        icon: faGear,
        path: "/personaltrainer/qrcheckin",
      },
      {
        name: "Plans & Bookings",
        icon: faBookAtlas,
        path: "/personaltrainer/PersonalPlansBookings",
      },
      // {
      //   name: "Assigned Members",
      //   icon: faUsers,
      //   path: "/personaltrainer/members",
      // },
      // {
      //   name: "Session Bookings",
      //   icon: faCalendarAlt,
      //   path: "/personaltrainer/bookings",
      // },
      // {
      //   name: "Group Classes",
      //   icon: faChalkboardTeacher,
      //   path: "/personaltrainer/group-classes",
      // },
      // {
      //   name: "Attendance",
      //   icon: faClipboardCheck,
      //   path: "/personaltrainer/attendance",
      // },
      // {
      //   name: "Salary Overview",
      //   icon: faDollarSign,
      //   path: "/personaltrainer/salary",
      // },
      // {
      //   name: "Messages",
      //   icon: faComments,
      //   path: "/personaltrainer/messages",
      // },
    ],






    receptionist: [
      {
        name: "Dashboard",
        icon: faChartBar,
        path: "/receptionist/dashboard",
      },
      {
        name: "QR Check-in",
        icon: faGear,
        path: "/receptionist/qrcheckin",
      },

      {
        name: " Walk-in Registration ",
        icon: faFileAlt,
        path: "/receptionist/walk-in-registration "

      },

      {
        name: " New Sign-ups",
        icon: faFileAlt,
        path: "/receptionist/new-sign-ups"

      },


      {
        name: " QR Attendance",
        icon: faFileAlt,
        path: "/receptionist/qr-attendance"

      },

      {
        name: " Book Classes & Sessions ",
        icon: faFileAlt,
        path: "/receptionist/book-classes-sessions"

      },
      {
        name: " Payment ",
        icon: faFileAlt,
        path: "/receptionist/payemnet"

      },

    ],
    member: [
      {
        name: "Dashboard",
        icon: faChartBar,
        path: "/member/dashboard",
      },



      // {
      //   name: "Profile Management",
      //   icon: faChartBar,
      //   path: "/member/profile-managmnet",
      // },
      {
        name: "QR Check-in",
        icon: faGear,
        path: "/member/qrcheckin",
      },
      {
        name: "View Plan",
        icon:  faEye,
        path: "/member/viewplan"
      },
      {
        name: "Class Schedule",
        icon: faClapperboard,
        path: "/member/classSchedule",
      },


      // {
      //   name: "Book Classes",
      //   icon: faNetworkWired,
      //   path: "/member/memberbooking",
      // },

      {
        name: "My Account",
        icon: faMoneyBillAlt,
        path: "/member/account",
      },
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
                        style={{ cursor: "pointer" }}
                      >
                        {sub.label}
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