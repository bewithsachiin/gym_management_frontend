import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useState, useEffect } from "react";
import * as echarts from "echarts";
import { UserProvider } from "./UserContext";


import Navbar from "./Layout/Navbar";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ForgotPassword from "./Auth/ForgotPassword";
import Sidebar from "./Layout/Sidebar";
// import DepartmentOKRs from "./Component/Okrs-management/Departement/DepartmentOKRs";
import AdminDashbaord from "./Dashboard/Admin/AdminDashbaord";
import MemberManagement from "./Dashboard/Manager/MemberManagement";
import StaffManagement from "./Dashboard//Manager/StaffManagement";
import ClassScheduling from "./Dashboard/Manager/ClassScheduling";
import Reports from "./Dashboard/Manager/Reports";
import Communication from "./Dashboard/Manager/Communication";
import Dashboard from "./Dashboard/Manager/Dashboard";



import Campaigns from "./Dashboard/Admin/Marketing/Campaigns";
import AdminQrCheckin from "./Dashboard/Admin/AdminQrCheckin";
import EmailsSms from "./Dashboard/Admin/Marketing/EmailsSms";
import ManageMembers from "./Dashboard/Admin/Members/ManageMembers";
import QrCodeAttendance from "./Dashboard/Admin/Members/QrCodeAttendance";
import WalkInRegistration from "./Dashboard/Admin/Members/WalkInRegistration";
import Membership from "./Dashboard/Admin/Payments/Membership";

import SalesReport from "./Dashboard/Admin/Reports/SalesReport";
import ManageStaff from "./Dashboard/Admin/Staff/ManageStaff";
import RolesPermissions from "./Dashboard/Admin/Staff/RolesPermissions";
import StaffAttendance from "./Dashboard/Admin/Staff/StaffAttendance";
import DutyRoster from "./Dashboard/Admin/Staff/DutyRoster";
import SalaryCalculator from "./Dashboard/Admin/Staff/SalaryCalculator";
import HouseKeepingDashboard from "./Dashboard/HouseKeeping/HouseKeepingDashboard";
import GeneralTrainerDashboard from "./Dashboard/GeneralTrainer/GeneralTrainerDashboard";
import GeneralQrCheckin from "./Dashboard/GeneralTrainer/GeneralQrCheckin";
import MemberDashboard from "./Dashboard/Member/MemberDashboard";
import Account from "./Dashboard/Member/Account";
// import MemberBooking from "./Dashboard/Member/MemberBooking";
import MemberQrCheckin from "./Dashboard/Member/MemberQrCheckin";
import ClassSchedule from "./Dashboard/Member/ClassSchedule";
import Report from "./Dashboard/GeneralTrainer/Report"

import AttendanceHistory from "./Dashboard/Member/AttendanceHistory";

import ReceptionistDashboard from "./Dashboard/Receptionist/ReceptionistDashboard";


// import PersonalTrainerAssignedMembers from "./Dashboard/PersonalTrainer/PersonalTrainerAssignedMembers";

import PersonalTrainerMessages from "./Dashboard/PersonalTrainer/PersonalTrainerMessages";
import PersonalTrainerGroupClasses from "./Dashboard/PersonalTrainer/PersonalTrainerGroupClasses";

import PersonalTrainerDashboard from "./Dashboard/PersonalTrainer/PersonalTrainerDashboard";
import PersonalTrainerQrCheckin from "./Dashboard/PersonalTrainer/PersonsalTrainerQrCheckin"

import Attendance from "./Dashboard/GeneralTrainer/Attendance";
// import MemberInteraction from "./Dashboard/GeneralTrainer/MemberInteraction";
import DailyScedule from "./Dashboard/GeneralTrainer/DailyScedule";

import HouseKeepingDutyRoster from "./Dashboard/HouseKeeping/HouseKeepingDutyRoster";
import HouseKeepingAttendance from "./Dashboard/HouseKeeping/HouseKeepingAttendance";
import HouseKeepingTaskChecklist from "./Dashboard/HouseKeeping/HouseKeepingTaskChecklist";
import HouseKeepingNotifications from "./Dashboard/HouseKeeping/HouseKeepingNotifications";
import HouseKeepingQrCheckin from "./Dashboard/HouseKeeping/HouseKeepingQrCheckin";
// import HouseKeepingDutyRosters from "./Dashboard/HouseKeeping/HouseKeepingQDutyRoster";
import ReceptionistWalkinMember from "./Dashboard/Receptionist/ReceptionistWalkinMember"
import ReceptionistMembershipSignups from "./Dashboard/Receptionist/ReceptionistMembershipSignups";

