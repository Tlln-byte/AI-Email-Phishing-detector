import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css";
import API from "../services/api";
import { toast } from "react-toastify";
import { handleApiError } from "../services/api";

const Signup = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      await API.post("/signup", form);
      toast.info("Signup successful! Your account is pending admin approval.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      handleApiError(err, "Email already exists or invalid input");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 style={{textAlign: 'center', color: '#00ffc3', fontWeight: 700, letterSpacing: '0.05em'}}>🆕 Sign Up</h2>
        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label htmlFor="signup-password">Password</label>
        <input id="signup-password" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit" className="login-btn">Create Account</button>
        <p className="switch-link">Already have an account? <Link to="/">Login</Link></p>
      </form>
    </div>
  );
};

export default Signup;
