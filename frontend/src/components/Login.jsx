/**
 * Login Component
 * 
 * Handles user authentication and login functionality.
 * Features:
 * - Modern, responsive login form
 * - JWT token storage
 * - Error handling for various scenarios
 * - Admin approval status checking
 * - Automatic navigation after successful login
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";
import API from "../services/api";
import { toast } from "react-toastify";
import { handleApiError } from "../services/api";

const Login = () => {
  // State management for form data and error handling
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles form submission and user authentication
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    // Validate form inputs
    if (!form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);

    try {
      // Send login request with form data
      // Note: Backend expects 'username' field, not 'email'
      const loginData = new URLSearchParams({
        username: form.email,
        password: form.password
      });
      
      const response = await API.post("/login", loginData);
      
      // Store JWT token in localStorage for future requests
      localStorage.setItem("token", response.data.access_token);
      
      toast.success("🔐 Login successful! Welcome back!");
      
      // Navigate to dashboard after successful login
      navigate("/dashboard");
      
    } catch (err) {
      // Handle specific error cases
      if (err.response?.status === 403 && 
          err.response?.data?.detail === "Account pending admin approval.") {
        toast.info("⏳ Your account is pending admin approval. Please contact an administrator.");
        setError("Account pending approval");
      } else if (err.response?.status === 401) {
        setError("Invalid email or password");
        handleApiError(err, "Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
        handleApiError(err, "Login failed. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles input field changes
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div className="login-page-centered">
      {/* Brand Logo and Title */}
      <div className="login-logo-row">
        <span className="login-logo">🛡️</span>
        <span className="login-brand">PhishGuard AI</span>
      </div>
      
      {/* Login Form */}
      <form className="login-form-card" onSubmit={handleSubmit}>
        <h2 className="login-title">🔒 PhishGuard Login</h2>
        
        {/* Error Message Display */}
        {error && <div className="login-error-message">{error}</div>}
        
        {/* Email Input Field */}
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input 
            id="login-email"
            name="email"
            type="email" 
            placeholder="Enter your email address" 
            value={form.email} 
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </div>
        
        {/* Password Input Field */}
        <div className="form-group">
        <label htmlFor="login-password">Password</label>
          <input 
            id="login-password"
            name="password"
            type="password" 
            placeholder="Enter your password" 
            value={form.password} 
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="login-btn"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
        
        {/* Navigation Links */}
        <p className="switch-link">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
        <p className="switch-link">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
