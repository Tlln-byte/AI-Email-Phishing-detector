import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [form, setForm] = useState({ token: '', new_password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/reset-password', form);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="reset-token">Reset Token</label>
        <input id="reset-token" name="token" value={form.token} onChange={handleChange} required />
        <label htmlFor="reset-new-password">New Password</label>
        <input id="reset-new-password" name="new_password" type="password" value={form.new_password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
      </form>
    </div>
  );
};

export default ResetPassword; 