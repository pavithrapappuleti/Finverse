import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Deposit.css";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [description, setDescription] = useState("");

  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleDeposit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // -----------------------------
    // Validation
    // -----------------------------

    if (!amount) {
      setError("Please enter deposit amount");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    if (!pin) {
      setError("Please enter your 4-digit PIN");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/deposit`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            amount: Number(amount),
            pin: pin,
            description: description || "Cash deposit",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Deposit failed");
        return;
      }

      setMessage(
        data.message || "Money deposited successfully"
      );

      // Clear form
      setAmount("");
      setPin("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-main deposit-main">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="deposit-page-header">

        <p className="deposit-label">
          TRANSACTION
        </p>

        <h1>
          Deposit Money
        </h1>

        <p className="deposit-subtitle">
          Add money securely to your FINVERSE account.
        </p>

      </div>


      {/* =================================================
          MAIN DEPOSIT AREA
      ================================================= */}

      <div className="deposit-content">

        {/* =================================================
            LEFT FORM CARD
        ================================================= */}

        <div className="deposit-form-card">

          <div className="deposit-icon-box">
            📥
          </div>

          <p className="deposit-small-title">
            ADD MONEY
          </p>

          <h2>
            Make a Deposit
          </h2>

          <p className="deposit-description">
            Enter the amount and verify your PIN to deposit
            money into your account.
          </p>


          {/* =================================================
              DEPOSIT FORM
          ================================================= */}

          <form onSubmit={handleDeposit}>

            {/* Amount */}

            <div className="deposit-input-group">

              <label>
                Deposit Amount
              </label>

              <div className="deposit-input-wrapper">

                <span className="input-icon">
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                />

              </div>

            </div>


            {/* PIN */}

            <div className="deposit-input-group">

              <label>
                Account PIN
              </label>

              <div className="deposit-input-wrapper">

                <span className="input-icon">
                  🔐
                </span>

                <input
                  type={
                    showPin
                      ? "text"
                      : "password"
                  }
                  maxLength="4"
                  inputMode="numeric"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />

                <button
                  type="button"
                  className="pin-toggle"
                  onClick={() =>
                    setShowPin(!showPin)
                  }
                >
                  {showPin ? "◉" : "◌"}
                </button>

              </div>

            </div>


            {/* Forgot PIN */}

            <Link
              to="/reset-pin"
              className="forgot-pin-link"
            >
              Forgot PIN?
            </Link>


            {/* Description */}

            <div className="deposit-input-group">

              <label>
                Description
              </label>

              <div className="deposit-input-wrapper description-wrapper">

                <span className="input-icon">
                  📝
                </span>

                <input
                  type="text"
                  placeholder="Example: Cash deposit"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>


            {/* Error */}

            {error && (
              <div className="deposit-error">
                ⚠ {error}
              </div>
            )}


            {/* Success */}

            {message && (
              <div className="deposit-success">
                ✓ {message}
              </div>
            )}


            {/* Submit Button */}

            <button
              type="submit"
              className="deposit-submit-button"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Deposit Money  →"}
            </button>

          </form>


          {/* =================================================
              SECURITY MESSAGE
          ================================================= */}

          <div className="deposit-security">

            <span>
              🛡️
            </span>

            <p>
              Your transaction is securely processed
              through FINVERSE banking services.
            </p>

          </div>

        </div>


        {/* =================================================
            RIGHT PREVIEW CARD
        ================================================= */}

        <div className="deposit-preview-card">

          <div className="preview-icon">
            💰
          </div>

          <p className="preview-title">
            DEPOSIT PREVIEW
          </p>

          <div className="preview-amount">

            <span>
              ₹
            </span>

            <strong>
              {amount
                ? Number(amount).toLocaleString(
                    "en-IN"
                  )
                : "••••••"}
            </strong>

          </div>

          <p className="preview-text">

            {amount
              ? "Review your deposit amount before confirming."
              : "Enter an amount and verify your PIN to make a deposit."}

          </p>


          {/* Decorative Circle */}

          <div className="preview-circle"></div>

        </div>

      </div>


      {/* =================================================
          INFORMATION CARDS
      ================================================= */}

      <div className="deposit-info-grid">

        {/* Secure Deposit */}

        <div className="deposit-info-card">

          <div className="info-icon green">
            🔐
          </div>

          <div>

            <h3>
              Secure Deposit
            </h3>

            <p>
              Your PIN is verified securely
              before processing the transaction.
            </p>

          </div>

        </div>


        {/* Instant Update */}

        <div className="deposit-info-card">

          <div className="info-icon blue">
            ⚡
          </div>

          <div>

            <h3>
              Instant Update
            </h3>

            <p>
              Your account balance is updated
              immediately after a successful deposit.
            </p>

          </div>

        </div>


        {/* Transaction History */}

        <div className="deposit-info-card">

          <div className="info-icon yellow">
            📊
          </div>

          <div>

            <h3>
              Transaction History
            </h3>

            <p>
              Every successful deposit is recorded
              in your transaction history.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
};

export default Deposit;