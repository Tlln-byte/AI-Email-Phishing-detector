import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ConnectEmail = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    imap_server: 'imap.gmail.com',
    imap_port: 993,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/connect-email', form);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/scan-inbox');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Connection failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connect-email-container">
      <h2>Connect Your Email</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="connect-email-email">Email Address:</label>
          <input id="connect-email-email" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="connect-email-password">Password:</label>
          <input id="connect-email-password" type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="connect-email-server">IMAP Server:</label>
          <input id="connect-email-server" type="text" name="imap_server" value={form.imap_server} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="connect-email-port">IMAP Port:</label>
          <input id="connect-email-port" type="number" name="imap_port" value={form.imap_port} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Email'}
        </button>
      </form>
    </div>
  );
};

export default ConnectEmail; 