import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load profile");
        return;
      }

      setUser(data.user);
      setAccount(data.account);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error-page">
        <div className="profile-error-card">
          <div className="profile-error-icon">⚠</div>
          <h2>Unable to Load Profile</h2>
          <p>{error}</p>
          <button onClick={fetchProfile}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <main className="profile-main">

     
      {/* ================= MAIN CONTENT ================= */}
      
        {/* Header */}
        <div className="profile-top-header">

          <div>
            <p className="profile-small-title">
              FINVERSE BANKING
            </p>

            <h1>My Profile</h1>

            <p className="profile-header-subtitle">
              Manage your personal and account information
            </p>
          </div>

          <div className="profile-header-actions">

            <button
              className="profile-header-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>

            <div className="profile-header-avatar">
              {user?.full_name
                ? user.full_name.charAt(0).toUpperCase()
                : "U"}
            </div>

          </div>
        </div>

        {/* ================= PROFILE HERO ================= */}
        <section className="profile-hero-card">

          <div className="profile-avatar-large">
            {user?.full_name
              ? user.full_name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="profile-hero-info">

            <h2>{user?.full_name || "User"}</h2>

            <p>{user?.email}</p>

            <div className="profile-status">
              <span className="profile-status-dot"></span>
              {user?.status || "ACTIVE"}
            </div>

          </div>

          <div className="profile-user-badge">
            <span>✓</span>
            Verified Account
          </div>

        </section>

        {/* ================= INFORMATION GRID ================= */}
        <div className="profile-content-grid">

          {/* Personal Information */}
          <section className="profile-card">

            <div className="profile-card-header">
              <div className="profile-card-icon">
                👤
              </div>

              <div>
                <h3>Personal Information</h3>
                <p>Your registered personal details</p>
              </div>
            </div>

            <div className="profile-information">

              <div className="profile-info-row">
                <div className="profile-info-label">
                  Full Name
                </div>

                <div className="profile-info-value">
                  {user?.full_name || "Not provided"}
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-label">
                  Email Address
                </div>

                <div className="profile-info-value">
                  {user?.email || "Not provided"}
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-label">
                  Phone Number
                </div>

                <div className="profile-info-value">
                  {user?.phone || "Not provided"}
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-label">
                  Date of Birth
                </div>

                <div className="profile-info-value">
                  {user?.date_of_birth || "Not provided"}
                </div>
              </div>

              <div className="profile-info-row">
                <div className="profile-info-label">
                  Address
                </div>

                <div className="profile-info-value">
                  {user?.address || "Not provided"}
                </div>
              </div>

            </div>

          </section>

          {/* Account Information */}
          <section className="profile-card">

            <div className="profile-card-header">
              <div className="profile-card-icon">
                💳
              </div>

              <div>
                <h3>Account Information</h3>
                <p>Your banking account details</p>
              </div>
            </div>

            <div className="profile-account-box">

              <div className="profile-account-number">
                <span>Account Number</span>

                <strong>
                  {account?.account_number || "N/A"}
                </strong>
              </div>

              <div className="profile-account-details">

                <div className="profile-account-detail">
                  <span>Account Type</span>
                  <strong>
                    {account?.account_type || "N/A"}
                  </strong>
                </div>

                <div className="profile-account-detail">
                  <span>Balance</span>
                  <strong>
                    ₹
                    {account?.balance !== undefined
                      ? Number(account.balance).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )
                      : "0.00"}
                  </strong>
                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ================= SECURITY CARD ================= */}
        <section className="profile-security-card">

          <div className="profile-security-left">

            <div className="profile-security-large-icon">
              🔐
            </div>

            <div>
              <h3>Keep Your Account Secure</h3>

              <p>
                Never share your password, PIN, OTP or banking
                information with anyone.
              </p>
            </div>

          </div>

          <button
            className="profile-reset-pin-button"
            onClick={() => navigate("/reset-pin")}
          >
            Reset PIN
            <span>→</span>
          </button>

        </section>

        {/* ================= FOOTER INFO ================= */}
        <div className="profile-footer-info">

          <span>🔒 Secure & Protected</span>

          <span>•</span>

          <span>FINVERSE Online Banking</span>

          <span>•</span>

          <span>24×7 Banking</span>

        </div>

      </main>
    
  );
}

export default Profile;