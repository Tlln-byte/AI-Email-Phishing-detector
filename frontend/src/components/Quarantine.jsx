/**
 * Quarantine Component
 * 
 * Displays quarantined emails that were flagged as potential phishing attempts.
 * Features:
 * - View quarantined email details
 * - Provide feedback on false positives/negatives
 * - Real-time status updates
 * - Proper authentication handling
 */

import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { handleApiError } from '../services/api';
import EmptyState from "./EmptyState";
import './Quarantine.css';

const Quarantine = () => {
  // State management for quarantined emails and UI
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetches quarantined emails from the backend
   * Requires user authentication
   */
    const fetchQuarantine = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Fetch quarantined emails with proper authentication
      const response = await API.get('/quarantine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEmails(response.data);
      
    } catch (err) {
      console.error('Failed to fetch quarantined emails:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        toast.error('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your permissions.');
        toast.error('You do not have permission to access quarantined emails.');
      } else {
        setError('Failed to load quarantined emails. Please try again.');
        handleApiError(err, 'Failed to fetch quarantined emails');
      }
      } finally {
        setLoading(false);
      }
    };

  /**
   * Handles user feedback on quarantined emails
   * @param {number} emailId - The ID of the email
   * @param {boolean} isPhishing - Whether the user thinks it's phishing or not
   */
  const handleFeedback = async (emailId, isPhishing) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await API.post('/feedback', 
        { email_id: emailId, is_phishing: isPhishing },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const feedbackType = isPhishing ? 'phishing' : 'legitimate';
      toast.success(`✅ Feedback submitted! Email marked as ${feedbackType}.`);
      
      // Refresh the quarantined emails list
      fetchQuarantine();
      
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      handleApiError(err, 'Failed to submit feedback');
    }
  };

  // Load quarantined emails on component mount
  useEffect(() => {
    fetchQuarantine();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="quarantine-container">
        <h2>🚫 Quarantined Emails</h2>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading quarantined emails...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="quarantine-container">
        <h2>🚫 Quarantined Emails</h2>
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchQuarantine} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quarantine-container">
      <h2>🚫 Quarantined Emails</h2>
      
      {/* Quarantined Emails List */}
      {emails.length === 0 ? (
        <EmptyState 
          message="🎉 No quarantined emails found!" 
          subtitle="Your inbox is safe and secure."
        />
      ) : (
        <div className="quarantine-list">
          <p className="quarantine-info">
            📊 Found {emails.length} quarantined email{emails.length !== 1 ? 's' : ''}. 
            Please review and provide feedback to help improve our detection system.
          </p>
          
          <ul role="list" className="email-list">
          {emails.map(email => (
              <li key={email.id} className="email-item" role="listitem">
                {/* Email Header Information */}
                <div className="email-header">
                  <div className="email-meta">
                    <span className="email-reason">
                      <strong>🚨 Reason:</strong> {email.reason}
                    </span>
                    <span className="email-status">
                      <strong>📊 Status:</strong> {email.status}
                    </span>
                    <span className="email-timestamp">
                      <strong>🕒 Detected:</strong> {new Date(email.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Email Content */}
                <div className="email-content">
                  <strong>📧 Email Content:</strong>
                  <pre className="email-text">
                    {email.email_content}
                  </pre>
                </div>
                
                {/* Feedback Actions */}
                <div className="email-actions">
                  <p className="feedback-prompt">
                    💭 Is this email actually phishing or legitimate?
                  </p>
                  <div className="feedback-buttons">
                    <button 
                      className="feedback-btn legitimate-btn"
                      aria-label={`Mark email ${email.id} as legitimate`} 
                      onClick={() => handleFeedback(email.id, false)}
                      title="Mark as legitimate email"
                    >
                      ✅ Legitimate
                    </button>
                    <button 
                      className="feedback-btn phishing-btn"
                      aria-label={`Mark email ${email.id} as phishing`} 
                      onClick={() => handleFeedback(email.id, true)}
                      title="Mark as phishing email"
                    >
                      🚫 Phishing
                    </button>
              </div>
              </div>
            </li>
          ))}
        </ul>
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="quarantine-actions">
        <button 
          onClick={fetchQuarantine} 
          className="refresh-btn"
          title="Refresh quarantined emails"
        >
          🔄 Refresh Quarantine
        </button>
      </div>
    </div>
  );
};

export default Quarantine; 