import ReceptionistQrCheckin from "./Dashboard/Receptionist/ReceptionistQrCheckin";
import ReceptionistQRCode from "./Dashboard/Receptionist/ReceptionistQRCode";
import ReceptionistPaymentCollection from "./Dashboard/Receptionist/ReceptionistPaymentCollection"
import ReceptionistBookGroupClasses from "./Dashboard/Receptionist/ReceptionistBookGroupClasses"
import BranchManagement from "./Dashboard/Admin/Settings/BranchManagement";
import RoleManagement from "./Dashboard/Admin/Settings/RoleManagement";



import SuperAdminDashbaord from "./Dashboard/SuperAdmin/SuperAdminDashbaord";
import SuperAdminBranches from "./Dashboard/SuperAdmin/SuperAdminBranches";
import Plans from "./Dashboard/SuperAdmin/MembershipPlans";
import Marketing from "./Dashboard/SuperAdmin/Marketing";
import Staff from "./Dashboard/SuperAdmin/People/Staff";
import Members from "./Dashboard/SuperAdmin/People/Members";
import Invoices from "./Dashboard/SuperAdmin/Payments/Invoices";
import RazorpayReports from "./Dashboard/SuperAdmin/Payments/RazorpayReports";
import SalesReports from "./Dashboard/SuperAdmin/Reports/SalesReports";
import MembershipReports from "./Dashboard/SuperAdmin/Reports/Membershipreports";
import AttendanceReports from "./Dashboard/SuperAdmin/Reports/AttendanceReports";
import Groups from "./Dashboard/Admin/Groups";
import ClassesSchedule from "./Dashboard/Admin/ClassesSchedule";
import AttendanceReport from "./Dashboard/Admin/Reports/AttendanceReport";
import LendingPage from "./Website/LendingPage";
import PersonalTrainerSessionBookings from "./Dashboard/Admin/Bookings/PersonalTrainerSessionBookings";
import CreatePlan from "./Dashboard/Admin/CreatePlan";
import ViewPlan from "./Dashboard/Member/ViewPlan";
import PersonalPlansBookings from "./Dashboard/PersonalTrainer/PersonalPlansBookings";
import GroupPlansBookings from "./Dashboard/GeneralTrainer/GroupPlansBookings";




