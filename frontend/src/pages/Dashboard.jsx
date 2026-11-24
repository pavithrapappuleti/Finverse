import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [accountNumber, setAccountNumber] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] =
    useState(false);

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Savings goal
  const [savingsGoal, setSavingsGoal] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token")
    );
  };

  // =====================================================
  // FETCH DATA WHEN DASHBOARD LOADS
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
    fetchSavingsGoal();
    fetchNotifications();
  }, []);

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:5000/api/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data);
        return;
      }

      setBalance(data.current_balance || 0);
      setAccountNumber(data.account_number || "");
      setTransactions(data.transactions || []);

    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH SAVINGS GOAL
  // =====================================================

  const fetchSavingsGoal = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://127.0.0.1:5000/api/savings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.goals) {
        const activeGoal = data.goals.find(
          (goal) => goal.status === "ACTIVE"
        );

        setSavingsGoal(
          activeGoal || data.goals[0] || null
        );
      }

    } catch (error) {
      console.error("Savings goal error:", error);
    }
  };

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      setNotificationLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Notification error:", data);
        return;
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);

    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // =====================================================
  // MARK ONE NOTIFICATION AS READ
  // =====================================================

  const markNotificationAsRead = async (
    notificationId
  ) => {
    try {
      const token = getToken();

      const response = await fetch(
        `http://127.0.0.1:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(
          "Mark notification error:",
          data
        );
        return;
      }

      // Update notification locally
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.notification_id ===
          notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );

      // Decrease unread count
      setUnreadCount((previous) =>
        Math.max(previous - 1, 0)
      );

    } catch (error) {
      console.error(
        "Mark notification error:",
        error
      );
    }
  };

  // =====================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =====================================================

  const markAllNotificationsAsRead = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        "http://127.0.0.1:5000/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(
          "Mark all notifications error:",
          data
        );
        return;
      }

      // Update all notifications locally
      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);

    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    }
  };

  // =====================================================
  // FORMAT NOTIFICATION DATE
  // =====================================================

  const formatNotificationDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // MONTHLY EXPENDITURE
  // =====================================================

  const getMonthlyExpenditure = () => {
    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let withdraw = 0;
    let transfer = 0;
    let cardPayment = 0;
    let savings = 0;

    transactions.forEach((transaction) => {
      const transactionDate = new Date(
        transaction.transaction_date
      );

      if (
        transactionDate.getMonth() !== currentMonth ||
        transactionDate.getFullYear() !== currentYear
      ) {
        return;
      }

      const amount =
        Number(transaction.amount) || 0;

      if (
        transaction.transaction_type ===
        "WITHDRAW"
      ) {
        withdraw += amount;
      }

      else if (
        transaction.transaction_type ===
        "TRANSFER"
      ) {
        // Savings goal transactions are stored as TRANSFER
        if (
          transaction.description &&
          transaction.description.startsWith(
            "Savings Goal"
          )
        ) {
          savings += amount;
        } else {
          transfer += amount;
        }
      }

      else if (
        transaction.transaction_type ===
        "CARD_PAYMENT"
      ) {
        cardPayment += amount;
      }
    });

    return {
      withdraw,
      transfer,
      cardPayment,
      savings,
    };
  };

  const expenditure =
    getMonthlyExpenditure();

  const totalExpenditure =
    expenditure.withdraw +
    expenditure.transfer +
    expenditure.cardPayment +
    expenditure.savings;

  // =====================================================
  // PIE CHART
  // =====================================================

  const getPieStyle = () => {
    if (totalExpenditure === 0) {
      return {
        background:
          "conic-gradient(#dce8f5 0deg 360deg)",
      };
    }

    const withdrawDegree =
      (expenditure.withdraw /
        totalExpenditure) *
      360;

    const transferDegree =
      (expenditure.transfer /
        totalExpenditure) *
      360;

    const cardDegree =
      (expenditure.cardPayment /
        totalExpenditure) *
      360;

    const savingsDegree =
      (expenditure.savings /
        totalExpenditure) *
      360;

    const withdrawEnd =
      withdrawDegree;

    const transferEnd =
      withdrawEnd + transferDegree;

    const cardEnd =
      transferEnd + cardDegree;

    const savingsEnd =
      cardEnd + savingsDegree;

    return {
      background: `
        conic-gradient(
          #1769ff 0deg ${withdrawEnd}deg,
          #19c9e8 ${withdrawEnd}deg ${transferEnd}deg,
          #ff9f43 ${transferEnd}deg ${cardEnd}deg,
          #7c5cff ${cardEnd}deg ${savingsEnd}deg
        )
      `,
    };
  };

  const getPercentage = (amount) => {
    if (totalExpenditure === 0) {
      return 0;
    }

    return Math.round(
      (amount / totalExpenditure) * 100
    );
  };

  // =====================================================
  // RECENT TRANSACTIONS
  // =====================================================

  const recentTransactions =
    transactions
      .slice()
      .sort(
        (a, b) =>
          new Date(b.transaction_date) -
          new Date(a.transaction_date)
      )
      .slice(0, 5);

  // =====================================================
  // SAVINGS PROGRESS
  // =====================================================

  const savingsPercentage = savingsGoal
    ? Math.min(
        Math.round(
          (Number(
            savingsGoal.saved_amount
          ) /
            Number(
              savingsGoal.target_amount
            )) *
            100
        ),
        100
      )
    : 0;

  // =====================================================
  // CHATBOT QUESTIONS
  // =====================================================

  const chatbotQuestions = [
    {
      question:
        "What is my account balance?",
      answer: `Your current available balance is ₹${Number(
        balance
      ).toLocaleString("en-IN")}.`,
    },
    {
      question:
        "How do I transfer money?",
      answer:
        "Go to Transfer from the sidebar, enter the recipient account number, amount and your 4-digit PIN, then confirm the transfer.",
    },
    {
      question:
        "How can I deposit money?",
      answer:
        "Open Deposit from the sidebar, enter the required amount and authorize the transaction using your PIN.",
    },
    {
      question:
        "How do I withdraw money?",
      answer:
        "Open Withdraw from the sidebar, enter the amount and your 4-digit PIN, then confirm the withdrawal.",
    },
    {
      question:
        "How do savings goals work?",
      answer:
        "Create a savings goal with a target amount and optionally a target date. You can then add money toward the goal whenever you want.",
    },
    {
      question:
        "How can I view my transactions?",
      answer:
        "Open History from the sidebar to see your complete transaction history.",
    },
  ];

  const handleQuestionClick = (item) => {
    setSelectedQuestion(item);
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // TRANSACTION ICON
  // =====================================================

  const getTransactionIcon = (type) => {
    if (type === "DEPOSIT") return "↓";
    if (type === "WITHDRAW") return "↑";
    if (type === "CARD_PAYMENT") return "💳";
    if (type === "TRANSFER") return "↗";

    return "•";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="dashboard-main">

      {/* =========================================
          TOP HEADER
      ========================================= */}

      <header className="dashboard-header">

        <div>
          <div className="dashboard-breadcrumb">
            FINVERSE / DASHBOARD
          </div>

          <h1>
            Welcome back,{" "}
            {user.full_name || "Pavithra"} 👋
          </h1>

          <p>
            Here's your financial overview.
          </p>
        </div>

        {/* =====================================
            NOTIFICATION BUTTON
        ===================================== */}

        <div className="notification-container">

          <button
            type="button"
            className="notification-button"
            onClick={() => {
              setNotificationOpen(
                !notificationOpen
              );

              if (!notificationOpen) {
                fetchNotifications();
              }
            }}
            aria-label="Notifications"
          >

            {/* Bell SVG */}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M18 8a6 6 0 0 0-12 0
                c0 7-3 7-3 9h18c0-2-3-2-3-9"
              />

              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {/* Unread badge */}

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}

          </button>


          {/* ===================================
              NOTIFICATION PANEL
          =================================== */}

          {notificationOpen && (

            <div className="notification-panel">

              {/* Panel Header */}

              <div className="notification-panel-header">

                <div>
                  <h3>
                    Notifications
                  </h3>

                  <span>
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "All caught up"}
                  </span>
                </div>

                <button
                  type="button"
                  className="notification-close"
                  onClick={() =>
                    setNotificationOpen(false)
                  }
                >
                  ×
                </button>

              </div>


              {/* Mark all as read */}

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="mark-all-button"
                  onClick={
                    markAllNotificationsAsRead
                  }
                >
                  Mark all as read
                </button>
              )}


              {/* Notification Body */}

              <div className="notification-list">

                {notificationLoading ? (

                  <div className="notification-empty">
                    Loading notifications...
                  </div>

                ) : notifications.length ===
                  0 ? (

                  <div className="notification-empty">

                    <div className="notification-empty-icon">
                      🔔
                    </div>

                    <strong>
                      No notifications
                    </strong>

                    <span>
                      Your latest activity will appear here.
                    </span>

                  </div>

                ) : (

                  notifications.map(
                    (notification) => (

                      <div
                        key={
                          notification.notification_id
                        }
                        className={`notification-item ${
                          notification.is_read
                            ? "notification-read"
                            : "notification-unread"
                        }`}
                        onClick={() => {
                          if (
                            !notification.is_read
                          ) {
                            markNotificationAsRead(
                              notification.notification_id
                            );
                          }
                        }}
                      >

                        <div className="notification-icon">
                          {notification.title.includes(
                            "Deposit"
                          )
                            ? "↓"
                            : notification.title.includes(
                                "Withdrawal"
                              )
                            ? "↑"
                            : notification.title.includes(
                                "Transfer"
                              )
                            ? "↗"
                            : notification.title.includes(
                                "Received"
                              )
                            ? "↓"
                            : notification.title.includes(
                                "Card"
                              )
                            ? "💳"
                            : "🔔"}
                        </div>


                        <div className="notification-content">

                          <div className="notification-title-row">

                            <strong>
                              {
                                notification.title
                              }
                            </strong>

                            {!notification.is_read && (
                              <span className="notification-unread-dot"></span>
                            )}

                          </div>

                          <p>
                            {
                              notification.message
                            }
                          </p>

                          <small>
                            {formatNotificationDate(
                              notification.created_at
                            )}
                          </small>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          )}

        </div>

      </header>


      {/* =========================================
          MAIN DASHBOARD
      ========================================= */}

      <section className="dashboard-content">

        {/* =========================================
            BALANCE CARD
        ========================================= */}

        <div
          className="dashboard-balance-card"
          onClick={() =>
            navigate("/balance")
          }
          style={{ cursor: "pointer" }}
        >

          <div className="balance-card-left">

            <span className="balance-label">
              AVAILABLE BALANCE
            </span>

            <h2>
              ₹••••••
            </h2>

            <p>
              Click to view your balance
            </p>

          </div>

          <div className="balance-card-icon">
            ₹
          </div>

        </div>


        {/* =========================================
            ACCOUNT NUMBER
        ========================================= */}

        <div className="dashboard-account-info">

          <span>
            ACCOUNT NUMBER
          </span>

          <div className="account-number-wrapper">

            <strong>
              {showAccountNumber
                ? accountNumber
                : "••••••••••••"}
            </strong>

            <button
              type="button"
              className="account-eye-button"
              onClick={() =>
                setShowAccountNumber(
                  !showAccountNumber
                )
              }
              aria-label={
                showAccountNumber
                  ? "Hide account number"
                  : "Show account number"
              }
            >
              {showAccountNumber
                ? "🙈"
                : "👁️"}
            </button>

          </div>

        </div>


        {/* =========================================
            TWO COLUMN SECTION
        ========================================= */}

        <div className="dashboard-grid">

          {/* =====================================
              MONTHLY EXPENDITURE
          ===================================== */}

          <div className="dashboard-card expenditure-card">

            <div className="dashboard-card-header">

              <div>
                <span className="dashboard-card-label">
                  MONTHLY ANALYSIS
                </span>

                <h3>
                  Monthly Expenditure
                </h3>
              </div>

              <span className="dashboard-card-month">
                {new Date().toLocaleDateString(
                  "en-IN",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>

            </div>


            <div className="expenditure-content">

              <div
                className="expense-pie"
                style={getPieStyle()}
              >

                <div className="expense-pie-center">

                  <strong>
                    ₹
                    {totalExpenditure.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <span>
                    Total spent
                  </span>

                </div>

              </div>


              <div className="expense-legend">

                <div className="legend-item">

                  <span className="legend-dot withdraw"></span>

                  <div>
                    <strong>
                      Withdrawals
                    </strong>

                    <small>
                      ₹
                      {expenditure.withdraw.toLocaleString(
                        "en-IN"
                      )}
                    </small>
                  </div>

                  <b>
                    {getPercentage(
                      expenditure.withdraw
                    )}
                    %
                  </b>

                </div>


                <div className="legend-item">

                  <span className="legend-dot transfer"></span>

                  <div>
                    <strong>
                      Transfers
                    </strong>

                    <small>
                      ₹
                      {expenditure.transfer.toLocaleString(
                        "en-IN"
                      )}
                    </small>
                  </div>

                  <b>
                    {getPercentage(
                      expenditure.transfer
                    )}
                    %
                  </b>

                </div>


                <div className="legend-item">

                  <span className="legend-dot card"></span>

                  <div>
                    <strong>
                      Card Payments
                    </strong>

                    <small>
                      ₹
                      {expenditure.cardPayment.toLocaleString(
                        "en-IN"
                      )}
                    </small>
                  </div>

                  <b>
                    {getPercentage(
                      expenditure.cardPayment
                    )}
                    %
                  </b>

                </div>


                <div className="legend-item">

                  <span className="legend-dot savings"></span>

                  <div>
                    <strong>
                      Savings
                    </strong>

                    <small>
                      ₹
                      {expenditure.savings.toLocaleString(
                        "en-IN"
                      )}
                    </small>
                  </div>

                  <b>
                    {getPercentage(
                      expenditure.savings
                    )}
                    %
                  </b>

                </div>

              </div>

            </div>

          </div>


          {/* =====================================
              SAVINGS GOAL
          ===================================== */}

          <div className="dashboard-card savings-card">

            <div className="dashboard-card-header">

              <div>

                <span className="dashboard-card-label">
                  SAVINGS
                </span>

                <h3>
                  Savings Goal
                </h3>

              </div>

              <button
                className="view-link"
                onClick={() =>
                  navigate("/savings")
                }
              >
                View all →
              </button>

            </div>


            {savingsGoal ? (

              <div className="dashboard-savings-content">

                <div className="savings-goal-icon">
                  🎯
                </div>

                <div className="savings-goal-info">

                  <h4>
                    {savingsGoal.goal_name}
                  </h4>

                  <p>

                    ₹
                    {Number(
                      savingsGoal.saved_amount
                    ).toLocaleString(
                      "en-IN"
                    )}

                    {" "}of{" "}

                    ₹
                    {Number(
                      savingsGoal.target_amount
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </p>

                </div>

                <strong className="savings-percent">
                  {savingsPercentage}%
                </strong>

              </div>

            ) : (

              <div className="no-goal">

                <div>
                  🎯
                </div>

                <h4>
                  No savings goal yet
                </h4>

                <p>
                  Create a goal and start saving.
                </p>

                <button
                  onClick={() =>
                    navigate("/savings")
                  }
                >
                  + Create Goal
                </button>

              </div>

            )}


            {savingsGoal && (

              <div className="savings-progress">

                <div className="savings-progress-track">

                  <div
                    className="savings-progress-fill"
                    style={{
                      width: `${savingsPercentage}%`,
                    }}
                  ></div>

                </div>

                <div className="savings-progress-bottom">

                  <span>
                    Remaining
                  </span>

                  <strong>

                    ₹
                    {(
                      Number(
                        savingsGoal.target_amount
                      ) -
                      Number(
                        savingsGoal.saved_amount
                      )
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </strong>

                </div>

              </div>

            )}

          </div>

        </div>


        {/* =========================================
            RECENT TRANSACTIONS
        ========================================= */}

        <div className="dashboard-card transactions-card">

          <div className="dashboard-card-header">

            <div>

              <span className="dashboard-card-label">
                ACTIVITY
              </span>

              <h3>
                Recent Transactions
              </h3>

            </div>

            <button
              className="view-link"
              onClick={() =>
                navigate("/history")
              }
            >
              View all →
            </button>

          </div>


          {recentTransactions.length ===
          0 ? (

            <div className="empty-transactions">
              No transactions available yet.
            </div>

          ) : (

            <div className="transaction-list">

              {recentTransactions.map(
                (
                  transaction,
                  index
                ) => {

                  const isIncome =
                    transaction.transaction_type ===
                    "DEPOSIT";

                  return (

                    <div
                      className="dashboard-transaction"
                      key={
                        transaction.transaction_id ||
                        index
                      }
                    >

                      <div
                        className={`transaction-icon ${
                          isIncome
                            ? "income"
                            : "expense"
                        }`}
                      >

                        {getTransactionIcon(
                          transaction.transaction_type
                        )}

                      </div>


                      <div className="transaction-details">

                        <strong>
                          {
                            transaction.description ||
                            transaction.transaction_type
                          }
                        </strong>

                        <span>
                          {formatDate(
                            transaction.transaction_date
                          )}
                        </span>

                      </div>


                      <strong
                        className={`transaction-amount ${
                          isIncome
                            ? "amount-income"
                            : "amount-expense"
                        }`}
                      >

                        {isIncome
                          ? "+"
                          : "-"}

                        ₹
                        {Number(
                          transaction.amount
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </strong>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </div>

      </section>


      {/* =========================================
          CHATBOT BUTTON
      ========================================= */}

      <button
        className={`chatbot-floating-button ${
          chatOpen
            ? "chat-active"
            : ""
        }`}
        onClick={() => {

          setChatOpen(!chatOpen);

          setSelectedQuestion(
            null
          );

        }}
        aria-label="Open FINVERSE Assistant"
      >
        {chatOpen
          ? "×"
          : "🤖"}
      </button>


      {/* =========================================
          CHATBOT PANEL
      ========================================= */}

      <div
        className={`chatbot-panel ${
          chatOpen
            ? "chatbot-open"
            : ""
        }`}
      >

        <div className="chatbot-header">

          <div className="chatbot-title">

            <div className="chatbot-avatar">
              🤖
            </div>

            <div>

              <strong>
                FINVERSE Assistant
              </strong>

              <span>
                Online
              </span>

            </div>

          </div>


          <button
            className="chatbot-close"
            onClick={() => {

              setChatOpen(false);

              setSelectedQuestion(
                null
              );

            }}
          >
            ×
          </button>

        </div>


        <div className="chatbot-body">

          <div className="bot-message">

            Hello{" "}
            {user.full_name ||
              "there"} 👋

            <br />

            How can I help you today?

          </div>


          {selectedQuestion && (

            <>

              <div className="user-message">
                {
                  selectedQuestion.question
                }
              </div>

              <div className="bot-message">
                {
                  selectedQuestion.answer
                }
              </div>

            </>

          )}


          <div className="chatbot-questions">

            <span>
              Common questions
            </span>

            {chatbotQuestions.map(
              (
                item,
                index
              ) => (

                <button
                  key={index}
                  onClick={() =>
                    handleQuestionClick(
                      item
                    )
                  }
                >
                  {
                    item.question
                  }
                </button>

              )
            )}

          </div>

        </div>

      </div>

    </main>
  );
}

export default Dashboard;