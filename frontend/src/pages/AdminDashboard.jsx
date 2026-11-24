import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
    const [stats, setStats] = useState({
  total_users: 0,
  total_accounts: 0,
  total_transactions: 0,
  total_updates: 0
});

const [statsLoading, setStatsLoading] = useState(true);

  const { setMenuOpen } = useOutletContext();

  const fetchDashboardStats = async () => {

  try {

    setStatsLoading(true);

    const response = await fetch(
      "http://127.0.0.1:5000/api/admin/dashboard-stats"
    );

    const data = await response.json();

    console.log("Dashboard Stats:", data);

    if (response.ok) {
      setStats({
        total_users: data.total_users || 0,
        total_accounts: data.total_accounts || 0,
        total_transactions: data.total_transactions || 0,
        total_updates: data.total_updates || 0
      });
    }

  } catch (error) {

    console.error("Dashboard Stats Error:", error);

  } finally {

    setStatsLoading(false);

  }
};
useEffect(() => {
  fetchDashboardStats();
}, []);
  const admin =
    JSON.parse(
      localStorage.getItem("admin")
    ) || {};

  return (
    <main className="admin-dashboard-main">

      {/* Top Bar */}
      <div className="admin-topbar">

        {/* Mobile Menu */}
        <button
          className="admin-menu-button"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Manage and monitor FINVERSE banking services
          </p>
        </div>

        {/* Admin Info */}
        <div className="admin-profile">

          <div className="admin-avatar">
            {admin.full_name
              ? admin.full_name
                  .charAt(0)
                  .toUpperCase()
              : "A"}
          </div>

          <div>
            <strong>
              {admin.full_name || "Administrator"}
            </strong>

            <span>
              Administrator
            </span>
          </div>

        </div>

      </div>


      {/* Welcome */}
      <section className="admin-welcome-card">

        <div>

          <h2>
            Welcome,{" "}
            {admin.full_name || "Admin"} 👋
          </h2>

          <p>
            Here's an overview of your FINVERSE
            banking system.
          </p>

        </div>

      </section>


      {/* Statistics */}
      <section className="admin-stat-grid">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            👥
          </div>

          <div>

            <p>Total Users</p>

            <h2>
  {statsLoading ? "..." : stats.total_users}
</h2>

            <span>
              Registered users
            </span>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            💳
          </div>

          <div>

            <p>Total Accounts</p>

           <h2>
  {statsLoading ? "..." : stats.total_accounts}
</h2>

            <span>
              Active accounts
            </span>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            💸
          </div>

          <div>

            <p>Transactions</p>

            <h2>
  {statsLoading ? "..." : stats.total_transactions}
</h2>

            <span>
              Total transactions
            </span>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🔔
          </div>

          <div>

            <p>Bank Updates</p>

            <h2>
  {statsLoading ? "..." : stats.total_updates}
</h2>
            <span>
              Notifications sent
            </span>

          </div>

        </div>

      </section>


      {/* Quick Navigation */}
      <section className="admin-section">

        <div className="admin-section-heading">

          <div>

            <h2>Administration</h2>

            <p>
              Manage different areas of FINVERSE
            </p>

          </div>

        </div>


        <div className="admin-action-grid">

          <button
            onClick={() =>
              window.location.href =
                "/admin-users"
            }
          >
            <span>👥</span>

            <div>
              <strong>
                Manage Users
              </strong>

              <small>
                View and manage registered users
              </small>
            </div>

            <b>→</b>
          </button>


          <button
            onClick={() =>
              window.location.href =
                "/admin-accounts"
            }
          >
            <span>💳</span>

            <div>
              <strong>
                Accounts
              </strong>

              <small>
                View customer accounts
              </small>
            </div>

            <b>→</b>
          </button>


          <button
            onClick={() =>
              window.location.href =
                "/admin-transactions"
            }
          >
            <span>▤</span>

            <div>
              <strong>
                Transactions
              </strong>

              <small>
                Monitor banking transactions
              </small>
            </div>

            <b>→</b>
          </button>


          <button
            onClick={() =>
              window.location.href =
                "/admin-updates"
            }
          >
            <span>🔔</span>

            <div>
              <strong>
                Bank Updates
              </strong>

              <small>
                Send notifications to users
              </small>
            </div>

            <b>→</b>
          </button>

        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;