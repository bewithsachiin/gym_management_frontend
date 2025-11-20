import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import { useUser } from "../UserContext";

const Navbar = ({ toggleSidebar }) => {
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // prevent background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showProfileModal ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [showProfileModal]);

  const handleSaveProfile = () => {
    // TODO: call API to save
    alert("Profile saved!");
    setShowProfileModal(false);
  };

  // Profile data from user context
  const profile = user ? {
    name: user.name || "N/A",
    email: user.email || "N/A",
    phone: user.phone || "N/A",
    role: user.role || "N/A",
    branch: user.branch || "N/A",
  } : {
    name: "Guest",
    email: "",
    phone: "",
    role: "",
    branch: "",
  };

  return (
    <>
      <nav
        className="navbar navbar-expand px-3 py-2 d-flex justify-content-between align-items-center fixed-top"
        style={{
          backgroundColor: "#2f6a87",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          {/* Toggle Button with Custom Hover */}
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
              e.target.style.borderColor = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "white";
              e.target.style.borderColor = "white";
            }}
            onClick={toggleSidebar}
          >
            <FaBars color="currentColor" />
          </button>

          {/* Text Logo */}
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "white",
              letterSpacing: "-0.5px",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Gym<span style={{ color: "#0d6efd", fontWeight: "800" }}>Management</span>
          </span>
        </div>

        {/* Notification and User */}
        <div className="d-flex align-items-center gap-3 position-relative">
          {/* Notification */}
          <div className="position-relative">
            <FaBell size={18} color="white" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </div>

          {/* User Profile */}
          <div className="dropdown" ref={dropdownRef}>
            <div
              className="d-flex align-items-center gap-2 cursor-pointer text-white"
              role="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FaUserCircle size={24} />
              <div className="d-none d-sm-block text-white">
                <small className="mb-0">Welcome</small>
                <div className="fw-bold">{user ? user.name : "Guest"}</div>
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
                  overflow: "hidden",
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
                  <a className="dropdown-item text-danger" href="/">Logout</a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* PROFILE MODAL */}
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
                

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-control"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Branch</label>
                    <input
                      className="form-control"
                      value={profile.branch}
                      readOnly
                    />
                  </div>
                </div>

                <hr className="my-4" />

                {/* Password change */}
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" placeholder="••••••••" />
                  </div>
                </div>

                <hr className="my-4" />

              
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
