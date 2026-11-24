import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../pages/Dashboard.css";

function Sidebar({ menuOpen, setMenuOpen }) {

  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user =
    JSON.parse(localStorage.getItem("user")) || {};


  // -----------------------------------
  // NAVIGATION
  // -----------------------------------

  const handleNavigation = (path) => {

    navigate(path);

    setMenuOpen(false);

  };


  // -----------------------------------
  // OPEN LOGOUT MODAL
  // -----------------------------------

  const handleLogout = () => {

    setShowLogoutModal(true);

  };


  // -----------------------------------
  // CONFIRM LOGOUT
  // -----------------------------------

  const confirmLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setShowLogoutModal(false);

    setMenuOpen(false);

    navigate("/login");

  };


  // -----------------------------------
  // CANCEL LOGOUT
  // -----------------------------------

  const cancelLogout = () => {

    setShowLogoutModal(false);

  };


  // -----------------------------------
  // ACTIVE MENU
  // -----------------------------------

  const isActive = (path) => {

    return location.pathname === path;

  };


  return (
    <>

      {/* ===================================
          MOBILE OVERLAY
      =================================== */}

      {menuOpen && (

        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>

      )}


      {/* ===================================
          SIDEBAR
      =================================== */}

      <aside
        className={`dashboard-sidebar ${
          menuOpen ? "open" : ""
        }`}
      >

        {/* ===================================
            LOGO
        =================================== */}

        <div className="sidebar-logo">

          <img
            src="/images/finverse-logo.png"
            alt="FINVERSE"
          />

        </div>


        {/* ===================================
            MENU
        =================================== */}

        <div className="sidebar-menu">

          <p className="menu-title">
            MAIN MENU
          </p>


          {/* ===================================
              OVERVIEW
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/dashboard")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/dashboard")
            }
          >

            <span>⌂</span>

            Overview

          </button>


          {/* ===================================
              BALANCE
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/balance")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/balance")
            }
          >

            <span>💰</span>

            Balance

          </button>


          {/* ===================================
              CARDS
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/cards")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/cards")
            }
          >

            <span>💳</span>

            Cards

          </button>


          {/* ===================================
              DEPOSIT
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/deposit")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/deposit")
            }
          >

            <span>📥</span>

            Deposit

          </button>


          {/* ===================================
              WITHDRAW
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/withdraw")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/withdraw")
            }
          >

            <span>💸</span>

            Withdraw

          </button>


          {/* ===================================
              TRANSFER
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/transfer")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/transfer")
            }
          >

            <span>🔄</span>

            Transfer

          </button>


          {/* ===================================
              SCHEDULED
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/scheduled")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/scheduled")
            }
          >

            <span>📅</span>

            Scheduled

          </button>
          <button
  className={`sidebar-item ${
    isActive("/savings")
      ? "active"
      : ""
  }`}
  onClick={() =>
    handleNavigation("/savings")
  }
>
  <span>🎯</span>

  Savings Goals
</button>

          {/* ===================================
              HISTORY
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/history")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/history")
            }
          >

            <span>📜</span>

            History

          </button>


    


          {/* ===================================
              PROFILE
          =================================== */}

          <button
            className={`sidebar-item ${
              isActive("/profile")
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation("/profile")
            }
          >

            <span>👤</span>

            Profile

          </button>


          {/* ===================================
              LOGOUT
          =================================== */}

          <button
            className="sidebar-item logout-item"
            onClick={handleLogout}
          >

            <span>↪</span>

            Logout

          </button>

        </div>

      </aside>


      {/* ===================================
          LOGOUT CONFIRMATION MODAL
      =================================== */}

      {showLogoutModal && (

        <div className="logout-modal-overlay">

          <div className="logout-modal">

            {/* ICON */}

            <div className="logout-modal-icon">
              🚪
            </div>


            {/* TITLE */}

            <h2>
              Logout
            </h2>


            {/* MESSAGE */}

            <p>
              Leaving FINVERSE?
Hope to see you again soon! 👋
            </p>


            {/* BUTTONS */}

            <div className="logout-modal-buttons">

              <button
                className="logout-no-btn"
                onClick={cancelLogout}
              >
                Stay a little
              </button>


              <button
                className="logout-yes-btn"
                onClick={confirmLogout}
              >
                I'm leaving 👋
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default Sidebar;