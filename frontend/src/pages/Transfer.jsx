import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Transfer.css";

function Transfer() {
  const navigate = useNavigate();

  const [recipientAccount, setRecipientAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");

  const [balanceData, setBalanceData] = useState(null);
  const [transferData, setTransferData] = useState(null);

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Use the same token that is working in Reset PIN and Withdraw
  const getToken = () => localStorage.getItem("token");

  // ==============================
  // CHECK BALANCE
  // ==============================
  const handleCheckBalance = async () => {
    setError("");
    setSuccess("");

    if (!pin || !/^\d{4}$/.test(pin)) {
      setError("Please enter your 4-digit PIN first.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    setBalanceLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/account/balance`,
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
          data.message ||
            data.msg ||
            data.error ||
            "Unable to check balance."
        );
        return;
      }

      setBalanceData(data.account);
    } catch (error) {
      console.error("Balance error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setBalanceLoading(false);
    }
  };

  // ==============================
  // TRANSFER MONEY
  // ==============================
  const handleTransfer = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setTransferData(null);

    // Validate account number
    if (!recipientAccount.trim()) {
      setError("Please enter the recipient account number.");
      return;
    }

    // Prevent spaces in account number
    

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    // Validate PIN
    if (!pin || !/^\d{4}$/.test(pin)) {
      setError("Please enter a valid 4-digit PIN.");
      return;
    }

    // Check balance if already available
    if (
      balanceData &&
      Number(amount) > Number(balanceData.balance)
    ) {
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
        `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/transfer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipient_account: recipientAccount.trim(),
            amount: Number(amount),
            pin: pin,
          }),
        }
      );

      const data = await response.json();

      console.log("Transfer response:", data);

      if (!response.ok) {
        setError(
          data.message ||
            data.msg ||
            data.error ||
            `Transfer failed (${response.status})`
        );
        return;
      }

      setSuccess(
        data.message || "Money transferred successfully."
      );

      // Store transfer details
      if (data.transfer) {
        setTransferData(data.transfer);
      } else {
        setTransferData(data);
      }

      // Update balance if backend returns account
      if (data.account) {
        setBalanceData(data.account);
      }

      // If backend returns sender balance separately
      if (data.sender_balance !== undefined) {
        setBalanceData((previous) => ({
          ...(previous || {}),
          balance: Number(data.sender_balance),
        }));
      }

      setRecipientAccount("");
      setAmount("");
      setPin("");

    } catch (error) {
      console.error("Transfer error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-main transfer-main">

     

      {/* ================= MAIN ================= */}
      

        <div className="transfer-page">

          {/* HEADER */}
          <div className="transfer-header">
            <span className="transfer-label">
              FINVERSE / TRANSFER
            </span>

            <h1>Transfer Money</h1>

            <p>
              Send money securely to another FINVERSE account.
            </p>
          </div>

          {/* ================= GRID ================= */}
          <div className="transfer-grid">

            {/* TRANSFER CARD */}
            <div className="transfer-card">

              <div className="transfer-card-icon">
                ↗
              </div>

              <p className="transfer-card-small-title">
                SECURE TRANSFER
              </p>

              <h2>Send Money</h2>

              <p className="transfer-description">
                Enter the recipient account details and
                authorize the transfer with your PIN.
              </p>

              <form onSubmit={handleTransfer}>

                {/* Recipient Account */}
                <label>
                  Recipient Account Number
                </label>

                <div className="transfer-input-wrapper">
                  <span className="transfer-input-icon">
                    🏦
                  </span>

                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={recipientAccount}
                   onChange={(e) =>
  setRecipientAccount(
    e.target.value.toUpperCase().replace(/\s/g, "")
  )
}
                  />
                </div>

                {/* Amount */}
                <label>
                  Transfer Amount
                </label>

                <div className="transfer-input-wrapper">
                  <span className="transfer-input-icon">
                    ₹
                  </span>

                  <input
                    type="number"
                    placeholder="Enter amount"
                    min="1"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                  />
                </div>

                {/* PIN */}
                <label>
                  4-Digit PIN
                </label>

                <div className="transfer-input-wrapper">
                  <span className="transfer-input-icon">
                    🔐
                  </span>

                  <input
                    type="password"
                    placeholder="Enter 4-digit PIN"
                    maxLength="4"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) =>
                      setPin(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="transfer-error">
                    ⚠️ {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="transfer-success">
                    ✓ {success}
                  </div>
                )}

                {/* Transfer Button */}
                <button
                  type="submit"
                  className="transfer-button"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : "Transfer Money →"}
                </button>

              </form>

              {/* Check Balance */}
              <button
                className="transfer-check-balance"
                onClick={handleCheckBalance}
                disabled={balanceLoading}
              >
                {balanceLoading
                  ? "Checking..."
                  : "◉ Check Available Balance"}
              </button>

              <div className="transfer-security-note">
                🔒 Your transaction is protected with
                secure PIN verification.
              </div>

            </div>

            {/* ================= ACCOUNT CARD ================= */}
            <div className="transfer-card">

              <div className="transfer-card-icon">
                💳
              </div>

              <p className="transfer-card-small-title">
                ACCOUNT INFORMATION
              </p>

              <h2>Your Account</h2>

              <p className="transfer-description">
                Review your account information before
                sending money.
              </p>

              {balanceData ? (
                <div className="transfer-account-info">

                  <div className="transfer-info-box">
                    <span>Available Balance</span>

                    <strong>
                      ₹
                      {Number(
                        balanceData.balance || 0
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>

                  <div className="transfer-info-box">
                    <span>Account Number</span>

                    <strong>
                      ****
                      {String(
                        balanceData.account_number
                      ).slice(-4)}
                    </strong>
                  </div>

                  <div className="transfer-info-box">
                    <span>Account Type</span>

                    <strong>
                      {balanceData.account_type ||
                        "SAVINGS"}
                    </strong>
                  </div>

                </div>
              ) : (
                <div className="transfer-account-placeholder">
                  <div className="transfer-placeholder-icon">
                    🔐
                  </div>

                  <h3>Balance Protected</h3>

                  <p>
                    Enter your 4-digit PIN and click
                    "Check Available Balance" to view
                    your account balance.
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* ================= SUCCESS RESULT ================= */}
          {transferData && (
            <div className="transfer-result-card">

              <div className="transfer-result-top">

                <div className="transfer-result-icon">
                  ✓
                </div>

                <div>
                  <p className="transfer-check">
                    TRANSFER SUCCESSFUL
                  </p>

                  <h2>
                    Money Sent Successfully
                  </h2>
                </div>

              </div>

              <div className="transfer-result-details">

                <div>
                  <span>Amount Sent</span>

                  <strong>
                    ₹
                    {Number(
                      transferData.amount || amount
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </div>

                <div>
                  <span>Recipient Account</span>

                  <strong>
                    ****
                    {String(
  transferData.to_account || ""
).slice(-4)}
                  </strong>
                </div>

                <div>
                  <span>Transaction Status</span>

                  <strong className="transfer-status-success">
                    SUCCESS
                  </strong>
                </div>

                {transferData.remaining_balance !==
                  undefined && (
                  <div>
                    <span>Remaining Balance</span>

                    <strong>
                      ₹
                      {Number(
                        transferData.remaining_balance
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                )}

              </div>

              <div className="transfer-security">
                <span className="transfer-status-dot"></span>
                Transaction securely processed
              </div>

            </div>
          )}

          {/* ================= INFO ================= */}
          <div className="transfer-info">

            <div className="transfer-info-item">

              <div className="transfer-info-icon blue">
                🔒
              </div>

              <div>
                <h3>Secure Transfer</h3>

                <p>
                  Every transfer requires your
                  4-digit transaction PIN.
                </p>
              </div>

            </div>

            <div className="transfer-info-item">

              <div className="transfer-info-icon gold">
                ⚡
              </div>

              <div>
                <h3>Instant Processing</h3>

                <p>
                  Transfers are processed instantly
                  between FINVERSE accounts.
                </p>
              </div>

            </div>

            <div className="transfer-info-item">

              <div className="transfer-info-icon blue">
                🛡️
              </div>

              <div>
                <h3>Protected Transaction</h3>

                <p>
                  Your financial information is
                  protected with secure authentication.
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>

   
  );
}

export default Transfer;