import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToken(null);
    try {
      const res = await axios.post('/request-password-reset', { email });
      toast.info(res.data.message);
      if (res.data.token) setToken(res.data.token);
    } catch (err) {
      toast.error('Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-request-container">
      <h2>Forgot Password?</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="forgot-email">Email</label>
        <input id="forgot-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Requesting...' : 'Request Reset'}</button>
      </form>
      {token && (
        <div style={{ marginTop: '1em', color: 'green' }}>
          <strong>Reset Token (MVP only):</strong>
          <div style={{ wordBreak: 'break-all' }}>{token}</div>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordRequest; 