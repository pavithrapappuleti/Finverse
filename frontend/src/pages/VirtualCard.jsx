import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./VirtualCard.css";

function VirtualCard() {

  const { setMenuOpen } = useOutletContext();

  // ==============================
  // CARD STATES
  // ==============================

  const [isFlipped, setIsFlipped] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [cardFrozen, setCardFrozen] = useState(false);
  const [onlinePayments, setOnlinePayments] = useState(true);

  const [spendingLimit, setSpendingLimit] = useState(50000);
  const [showLimitInput, setShowLimitInput] = useState(false);
  const [newLimit, setNewLimit] = useState(50000);

  const [copied, setCopied] = useState(false);

  const [cardData, setCardData] = useState(null);
  const [cardLoading, setCardLoading] = useState(true);

  // ==============================
  // MAKE PAYMENT STATES
  // ==============================

  const [showPayment, setShowPayment] = useState(false);

  const [paymentRecipientAccount, setPaymentRecipientAccount] =
    useState("");

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentDescription, setPaymentDescription] =
    useState("");

  const [paymentPin, setPaymentPin] =
    useState("");

  const [showPaymentPin, setShowPaymentPin] =
    useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  // ==============================
  // PAYMENT RESULT STATE
  // ==============================

  const [paymentResult, setPaymentResult] =
    useState(null);

  // ==============================
  // GET VIRTUAL CARD
  // ==============================

  useEffect(() => {

    const fetchVirtualCard = async () => {

      try {

        const token =
          localStorage.getItem("token");

        if (!token) {

          console.error("Token not found");

          setCardLoading(false);

          return;
        }

        const response = await fetch(
          "http://127.0.0.1:5000/api/card",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data =
          await response.json();

        if (response.ok) {

          console.log(
            "Virtual Card Data:",
            data
          );

          setCardData(data.card);

          setCardFrozen(
            data.card.status === "FROZEN"
          );

          setOnlinePayments(
            data.card.online_payments
          );

          setSpendingLimit(
            data.card.spending_limit
          );

          setNewLimit(
            data.card.spending_limit
          );

        } else {

          console.error(
            "Virtual Card Error:",
            data.message
          );

        }

      } catch (error) {

        console.error(
          "Virtual Card Fetch Error:",
          error
        );

      } finally {

        setCardLoading(false);

      }

    };

    fetchVirtualCard();

  }, []);

  // ==============================
  // CARD DETAILS
  // ==============================

  const cardNumber = cardData?.card_number
    ? cardData.card_number
        .replace(/(.{4})/g, "$1 ")
        .trim()
    : "Loading...";

  const cardNumberWithoutSpaces =
    cardData?.card_number || "";

  const cardHolder =
    cardData?.card_holder || "Loading...";

  const expiryDate =
    cardData?.expiry_date || "--/--";

  const cvv =
    cardData?.cvv || "---";

  // ==============================
  // MASKED CARD NUMBER
  // ==============================

  const maskedCardNumber =
    cardData?.card_number
      ? `•••• •••• •••• ${cardData.card_number.slice(-4)}`
      : "•••• •••• •••• ----";

  // ==============================
  // COPY CARD NUMBER
  // ==============================

  const handleCopyCardNumber = async () => {

    if (!cardNumberWithoutSpaces) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        cardNumberWithoutSpaces
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {

      console.error(
        "Copy Error:",
        error
      );

    }

  };

  // ==============================
  // FREEZE / UNFREEZE CARD
  // ==============================

  const handleFreezeCard = async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        alert("Please login again");

        return;
      }

      const newStatus =
        cardFrozen
          ? "ACTIVE"
          : "FROZEN";

      const response = await fetch(
        "http://127.0.0.1:5000/api/card/status",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to update card status"
        );

        return;
      }

      setCardFrozen(
        newStatus === "FROZEN"
      );

      setCardData(
        data.card
      );

      alert(data.message);

    } catch (error) {

      console.error(
        "Card Status Error:",
        error
      );

      alert(
        "Unable to update card status"
      );

    }

  };

  // ==============================
  // ONLINE PAYMENTS
  // ==============================

  const handleOnlinePayments = async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        alert("Please login again");

        return;
      }

      const newValue =
        !onlinePayments;

      const response = await fetch(
        "http://127.0.0.1:5000/api/card/online-payments",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify({
            online_payments: newValue
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to update online payments"
        );

        return;
      }

      setOnlinePayments(
        newValue
      );

      setCardData(
        data.card
      );

      alert(data.message);

    } catch (error) {

      console.error(
        "Online Payments Error:",
        error
      );

      alert(
        "Unable to update online payments"
      );

    }

  };

  // ==============================
  // CHANGE SPENDING LIMIT
  // ==============================

  const handleSaveLimit = async () => {

    const limit =
      Number(newLimit);

    if (!limit || limit <= 0) {

      alert(
        "Please enter a valid spending limit."
      );

      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        alert("Please login again");

        return;
      }

      const response = await fetch(
        "http://127.0.0.1:5000/api/card/spending-limit",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify({
            spending_limit: limit
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to update spending limit"
        );

        return;
      }

      setSpendingLimit(
        data.card.spending_limit
      );

      setCardData(
        data.card
      );

      setNewLimit(
        data.card.spending_limit
      );

      setShowLimitInput(
        false
      );

      alert(data.message);

    } catch (error) {

      console.error(
        "Spending Limit Error:",
        error
      );

      alert(
        "Unable to update spending limit"
      );

    }

  };

  // ==============================
  // OPEN PAYMENT FORM
  // ==============================

  const openPaymentForm = () => {

    setPaymentRecipientAccount("");
    setPaymentAmount("");
    setPaymentDescription("");
    setPaymentPin("");
    setShowPaymentPin(false);

    setPaymentResult(null);

    setShowPayment(true);

  };

  // ==============================
  // CLOSE PAYMENT FORM
  // ==============================

  const closePaymentForm = () => {

    setShowPayment(false);

    setPaymentRecipientAccount("");
    setPaymentAmount("");
    setPaymentDescription("");
    setPaymentPin("");
    setShowPaymentPin(false);

    setPaymentResult(null);

  };

  // ==============================
  // CLOSE PAYMENT RESULT
  // ==============================

  const closePaymentResult = () => {

    setPaymentResult(null);

    setShowPayment(false);

    setPaymentRecipientAccount("");
    setPaymentAmount("");
    setPaymentDescription("");
    setPaymentPin("");
    setShowPaymentPin(false);

  };

  // ==============================
  // PRINT / SAVE RECEIPT
  // ==============================

  const handlePrintReceipt = () => {

    window.print();

  };

  // ==============================
  // MAKE CARD PAYMENT
  // ==============================

  const handleMakePayment = async () => {

    const amount =
      Number(paymentAmount);

    // ==============================
    // RECIPIENT ACCOUNT VALIDATION
    // ==============================

    if (!paymentRecipientAccount.trim()) {

      alert(
        "Please enter the recipient account number."
      );

      return;
    }

    if (
      !/^\d+$/.test(
        paymentRecipientAccount.trim()
      )
    ) {

      alert(
        "Recipient account number must contain only digits."
      );

      return;
    }

    if (
      paymentRecipientAccount.trim().length < 10 ||
      paymentRecipientAccount.trim().length > 20
    ) {

      alert(
        "Please enter a valid recipient account number."
      );

      return;
    }

    // ==============================
    // AMOUNT VALIDATION
    // ==============================

    if (!amount || amount <= 0) {

      alert(
        "Please enter a valid payment amount."
      );

      return;
    }

    // ==============================
    // DESCRIPTION VALIDATION
    // ==============================

    if (!paymentDescription.trim()) {

      alert(
        "Please enter a payment description."
      );

      return;
    }

    // ==============================
    // PIN VALIDATION
    // ==============================

    if (!paymentPin) {

      alert(
        "Please enter your 4-digit Account PIN."
      );

      return;
    }

    if (!/^\d{4}$/.test(paymentPin)) {

      alert(
        "Account PIN must be exactly 4 digits."
      );

      return;
    }

    // ==============================
    // CARD STATUS
    // ==============================

    if (cardFrozen) {

      alert(
        "Card is frozen. Payment cannot be processed."
      );

      return;
    }

    // ==============================
    // ONLINE PAYMENTS
    // ==============================

    if (!onlinePayments) {

      alert(
        "Online payments are disabled."
      );

      return;
    }

    // ==============================
    // SPENDING LIMIT
    // ==============================

    if (
      amount > Number(spendingLimit)
    ) {

      alert(
        "Payment exceeds your card spending limit."
      );

      return;
    }

    // ==============================
    // API REQUEST
    // ==============================

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {

        alert(
          "Please login again"
        );

        return;
      }

      setPaymentLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/card-payment",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify({

            recipient_account_number:
              paymentRecipientAccount.trim(),

            amount:
              amount,

            description:
              paymentDescription.trim(),

            pin:
              paymentPin

          })
        }
      );

      const data =
        await response.json();

      // ==============================
      // PAYMENT FAILED
      // ==============================

      if (!response.ok) {

        alert(
          data.message ||
          "Payment failed"
        );

        return;
      }

      // ==============================
      // PAYMENT SUCCESS
      // ==============================

      console.log(
        "Payment Response:",
        data
      );

      setPaymentResult({

        recipient_account_number:
          data.payment.recipient_account_number ||
          paymentRecipientAccount.trim(),

        amount:
          data.payment.amount,

        description:
          data.payment.description,

        remaining_balance:
          data.payment.remaining_balance,

        transaction_id:
          data.payment.transaction_id,

        status:
          data.payment.status

      });

      // ==============================
      // CLEAR FORM
      // ==============================

      setPaymentRecipientAccount("");

      setPaymentAmount("");

      setPaymentDescription("");

      setPaymentPin("");

      setShowPaymentPin(false);

    } catch (error) {

      console.error(
        "Make Payment Error:",
        error
      );

      alert(
        "Unable to process payment."
      );

    } finally {

      setPaymentLoading(false);

    }

  };

  // ==============================
  // FORMAT MONEY
  // ==============================

  const formatAmount = (amount) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }
    ).format(amount);

  };

  // ==============================
  // LOADING
  // ==============================

  if (cardLoading) {

    return (

      <main className="dashboard-main">

        <div className="virtual-card-topbar">

          <button
            className="virtual-card-menu-button"
            onClick={() =>
              setMenuOpen(true)
            }
          >
            ☰
          </button>

          <div>

            <h1>
              Virtual Debit Card
            </h1>

            <p>
              Manage your FINVERSE virtual card
            </p>

          </div>

        </div>

        <div className="virtual-card-page">

          <div
            style={{
              padding: "40px",
              textAlign: "center"
            }}
          >
            Loading virtual card...
          </div>

        </div>

      </main>

    );

  }

  // ==============================
  // MAIN UI
  // ==============================

  return (

    <main className="dashboard-main">

      {/* ==============================
          TOP BAR
      ============================== */}

      <div className="virtual-card-topbar">

        <button
          className="virtual-card-menu-button"
          onClick={() =>
            setMenuOpen(true)
          }
        >
          ☰
        </button>

        <div>

          <h1>
            Virtual Debit Card
          </h1>

          <p>
            Manage your FINVERSE virtual card
          </p>

        </div>

      </div>

      {/* ==============================
          MAIN CONTENT
      ============================== */}

      <div className="virtual-card-page">

        <div className="cards-page-grid">

          {/* ==============================
              CARD SECTION
          ============================== */}

          <section className="virtual-card-section">

            <div className="section-heading">

              <div>

                <h2>
                  My Virtual Card
                </h2>

                <p>
                  Use your virtual card for secure
                  online payments
                </p>

              </div>

              <span
                className={`card-status-badge ${
                  cardFrozen
                    ? "frozen"
                    : "active"
                }`}
              >

                <span className="status-dot">
                </span>

                {cardFrozen
                  ? "Frozen"
                  : "Active"
                }

              </span>

            </div>

            {/* ==============================
                3D CARD
            ============================== */}

            <div
              className={`card-scene ${
                isFlipped
                  ? "flipped"
                  : ""
              }`}
              onClick={() =>
                setIsFlipped(!isFlipped)
              }
            >

              <div className="card-inner">

                {/* ==============================
                    FRONT
                ============================== */}

                <div
                  className={`virtual-bank-card card-front ${
                    cardFrozen
                      ? "card-is-frozen"
                      : ""
                  }`}
                >

                  <div className="card-overlay">
                  </div>

                  <div className="card-top">

                    <div className="card-brand">
                      FINVERSE
                    </div>

                    <div className="contactless-icon">
                      ))))
                    </div>

                  </div>

                  <div className="card-chip">

                    <div className="chip-line chip-line-1">
                    </div>

                    <div className="chip-line chip-line-2">
                    </div>

                    <div className="chip-line chip-line-3">
                    </div>

                  </div>

                  <div className="card-number">
                    {cardNumber}
                  </div>

                  <div className="card-bottom">

                    <div className="card-holder">

                      <span>
                        CARDHOLDER
                      </span>

                      <strong>
                        {cardHolder}
                      </strong>

                    </div>

                    <div className="card-expiry">

                      <span>
                        VALID THRU
                      </span>

                      <strong>
                        {expiryDate}
                      </strong>

                    </div>

                    <div className="card-network">
                      VISA
                    </div>

                  </div>

                  {cardFrozen && (

                    <div className="frozen-overlay">

                      <span>
                        🔒
                      </span>

                      <strong>
                        CARD FROZEN
                      </strong>

                    </div>

                  )}

                </div>

                {/* ==============================
                    BACK
                ============================== */}

                <div
                  className={`virtual-bank-card card-back ${
                    cardFrozen
                      ? "card-is-frozen"
                      : ""
                  }`}
                >

                  <div className="back-brand">
                    FINVERSE
                  </div>

                  <div className="magnetic-strip">
                  </div>

                  <div className="signature-area">

                    <div className="signature-line">
                      Authorized Signature
                    </div>

                    <div className="cvv-box">

                      <span>
                        CVV
                      </span>

                      <strong>
                        {showCVV
                          ? cvv
                          : "•••"
                        }
                      </strong>

                    </div>

                  </div>

                  <div className="back-info">

                    <p>
                      This card is issued by FINVERSE
                      for secure digital banking services.
                    </p>

                    <p>
                      If this card is lost, stolen or
                      compromised, please freeze the
                      card immediately.
                    </p>

                  </div>

                  <div className="back-footer">
                    FINVERSE • VIRTUAL DEBIT CARD
                  </div>

                </div>

              </div>

            </div>

            <p className="flip-hint">
              ↻ Click the card to view the back
            </p>

            {/* ==============================
                CARD ACTIONS
            ============================== */}

            <div className="card-actions">

              <button
                className="card-action-btn"
                onClick={(e) => {

                  e.stopPropagation();

                  setShowCVV(
                    !showCVV
                  );

                  setIsFlipped(true);

                }}
              >

                <span>
                  {showCVV
                    ? "🙈"
                    : "👁"
                  }
                </span>

                {showCVV
                  ? "Hide CVV"
                  : "Show CVV"
                }

              </button>

              <button
                className="card-action-btn"
                onClick={(e) => {

                  e.stopPropagation();

                  handleCopyCardNumber();

                }}
              >

                <span>
                  📋
                </span>

                {copied
                  ? "Copied!"
                  : "Copy Card Number"
                }

              </button>

              <button
                className={`card-action-btn freeze-button ${
                  cardFrozen
                    ? "unfreeze"
                    : ""
                }`}
                onClick={(e) => {

                  e.stopPropagation();

                  handleFreezeCard();

                }}
              >

                <span>
                  {cardFrozen
                    ? "🔓"
                    : "🔒"
                  }
                </span>

                {cardFrozen
                  ? "Unfreeze Card"
                  : "Freeze Card"
                }

              </button>

            </div>

            {/* ==============================
                MAKE PAYMENT BUTTON
            ============================== */}

            <button
              className="make-payment-btn"
              onClick={openPaymentForm}
            >
              💳 Make Payment
            </button>

            {/* ==============================
                PAYMENT BOX
            ============================== */}

            {showPayment && (

              <div className="payment-box">

                {/* ==============================
                    PAYMENT RESULT
                ============================== */}

                {paymentResult ? (

                  <div className="payment-result-card">

                    <div className="payment-success-icon">
                      ✓
                    </div>

                    <h2>
                      Payment Successful
                    </h2>

                    <p className="payment-result-message">
                      Your payment has been processed successfully.
                    </p>

                    <div className="payment-result-details">

                      {/* RECIPIENT ACCOUNT */}

                      <div className="payment-result-row">

                        <span>
                          Paid To Account
                        </span>

                        <strong>
                          {
                            paymentResult.recipient_account_number
                          }
                        </strong>

                      </div>

                      {/* AMOUNT */}

                      <div className="payment-result-row">

                        <span>
                          Amount
                        </span>

                        <strong className="payment-result-amount">

                          {formatAmount(
                            paymentResult.amount
                          )}

                        </strong>

                      </div>

                      {/* DESCRIPTION */}

                      <div className="payment-result-row">

                        <span>
                          Description
                        </span>

                        <strong>
                          {
                            paymentResult.description
                          }
                        </strong>

                      </div>

                      {/* TRANSACTION ID */}

                      <div className="payment-result-row">

                        <span>
                          Transaction ID
                        </span>

                        <strong>
                          {
                            paymentResult.transaction_id
                          }
                        </strong>

                      </div>

                      {/* STATUS */}

                      <div className="payment-result-row">

                        <span>
                          Status
                        </span>

                        <strong className="payment-success-status">
                          ✓ Successful
                        </strong>

                      </div>

                    </div>

                    {/* PRINT RECEIPT */}

                    <button
                      className="payment-result-print-btn"
                      onClick={handlePrintReceipt}
                    >
                      🖨️ Print / Save Receipt
                    </button>

                    {/* DONE */}

                    <button
                      className="payment-result-done-btn"
                      onClick={closePaymentResult}
                    >
                      Done
                    </button>

                  </div>

                ) : (

                  <>

                    {/* ==============================
                        PAYMENT HEADER
                    ============================== */}

                    <div className="payment-header">

                      <h3>
                        Make Payment
                      </h3>

                      <button
                        className="close-payment-btn"
                        onClick={closePaymentForm}
                      >
                        ×
                      </button>

                    </div>

                    <div className="payment-form">

                      {/* ==============================
                          PAYING WITH CARD
                      ============================== */}

                      <div className="payment-card-preview">

                        <div className="payment-card-preview-header">

                          <span>
                            Paying With
                          </span>

                        </div>

                        <div className="payment-card-mini">

                          <div className="payment-card-brand">
                            FINVERSE
                          </div>

                          <div className="payment-card-number">
                            {maskedCardNumber}
                          </div>

                          <div className="payment-card-bottom">

                            <div>

                              <span>
                                CARDHOLDER
                              </span>

                              <strong>
                                {cardHolder}
                              </strong>

                            </div>

                            <div>

                              <span>
                                VALID THRU
                              </span>

                              <strong>
                                {expiryDate}
                              </strong>

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* ==============================
                          RECIPIENT ACCOUNT NUMBER
                      ============================== */}

                      <div className="payment-field">

                        <label>
                          Recipient Account Number
                        </label>

                        <input
                          type="text"
                          value={paymentRecipientAccount}
                          onChange={(e) => {

                            const value =
                              e.target.value;

                            // Allow only digits
                            if (
                              /^\d*$/.test(value)
                            ) {

                              setPaymentRecipientAccount(
                                value
                              );

                            }

                          }}
                          placeholder="Enter recipient account number"
                          maxLength="20"
                          inputMode="numeric"
                        />

                        <small>
                          Enter the account number of the person you want to pay.
                        </small>

                      </div>

                      {/* ==============================
                          AMOUNT
                      ============================== */}

                      <div className="payment-field">

                        <label>
                          Payment Amount
                        </label>

                        <div className="amount-input">

                          <span>
                            ₹
                          </span>

                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) =>
                              setPaymentAmount(
                                e.target.value
                              )
                            }
                            placeholder="Enter amount"
                            min="1"
                          />

                        </div>

                      </div>

                      {/* ==============================
                          DESCRIPTION
                      ============================== */}

                      <div className="payment-field">

                        <label>
                          Payment Purpose / Description
                        </label>

                        <input
                          type="text"
                          value={paymentDescription}
                          onChange={(e) =>
                            setPaymentDescription(
                              e.target.value
                            )
                          }
                          placeholder="Example: Online Shopping"
                          maxLength="255"
                        />

                      </div>

                      {/* ==============================
                          ACCOUNT PIN
                      ============================== */}

                      <div className="payment-field">

                        <label>
                          Account PIN
                        </label>

                        <div className="payment-pin-wrapper">

                          <input
                            type={
                              showPaymentPin
                                ? "text"
                                : "password"
                            }
                            value={paymentPin}
                            onChange={(e) => {

                              const value =
                                e.target.value;

                              if (
                                /^\d{0,4}$/.test(value)
                              ) {

                                setPaymentPin(
                                  value
                                );

                              }

                            }}
                            placeholder="Enter 4-digit PIN"
                            maxLength="4"
                            inputMode="numeric"
                          />

                          <button
                            type="button"
                            className="payment-pin-toggle"
                            onClick={() =>
                              setShowPaymentPin(
                                !showPaymentPin
                              )
                            }
                          >

                            {showPaymentPin
                              ? "Hide"
                              : "Show"
                            }

                          </button>

                        </div>

                        <small>
                          Enter your 4-digit Account PIN
                          to authorize this payment.
                        </small>

                      </div>

                      {/* ==============================
                          PAYMENT INFORMATION
                      ============================== */}

                      <div className="payment-info">

                        <div>

                          <span>
                            Card Status
                          </span>

                          <strong>
                            {cardFrozen
                              ? "Frozen"
                              : "Active"
                            }
                          </strong>

                        </div>

                        <div>

                          <span>
                            Online Payments
                          </span>

                          <strong>
                            {onlinePayments
                              ? "Enabled"
                              : "Disabled"
                            }
                          </strong>

                        </div>

                        <div>

                          <span>
                            Spending Limit
                          </span>

                          <strong>
                            {formatAmount(
                              spendingLimit
                            )}
                          </strong>

                        </div>

                      </div>

                      {/* ==============================
                          PAY BUTTON
                      ============================== */}

                      <button
                        className="confirm-payment-btn"
                        onClick={
                          handleMakePayment
                        }
                        disabled={
                          paymentLoading
                        }
                      >

                        {paymentLoading
                          ? "Processing..."
                          : "Pay Now"
                        }

                      </button>

                    </div>

                  </>

                )}

              </div>

            )}

          </section>

          {/* ==============================
              CARD CONTROL SECTION
          ============================== */}

          <section className="card-controls-section">

            <div className="section-heading">

              <div>

                <h2>
                  Card Controls
                </h2>

                <p>
                  Manage your virtual card settings
                </p>

              </div>

            </div>

            {/* ==============================
                CARD STATUS
            ============================== */}

            <div className="control-card">

              <div className="control-icon">

                {cardFrozen
                  ? "🔒"
                  : "🛡️"
                }

              </div>

              <div className="control-content">

                <h3>
                  Card Status
                </h3>

                <p>

                  {cardFrozen
                    ? "Your card is currently frozen and cannot be used."
                    : "Your virtual card is active and ready to use."
                  }

                </p>

              </div>

              <div
                className={`control-status ${
                  cardFrozen
                    ? "status-frozen"
                    : "status-active"
                }`}
              >

                {cardFrozen
                  ? "Frozen"
                  : "Active"
                }

              </div>

            </div>

            {/* ==============================
                SPENDING LIMIT
            ============================== */}

            <div className="control-card">

              <div className="control-icon">
                💰
              </div>

              <div className="control-content">

                <h3>
                  Monthly Spending Limit
                </h3>

                <p>
                  Maximum amount that can be spent
                  using this virtual card.
                </p>

                <div className="limit-display">

                  <strong>
                    {formatAmount(
                      spendingLimit
                    )}
                  </strong>

                  <span>
                    per month
                  </span>

                </div>

              </div>

              <button
                className="change-limit-btn"
                onClick={() => {

                  setNewLimit(
                    spendingLimit
                  );

                  setShowLimitInput(
                    !showLimitInput
                  );

                }}
              >
                Change Limit
              </button>

            </div>

            {/* ==============================
                LIMIT INPUT
            ============================== */}

            {showLimitInput && (

              <div className="limit-edit-box">

                <label>
                  New Monthly Limit
                </label>

                <div className="limit-input-row">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    value={newLimit}
                    onChange={(e) =>
                      setNewLimit(
                        e.target.value
                      )
                    }
                    min="1"
                  />

                  <button
                    onClick={
                      handleSaveLimit
                    }
                  >
                    Save
                  </button>

                  <button
                    className="cancel-limit-btn"
                    onClick={() =>
                      setShowLimitInput(false)
                    }
                  >
                    Cancel
                  </button>

                </div>

              </div>

            )}

            {/* ==============================
                ONLINE PAYMENTS
            ============================== */}

            <div className="control-card">

              <div className="control-icon">
                🌐
              </div>

              <div className="control-content">

                <h3>
                  Online Payments
                </h3>

                <p>
                  Your virtual card can be used for
                  supported online transactions.
                </p>

              </div>

              <div
                className={`toggle-switch ${
                  onlinePayments
                    ? "active-toggle"
                    : ""
                }`}
                onClick={
                  handleOnlinePayments
                }
              >

                <span>
                </span>

              </div>

            </div>

            {/* ==============================
                CARD INFORMATION
            ============================== */}

            <div className="card-info-box">

              <div className="info-icon">
                ℹ️
              </div>

              <div>

                <h3>
                  Virtual Card Security
                </h3>

                <p>
                  Never share your CVV or card details
                  with anyone. Freeze your card immediately
                  if you notice suspicious activity.
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>

  );

}

export default VirtualCard;