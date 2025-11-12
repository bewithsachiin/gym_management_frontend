// Import React and necessary hooks from React library
import React, { useState } from "react";
// Import useNavigate hook from react-router-dom for navigation after login
import { useNavigate } from "react-router-dom";
// Import Axios instance for making API requests
import axiosInstance from "../utils/axiosInstance";
// Import useUser hook from UserContext
import { useUser } from "../UserContext";

// Define Login functional component
const Login = () => {
  // Initialize the navigate function for redirection
  const navigate = useNavigate();
  // Get login function from UserContext
  const { login } = useUser();

  // Define state variables for email, password, and showPassword toggle
  const [email, setEmail] = useState(""); // Store user email input
  const [password, setPassword] = useState(""); // Store user password input
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility of password field

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    try {
      // Make POST request to backend login API with email and password
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      // Destructure from backend response
      const { success, message, token, user } = response.data;

      if (!success) {
        alert(message);
        return;
      }

      // Set user in context (which also handles localStorage)
      login({ ...user, token });

      // Destructure role from user
      let { role } = user;

      // Check if role is received from backend
      if (!role) {
        alert("Role not found in backend response."); // Handle missing role scenario
        return;
      }

      // Convert role to lowercase for case-insensitive handling
      role = role.toLowerCase();

      // Redirect user to their specific dashboard based on role
      switch (role) {
        case "superadmin":
          navigate("/superadmin/dashboard");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "generaltrainer":
          navigate("/generaltrainer/dashboard");
          break;
        case "personaltrainer":
          navigate("/personaltrainer/dashboard");
          break;
        case "member":
          navigate("/member/dashboard");
          break;
        case "housekeeping":
          navigate("/housekeeping/dashboard");
          break;
        case "receptionist":
          navigate("/receptionist/dashboard");
          break;
        default:
          // If an unknown role is received, show an alert
          alert(`Unknown role: ${role}`);
          break;
      }
    } catch (error) {
      // Catch any error that occurs during API request or login process
      console.error("Login error:", error);
      alert("Invalid email or password. Please try again."); // Display friendly error message
    }
  };

  // JSX for the component (User Interface)
  return (
    // Full-page container with centered login card
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      {/* Outer card with shadow and rounded corners */}
      <div
        className="card shadow w-100"
        style={{ maxWidth: "950px", borderRadius: "1.5rem" }}
      >
        <div className="row g-0">
          {/* Left image column (hidden on small screens) */}
          <div className="col-md-6 d-none d-md-block">
            <img
              src="https://hips.hearstapps.com/hmg-prod/images/muscular-man-doing-pushup-exercise-with-dumbbell-royalty-free-image-1728661212.jpg?crop=0.668xw:1.00xh;0.00680xw,0&resize=640:*"
              alt="login"
              className="img-fluid rounded-start"
              style={{ height: "100%", objectFit: "cover" }} // Makes image fill column properly
            />
          </div>

          {/* Right form column */}
          <div className="col-md-6 d-flex align-items-center p-5">
            <div className="w-100">
              {/* Heading and subtitle */}
              <h2 className="fw-bold mb-3 text-center">Welcome Back!</h2>
              <p className="text-muted text-center mb-4">
                Please login to your account
              </p>

              {/* Login form */}
              <form onSubmit={handleSubmit}>
                {/* Email input field */}
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email" // Email input type
                    className="form-control"
                    value={email} // Controlled input bound to email state
                    onChange={(e) => setEmail(e.target.value)} // Update email state on input change
                    required // Make field mandatory
                  />
                </div>

                {/* Password input field with show/hide functionality */}
                <div className="mb-3 position-relative">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"} // Toggle input type
                      className="form-control"
                      value={password} // Controlled input bound to password stateA
                      onChange={(e) => setPassword(e.target.value)} // Update password state
                      required // Make field mandatory
                      style={{ paddingRight: "40px" }} // Add padding for eye icon
                    />
                    {/* Password visibility toggle icon */}
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y pe-3"
                      style={{ cursor: "pointer", zIndex: 10 }}
                      onClick={() => setShowPassword(!showPassword)} // Toggle visibility on click
                    >
                      {/* Conditional rendering of icon based on visibility state */}
                      {showPassword ? (
                        <i className="bi bi-eye-slash-fill"></i> // Eye-slash icon when visible
                      ) : (
                        <i className="bi bi-eye-fill"></i> // Eye icon when hidden
                      )}
                    </span>
                  </div>
                </div>

                {/* Remember me checkbox and forgot password link */}
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-decoration-none small">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit button for login */}
                <button type="submit" className="btn btn-warning w-100 py-2">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the app
export default Login;
