import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Predict from "./components/Predict";
import ReportsLog from "./components/ReportsLog";
import EmailLogs from "./components/EmailLogs/EmailLogs";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import ConnectEmail from "./components/ConnectEmail";
import ScanInbox from "./components/ScanInbox";
import Quarantine from "./components/Quarantine";
import AdminUsers from "./components/AdminUsers";
import { jwtDecode } from "jwt-decode";
import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPasswordRequest from "./components/ForgotPasswordRequest";
import ResetPassword from "./components/ResetPassword";
import Footer from "./components/Footer";
import UploadEmailScan from "./components/UploadEmailScan";
import Chatbot from "./components/Chatbot";
import AdminEducativeTips from "./components/AdminEducativeTips";

const App = () => {
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      isAdmin = decoded.role === "admin";
    } catch (e) {
      isAdmin = false;
    }
  }

  return (
    <BrowserRouter>
      <div className="app-background">
        {isLoggedIn && <Header />}
        {isLoggedIn && (
          <nav style={{ margin: '1em' }}>
            <Link to="/connect-email" style={{ marginRight: '1em' }}>Connect Email</Link>
            <Link to="/scan-inbox" style={{ marginRight: '1em' }}>Scan My Inbox</Link>
            <Link to="/upload-email" style={{ marginRight: '1em' }}>Upload Email</Link>
            <Link to="/quarantine" style={{ marginRight: '1em' }}>Quarantine</Link>
            {isAdmin && <Link to="/admin/users" style={{ marginRight: '1em' }}>User Management</Link>}
            {isAdmin && <Link to="/admin/tips" style={{ marginRight: '1em' }}>Manage Tips</Link>}
          </nav>
        )}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPasswordRequest />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/connect-email" element={<ProtectedRoute><ConnectEmail /></ProtectedRoute>} />
          <Route path="/scan-inbox" element={<ProtectedRoute><ScanInbox /></ProtectedRoute>} />
          <Route path="/upload-email" element={<ProtectedRoute><UploadEmailScan /></ProtectedRoute>} />
          <Route path="/quarantine" element={<ProtectedRoute><Quarantine /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/tips" element={<ProtectedRoute><AdminEducativeTips /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/predict" element={<ProtectedRoute><Predict /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsLog /></ProtectedRoute>} />
          <Route path="/email-logs" element={<ProtectedRoute><EmailLogs /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
        <Footer />
        {/* Floating Chatbot for phishing education and support */}
        <Chatbot />
      </div>
    </BrowserRouter>
  );
};

export default App;
