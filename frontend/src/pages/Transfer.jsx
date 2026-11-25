
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Transfer.css";

function Transfer() {
  const navigate = useNavigate();

  const [recipientAccount, setRecipientAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");

  const [pendingTransferId, setPendingTransferId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const [balanceData, setBalanceData] = useState(null);
  const [transferData, setTransferData] = useState(null);

  const [balanceLoading, setBalanceLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

  const getToken = () => localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
        `${API_URL}/api/account/balance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pin }),
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
    } catch (err) {
      console.error("Balance error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setBalanceLoading(false);
    }
  };

  // ==============================
  // STEP 1: SEND EMAIL OTP
  // ==============================
  const handleTransfer = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setTransferData(null);

    if (!recipientAccount.trim()) {
      setError("Please enter the recipient account number.");
      return;
    }

    if (/\s/.test(recipientAccount)) {
      setError("Account number must not contain spaces.");
      return;
    }

    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid transfer amount.");
      return;
    }

    if (!pin || !/^\d{4}$/.test(pin)) {
      setError("Please enter a valid 4-digit PIN.");
      return;
    }

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
        `${API_URL}/api/transfer`,
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

      console.log("Send OTP response:", data);

      if (!response.ok) {
        setError(
          data.message ||
          data.msg ||
          data.error ||
          `Unable to send OTP (${response.status})`
        );

        // Keep the pending transfer ID if email delivery failed.
        if (data.pending_transfer_id) {
          setPendingTransferId(data.pending_transfer_id);
        }

        return;
      }

      setPendingTransferId(data.pending_transfer_id);
      setMaskedEmail(data.email || "your registered email");
      setOtpSent(true);
      setOtp("");

      setSuccess(
        data.message || "Verification OTP sent successfully."
      );

    } catch (err) {
      console.error("Send OTP error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // STEP 2: VERIFY OTP AND TRANSFER
  // ==============================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!pendingTransferId) {
      setError("Transfer session not found. Please start again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the valid 6-digit email OTP.");
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
        `${API_URL}/api/transfer/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pending_transfer_id: pendingTransferId,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      console.log("OTP verification response:", data);

      if (!response.ok) {
        setError(
          data.message ||
          data.msg ||
          data.error ||
          `Transfer verification failed (${response.status})`
        );
        return;
      }

      setTransferData(data.transfer || data);

      setSuccess(
        data.message || "Money transferred successfully."
      );

      // Update available balance after successful transfer.
      if (data.transfer?.remaining_balance !== undefined) {
        setBalanceData((previous) => ({
          ...(previous || {}),
          balance: Number(data.transfer.remaining_balance),
        }));
      }

      // Clear sensitive and pending transfer details.
      setRecipientAccount("");
      setAmount("");
      setPin("");
      setOtp("");
      setPendingTransferId(null);
      setOtpSent(false);
      setMaskedEmail("");

    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // RESEND OTP
  // ==============================
  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    if (!pendingTransferId) {
      setError("Transfer session not found. Please start again.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    setResendLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/transfer/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pending_transfer_id: pendingTransferId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
          data.msg ||
          data.error ||
          "Unable to resend OTP."
        );
        return;
      }

      setOtp("");
      setSuccess(
        data.message || "A new OTP has been sent to your email."
      );

    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setResendLoading(false);
    }
  };

  // ==============================
  // CHANGE TRANSFER DETAILS
  // ==============================
  const handleChangeDetails = () => {
    setOtpSent(false);
    setPendingTransferId(null);
    setOtp("");
    setMaskedEmail("");
    setError("");
    setSuccess("You can now update your transfer details.");
  };

  return (
    <main className="dashboard-main transfer-main">

      <div className="transfer-page">

        {/* HEADER */}
        <div className="transfer-header">
          <span className="transfer-label">
            FINVERSE / TRANSFER
          </span>

          <h1>Transfer Money</h1>

          <p>
            Send money securely with two-step transaction verification.
          </p>
        </div>

        {/* GRID */}
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
              Verify your transaction using your 4-digit PIN
              and email OTP.
            </p>

            <form
              onSubmit={otpSent ? handleVerifyOTP : handleTransfer}
            >

              {/* RECIPIENT ACCOUNT */}
              <label>Recipient Account Number</label>

              <div className="transfer-input-wrapper">
                <span className="transfer-input-icon">
                  🏦
                </span>

                <input
                  type="text"
                  placeholder="Enter account number"
                  value={recipientAccount}
                  disabled={otpSent || loading}
                  onChange={(e) =>
                    setRecipientAccount(
                      e.target.value.toUpperCase().replace(/\s/g, "")
                    )
                  }
                  required
                />
              </div>

              {/* AMOUNT */}
              <label>Transfer Amount</label>

              <div className="transfer-input-wrapper">
                <span className="transfer-input-icon">
                  ₹
                </span>

                <input
                  type="number"
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  disabled={otpSent || loading}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* PIN */}
              <label>4-Digit Transaction PIN</label>

              <div className="transfer-input-wrapper">
                <span className="transfer-input-icon">
                  🔐
                </span>

                <input
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  maxLength="4"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pin}
                  disabled={otpSent || loading}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, ""))
                  }
                  required
                />
              </div>

              {/* OTP SECTION */}
              {otpSent && (
                <div className="transfer-otp-section">

                  <div className="transfer-otp-heading">
                    <span>✉️</span>
                    <h3>Email Verification</h3>
                  </div>

                  <p>
                    A six-digit verification code has been sent
                    to <strong>{maskedEmail}</strong>.
                  </p>

                  <label>Enter 6-Digit OTP</label>

                  <div className="transfer-input-wrapper">
                    <span className="transfer-input-icon">
                      🔑
                    </span>

                    <input
                      type="text"
                      placeholder="Enter email OTP"
                      maxLength="6"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                  </div>

                  <p className="transfer-otp-expiry">
                    OTP is valid for 5 minutes. Maximum 5 attempts.
                  </p>

                  <button
                    type="button"
                    className="transfer-check-balance"
                    onClick={handleResendOTP}
                    disabled={resendLoading || loading}
                  >
                    {resendLoading
                      ? "Sending new OTP..."
                      : "↻ Resend OTP"}
                  </button>

                  <button
                    type="button"
                    className="transfer-check-balance"
                    onClick={handleChangeDetails}
                    disabled={loading || resendLoading}
                  >
                    ← Change Transfer Details
                  </button>

                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="transfer-error">
                  ⚠️ {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="transfer-success">
                  ✓ {success}
                </div>
              )}

              {/* MAIN ACTION BUTTON */}
              <button
                type="submit"
                className="transfer-button"
                disabled={loading || resendLoading}
              >
                {loading
                  ? otpSent
                    ? "Verifying OTP..."
                    : "Sending OTP..."
                  : otpSent
                    ? "Verify OTP & Transfer →"
                    : "Send Verification OTP →"}
              </button>

            </form>

            {/* CHECK BALANCE */}
            {!otpSent && (
              <button
                type="button"
                className="transfer-check-balance"
                onClick={handleCheckBalance}
                disabled={balanceLoading || loading}
              >
                {balanceLoading
                  ? "Checking..."
                  : "◉ Check Available Balance"}
              </button>
            )}

            <div className="transfer-security-note">
              🔒 Protected by two-step verification:
              4-digit PIN + email OTP.
            </div>

          </div>

          {/* ACCOUNT CARD */}
          <div className="transfer-card">

            <div className="transfer-card-icon">
              💳
            </div>

            <p className="transfer-card-small-title">
              ACCOUNT INFORMATION
            </p>

            <h2>Your Account</h2>

            <p className="transfer-description">
              Review your account information before sending money.
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
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>

                <div className="transfer-info-box">
                  <span>Account Number</span>

                  <strong>
                    ****
                    {String(
                      balanceData.account_number || ""
                    ).slice(-4)}
                  </strong>
                </div>

                <div className="transfer-info-box">
                  <span>Account Type</span>

                  <strong>
                    {balanceData.account_type || "SAVINGS"}
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
                  "Check Available Balance" to view your account balance.
                </p>

              </div>
            )}

          </div>

        </div>

        {/* SUCCESS RESULT */}
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

                <h2>Money Sent Successfully</h2>
              </div>

            </div>

            <div className="transfer-result-details">

              <div>
                <span>Amount Sent</span>

                <strong>
                  ₹
                  {Number(
                    transferData.amount || 0
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
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

              {transferData.remaining_balance !== undefined && (
                <div>
                  <span>Remaining Balance</span>

                  <strong>
                    ₹
                    {Number(
                      transferData.remaining_balance
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              )}

              {transferData.transaction_id && (
                <div>
                  <span>Transaction ID</span>
                  <strong>{transferData.transaction_id}</strong>
                </div>
              )}

            </div>

            <div className="transfer-security">
              <span className="transfer-status-dot"></span>
              Transaction securely processed after PIN and OTP verification.
            </div>

          </div>
        )}

        {/* INFO */}
        <div className="transfer-info">

          <div className="transfer-info-item">

            <div className="transfer-info-icon blue">
              🔒
            </div>

            <div>
              <h3>PIN Verification</h3>

              <p>
                Your 4-digit transaction PIN is verified before
                an OTP is sent.
              </p>
            </div>

          </div>

          <div className="transfer-info-item">

            <div className="transfer-info-icon gold">
              ✉️
            </div>

            <div>
              <h3>Email OTP Verification</h3>

              <p>
                A six-digit OTP is sent to your registered email
                for additional security.
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
                The transfer is completed only after successful
                OTP verification.
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default Transfer;
