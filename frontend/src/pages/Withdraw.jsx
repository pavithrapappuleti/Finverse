import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Withdraw.css";

function Withdraw() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [balanceData, setBalanceData] = useState(null);
  const [withdrawData, setWithdrawData] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
  return localStorage.getItem("token");
};
  // =====================================================
  // CHECK BALANCE
  // =====================================================

  const handleCheckBalance = async () => {
    setError("");
    setBalanceLoading(true);

    const token = getToken();

    if (!token) {
      setError("You are not logged in. Please login again.");
      setBalanceLoading(false);
      return;
    }

    if (pin.length !== 4) {
      setError("Please enter a valid 4-digit PIN.");
      setBalanceLoading(false);
      return;
    }

    try {
      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/withdraw`,
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      amount: Number(amount),
      pin: pin,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to retrieve account balance."
        );
        return;
      }

      setBalanceData(data.account);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the server. Make sure Flask backend is running."
      );
    } finally {
      setBalanceLoading(false);
    }
  };

  // =====================================================
  // WITHDRAW
  // =====================================================
const handleWithdraw = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");
  setWithdrawData(null);

  if (!amount || Number(amount) <= 0) {
    setError("Please enter a valid withdrawal amount.");
    return;
  }

  if (!pin || !/^\d{4}$/.test(pin)) {
    setError("Please enter a valid 4-digit PIN.");
    return;
  }

  if (balanceData && Number(amount) > Number(balanceData.balance)) {
    setError("Insufficient balance.");
    return;
  }

  const token = getToken();

  if (!token) {
    setError("Session expired. Please login again.");
    navigate("/login");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/withdraw",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          pin: pin,
        }),
      }
    );

    const data = await response.json();

    console.log("Withdraw response:", data);

    if (!response.ok) {
      setError(
        data.message ||
        data.msg ||
        data.error ||
        `Withdrawal failed (${response.status})`
      );
      return;
    }

    setSuccess(data.message || "Money withdrawn successfully.");

    // Backend returns withdrawal details
    if (data.withdrawal) {
      setWithdrawData({
        ...data.withdrawal,
        balance: Number(data.withdrawal.remaining_balance),
      });
    }

    // Update current account balance
    if (data.account) {
      setBalanceData(data.account);
    }

    setAmount("");
    setPin("");

  } catch (error) {
    console.error("Withdraw error:", error);
    setError("Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
};

  // =====================================================
  // JSX
  // =====================================================

  return (
    <main className="dashboard-main">
     

      


      {/* =================================================
          MAIN
      ================================================= */}

      

        <div className="withdraw-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="withdraw-header">

            <div>

              <span className="withdraw-label">
                WITHDRAW
              </span>

              <h1>
                Withdraw Money
              </h1>

              <p>
                Securely withdraw funds from your account.
              </p>

            </div>

          </div>


          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="withdraw-grid">


            {/* =================================================
                WITHDRAW CARD
            ================================================= */}

            <div className="withdraw-card">

              {/* ICON */}

              <div className="withdraw-card-icon">
                💸
              </div>


              <span className="withdraw-card-small-title">
                WITHDRAWAL
              </span>


              <h2>
                Withdraw funds
              </h2>


              <p className="withdraw-description">
                Enter the withdrawal amount and verify your
                transaction PIN to continue.
              </p>


              {/* =================================================
                  ACCOUNT INFORMATION
              ================================================= */}

              <div className="withdraw-account-info">


                {/* AVAILABLE BALANCE */}

                <div className="withdraw-info-box">

                  <span>
                    Available Balance
                  </span>

                  <strong>

                    {balanceData
                      ? `₹${Number(
                          balanceData.balance
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}`
                      : "₹ ••••••"}

                  </strong>

                </div>


                {/* ACCOUNT TYPE */}

                <div className="withdraw-info-box">

                  <span>
                    Account Type
                  </span>

                  <strong>

                    {balanceData?.account_type ||
                      "Not available"}

                  </strong>

                </div>

              </div>


              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleWithdraw}>


                {/* AMOUNT */}

                <label htmlFor="withdraw-amount">
                  Withdrawal Amount
                </label>

                <div className="withdraw-input-wrapper">

                  <span className="withdraw-input-icon">
                    ₹
                  </span>

                  <input
                    id="withdraw-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    placeholder="Enter withdrawal amount"
                    min="1"
                  />

                </div>


                {/* PIN */}

                <label
                  htmlFor="withdraw-pin"
                  style={{
                    marginTop: "20px",
                  }}
                >
                  Transaction PIN
                </label>

                <div className="withdraw-input-wrapper">

                  <span className="withdraw-input-icon">
                    🔒
                  </span>

                  <input
                    id="withdraw-pin"
                    type="password"
                    value={pin}
                    onChange={(e) => {

                      const value =
                        e.target.value.replace(/\D/g, "");

                      if (value.length <= 4) {
                        setPin(value);
                      }

                      setError("");
                      setSuccess("");

                    }}
                    placeholder="Enter 4-digit PIN"
                    maxLength="4"
                    inputMode="numeric"
                  />

                </div>


                {/* ERROR */}

                {error && (
                  <div className="withdraw-error">
                    ⚠ {error}
                  </div>
                )}


                {/* SUCCESS */}

                {success && (
                  <div className="withdraw-success">
                    ✓ {success}
                  </div>
                )}


                {/* WITHDRAW BUTTON */}

                <button
                  type="submit"
                  className="withdraw-button"
                  disabled={loading}
                >

                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      Withdraw Money
                      <span>→</span>
                    </>
                  )}

                </button>

              </form>


              {/* =================================================
                  CHECK BALANCE
              ================================================= */}

              {!balanceData && (

                <button
                  type="button"
                  className="withdraw-check-balance"
                  onClick={handleCheckBalance}
                  disabled={balanceLoading}
                >

                  {balanceLoading
                    ? "Checking Balance..."
                    : "Check Available Balance"}

                </button>

              )}


              {/* =================================================
                  SECURITY NOTE
              ================================================= */}

              <div className="withdraw-security-note">

                <span>
                  🛡️
                </span>

                <p>
                  Your transaction PIN is securely verified
                  through FINVERSE protected banking services.
                </p>

              </div>

            </div>


 {/* =================================================
    RESULT CARD
================================================= */}

{withdrawData && (
  <div className="withdraw-result-card">

    {/* RESULT TOP */}
    <div className="withdraw-result-top">

      <div className="withdraw-result-icon">
        ✓
      </div>

      <div>
        <p className="withdraw-check">
          WITHDRAWAL SUCCESSFUL
        </p>

        <h2>
          Money Withdrawn Successfully
        </h2>
      </div>

    </div>

    {/* RESULT DETAILS */}
    <div className="withdraw-result-details">

      {/* AMOUNT */}
      <div>
        <span>Amount Withdrawn</span>

        <strong>
          ₹
          {Number(
            withdrawData.amount || 0
          ).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </strong>
      </div>

      {/* ACCOUNT NUMBER */}
      <div>
        <span>Account Number</span>

        <strong>
          ••••
          {withdrawData.account_number
            ? withdrawData.account_number.slice(-4)
            : balanceData?.account_number
            ? balanceData.account_number.slice(-4)
            : "----"}
        </strong>
      </div>

      {/* TRANSACTION STATUS */}
      <div>
        <span>Transaction Status</span>

        <strong className="withdraw-status-success">
          SUCCESS
        </strong>
      </div>

      {/* REMAINING BALANCE */}
      <div>
        <span>Remaining Balance</span>

        <strong>
          ₹
          {Number(
            withdrawData.balance ??
            balanceData?.balance ??
            0
          ).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </strong>
      </div>

    </div>

    {/* SECURITY */}
    <div className="withdraw-security">

      <span className="withdraw-status-dot"></span>

      Transaction securely processed

    </div>

  </div>
)}
</div>
          {/* =================================================
              INFORMATION SECTION
          ================================================= */}

          <div className="withdraw-info">


            {/* SECURE */}

            <div className="withdraw-info-item">

              <div className="withdraw-info-icon">
                🔐
              </div>

              <div>

                <h3>
                  Secure Withdrawal
                </h3>

                <p>
                  Your transaction PIN is verified securely
                  by the FINVERSE backend.
                </p>

              </div>

            </div>


            {/* INSTANT */}

            <div className="withdraw-info-item">

              <div className="withdraw-info-icon blue">
                ⚡
              </div>

              <div>

                <h3>
                  Instant Processing
                </h3>

                <p>
                  Your withdrawal request is processed
                  instantly.
                </p>

              </div>

            </div>


            {/* PROTECTED */}

            <div className="withdraw-info-item">

              <div className="withdraw-info-icon gold">
                🛡️
              </div>

              <div>

                <h3>
                  Protected Transaction
                </h3>

                <p>
                  Your account and transaction information
                  remains protected.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

   
  );
}

export default Withdraw;