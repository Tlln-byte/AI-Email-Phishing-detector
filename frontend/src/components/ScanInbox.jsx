import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { handleApiError } from "../services/api";

const ScanInbox = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Remove credential form, just scan
  const handleScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('/scan-inbox');
      setResult(res.data);
      toast.success(`Scanned: ${res.data.scanned}, Quarantined: ${res.data.quarantined}`);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        toast.error('Not connected to email. Please connect your email first.');
      } else {
        handleApiError(err, 'Scan failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scan-inbox-container">
      <h2>Scan My Inbox</h2>
      <div style={{ background: 'rgba(255,255,0,0.08)', color: '#ffb300', padding: '1em', borderRadius: '8px', marginBottom: '1em', fontWeight: 500 }}>
        <span role="img" aria-label="warning">⚠️</span> For your security, use a test email account. Credentials are now stored only for your session.
      </div>
      <button onClick={handleScan} disabled={loading}>
        {loading ? 'Scanning...' : 'Scan My Inbox'}
      </button>
      {result && (
        <div style={{ marginTop: '1em' }}>
          <strong>Scan Summary:</strong>
          <div>Scanned: {result.scanned}</div>
          <div>Quarantined: {result.quarantined}</div>
          {result.emails && result.emails.length > 0 && (
            <div style={{ marginTop: '1em' }}>
              <strong>Scanned Emails:</strong>
              <table style={{ width: '100%', marginTop: '0.5em', background: '#181c24', color: '#fff', borderRadius: '8px' }}>
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Snippet</th>
                    <th>Status</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.emails.map(email => (
                    <tr key={email.id}>
                      <td>{email.sender}</td>
                      <td>{email.subject}</td>
                      <td>{email.snippet}</td>
                      <td style={{ color: email.is_phishing ? '#ff5252' : '#00ffc3' }}>
                        {email.is_phishing ? 'Phishing' : 'Safe'}
                      </td>
                      <td>{(email.confidence * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanInbox; 