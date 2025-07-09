// /components/EmailLogs/Filters.jsx
import React from "react";
import { toast } from "react-toastify";

const Filters = ({ filters, setFilters, clearFilters }) => {
  const handleConfidenceChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value < 0 || value > 1) {
      toast.warning("Confidence must be between 0 and 1");
      return;
    }
    setFilters({ ...filters, confidence: [value, filters.confidence[1]] });
  };

  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value });
  };

  return (
    <div className="filters">
      <div>
        <label>Status:</label>
        <select value={filters.status} onChange={handleStatusChange}>
          <option value="all">All</option>
          <option value="phishing">Phishing</option>
          <option value="safe">Safe</option>
        </select>
      </div>

      <div>
        <label>Min Confidence:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={filters.confidence[0]}
          onChange={handleConfidenceChange}
        />
        <span>{Math.round(filters.confidence[0] * 100)}%</span>
      </div>

      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  );
};

export default Filters;
