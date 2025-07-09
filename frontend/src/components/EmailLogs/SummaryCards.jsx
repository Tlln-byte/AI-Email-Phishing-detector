// /components/EmailLogs/SummaryCards.jsx
import React from "react";

const SummaryCards = ({ logs }) => {
  const total = logs.length;
  const phishing = logs.filter((log) => log.prediction).length;
  const safe = total - phishing;

  return (
    <div className="summary-cards">
      <div className="card">
        <h4>Total Logs</h4>
        <p>{total}</p>
      </div>
      <div className="card">
        <h4>Phishing</h4>
        <p>{phishing}</p>
      </div>
      <div className="card">
        <h4>Safe</h4>
        <p>{safe}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
