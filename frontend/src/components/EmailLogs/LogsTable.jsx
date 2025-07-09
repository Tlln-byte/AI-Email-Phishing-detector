// /components/EmailLogs/LogsTable.jsx
import React from "react";
import axios from "../../services/api";
import { toast } from "react-toastify";

const LogsTable = ({ logs, refreshLogs }) => {
  const handleRescan = async (log) => {
    try {
      await axios.post("/rescan", { url: log.url });
      toast.success(`Rescanned ${log.url}`);
      refreshLogs();
    } catch (err) {
      toast.error("Rescan failed.");
    }
  };

  return (
    <div className="logs-table-container">
      <table className="logs-table">
        <thead>
          <tr>
            <th>URL</th>
            <th>Prediction</th>
            <th>Confidence</th>
            <th>Timestamp</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.url}</td>
              <td className={log.prediction ? "phishing" : "safe"}>
                {log.prediction ? "Phishing" : "Safe"}
              </td>
              <td>{(log.confidence * 100).toFixed(2)}%</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>
                <button onClick={() => handleRescan(log)}>🔄 Rescan</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