function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => window.innerWidth <= 768;
    if (checkIfMobile()) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const location = useLocation();

  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password";


  return (
    <UserProvider>
      {hideLayout ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<LendingPage />} />
        </Routes>
      ) : (
        <>
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="main-content">
            <Sidebar
              collapsed={isSidebarCollapsed}
              setCollapsed={setIsSidebarCollapsed}
            />
            <div
              className={`right-side-content ${isSidebarCollapsed ? "collapsed" : ""
                }`}
            >




              <Routes>










                <Route path="/superadmin/dashboard" element={<SuperAdminDashbaord />} />
                <Route path="/superadmin/branches" element={<SuperAdminBranches />} />

                <Route path="/superadmin/plans" element={<Plans />} />
                <Route path="/superadmin/marketing" element={<Marketing />} />





                <Route path="superadmin/people/staff" element={<Staff />} />
                <Route path="superadmin/people/members" element={<Members />} />




                <Route path="superadmin/payments/invoices" element={<Invoices />} />
                <Route path="superadmin/payments/RazorpayReports" element={<RazorpayReports />} />







                <Route path="/superadmin/reports/attendance" element={<AttendanceReports />} />


                <Route path="/superadmin/reports/membership" element={<MembershipReports />} />
                <Route path="/superadmin/reports/sales" element={<SalesReports />} />
                <Route path="/superadmin/reports/members" element={<MembershipReports />} />








                {/* <Route path="okrs/departmentokrs" element={<DepartmentOKRs />} /> */}
                <Route path="/admin/dashboard" element={<AdminDashbaord />} />

                <Route path="admin/admindashboard" element={<AdminDashbaord />} />

                <Route path="admin/group" element={<Groups />} />
                <Route path="admin/CreatePlan" element={<CreatePlan />} />







                {/* admin dahsboard */}
                <Route path="admin/admin-dashboard" element={<AdminDashbaord />} />
                {/* booking */}
                <Route path="/admin/booking/attendance" element={<AttendanceReport />} />
                <Route path="/admin/qrcheckin" element={<AdminQrCheckin />} />
                <Route path="/admin/ClassesSchedule" element={<ClassesSchedule />} />
                <Route path="/admin/bookings" element={<PersonalTrainerSessionBookings />} />

                {/* Marketibg */}

                <Route path="marketing/campaigns" element={<Campaigns />} />
                <Route path="marketing/email-sms" element={<EmailsSms />} />
                {/* Members */}
                <Route path="/admin/members/manage-members" element={<ManageMembers />} />

                <Route path="/admin/members/qr-code-attendance" element={<QrCodeAttendance />} />
                <Route path="/admin/members/walk-in-registration" element={<WalkInRegistration />} />
                {/* Payments Routes */}
                <Route path="/admin/payments/membership" element={<Membership />} />


                {/* Reports  */}
                <Route path="/admin/reports/sales" element={<SalesReport />} />
                <Route path="/admin/reports/AttendanceReport" element={<AttendanceReport />} />

                {/* Staff Routes */}
                <Route path="/admin/staff/manage-staff" element={<ManageStaff />} />
                <Route path="/admin/staff/roles-permissions" element={<RolesPermissions />} />
                <Route path="/admin/staff/attendance" element={<StaffAttendance />} />
                <Route path="/admin/staff/duty-roster" element={<DutyRoster />} />
                <Route path="/admin/staff/salary-calculator" element={<SalaryCalculator />} />

                {/* setting routes */}
                <Route path="/admin/settings/BranchManagement" element={< BranchManagement />} />
                <Route path="/admin/settings/RoleManagement" element={< RoleManagement />} />

                {/* admin dahsboard end */}


                {/* Manager Dashbaord */}
                <Route path="/manager/dashboard" element={<Dashboard />} />
                <Route path="/manager/members" element={<MemberManagement />} />
                {/* <Route path="/manager/membership-plan" element={<MembershipPlans />} /> */}
                <Route path="/manager/duty-roster" element={<StaffManagement />} />
                <Route path="/manager/class-schedule" element={<ClassScheduling />} />
                <Route path="/manager/reports" element={<Reports />} />
                <Route path="/manager/communication" element={<Communication />} />



                <Route path="/housekeeping/dashboard" element={<HouseKeepingDashboard />} />


                <Route path="/generaltrainer/dashboard" element={<GeneralTrainerDashboard />} />
                <Route path="/GeneralTrainer/attendance" element={<Attendance />} />
                {/* <Route path="/GeneralTrainer/MemberInteraction" element={<MemberInteraction />} /> */}
                <Route path="/GeneralTrainer/qrcheckin" element={<GeneralQrCheckin />} />
                <Route path="/GeneralTrainer/Reports" element={<Report />} />
                <Route path="/GeneralTrainer/DailyScedule" element={< DailyScedule />} />
                <Route path="/GeneralTrainer/GroupPlansBookings" element={ <GroupPlansBookings />} />


                <Route path="/member/dashboard" element={<MemberDashboard />} />
                <Route path="/member/account" element={<Account />} />
                <Route path="/member/classschedule" element={<ClassSchedule />} />
                <Route path="/member/attendance-history" element={<AttendanceHistory />} />
                <Route path="/member/qrcheckin" element={<MemberQrCheckin />} />
                <Route path="/member/viewplan" element={<ViewPlan />} />

                {/* <Route path="/member/memberbooking" element={<MemberBooking />} /> */}





                <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
                <Route path="/receptionist/walk-in-registration" element={<ReceptionistWalkinMember />} />
                <Route path="/receptionist/new-sign-ups" element={<ReceptionistMembershipSignups />} />
                <Route path="/receptionist/qr-attendance" element={<ReceptionistQRCode />} />
                <Route path="/receptionist/qrcheckin" element={<ReceptionistQrCheckin />} />
                <Route path="/receptionist/book-classes-sessions" element={<ReceptionistBookGroupClasses />} />
                <Route path="/receptionist/payemnet" element={<ReceptionistPaymentCollection />} />



                <Route path="/personaltrainer/dashboard" element={<PersonalTrainerDashboard />} />
                
              
                <Route path="/personaltrainer/messages" element={<PersonalTrainerMessages />} />
                <Route path="/personaltrainer/group-classes" element={<PersonalTrainerGroupClasses />} />

               

                <Route path="/personaltrainer/qrcheckin" element={<PersonalTrainerQrCheckin />} />
                <Route path="/personaltrainer/personalplansbookings" element={<PersonalPlansBookings />} />

                <Route path="/housekeeping/dashboard" element={<HouseKeepingDashboard />} />
                <Route path="/housekeeping/qrcheckin" element={<HouseKeepingQrCheckin />} />
                <Route path="//housekeeping/members" element={<HouseKeepingDutyRoster />} />
                <Route path="/housekeeping/membership-plan" element={<HouseKeepingAttendance />} />
                <Route path="/housekeeping/duty-roster" element={<HouseKeepingTaskChecklist />} />
                <Route path="/housekeeping/class-schedule" element={<HouseKeepingNotifications />} />

              </Routes>


            </div>
          </div>
        </>
      )}
    </UserProvider>
  );
}

export default App;
