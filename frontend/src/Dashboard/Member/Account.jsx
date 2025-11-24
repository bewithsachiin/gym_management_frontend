import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axiosInstance from "../../utils/axiosInstance";

/**
 * MemberProfile
 * React + Vite + Bootstrap + fully responsive
 */
const Account = () => {
  // --------------------- API Handling States ------------------------------
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialData, setInitialData] = useState(null);

  // --------------------- Personal Information ------------------------------
  const [personal, setPersonal] = useState({
    member_id: "",
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

  // --------------------- Membership Information ----------------------------
  const [membership, setMembership] = useState({
    membership_plan: "",
    plan_start_date: "",
    plan_end_date: "",
    status: "",
    membership_type: "",
    membership_fee: "",
  });

  // --------------------- Password Change Section ---------------------------
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    current: "",
    new: "",
    confirm: "",
    minLength: "",
    newMatch: "",
  });

  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Helper function to handle null values from API
  const getSafeValue = (value) => {
    return value === null ? "" : value;
  };

  // --------------------- Fetch Profile on Mount ---------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get("/members/me/profile");
        const data = response.data.data;
        
        // Handle null values from API response
        setPersonal({
          member_id: getSafeValue(data.member_id),
          first_name: getSafeValue(data.first_name),
          last_name: getSafeValue(data.last_name),
          gender: getSafeValue(data.gender),
          dob: getSafeValue(data.dob),
          email: getSafeValue(data.email),
          phone: getSafeValue(data.phone),
          address_street: getSafeValue(data.address_street),
          address_city: getSafeValue(data.address_city),
          address_state: getSafeValue(data.address_state),
          address_zip: getSafeValue(data.address_zip),
          profile_picture: null,
          profile_preview: getSafeValue(data.profile_preview),
        });
        
        setMembership({
          membership_plan: getSafeValue(data.membership_plan),
          plan_start_date: getSafeValue(data.plan_start_date),
          plan_end_date: getSafeValue(data.plan_end_date),
          status: getSafeValue(data.status),
          membership_type: getSafeValue(data.membership_type),
          membership_fee: getSafeValue(data.membership_fee),
        });
        
        setInitialData(data);
      } catch (err) {
        setError(err.message || "Failed to load profile");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

    // Clear success message when user starts typing
    if (passwordSuccess) {
      setPasswordSuccess("");
    }

    // Clear specific error when user starts correcting
    setPasswordErrors(prev => ({
      ...prev,
      [name]: "",
      newMatch: "",
      minLength: ""
    }));

    // Validation on the fly
    if (name === "new") {
      const newErrors = {
        minLength: value.length < 8 ? "Password must be at least 8 characters" : "",
        newMatch: password.confirm && value !== password.confirm ? "Passwords do not match" : "",
      };
      setPasswordErrors(prev => ({ ...prev, ...newErrors }));
    }

    if (name === "confirm") {
      setPasswordErrors(prev => ({
        ...prev,
        newMatch: value !== password.new ? "Passwords do not match" : "",
      }));
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {
      current: !password.current ? "Current password is required" : "",
      new: !password.new ? "New password is required" : "",
      confirm: !password.confirm ? "Please confirm your new password" : "",
      minLength: password.new.length < 8 ? "Password must be at least 8 characters" : "",
      newMatch: password.new !== password.confirm ? "Passwords do not match" : "",
    };

    setPasswordErrors(errors);
    
    return !Object.values(errors).some(error => error !== "");
  };

  // Handle password change API call
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      alert("Please fix the errors before submitting.");
      return;
    }

    try {
      setPasswordLoading(true);
      setError(null);
      setPasswordSuccess("");

      const payload = {
        currentPassword: password.current,
        newPassword: password.new,
      };

      const response = await axiosInstance.put("/members/me/change-password", payload);
      
      if (response.data.success) {
        setPasswordSuccess("Password updated successfully!");
        setPassword({ current: "", new: "", confirm: "" });
        setPasswordErrors({
          current: "",
          new: "",
          confirm: "",
          minLength: "",
          newMatch: "",
        });
      } else {
        throw new Error(response.data.message || "Failed to change password");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to change password";
      setError(errorMessage);
      
      // Set specific error for current password if it's wrong
      if (errorMessage.toLowerCase().includes("current") || errorMessage.toLowerCase().includes("incorrect")) {
        setPasswordErrors(prev => ({
          ...prev,
          current: "Current password is incorrect"
        }));
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      let payload;
      if (personal.profile_picture instanceof File) {
        // Use FormData for file upload
        payload = new FormData();
        payload.append("first_name", personal.first_name);
        payload.append("last_name", personal.last_name);
        payload.append("gender", personal.gender);
        payload.append("dob", personal.dob);
        payload.append("email", personal.email);
        payload.append("phone", personal.phone);
        payload.append("address_street", personal.address_street);
        payload.append("address_city", personal.address_city);
        payload.append("address_state", personal.address_state);
        payload.append("address_zip", personal.address_zip);
        payload.append("profile_picture", personal.profile_picture);
      } else {
        // JSON payload - convert empty strings to null for API
        payload = {
          first_name: personal.first_name || null,
          last_name: personal.last_name || null,
          gender: personal.gender || null,
          dob: personal.dob || null,
          email: personal.email || null,
          phone: personal.phone || null,
          address_street: personal.address_street || null,
          address_city: personal.address_city || null,
          address_state: personal.address_state || null,
          address_zip: personal.address_zip || null,
        };
      }
      
      const response = await axiosInstance.put("/members/me/profile", payload, {
        headers: personal.profile_picture instanceof File ? { "Content-Type": "multipart/form-data" } : {},
      });
      
      const updatedData = response.data.data;
      
      // Update state with new data, handling null values
      setPersonal(prev => ({
        ...prev,
        member_id: getSafeValue(updatedData.member_id),
        first_name: getSafeValue(updatedData.first_name),
        last_name: getSafeValue(updatedData.last_name),
        gender: getSafeValue(updatedData.gender),
        dob: getSafeValue(updatedData.dob),
        email: getSafeValue(updatedData.email),
        phone: getSafeValue(updatedData.phone),
        address_street: getSafeValue(updatedData.address_street),
        address_city: getSafeValue(updatedData.address_city),
        address_state: getSafeValue(updatedData.address_state),
        address_zip: getSafeValue(updatedData.address_zip),
        profile_picture: null, // Reset file after upload
        profile_preview: getSafeValue(updatedData.profile_preview),
      }));
      
      setMembership({
        membership_plan: getSafeValue(updatedData.membership_plan),
        plan_start_date: getSafeValue(updatedData.plan_start_date),
        plan_end_date: getSafeValue(updatedData.plan_end_date),
        status: getSafeValue(updatedData.status),
        membership_type: getSafeValue(updatedData.membership_type),
        membership_fee: getSafeValue(updatedData.membership_fee),
      });
      
      setInitialData(updatedData);
      alert("Profile updated successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update profile";
      setError(errorMessage);
      alert("Failed to update profile: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --------------------- Derived / helpers ---------------------------------
  const todayISO = format(new Date(), "yyyy-MM-dd");

  // Show loading state
  if (loading && !initialData) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-2">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Success Alert for Password */}
      {passwordSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success:</strong> {passwordSuccess}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setPasswordSuccess("")}
          ></button>
        </div>
      )}

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
                    disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      className="form-select"
                      value={personal.gender}
                      onChange={handlePersonalChange}
                      disabled={loading}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading}
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
                          disabled={loading}
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <input
                          name="address_city"
                          className="form-control"
                          placeholder="City"
                          value={personal.address_city}
                          onChange={handlePersonalChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="col-6 col-sm-3">
                        <input
                          name="address_state"
                          className="form-control"
                          placeholder="State"
                          value={personal.address_state}
                          onChange={handlePersonalChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="col-6 col-sm-3">
                        <input
                          name="address_zip"
                          className="form-control"
                          placeholder="Zip / Pincode"
                          value={personal.address_zip}
                          onChange={handlePersonalChange}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button 
                    className="btn btn-primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Profile"}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      if (initialData) {
                        setPersonal({
                          member_id: getSafeValue(initialData.member_id),
                          first_name: getSafeValue(initialData.first_name),
                          last_name: getSafeValue(initialData.last_name),
                          gender: getSafeValue(initialData.gender),
                          dob: getSafeValue(initialData.dob),
                          email: getSafeValue(initialData.email),
                          phone: getSafeValue(initialData.phone),
                          address_street: getSafeValue(initialData.address_street),
                          address_city: getSafeValue(initialData.address_city),
                          address_state: getSafeValue(initialData.address_state),
                          address_zip: getSafeValue(initialData.address_zip),
                          profile_picture: null,
                          profile_preview: getSafeValue(initialData.profile_preview),
                        });
                      }
                    }}
                    disabled={loading}
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Expired">Expired</option>
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
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                    <option value="Member">Member</option>
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

              <form onSubmit={handlePasswordChangeSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label">
                      Current Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      name="current"
                      className={`form-control ${passwordErrors.current ? 'is-invalid' : ''}`}
                      value={password.current}
                      onChange={handlePasswordChange}
                      required
                      disabled={passwordLoading}
                    />
                    {passwordErrors.current && (
                      <div className="invalid-feedback">{passwordErrors.current}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">
                      New Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      name="new"
                      className={`form-control ${passwordErrors.new || passwordErrors.minLength || passwordErrors.newMatch ? 'is-invalid' : ''}`}
                      value={password.new}
                      onChange={handlePasswordChange}
                      required
                      disabled={passwordLoading}
                    />
                    {passwordErrors.new && (
                      <div className="invalid-feedback">{passwordErrors.new}</div>
                    )}
                    {passwordErrors.minLength && (
                      <div className="invalid-feedback">{passwordErrors.minLength}</div>
                    )}
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">
                      Confirm New Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirm"
                      className={`form-control ${passwordErrors.confirm || passwordErrors.newMatch ? 'is-invalid' : ''}`}
                      value={password.confirm}
                      onChange={handlePasswordChange}
                      required
                      disabled={passwordLoading}
                    />
                    {passwordErrors.confirm && (
                      <div className="invalid-feedback">{passwordErrors.confirm}</div>
                    )}
                    {passwordErrors.newMatch && (
                      <div className="invalid-feedback">{passwordErrors.newMatch}</div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setPassword({ current: "", new: "", confirm: "" });
                      setPasswordErrors({
                        current: "",
                        new: "",
                        confirm: "",
                        minLength: "",
                        newMatch: "",
                      });
                      setPasswordSuccess("");
                    }}
                    disabled={passwordLoading}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;