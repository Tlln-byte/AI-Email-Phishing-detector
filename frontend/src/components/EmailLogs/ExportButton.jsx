// /components/EmailLogs/ExportButton.jsx
import React from "react";
import { toast } from "react-toastify";

const ExportButton = ({ logs }) => {
  const exportCSV = () => {
    if (logs.length === 0) {
      toast.warning("No logs to export.");
      return;
    }

    try {
      const headers = "URL,Prediction,Confidence,Timestamp\n";
      const rows = logs.map(
        (log) =>
          `${log.url},${log.prediction ? "Phishing" : "Safe"},${(
            log.confidence * 100
          ).toFixed(2)}%,${new Date(log.timestamp).toLocaleString()}`
      );
      const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "email_logs.csv";
      a.click();
      toast.success("Logs exported as CSV.");
    } catch (err) {
      toast.error("Failed to export logs.");
    }
  };

  return (
    <div className="export-section">
      <button onClick={exportCSV}>📤 Export Logs</button>
    </div>
  );
};

export default ExportButton;
