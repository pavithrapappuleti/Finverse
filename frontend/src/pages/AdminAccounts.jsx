import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./AdminAccounts.css";

function AdminAccounts() {

  const { setMenuOpen } = useOutletContext();

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // =========================
  // FETCH ACCOUNTS
  // =========================

  const fetchAccounts = async () => {

    try {

      setLoading(true);

      const response = await fetch(
  `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api/admin/accounts`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      const data = await response.json();

      console.log("Accounts Response:", data);

      if (response.ok) {

        setAccounts(data.accounts || []);

      } else {

        alert(data.message || "Failed to fetch accounts");
      }

    } catch (error) {

      console.error("Fetch Accounts Error:", error);

      alert("Unable to connect to server");

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    fetchAccounts();

  }, []);


  // =========================
  // SEARCH + FILTER
  // =========================

  const filteredAccounts = accounts.filter((account) => {

    const searchText = search.toLowerCase();

    const matchesSearch =
      account.full_name
        ?.toLowerCase()
        .includes(searchText) ||

      account.email
        ?.toLowerCase()
        .includes(searchText) ||

      account.account_number
        ?.toLowerCase()
        .includes(searchText);

    const matchesType =
      typeFilter === "ALL" ||
      account.account_type === typeFilter;

    return matchesSearch && matchesType;
  });


  // =========================
  // TOTAL BALANCE
  // =========================

  let totalBalance = 0;

  for (let i = 0; i < accounts.length; i++) {

    totalBalance += Number(
      accounts[i].balance || 0
    );
  }


  return (

    <main className="admin-dashboard-main">

      {/* TOP BAR */}

      <div className="admin-accounts-topbar">

        <div className="admin-accounts-title">

          <button
            className="admin-menu-button"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>

          <div>

            <h1>Accounts</h1>

            <p>
              View and monitor customer bank accounts
            </p>

          </div>

        </div>


        <div className="admin-accounts-summary">

          <div>

            <strong>
              {accounts.length}
            </strong>

            <span>Total Accounts</span>

          </div>

          <div>

            <strong>
              ₹{totalBalance.toLocaleString("en-IN")}
            </strong>

            <span>Total Balance</span>

          </div>

        </div>

      </div>


      {/* SEARCH + FILTER */}

      <section className="admin-accounts-controls">

        <div className="admin-accounts-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by customer, email or account number..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          className="admin-account-filter"
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
        >

          <option value="ALL">
            All Account Types
          </option>

          <option value="SAVINGS">
            Savings
          </option>

          <option value="CURRENT">
            Current
          </option>

          <option value="LOAN">
            Loan
          </option>

        </select>

      </section>


      {/* ACCOUNTS CARD */}

      <section className="admin-accounts-card">

        <div className="admin-accounts-card-header">

          <div>

            <h2>Customer Accounts</h2>

            <p>
              {filteredAccounts.length} account
              {filteredAccounts.length !== 1
                ? "s"
                : ""} found
            </p>

          </div>

        </div>


        {loading ? (

          <div className="admin-accounts-loading">

            Loading accounts...

          </div>

        ) : filteredAccounts.length === 0 ? (

          <div className="admin-accounts-empty">

            <div>💳</div>

            <h3>No accounts found</h3>

            <p>
              No accounts match your search or filter.
            </p>

          </div>

        ) : (

          <div className="admin-accounts-table-wrapper">

            <table className="admin-accounts-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Customer</th>

                  <th>Account Number</th>

                  <th>Account Type</th>

                  <th>Balance</th>

                  <th>Status</th>

                </tr>

              </thead>


              <tbody>

                {filteredAccounts.map((account) => (

                  <tr key={account.account_id}>

                    <td>
                      #{account.account_id}
                    </td>


                    <td>

                      <div className="admin-account-user">

                        <div className="admin-account-avatar">

                          {account.full_name
                            ? account.full_name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}

                        </div>

                        <div>

                          <strong>
                            {account.full_name}
                          </strong>

                          <span>
                            {account.email}
                          </span>

                        </div>

                      </div>

                    </td>


                    <td>

                      <span className="admin-account-number">

                        {account.account_number}

                      </span>

                    </td>


                    <td>

                      <span
                        className={`account-type ${account.account_type?.toLowerCase()}`}
                      >

                        {account.account_type}

                      </span>

                    </td>


                    <td>

                      <strong className="account-balance">

                        ₹{Number(
                          account.balance || 0
                        ).toLocaleString("en-IN")}

                      </strong>

                    </td>


                    <td>

                      <span
                        className={`account-status ${
                          account.user_status === "ACTIVE"
                            ? "active"
                            : "inactive"
                        }`}
                      >

                        {account.user_status}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminAccounts;