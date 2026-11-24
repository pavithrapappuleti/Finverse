import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Balance.css";

import { Link } from "react-router-dom";

function Balance() {
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [error, setError] = useState("");
  const [showBalance, setShowBalance] = useState(false);

  // ================= LOGOUT =================

  

  // ================= CHECK BALANCE =================

  const handleCheckBalance = async (e) => {
    e.preventDefault();

    setError("");
    setBalanceData(null);

    if (pin.length !== 4) {
      setError("Please enter a valid 4-digit PIN.");
      return;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/account/balance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pin: pin,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to retrieve balance."
        );
        return;
      }

      setBalanceData(data.account);
      setShowBalance(true);

      // Hide balance after 30 seconds
      setTimeout(() => {
        setShowBalance(false);
      }, 30000);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the server. Make sure Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <main className="dashboard-main">


     

      {/* =====================================================
          MAIN BALANCE CONTENT
      ===================================================== */}

      

        <div className="balance-page">

          {/* PAGE HEADER */}

          <div className="balance-header">

            <div>

              <span className="balance-label">
                ACCOUNT
              </span>

              <h1>
                Check Balance
              </h1>

              <p>
                Securely view your available account balance.
              </p>

            </div>

          </div>


          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="balance-grid">


            {/* =================================================
                PIN CARD
            ================================================= */}

            <div className="balance-pin-card">

              <div className="balance-card-icon">
                🔐
              </div>

              <span className="card-small-title">
                SECURITY VERIFICATION
              </span>

              <h2>
                Verify your PIN
              </h2>

              <p className="pin-description">
                Enter your 4-digit account PIN to securely
                view your current balance.
              </p>


              <form onSubmit={handleCheckBalance}>

                <label htmlFor="pin">
                  Account PIN
                </label>

                <div className="pin-input-wrapper">

                  <span className="pin-icon">
                    🔒
                  </span>

                  <input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => {

                      const value =
                        e.target.value.replace(/\D/g, "");

                      if (value.length <= 4) {
                        setPin(value);
                      }

                    }}
                    placeholder="Enter 4-digit PIN"
                    maxLength="4"
                    inputMode="numeric"
                  />

                </div>


                {/* ERROR */}

                {error && (
                  <div className="balance-error">
                    ⚠ {error}
                  </div>
                )}


                {/* VERIFY BUTTON */}

                <button
                  type="submit"
                  className="verify-button"
                  disabled={loading}
                >

                  {loading ? (
                    "Verifying..."
                  ) : (
                    <>
                      Verify PIN
                      <span>→</span>
                    </>
                  )}

                </button>

              </form>


              {/* SECURITY NOTE */}

              <div className="security-note">

                <span>
                  🛡️
                </span>

                <p>
                  Your PIN is securely verified through
                  FINVERSE protected banking services.
                </p>

              </div>

            </div>


            {/* =================================================
                BALANCE RESULT CARD
            ================================================= */}

            <div className="balance-result-card">

              {!balanceData || !showBalance ? (

                <div className="balance-hidden">

                  <div className="balance-lock">
                    🔒
                  </div>

                  <span>
                    AVAILABLE BALANCE
                  </span>

                  <h2>
                    ₹ ••••••
                  </h2>

                  <p>
                    Verify your PIN to view your balance
                  </p>

                </div>

              ) : (

                <div className="balance-visible">

                  <div className="balance-result-top">

                    <div>

                      <span>
                        AVAILABLE BALANCE
                      </span>

                      <h2>

                        ₹
                        {Number(
                          balanceData.balance
                        ).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}

                      </h2>

                    </div>


                    <div className="balance-check">
                      ✓
                    </div>

                  </div>


                  {/* ACCOUNT DETAILS */}

                  <div className="account-details">

                    <div className="account-detail">

                      <span>
                        Account Number
                      </span>

                      <strong>
                        ••••{" "}
                        {balanceData.account_number
                          ? balanceData.account_number.slice(-4)
                          : "----"}
                      </strong>

                    </div>


                    <div className="account-detail">

                      <span>
                        Account Type
                      </span>

                      <strong>
                        {balanceData.account_type}
                      </strong>

                    </div>

                  </div>


                  {/* SECURITY */}

                  <div className="balance-security">

                    <span className="status-dot">
                    </span>

                    Balance verified successfully

                    <small>
                      Balance will be hidden automatically.
                    </small>

                  </div>

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              INFORMATION SECTION
          ================================================= */}

          <div className="balance-info">


            {/* SECURE */}

            <div className="info-item">

              <div className="info-icon">
                🔐
              </div>

              <div>

                <h3>
                  Secure Verification
                </h3>

                <p>
                  Your PIN is verified securely by
                  the FINVERSE backend.
                </p>

              </div>

            </div>


            {/* INSTANT */}

            <div className="info-item">

              <div className="info-icon blue">
                ⚡
              </div>

              <div>

                <h3>
                  Instant Access
                </h3>

                <p>
                  Get your latest account balance instantly.
                </p>

              </div>

            </div>


            {/* PROTECTED */}

            <div className="info-item">

              <div className="info-icon gold">
                🛡️
              </div>

              <div>

                <h3>
                  Protected Data
                </h3>

                <p>
                  Your financial information remains protected.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>


  );
}

export default Balance;