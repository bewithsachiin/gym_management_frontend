import React, { useState } from "react";
import { format } from "date-fns";

/**
 * MemberProfile
 * React + Vite + Bootstrap + fully responsive
 * UI-only: wire submit handlers to your API later.
 */
const Account = () => {
  // --------------------- Personal Information ------------------------------
  const [personal, setPersonal] = useState({
    member_id: "M23456789", // Sample member ID
    first_name: "Rahul",
    last_name: "Sharma",
    gender: "Male",
    dob: "1990-05-15",
    email: "rahul.sharma@example.com",
    phone: "9876543210",
    address_street: "123 Park Avenue",
    address_city: "Mumbai",
    address_state: "Maharashtra",
    address_zip: "400001",
    profile_picture: null,
    profile_preview: "https://randomuser.me/api/portraits/men/32.jpg", // Sample profile image
  });

  // --------------------- Membership Information ----------------------------
  const [membership, setMembership] = useState({
    membership_plan: "Gold Annual",
    plan_start_date: "2023-01-15",
    plan_end_date: "2024-01-14",
    status: "Active",
    membership_type: "Premium",
    membership_fee: "12000",
  });

  // --------------------- Password Change Section ---------------------------
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    newMatch: "",
    minLength: "",
  });

  // --------------------- Handlers -----------------------------------------
  const handlePersonalChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_picture" && files?.[0]) {
      const file = files[0];
      setPersonal((p) => ({
        ...p,
        profile_picture: file,
        profile_preview: URL.createObjectURL(file),
      }));
    } else {
      setPersonal((p) => ({ ...p, [name]: value }));
    }
  };

  const handleMembershipChange = (e) => {
    const { name, value } = e.target;
    setMembership((m) => ({ ...m, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((p) => ({ ...p, [name]: value }));

    // Validation on the fly
    if (name === "new") {
      setPasswordErrors((prev) => ({
        ...prev,
        minLength: value.length < 8 ? "Password must be at least 8 characters" : "",
        newMatch: password.confirm && value !== password.confirm ? "Passwords do not match" : "",
      }));
    }

    if (name === "confirm") {
      setPasswordErrors((prev) => ({
        ...prev,
        newMatch: value !== password.new ? "Passwords do not match" : "",
      }));
    }
  };

  // Mock submit: replace with API calls
  const handleSaveMember = (e) => {
    e.preventDefault();
    const payload = {
      personal,
      membership,
      password: password.new ? password : null, // Only send if new password is set
    };
    console.log("SAVE MEMBER →", payload);
    alert("Member saved (mock). Check console for payload.");
  };

  // --------------------- Derived / helpers ---------------------------------
  const todayISO = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="container py-2 ">
      <div className="row g-4">
        {/* Full width column: Personal + Membership + Password */}
        <div className="col-12">

        {/* Personal Info */}
<div className="card border-0 shadow-sm mb-4">
  <div className="card-body">
    <h1 className="fw-bold mb-3">Personal Information</h1>

    {/* Profile Picture Section - Enhanced */}
    <div className="text-center mb-4">
      <div className="position-relative d-inline-block">
        {personal.profile_preview ? (
          <img
            src={personal.profile_preview}
            alt="Profile"
            className="rounded-circle border border-3 border-primary shadow-sm"
            style={{ width: 150, height: 150, objectFit: 'cover' }}
          />
        ) : (
          <div
            className="rounded-circle bg-light border border-3 border-primary d-flex align-items-center justify-content-center"
            style={{ width: 150, height: 150 }}
          >
            <span className="text-muted fs-4">No Photo</span>
          </div>
        )}
        <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" className="bi bi-camera-fill" viewBox="0 0 16 16">
            <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
            <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
          </svg>
        </div>
      </div>
      <div className="mt-3">
        <input
          type="file"
          name="profile_picture"
          className="form-control d-inline-block w-auto"
          accept="image/*"
          onChange={handlePersonalChange}
        />
      </div>
    </div>

    <form onSubmit={handleSaveMember}>
      <div className="row g-3">
        {/* Member ID (readonly) */}
        <div className="col-12 col-sm-6">
          <label className="form-label">Member ID</label>
          <input
            className="form-control"
            value={personal.member_id}
            readOnly
          />
        </div>
        <div className="col-12 col-sm-6">
          <label className="form-label">
            First Name <span className="text-danger">*</span>
          </label>
          <input
            name="first_name"
            className="form-control"
            value={personal.first_name}
            onChange={handlePersonalChange}
            required
            // ✅ REMOVED readOnly
          />
        </div>
        <div className="col-12 col-sm-6">
          <label className="form-label">
            Last Name <span className="text-danger">*</span>
          </label>
          <input
            name="last_name"
            className="form-control"
            value={personal.last_name}
            onChange={handlePersonalChange}
            required
            // ✅ REMOVED readOnly
          />
        </div>
        <div className="col-12 col-sm-6">
          <label className="form-label">Gender</label>
          <select
            name="gender"
            className="form-select"
            value={personal.gender}
            onChange={handlePersonalChange}
            // ✅ REMOVED disabled
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="col-12 col-sm-6">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            name="dob"
            className="form-control"
            value={personal.dob}
            onChange={handlePersonalChange}
            max={todayISO}
            // ✅ REMOVED readOnly
          />
        </div>
        <div className="col-12 col-sm-6">
          <label className="form-label">
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={personal.email}
            onChange={handlePersonalChange}
            required
            // ✅ REMOVED readOnly
          />
        </div>
        <div className="col-12 col-sm-6">
          <label className="form-label">
            Phone <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            value={personal.phone}
            onChange={handlePersonalChange}
            required
            // ✅ REMOVED readOnly
          />
        </div>
        <div className="col-12">
          <label className="form-label">Address (optional)</label>
          <div className="row g-2">
            <div className="col-12">
              <input
                name="address_street"
                className="form-control"
                placeholder="Street address"
                value={personal.address_street}
                onChange={handlePersonalChange}
                // ✅ REMOVED readOnly
              />
            </div>
            <div className="col-12 col-sm-6">
              <input
                name="address_city"
                className="form-control"
                placeholder="City"
                value={personal.address_city}
                onChange={handlePersonalChange}
                // ✅ REMOVED readOnly
              />
            </div>
            <div className="col-6 col-sm-3">
              <input
                name="address_state"
                className="form-control"
                placeholder="State"
                value={personal.address_state}
                onChange={handlePersonalChange}
                // ✅ REMOVED readOnly
              />
            </div>
            <div className="col-6 col-sm-3">
              <input
                name="address_zip"
                className="form-control"
                placeholder="Zip / Pincode"
                value={personal.address_zip}
                onChange={handlePersonalChange}
                // ✅ REMOVED readOnly
              />
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-primary" type="submit">
          Save Member
        </button>
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => {
            setPersonal({
              member_id: autoMemberId(),
              first_name: "",
              last_name: "",
              gender: "",
              dob: "",
              email: "",
              phone: "",
              address_street: "",
              address_city: "",
              address_state: "",
              address_zip: "",
              profile_picture: null,
              profile_preview: null,
            });
          }}
        >
          Reset
        </button>
      </div>
    </form>
  </div>
</div>

          {/* Membership Info */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Membership Information</h5>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label">Membership Plan</label>
                  <input
                    name="membership_plan"
                    className="form-control"
                    placeholder="e.g. Gold 12 Months"
                    value={membership.membership_plan}
                    onChange={handleMembershipChange}
                    readOnly
                  />
                </div>
                <div className="col-6 col-sm-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="plan_start_date"
                    className="form-control"
                    value={membership.plan_start_date}
                    onChange={handleMembershipChange}
                    readOnly
                  />
                </div>
                <div className="col-6 col-sm-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="plan_end_date"
                    className="form-control"
                    value={membership.plan_end_date}
                    onChange={handleMembershipChange}
                    readOnly
                  />
                </div>
                <div className="col-6 col-sm-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={membership.status}
                    onChange={handleMembershipChange}
                    disabled
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Expired</option>
                  </select>
                </div>
                <div className="col-6 col-sm-3">
                  <label className="form-label">Membership Type</label>
                  <select
                    name="membership_type"
                    className="form-select"
                    value={membership.membership_type}
                    onChange={handleMembershipChange}
                    disabled
                  >
                    <option>Standard</option>
                    <option>Premium</option>
                    <option>VIP</option>
                  </select>
                </div>
                <div className="col-12 col-sm-3">
                  <label className="form-label">Membership Fee</label>
                  <input
                    type="number"
                    name="membership_fee"
                    className="form-control"
                    placeholder="₹"
                    value={membership.membership_fee}
                    onChange={handleMembershipChange}
                    min="0"
                    step="0.01"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Change Password</h5>
              <p className="text-muted small">
                Enter your current password and set a new one. Password must be at least 8 characters.
              </p>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Current Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="current"
                    className="form-control"
                    value={password.current}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="new"
                    className={`form-control ${passwordErrors.minLength || passwordErrors.newMatch ? 'is-invalid' : ''}`}
                    value={password.new}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordErrors.minLength && (
                    <div className="invalid-feedback">{passwordErrors.minLength}</div>
                  )}
                  {passwordErrors.newMatch && (
                    <div className="invalid-feedback">{passwordErrors.newMatch}</div>
                  )}
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Confirm New Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirm"
                    className={`form-control ${passwordErrors.newMatch ? 'is-invalid' : ''}`}
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    required
                  />
                  {passwordErrors.newMatch && (
                    <div className="invalid-feedback">{passwordErrors.newMatch}</div>
                  )}
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!password.new || !password.confirm || passwordErrors.minLength || passwordErrors.newMatch) {
                      alert("Please fix password errors before saving.");
                      return;
                    }
                    if (password.new !== password.confirm) {
                      alert("New passwords do not match!");
                      return;
                    }
                    if (password.current.trim() === "") {
                      alert("Current password is required!");
                      return;
                    }
                    alert("Password updated successfully (mock).");
                    setPassword({ current: "", new: "", confirm: "" }); // Clear form after success
                  }}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ----------------------- helpers ----------------------- */
function autoMemberId() {
  const y = new Date().getFullYear().toString().slice(-2);
  return `M${y}${Math.floor(100000 + Math.random() * 900000)}`;
}

export default Account;