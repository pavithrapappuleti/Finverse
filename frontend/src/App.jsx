import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import BankLayout from "./components/BankLayout";
import AdminLayout from "./components/AdminLayout";

import About from "./pages/About";
import Features from "./pages/Features";
import Security from "./pages/Security";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Balance from "./pages/Balance";
import VirtualCard from "./pages/VirtualCard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Transfer from "./pages/Transfer";
import ScheduledTransactions from "./pages/ScheduledTransactions";
import SavingsGoals from "./pages/SavingsGoals";
import History from "./pages/History";
import Profile from "./pages/Profile";
import ResetPin from "./pages/ResetPin";
import KYCResubmit from "./pages/KYCResubmit";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminAccounts from "./pages/AdminAccounts";
import AdminTransactions from "./pages/AdminTransactions";
import AdminUpdates from "./pages/AdminUpdates";

import ResetPassword from "./pages/ResetPassword";

import "./App.css";

function App() {

  return (

    <BrowserRouter>

      {/* BACKGROUND */}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",

          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.20),
              rgba(235, 247, 255, 0.10),
              rgba(255, 255, 255, 0.10)
            ),
            url("/images/finverse-background-bg.jpg")
          `,

          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",

          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* WEBSITE CONTENT */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
        }}
      >

        <Routes>

          {/* ========================= */}
          {/* PUBLIC WEBSITE */}
          {/* ========================= */}

          <Route
            path="/"
            element={
              <>
                <Navbar />
                <HeroSection />
                <Footer />
              </>
            }
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/features"
            element={<Features />}
          />

          <Route
            path="/security"
            element={<Security />}
          />

          {/* ========================= */}
          {/* AUTHENTICATION */}
          {/* ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* ========================= */}
          {/* USER BANKING */}
          {/* ========================= */}

          <Route element={<BankLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/balance"
              element={<Balance />}
            />

            <Route
              path="/cards"
              element={<VirtualCard />}
            />

            <Route
              path="/deposit"
              element={<Deposit />}
            />

            <Route
              path="/withdraw"
              element={<Withdraw />}
            />

            <Route
              path="/transfer"
              element={<Transfer />}
            />

            <Route
              path="/scheduled"
              element={<ScheduledTransactions />}
            />

            <Route
              path="/savings"
              element={<SavingsGoals />}
            />

            <Route
              path="/history"
              element={<History />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

          </Route>


          {/* ========================= */}
          {/* ADMIN */}
          {/* ========================= */}

          <Route element={<AdminLayout />}>

            <Route
              path="/admin-dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin-users"
              element={<AdminUsers />}
            />

            <Route
              path="/admin-accounts"
              element={<AdminAccounts />}
            />

            <Route
              path="/admin-transactions"
              element={<AdminTransactions />}
            />

            <Route
              path="/admin-updates"
              element={<AdminUpdates />}
            />

          </Route>


          {/* ========================= */}
          {/* RESET PIN */}
          {/* ========================= */}

          <Route
            path="/reset-pin"
            element={<ResetPin />}
          />


          {/* ========================= */}
          {/* KYC RESUBMISSION */}
          {/* ========================= */}

          <Route
            path="/kyc-resubmit"
            element={<KYCResubmit />}
          />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;