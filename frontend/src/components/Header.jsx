import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { toast } from "react-toastify";

const Header = ({ setAuth }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const handleLogout = () => {
    if (setAuth) setAuth(null);
    toast.info("You have been logged out.");
    navigate("/");
  };

  return (
    <header className="app-header">
      <h1 className="logo">🛡️ PhishGuard AI</h1>
      <nav className="nav-links">
        <Link to="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
        <Link to="/predict" className={isActive("/predict")}>Predict</Link>
        <Link to="/reports" className={isActive("/reports")}>Reports</Link>
        <Link to="/email-logs" className={isActive("/email-logs")}>Email Logs</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>
    </header>
  );
};

export default Header;
