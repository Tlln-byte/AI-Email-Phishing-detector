/**
 * Dashboard Component
 * 
 * Main dashboard displaying phishing detection metrics and analytics.
 * Features:
 * - Real-time phishing detection statistics
 * - Interactive trend charts
 * - Alert system for unusual activity
 * - Summary cards with key metrics
 * - Proper authentication handling
 */

import React, { useEffect, useState, useRef } from "react";
import axios from "../services/api";
import Chart from "chart.js/auto";
import { toast } from "react-toastify";
import "./Dashboard.css";
import EmptyState from "./EmptyState";
import { FaUserShield, FaBug, FaCheckCircle } from "react-icons/fa";

// EducativeBanner component for phishing awareness (dynamic tips)
const EducativeBanner = () => {
  // State to control banner visibility
  const [visible, setVisible] = useState(true);
  // State to control modal visibility
  const [modalOpen, setModalOpen] = useState(false);
  // State for fetched tips
  const [tips, setTips] = useState([]);
  // State for loading/error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // State for current tip index (for randomization/rotation)
  const [currentTipIdx, setCurrentTipIdx] = useState(0);

  // Fetch tips from backend on mount
  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await axios.get("/educative-tips");
        const tipsArr = res.data.tips || [];
        setTips(tipsArr);
        // Randomize first tip
        if (tipsArr.length > 0) {
          setCurrentTipIdx(Math.floor(Math.random() * tipsArr.length));
        }
        setLoading(false);
      } catch (e) {
        setError("Could not load tips.");
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  // Rotate tips every 6 seconds
  useEffect(() => {
    if (tips.length < 2) return;
    const interval = setInterval(() => {
      setCurrentTipIdx(idx => (idx + 1) % tips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tips]);

  if (!visible) return null;
  return (
    <>
      <div className="educative-banner" role="alert" style={{
        background: '#fffbe6',
        color: '#856404',
        border: '1.5px solid #ffe58f',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '1.08rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        gap: 16
      }}>
        <span style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{fontSize: '1.6em', marginRight: 8}}>🎣</span>
          <b>Did you know?</b>&nbsp;
          {loading ? "Loading..." : error ? error : (
            <span style={{fontWeight: 500}}>{tips[currentTipIdx] || "Stay safe from phishing!"}</span>
          )}
        </span>
        <div style={{display: 'flex', gap: 10}}>
          <button className="educative-learn" style={{background: '#00bfae', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 18px', fontWeight: 600, cursor: 'pointer'}} onClick={() => setModalOpen(true)}>Learn more</button>
          <button className="educative-dismiss" style={{background: 'none', border: 'none', color: '#856404', fontSize: '1.3rem', marginLeft: 8, cursor: 'pointer'}} onClick={() => setVisible(false)} aria-label="Dismiss">×</button>
        </div>
      </div>
      {modalOpen && (
        <div className="educative-modal" role="dialog" aria-modal="true" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="educative-modal-content" style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setModalOpen(false)} 
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            
            <h2 style={{color: '#00bfae', marginBottom: 24, fontSize: '28px', textAlign: 'center'}}>
              🛡️ Complete Phishing Awareness Guide
            </h2>
            
            <div style={{lineHeight: 1.6, fontSize: '16px', color: '#333'}}>
              
              <h3 style={{color: '#00bfae', marginTop: 24, marginBottom: 12}}>🎣 What is Phishing?</h3>
              <p style={{marginBottom: 16}}>
                Phishing is a cyber attack where criminals impersonate trusted organizations to steal your personal information, 
                passwords, or money. They use fake emails, websites, and messages that look legitimate.
              </p>
              
              <h3 style={{color: '#00bfae', marginTop: 24, marginBottom: 12}}>🚨 6 Key Red Flags to Spot Phishing</h3>
              <ul style={{marginBottom: 16, paddingLeft: 20}}>
                <li><strong>Check the Sender:</strong> Look for misspellings like "paypa1.com" instead of "paypal.com"</li>
                <li><strong>Urgent Language:</strong> "Your account will be closed in 24 hours!" or "Immediate action required!"</li>
                <li><strong>Suspicious Links:</strong> Hover over links to see if they go to unexpected domains</li>
                <li><strong>Requests for Personal Info:</strong> Banks/companies rarely ask for passwords via email</li>
                <li><strong>Poor Grammar/Spelling:</strong> Professional companies don't send emails with obvious errors</li>
                <li><strong>Generic Greetings:</strong> "Dear Customer" instead of your actual name</li>
              </ul>
              
              <h3 style={{color: '#00bfae', marginTop: 24, marginBottom: 12}}>🎭 Common Phishing Types</h3>
              <div style={{marginBottom: 16}}>
                <p><strong>• Email Phishing:</strong> Fake emails from banks, PayPal, Amazon</p>
                <p><strong>• Spear Phishing:</strong> Targeted attacks using your personal information</p>
                <p><strong>• Whaling:</strong> Attacks targeting high-level executives</p>
                <p><strong>• Smishing:</strong> Phishing via text messages</p>
                <p><strong>• Vishing:</strong> Phishing via phone calls</p>
              </div>
              
              <h3 style={{color: '#00bfae', marginTop: 24, marginBottom: 12}}>✅ Prevention Best Practices</h3>
              <ul style={{marginBottom: 16, paddingLeft: 20}}>
                <li>Enable two-factor authentication (2FA) on all accounts</li>
                <li>Use a password manager to create strong, unique passwords</li>
                <li>Keep your software and antivirus updated</li>
                <li>Never click links in suspicious emails</li>
                <li>Verify sender addresses carefully</li>
                <li>Report suspicious emails to your IT team</li>
            </ul>
              
              <h3 style={{color: '#00bfae', marginTop: 24, marginBottom: 12}}>🚨 What to Do If You're Compromised</h3>
              <ol style={{marginBottom: 16, paddingLeft: 20}}>
                <li><strong>Don't panic</strong> - Take immediate action</li>
                <li><strong>Change passwords</strong> for affected accounts</li>
                <li><strong>Enable 2FA</strong> if not already active</li>
                <li><strong>Monitor accounts</strong> for suspicious activity</li>
                <li><strong>Contact your bank</strong> if financial info was shared</li>
                <li><strong>Report to authorities</strong> if necessary</li>
              </ol>
              
              <div style={{
                background: '#fffbe6',
                border: '2px solid #ffe58f',
                borderRadius: 12,
                padding: 16,
                marginTop: 24,
                marginBottom: 24,
                color: '#856404'
              }}>
                <h4 style={{margin: '0 0 8px 0', color: '#856404'}}>💡 Pro Tip</h4>
                <p style={{margin: 0}}>
                  <strong>When in doubt, don't click!</strong> Legitimate organizations will NEVER ask for passwords 
                  or sensitive information via email. Contact them through their official website or phone number.
                </p>
              </div>
              
              <div style={{textAlign: 'center', marginTop: 24}}>
                <button 
                  onClick={() => setModalOpen(false)} 
                  style={{
                    background: '#00bfae',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 20,
                    padding: '12px 32px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Got it! Stay Safe 🛡️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Dashboard = () => {
  // State management for dashboard data and UI
  const [summary, setSummary] = useState({});
  const [logs, setLogs] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Chart references for cleanup
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  /**
   * Fetches dashboard summary data from the backend
   * @returns {Promise} Promise that resolves when data is loaded
   */
  const fetchDashboardSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError('Authentication required');
        return false;
      }

      const response = await axios.get("/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSummary(response.data);
      return true;
      
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        toast.error('Session expired. Please log in again.');
      } else {
        setError('Failed to load dashboard summary.');
        toast.error("Failed to load summary.");
      }
      return false;
    }
  };

  /**
   * Fetches email logs and creates trend chart
   * @returns {Promise} Promise that resolves when data is loaded
   */
  const fetchEmailLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError('Authentication required');
        return false;
      }

      const response = await axios.get("/logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setLogs(response.data);
      toast.success("📊 Dashboard metrics updated.");

      // Check for unusual phishing activity today
      const todayLogs = response.data.filter(
        (log) =>
          new Date(log.timestamp).toDateString() ===
          new Date().toDateString()
      );
      
      if (todayLogs.length > 0) {
        const phishingToday = todayLogs.filter((l) => l.prediction).length;
        const phishingRate = phishingToday / todayLogs.length;
        
        if (phishingRate > 0.6) {
          setAlertVisible(true);
        }
      }

      // Create trend chart data
      createTrendChart(response.data);
      return true;
      
    } catch (err) {
      console.error('Failed to load email logs:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        toast.error('Session expired. Please log in again.');
      } else {
        setError('Failed to load dashboard data.');
        toast.error("Failed to load dashboard data.");
      }
      return false;
    }
  };

  /**
   * Creates and renders the phishing trend chart
   * @param {Array} logsData - Array of email log data
   */
  const createTrendChart = (logsData) => {
    if (!logsData || logsData.length === 0) return;
    if (!chartRef.current) return;
    // Group logs by date and calculate phishing percentages
    const grouped = {};
    logsData.forEach((log) => {
      const date = new Date(log.timestamp).toLocaleDateString();
      if (!grouped[date]) grouped[date] = { phishing: 0, total: 0 };
      grouped[date].total += 1;
      if (log.prediction) grouped[date].phishing += 1;
    });

    const labels = Object.keys(grouped).sort();
    const data = labels.map(
      (date) =>
        ((grouped[date].phishing / grouped[date].total) * 100).toFixed(1)
    );

    // Clean up existing chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "% Phishing Detected",
            data,
            fill: false,
            borderColor: "#00ffc3",
            tension: 0.3,
            pointBackgroundColor: "#00ffcc",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: "#ffffffaa",
              callback: (value) => value + "%",
            },
          },
          x: {
            ticks: {
              color: "#ffffffaa",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "#ffffffcc",
            },
          },
        },
      },
    });
  };

  /**
   * Calculates accuracy percentage from summary data
   * @returns {string} Formatted accuracy percentage or "N/A"
   */
  const calculateAccuracy = () => {
    if (!summary.total_feedback || summary.total_feedback === 0) {
      return "N/A";
    }
    const accuracy = ((summary.total_feedback - summary.phishing) / summary.total_feedback) * 100;
    return `${accuracy.toFixed(1)}%`;
  };

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      
      // Load both summary and logs data
      const summaryLoaded = await fetchDashboardSummary();
      const logsLoaded = await fetchEmailLogs();
      
      setLoading(false);
    };

    loadDashboardData();

    // Cleanup chart on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>❌ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            🔄 Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Empty state when no data is available
  if (!summary || Object.keys(summary).length === 0) {
    return (
      <EmptyState 
        message="📊 No dashboard data available" 
        subtitle="Start scanning emails to see your phishing detection metrics."
      />
    );
  }

  return (
    <div className="dashboard-container">
      {/* Educative banner for phishing awareness */}
      <EducativeBanner />
      {/* Alert Banner for Unusual Activity */}
      {alertVisible && (
        <div className="alert-banner">
          ⚠️ Unusual spike in phishing activity detected today!
        </div>
      )}
      
      {/* Summary Cards Section */}
      <div className="summary-section">
        <div className="summary-card">
          <h4>
            <span className="icon"><FaUserShield /></span> 
            Total Feedback
          </h4>
          <p>{summary.total_feedback || 0}</p>
        </div>
        
        <div className="summary-card">
          <h4>
            <span className="icon"><FaBug /></span> 
            Phishing URLs
          </h4>
          <p>{summary.phishing || 0}</p>
        </div>
        
        <div className="summary-card">
          <h4>
            <span className="icon">%</span> 
            Accuracy
          </h4>
          <p>{calculateAccuracy()}</p>
        </div>
        
        <div className="summary-card">
          <h4>
            <span className="icon"><FaCheckCircle /></span> 
            Model Status
          </h4>
          <p>✅ Up to date</p>
        </div>
      </div>
      
      {/* Trend Chart Section */}
      <div className="dashboard-chart">
        <h3>📈 Phishing Activity Trend</h3>
        
        {logs.length === 0 ? (
          <div className="empty-state">
            <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#232526"/>
              <path d="M40 12L64 20V36C64 54 40 68 40 68C40 68 16 54 16 36V20L40 12Z" fill="#00ffc3" fillOpacity="0.15" stroke="#00ffc3" strokeWidth="2"/>
              <path d="M40 24V44" stroke="#00ffc3" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="40" cy="52" r="2" fill="#00ffc3"/>
            </svg>
            <div>🎉 No phishing activity detected yet. Your system is safe!</div>
          </div>
        ) : (
          <canvas ref={chartRef} id="trendChart" width="600" height="200" />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
