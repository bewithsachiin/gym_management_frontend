import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";

const Navbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef();

  // ✅ Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "+91 90000 00000",
    role: "",
    branch: "",
    notifyEmail: true,
    notifySMS: false,
  });

  // ✅ Load profile data dynamically from localStorage
  useEffect(() => {
    const loadProfileFromLocalStorage = () => {
      try {
        const userDetails = localStorage.getItem("userDetails");
        const userRole = localStorage.getItem("userRole");
        const userEmail = localStorage.getItem("userEmail");
        const branchId = localStorage.getItem("branchId");

        if (userDetails) {
          const parsedUserDetails = JSON.parse(userDetails);

          setProfile((prev) => ({
            ...prev,
            name: parsedUserDetails?.name || prev.name,
            email: userEmail || parsedUserDetails?.email || prev.email,
            role: userRole || parsedUserDetails?.role || prev.role,
            branch: branchId
              ? `Branch ${branchId}`
              : parsedUserDetails?.branch || prev.branch,
          }));
        }
      } catch (error) {
        console.error("Error reading userDetails from localStorage:", error);
      }
    };

    loadProfileFromLocalStorage();

    // ✅ Update profile automatically when localStorage changes (after login/logout)
    const handleStorageChange = (event) => {
      if (
        ["userDetails", "userRole", "userEmail", "branchId"].includes(event.key)
      ) {
        loadProfileFromLocalStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Prevent scroll when profile modal is open
  useEffect(() => {
    document.body.style.overflow = showProfileModal ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showProfileModal]);

  // ✅ Mock Save Profile (future API integration)
  const handleSaveProfile = () => {
    alert("Profile saved successfully!");
    setShowProfileModal(false);
  };

  return (
    <>
      {/* ---------------- NAVBAR ---------------- */}
      <nav
        className="navbar navbar-expand px-3 py-2 d-flex justify-content-between align-items-center fixed-top"
        style={{
          backgroundColor: "#2f6a87",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Left Section */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn p-2"
            style={{
              backgroundColor: "transparent",
              borderColor: "white",
              color: "white",
              borderRadius: "6px",
              border: "2px solid white",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "white";
            }}
            onClick={toggleSidebar}
          >
            <FaBars color="currentColor" />
          </button>

          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "white",
              letterSpacing: "-0.5px",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Gym
            <span style={{ color: "#0d6efd", fontWeight: "800" }}>
              Management
            </span>
          </span>
        </div>

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3 position-relative">
          {/* Notification */}
          <div className="position-relative">
            <FaBell size={18} color="white" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </div>

          {/* User Profile Dropdown */}
          <div className="dropdown" ref={dropdownRef}>
            <div
              className="d-flex align-items-center gap-2 cursor-pointer text-white"
              role="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle size={24} />
              <div className="d-none d-sm-block text-white">
                <small className="mb-0">Welcome</small>
                <div className="fw-bold">
                  {profile.name || "User"}{" "}
                  {profile.role && `(${profile.role})`}
                </div>
              </div>
            </div>

            {dropdownOpen && (
              <ul
                className="dropdown-menu show mt-2 shadow-sm"
                style={{
                  position: "absolute",
                  right: 0,
                  minWidth: "200px",
                  maxWidth: "calc(100vw - 30px)",
                  zIndex: 1000,
                  borderRadius: "8px",
                }}
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowProfileModal(true);
                    }}
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item text-danger"
                    href="/"
                    onClick={() => {
                      localStorage.clear();
                    }}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* ---------------- PROFILE MODAL ---------------- */}
      {showProfileModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <FaUserCircle size={48} color="#6c757d" />
                  <h5 className="modal-title fw-bold">My Profile</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProfileModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Profile Form */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-control"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Branch</label>
                    <select
                      className="form-select"
                      value={profile.branch}
                      onChange={(e) =>
                        setProfile({ ...profile, branch: e.target.value })
                      }
                    >
                      <option>All Branches</option>
                      <option>Andheri</option>
                      <option>Bandra</option>
                      <option>Thane</option>
                      <option>Pune</option>
                    </select>
                  </div>
                </div>

                <hr className="my-4" />

                {/* Password Change Section */}
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" />
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveProfile}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
