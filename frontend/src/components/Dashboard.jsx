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
      <div className="educative-banner" role="alert">
        <span>
          ⚠️ <b>Did you know?</b> {loading ? "Loading..." : error ? error : (tips[currentTipIdx] || "Stay safe from phishing!")}
        </span>
        <button className="educative-learn" onClick={() => setModalOpen(true)}>Learn more</button>
        <button className="educative-dismiss" onClick={() => setVisible(false)} aria-label="Dismiss">×</button>
      </div>
      {modalOpen && (
        <div className="educative-modal" role="dialog" aria-modal="true">
          <div className="educative-modal-content">
            <h2>Email Phishing Awareness</h2>
            <ul>
              {loading ? <li>Loading...</li> : error ? <li>{error}</li> : tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
            <button onClick={() => setModalOpen(false)}>Close</button>
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
