import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check empty fields
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      // Flask API
      const response = await fetch(
  `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login Response:", data);

if (response.ok) {
  // Save JWT token
  localStorage.setItem("token", data.access_token);
  console.log("LOGIN ROLE:", data.role);

  // Check whether login is Admin or User
  if (data.role === "admin") {

    // Save admin information
    if (data.admin) {
      localStorage.setItem(
        "admin",
        JSON.stringify(data.admin)
      );
    }

    alert("Admin login successful!");

    // Go to Admin Dashboard
    navigate("/admin-dashboard");

  } else {

    // Save user information
    if (data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
    }

    alert("Login successful!");

    // Go to User Dashboard
    navigate("/dashboard");
  }
} else {
        alert(data.message || "Login failed");
      }

    } catch (error) {
      console.error("Login Error:", error);

      alert(
        "Unable to connect to server. Please make sure Flask is running."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background glow */}
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <div className="login-container">

        {/* Logo */}
        <div className="login-logo">
          <img
            src="/images/finverse-logo.png"
            alt="FINVERSE"
          />
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome Back</h1>
          <p>Login to your FINVERSE account</p>
        </div>

        {/* Login Card */}
        <div className="login-card">

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="input-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon email-icon">
                  
                </span>

                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>
            </div>

            {/* Password */}
            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">
                <i className = "fa-solid fa-lock"></i>
                <span className="input-icon password-icon">
                  
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="login-options">

              <label className="remember-me">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

          <button
  type="button"
  className="forgot-password-btn"
  onClick={() => navigate("/reset-password")}
>
  Forgot Password?
</button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              <span>
                {loading
                  ? "Logging in..."
                  : "Login"}
              </span>

              <span className="login-arrow">
                →
              </span>

            </button>

          </form>

          {/* Register */}
          <div className="register-link">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
            >
              Create Account
            </button>

          </div>

        </div>

        {/* Security */}
        <div className="login-security">

          <span>🔐</span>

          <span>
            Your information is protected
            with secure encryption
          </span>

        </div>

      </div>

    </div>
  );
}

export default Login;