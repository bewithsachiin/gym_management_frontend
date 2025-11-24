// Import React and necessary hooks from React library
import React, { useState } from "react";
// Import useNavigate hook from react-router-dom for navigation after login
import { useNavigate } from "react-router-dom";
// Import Axios instance for making API requests
import axiosInstance from "../utils/axiosInstance";
// Import useUser hook from UserContext
import { useUser } from "../UserContext";

// 🎨 Inline Debug Helper
const debugLogin = {
  start: (email) =>
    console.log(
      `%c🔐 LOGIN REQUEST → Email: ${email}`,
      "color:#03A9F4; font-weight:bold;"
    ),

  success: (user) =>
    console.log(
      `%c🎉 LOGIN SUCCESS → User: ${user.name} | Role: ${user.role}`,
      "color:#4CAF50; font-weight:bold;"
    ),

  nav: (role, path) =>
    console.log(
      `%c🛣 REDIRECT → Role: ${role} → Path: ${path}`,
      "color:#8E44AD; font-weight:bold;"
    ),

  warn: (msg, data) =>
    console.warn(
      `%c⚠️ LOGIN WARNING → ${msg}`,
      "color:#FFC107; font-weight:bold;",
      data || ""
    ),

  error: (error) =>
    console.error(
      `%c❌ LOGIN ERROR`,
      "color:#E53935; font-weight:bold;",
      error
    ),
};

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

    debugLogin.start(email);

    try {
      // Make POST request to backend login API with email and password
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      // Destructure from backend response
      const { success, message, token, user } = response.data;

      if (!success) {
        debugLogin.warn("Backend login failed", message);
        alert(message);
        return;
      }

      // Set user in context (which also handles localStorage)
      login({ ...user, token });

      debugLogin.success(user);

      // Destructure role from user
      let { role } = user;

      if (!role) {
        debugLogin.warn("Role missing in backend response", user);
        alert("Role not found in backend response.");
        return;
      }

      role = role.toLowerCase();

      // Redirect user based on role
      switch (role) {
        case "superadmin":
          debugLogin.nav(role, "/superadmin/dashboard");
          navigate("/superadmin/dashboard");
          break;
        case "admin":
          debugLogin.nav(role, "/admin/dashboard");
          navigate("/admin/dashboard");
          break;
        case "generaltrainer":
          debugLogin.nav(role, "/generaltrainer/dashboard");
          navigate("/generaltrainer/dashboard");
          break;
        case "personaltrainer":
          debugLogin.nav(role, "/personaltrainer/dashboard");
          navigate("/personaltrainer/dashboard");
          break;
        case "member":
          debugLogin.nav(role, "/member/dashboard");
          navigate("/member/dashboard");
          break;
        case "housekeeping":
          debugLogin.nav(role, "/housekeeping/dashboard");
          navigate("/housekeeping/dashboard");
          break;
        case "receptionist":
          debugLogin.nav(role, "/receptionist/dashboard");
          navigate("/receptionist/dashboard");
          break;
        default:
          debugLogin.warn(`Unknown role received: ${role}`, user);
          alert(`Unknown role: ${role}`);
          break;
      }
    } catch (error) {
      debugLogin.error(error);
      alert("Invalid email or password. Please try again.");
    }
  };

  // JSX (UI stays unchanged)
  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div
        className="card shadow w-100"
        style={{ maxWidth: "950px", borderRadius: "1.5rem" }}
      >
        <div className="row g-0">
          <div className="col-md-6 d-none d-md-block">
            <img
              src="https://hips.hearstapps.com/hmg-prod/images/muscular-man-doing-pushup-exercise-with-dumbbell-royalty-free-image-1728661212.jpg?crop=0.668xw:1.00xh;0.00680xw,0&resize=640:*"
              alt="login"
              className="img-fluid rounded-start"
              style={{ height: "100%", objectFit: "cover" }}
            />
          </div>

          <div className="col-md-6 d-flex align-items-center p-5">
            <div className="w-100">
              <h2 className="fw-bold mb-3 text-center">Welcome Back!</h2>
              <p className="text-muted text-center mb-4">
                Please login to your account
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: "40px" }}
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y pe-3"
                      style={{ cursor: "pointer", zIndex: 10 }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash-fill"></i>
                      ) : (
                        <i className="bi bi-eye-fill"></i>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" />
                    <label className="form-check-label" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-decoration-none small">
                    Forgot Password?
                  </a>
                </div>

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
