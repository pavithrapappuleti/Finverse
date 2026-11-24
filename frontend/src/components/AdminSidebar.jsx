import { useLocation, useNavigate } from "react-router-dom";
import "../pages/AdminDashboard.css";

function AdminSidebar({ menuOpen, setMenuOpen }) {

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

 const handleLogout = () => {

  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (confirmLogout) {

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin");

    navigate("/login");

    setMenuOpen(false);
  }
};
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      <aside
        className={`admin-sidebar ${
          menuOpen ? "open" : ""
        }`}
      >

        {/* Logo */}
        <div className="admin-sidebar-logo">

          <img
            src="/images/finverse-logo.png"
            alt="FINVERSE"
          />

        </div>

        {/* Menu */}
        <div className="admin-sidebar-menu">

          <p className="admin-menu-title">
            ADMIN MENU
          </p>

          {/* Overview */}
          <button
            className={`admin-sidebar-item ${
              isActive("/admin-dashboard")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/admin-dashboard")
            }
          >
            <span>⌂</span>
            Overview
          </button>

          {/* Manage Users */}
          <button
            className={`admin-sidebar-item ${
              isActive("/admin-users")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/admin-users")
            }
          >
            <span>👥</span>
            Manage Users
          </button>

          {/* Accounts */}
          <button
            className={`admin-sidebar-item ${
              isActive("/admin-accounts")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/admin-accounts")
            }
          >
            <span>💳</span>
            Accounts
          </button>

          {/* Transactions */}
          <button
            className={`admin-sidebar-item ${
              isActive("/admin-transactions")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/admin-transactions")
            }
          >
            <span>▤</span>
            Transactions
          </button>

          {/* Bank Updates */}
          <button
            className={`admin-sidebar-item ${
              isActive("/admin-updates")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/admin-updates")
            }
          >
            <span>🔔</span>
            Bank Updates
          </button>

          {/* Account Section */}
          <p className="admin-menu-title admin-settings-title">
            ACCOUNT
          </p>

          {/* Logout */}
          <button
            className="admin-sidebar-item admin-logout-item"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>
    </>
  );
}

export default AdminSidebar;