import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./AdminTransactions.css";

function AdminTransactions() {

  const { setMenuOpen } = useOutletContext();

  const [transactions, setTransactions] = useState([]);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");


  // =========================
  // FETCH TRANSACTIONS
  // =========================

  const fetchTransactions = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/transactions",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log(
        "Transactions Response:",
        data
      );

      if (response.ok) {

        setTransactions(
          data.transactions || []
        );

      } else {

        alert(
          data.message ||
          "Failed to fetch transactions"
        );
      }

    } catch (error) {

      console.error(
        "Fetch Transactions Error:",
        error
      );

      alert(
        "Unable to connect to server"
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchTransactions();

  }, []);


  // =========================
  // FILTER TRANSACTIONS
  // =========================

  const filteredTransactions =
    transactions.filter((transaction) => {

      const searchText =
        search.toLowerCase();

      const matchesSearch =

        String(
          transaction.transaction_id
        )
          .toLowerCase()
          .includes(searchText)

        ||

        transaction.full_name
          ?.toLowerCase()
          .includes(searchText)

        ||

        transaction.email
          ?.toLowerCase()
          .includes(searchText)

        ||

        transaction.account_number
          ?.toLowerCase()
          .includes(searchText);


      const matchesType =

        typeFilter === "ALL" ||

        transaction.transaction_type ===
          typeFilter;


      const matchesStatus =

        statusFilter === "ALL" ||

        transaction.status ===
          statusFilter;


      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );

    });


  // =========================
// TOTAL TRANSACTION VALUE
// =========================

let totalAmount = 0;

for (
  let i = 0;
  i < transactions.length;
  i++
) {

  const transactionType =
    transactions[i].transaction_type;

  // Count only outgoing transactions
  if (
    transactionType === "WITHDRAW" ||
    transactionType === "TRANSFER" ||
    transactionType === "CARD_PAYMENT"
  ) {

    totalAmount += Number(
      transactions[i].amount || 0
    );

  }

}

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const formattedDate =
      new Date(date);

    return formattedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };


  return (

    <main className="admin-dashboard-main">

      {/* TOP BAR */}

      <div className="admin-transactions-topbar">

        <div className="admin-transactions-title">

          <button
            className="admin-menu-button"
            onClick={() =>
              setMenuOpen(true)
            }
          >
            ☰
          </button>

          <div>

            <h1>
              Transactions
            </h1>

            <p>
              Monitor customer banking transactions
            </p>

          </div>

        </div>


        <div className="admin-transactions-summary">

          <div>

            <strong>
              {transactions.length}
            </strong>

            <span>
              Total Transactions
            </span>

          </div>


          <div>

            <strong>
              ₹
              {totalAmount.toLocaleString(
                "en-IN"
              )}
            </strong>

            <span>
              Total Money Out
            </span>

          </div>

        </div>

      </div>


      {/* FILTERS */}

      <section className="admin-transactions-controls">

        <div className="admin-transactions-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by customer, account or transaction ID..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          className="admin-transaction-filter"
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
        >

          <option value="ALL">
            All Types
          </option>

          <option value="DEPOSIT">
            Deposit
          </option>

          <option value="WITHDRAW">
            Withdraw
          </option>

          <option value="TRANSFER">
            Transfer
          </option>

        </select>


        <select
          className="admin-transaction-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >

          <option value="ALL">
            All Status
          </option>

          <option value="SUCCESS">
            Success
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="FAILED">
            Failed
          </option>

        </select>

      </section>


      {/* TRANSACTION CARD */}

      <section className="admin-transactions-card">

        <div className="admin-transactions-card-header">

          <div>

            <h2>
              Transaction Records
            </h2>

            <p>
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1
                ? "s"
                : ""} found
            </p>

          </div>

        </div>


        {loading ? (

          <div className="admin-transactions-loading">

            Loading transactions...

          </div>

        ) : filteredTransactions.length === 0 ? (

          <div className="admin-transactions-empty">

            <div>▤</div>

            <h3>
              No transactions found
            </h3>

            <p>
              No transactions match your
              search or filters.
            </p>

          </div>

        ) : (

          <div className="admin-transactions-table-wrapper">

            <table className="admin-transactions-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Customer</th>

                  <th>Account</th>

                  <th>Type</th>

                  <th>Amount</th>

                  <th>Description</th>

                  <th>Status</th>

                  <th>Date</th>

                </tr>

              </thead>


              <tbody>

                {filteredTransactions.map(
                  (transaction) => (

                    <tr
                      key={
                        transaction.transaction_id
                      }
                    >

                      {/* ID */}

                      <td>

                        <span className="transaction-id">

                          #
                          {
                            transaction.transaction_id
                          }

                        </span>

                      </td>


                      {/* CUSTOMER */}

                      <td>

                        <div className="transaction-user">

                          <div className="transaction-avatar">

                            {transaction.full_name
                              ? transaction.full_name
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}

                          </div>

                          <div>

                            <strong>
                              {
                                transaction.full_name
                              }
                            </strong>

                            <span>
                              {
                                transaction.email
                              }
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* ACCOUNT */}

                      <td>

                        <span className="transaction-account">

                          {
                            transaction.account_number
                          }

                        </span>

                      </td>


                      {/* TYPE */}

                      <td>

                        <span
                          className={`transaction-type ${
                            transaction.transaction_type
                              ?.toLowerCase()
                          }`}
                        >

                          {
                            transaction.transaction_type
                          }

                        </span>

                      </td>


                      {/* AMOUNT */}

                      <td>

                        <strong
                          className={`transaction-amount ${
                            transaction.transaction_type
                              ?.toLowerCase()
                          }`}
                        >

                          ₹
                          {Number(
                            transaction.amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </strong>

                      </td>


                      {/* DESCRIPTION */}

                      <td>

                        <span className="transaction-description">

                          {
                            transaction.description ||
                            "-"
                          }

                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`transaction-status ${
                            transaction.status
                              ?.toLowerCase()
                          }`}
                        >

                          {
                            transaction.status ||
                            "SUCCESS"
                          }

                        </span>

                      </td>


                      {/* DATE */}

                      <td>

                        <span className="transaction-date">

                          {formatDate(
                            transaction.created_at
                          )}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminTransactions;