import React, { useEffect, useState } from "react";
import axios from "../services/api";
import "./ReportsLog.css";
import { toast } from "react-toastify";
import EmptyState from "./EmptyState";

const ReportsLog = () => {
  const [logs, setLogs] = useState([]);
  const [filterMinConfidence, setFilterMinConfidence] = useState(0.0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setLogs(res.data);
        toast.success("Reports loaded successfully.");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load reports.");
      });
  }, []);

  const filteredLogs = logs.filter(
    (log) => log.confidence >= filterMinConfidence
  );

  const exportCSV = () => {
    try {
      const headers = "URL,Prediction,Confidence,Timestamp\n";
      const rows = filteredLogs.map((log) =>
        `${log.url},${log.prediction ? "Phishing" : "Safe"},${(
          log.confidence * 100
        ).toFixed(2)}%,${new Date(log.timestamp).toLocaleString()}`
      );
      const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "phishing_logs.csv";
      a.click();
      toast.success("CSV exported successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export CSV.");
    }
  };

  return (
    <div className="reports-container">
      <h2>📜 Phishing Reports Log</h2>
      <div className="filter-section">
        <label htmlFor="confidence-range">
          Min Confidence: {Math.round(filterMinConfidence * 100)}%
        </label>
        <input
          type="range"
          id="confidence-range"
          min="0"
          max="1"
          step="0.01"
          value={filterMinConfidence}
          onChange={(e) => setFilterMinConfidence(parseFloat(e.target.value))}
        />
        <button onClick={exportCSV}>Export CSV</button>
      </div>

      <table className="logs-table">
        <thead>
          <tr>
            <th>URL</th>
            <th>Prediction</th>
            <th>Confidence</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length === 0 ? (
            <tr>
              <td colSpan="4">
                <EmptyState message="No phishing reports found. All clear!" />
              </td>
            </tr>
          ) : (
            filteredLogs.map((log, index) => (
              <tr key={index}>
                <td>{log.url}</td>
                <td className={log.prediction ? "phishing" : "safe"}>
                  {log.prediction ? "Phishing" : "Safe"}
                </td>
                <td>{(log.confidence * 100).toFixed(2)}%</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsLog;
