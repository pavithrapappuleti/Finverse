import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./History.css";

function History() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

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
  // GET TRANSACTION HISTORY
  // =====================================================

  const fetchHistory = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:5000/api/history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("History response:", data);

      if (!response.ok) {
        setError(
          data.message ||
            data.msg ||
            data.error ||
            `Failed to load history (${response.status})`
        );
        return;
      }

      setTransactions(data.transactions || []);
      setAccountNumber(data.account_number || "");
      setCurrentBalance(Number(data.current_balance || 0));
    } catch (err) {
      console.error("History Error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // TRANSACTION TYPE
  // =====================================================

  const getTransactionIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "DEPOSIT":
        return "↓";

      case "WITHDRAW":
        return "↑";

      case "TRANSFER":
        return "⇄";

      default:
        return "₹";
    }
  };

  const getTransactionClass = (type) => {
    switch (type?.toUpperCase()) {
      case "DEPOSIT":
        return "history-deposit";

      case "WITHDRAW":
        return "history-withdraw";

      case "TRANSFER":
        return "history-transfer";

      default:
        return "history-default";
    }
  };

  // =====================================================
  // AMOUNT DISPLAY
  // =====================================================

  const getAmountPrefix = (type) => {
    return type?.toUpperCase() === "DEPOSIT" ? "+" : "-";
  };

  return (
   <main className="dashboard-main">
      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      

        <div className="history-page">

          {/* HEADER */}

          <div className="history-header">

            <div>
              <p className="history-label">
                TRANSACTION CENTER
              </p>

              <h1>
                Transaction History
              </h1>

              <p className="history-subtitle">
                Track and review all your banking transactions.
              </p>
            </div>

            <button
              className="history-refresh"
              onClick={fetchHistory}
              disabled={loading}
            >
              ↻ {loading ? "Loading..." : "Refresh"}
            </button>

          </div>

          {/* =================================================
              ACCOUNT SUMMARY
          ================================================= */}

          <div className="history-summary">

            <div className="history-summary-card">

              <div className="history-summary-icon">
                ₹
              </div>

              <div>
                <p>Current Balance</p>

                <h2>
                  ₹
                  {currentBalance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </h2>
              </div>

            </div>


            <div className="history-summary-card">

              <div className="history-summary-icon">
                #
              </div>

              <div>
                <p>Account Number</p>

                <h2>
                  {accountNumber || "N/A"}
                </h2>
              </div>

            </div>


            <div className="history-summary-card">

              <div className="history-summary-icon">
                ▤
              </div>

              <div>
                <p>Total Transactions</p>

                <h2>
                  {transactions.length}
                </h2>
              </div>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="history-error">
              ⚠ {error}
            </div>
          )}

          {/* =================================================
              TRANSACTION TABLE
          ================================================= */}

          <div className="history-card">

            <div className="history-card-header">

              <div>
                <h2>Recent Transactions</h2>

                <p>
                  Your latest account activity
                </p>
              </div>

              <span className="history-count">
                {transactions.length} Transactions
              </span>

            </div>


            {loading ? (

              <div className="history-loading">
                <div className="history-spinner"></div>

                <p>
                  Loading transaction history...
                </p>
              </div>

            ) : transactions.length === 0 ? (

              <div className="history-empty">

                <div className="history-empty-icon">
                  ▤
                </div>

                <h3>
                  No Transactions Yet
                </h3>

                <p>
                  Your deposit, withdrawal and transfer
                  transactions will appear here.
                </p>

              </div>

            ) : (

              <div className="history-table-wrapper">

                <table className="history-table">

                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Date & Time</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {transactions.map(
                      (transaction, index) => {

                        const type =
                          transaction.transaction_type ||
                          transaction.type ||
                          "TRANSACTION";

                        const amount =
                          Number(transaction.amount || 0);

                        return (
                          <tr
                            key={
                              transaction.transaction_id ||
                              index
                            }
                          >

                            {/* TRANSACTION */}

                            <td>

                              <div className="history-transaction">

                                <div
                                  className={`history-type-icon ${getTransactionClass(
                                    type
                                  )}`}
                                >
                                  {getTransactionIcon(type)}
                                </div>

                                <div>

                                  <strong>
                                    {type}
                                  </strong>

                                  <small>
                                    ID:{" "}
                                    {transaction.transaction_id ||
                                      "N/A"}
                                  </small>

                                </div>

                              </div>

                            </td>


                            {/* DATE */}

                            <td>
                              <span className="history-date">
                                {formatDate(
                                  transaction.transaction_date ||
                                    transaction.created_at ||
                                    transaction.date
                                )}
                              </span>
                            </td>


                            {/* DESCRIPTION */}

                            <td>

                              <span className="history-description">
                                {transaction.description ||
                                  "Bank transaction"}
                              </span>

                            </td>


                            {/* AMOUNT */}

                            <td>

                              <span
                                className={`history-amount ${
                                  type.toUpperCase() ===
                                  "DEPOSIT"
                                    ? "amount-credit"
                                    : "amount-debit"
                                }`}
                              >
                                {getAmountPrefix(type)}
                                ₹
                                {amount.toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                  }
                                )}
                              </span>

                            </td>


                            {/* STATUS */}

                            <td>

                              <span
                                className={`history-status ${
                                  transaction.status
                                    ?.toUpperCase() ===
                                  "SUCCESS"
                                    ? "status-success"
                                    : "status-failed"
                                }`}
                              >

                                <span className="history-status-dot"></span>

                                {transaction.status ||
                                  "SUCCESS"}

                              </span>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* SECURITY INFO */}

          <div className="history-security">

            <div className="history-security-icon">
              🔒
            </div>

            <div>

              <h3>
                Your transactions are secure
              </h3>

              <p>
                FINVERSE keeps your banking activity
                protected with secure authentication
                and encrypted communication.
              </p>

            </div>

          </div>

        </div>

      </main>


  );
}

export default History;