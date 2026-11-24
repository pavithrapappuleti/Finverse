import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =====================================================
     SEND OTP
  ===================================================== */

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your registered email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
         `${import.meta.env.VITE_API_URL}/api/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to send OTP");
        return;
      }

      setMessage(
        data.message || "OTP has been sent to your email"
      );

      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     VERIFY OTP
  ===================================================== */

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/verify-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }

      setMessage(
        data.message || "OTP verified successfully"
      );

      setStep(3);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!password) {
      setError("Please enter a new password");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters"
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "Password must contain at least one uppercase letter"
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        "Password must contain at least one lowercase letter"
      );
      return;
    }

    if (!/\d/.test(password)) {
      setError(
        "Password must contain at least one number"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
            new_password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Password reset failed"
        );
        return;
      }

      setMessage(
        data.message ||
          "Password reset successfully. You can now login."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RESEND OTP
  ===================================================== */

  const handleResendOTP = async () => {
    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to resend OTP");
        return;
      }

      setMessage(
        data.message || "A new OTP has been sent"
      );
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">

      {/* Background Glows */}

      <div className="reset-glow reset-glow-one"></div>
      <div className="reset-glow reset-glow-two"></div>

      <div className="reset-password-container">

        {/* Logo */}

        <div className="reset-logo">
          <img
            src="/images/finverse-logo.png"
            alt="FINVERSE"
          />
        </div>

        {/* Heading */}

        <div className="reset-heading">
          <span>ACCOUNT RECOVERY</span>

          <h1>
            Reset Your
            <span> Password.</span>
          </h1>

          <p>
            Recover your FINVERSE account securely and
            create a new login password.
          </p>
        </div>

        {/* Card */}

        <div className="reset-password-card">

          {/* Progress */}

          <div className="reset-progress">

            <div
              className={
                step >= 1
                  ? "progress-step active"
                  : "progress-step"
              }
            >
              <div className="progress-number">
                1
              </div>

              <span>Email</span>
            </div>

            <div className="progress-line"></div>

            <div
              className={
                step >= 2
                  ? "progress-step active"
                  : "progress-step"
              }
            >
              <div className="progress-number">
                2
              </div>

              <span>Verify</span>
            </div>

            <div className="progress-line"></div>

            <div
              className={
                step >= 3
                  ? "progress-step active"
                  : "progress-step"
              }
            >
              <div className="progress-number">
                3
              </div>

              <span>Reset</span>
            </div>

          </div>

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (
            <form onSubmit={handleSendOTP}>

              <div className="reset-icon">
                ✉️
              </div>

              <p className="reset-small-title">
                VERIFY YOUR ACCOUNT
              </p>

              <h2>
                Forgot your password?
              </h2>

              <p className="reset-description">
                Enter the email address registered with
                your FINVERSE account. We'll send you a
                verification code.
              </p>

              <div className="reset-input-group">

                <label>Registered Email</label>

                <div className="reset-input-wrapper">

                  <span className="reset-input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                </div>

              </div>

              {error && (
                <div className="reset-error">
                  ⚠ {error}
                </div>
              )}

              {message && (
                <div className="reset-success">
                  ✓ {message}
                </div>
              )}

              <button
                type="submit"
                className="reset-submit"
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "Send Verification Code →"}
              </button>

            </form>
          )}

          {/* =================================================
              STEP 2
          ================================================= */}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>

              <div className="reset-icon">
                🔐
              </div>

              <p className="reset-small-title">
                VERIFICATION
              </p>

              <h2>
                Enter verification code
              </h2>

              <p className="reset-description">
                Enter the 6-digit OTP sent to your
                registered email address.
              </p>

              <div className="reset-email-display">
                ✉ {email}
              </div>

              <div className="reset-input-group">

                <label>Verification Code</label>

                <div className="reset-input-wrapper">

                  <span className="reset-input-icon">
                    #
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                  />

                </div>

              </div>

              {error && (
                <div className="reset-error">
                  ⚠ {error}
                </div>
              )}

              {message && (
                <div className="reset-success">
                  ✓ {message}
                </div>
              )}

              <button
                type="submit"
                className="reset-submit"
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP →"}
              </button>

              <div className="resend-section">

                <span>
                  Didn't receive the code?
                </span>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>

              </div>

              <button
                type="button"
                className="back-step"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
              >
                ← Change email
              </button>

            </form>
          )}

          {/* =================================================
              STEP 3
          ================================================= */}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>

              <div className="reset-icon">
                🔑
              </div>

              <p className="reset-small-title">
                CREATE NEW PASSWORD
              </p>

              <h2>
                Set a new password
              </h2>

              <p className="reset-description">
                Create a strong password to protect your
                FINVERSE account.
              </p>

              <div className="reset-input-group">

                <label>New Password</label>

                <div className="reset-input-wrapper">

                  <span className="reset-input-icon">
                    🔒
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>

                </div>

              </div>

              <div className="reset-input-group">

                <label>
                  Confirm New Password
                </label>

                <div className="reset-input-wrapper">

                  <span className="reset-input-icon">
                    🔒
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "◉"
                      : "◌"}
                  </button>

                </div>

              </div>

              <div className="password-rules">

                <p>Password should contain:</p>

                <div>
                  <span
                    className={
                      password.length >= 8
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ At least 8 characters
                  </span>

                  <span
                    className={
                      /[A-Z]/.test(password)
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One uppercase letter
                  </span>

                  <span
                    className={
                      /[a-z]/.test(password)
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One lowercase letter
                  </span>

                  <span
                    className={
                      /\d/.test(password)
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One number
                  </span>
                </div>

              </div>

              {error && (
                <div className="reset-error">
                  ⚠ {error}
                </div>
              )}

              {message && (
                <div className="reset-success">
                  ✓ {message}
                </div>
              )}

              <button
                type="submit"
                className="reset-submit"
                disabled={loading}
              >
                {loading
                  ? "Updating Password..."
                  : "Reset Password →"}
              </button>

            </form>
          )}

          {/* Login */}

          <div className="back-login">

            Remember your password?

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

        </div>

        {/* Security Message */}

        <div className="reset-security">
          🔐 Your account information is protected
          with secure verification.
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;