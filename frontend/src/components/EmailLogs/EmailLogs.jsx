import React, { useState, useEffect } from "react";
import axios from "../../services/api";
import "./EmailLogs.css";
import Filters from "./Filters";
import LogsTable from "./LogsTable";
import SummaryCards from "./SummaryCards";
import PieChart from "./PieChart";
import ExportButton from "./ExportButton";
import { toast } from "react-toastify";
import EmptyState from "../EmptyState";

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    confidence: [0, 1],
    status: "all",
    dateRange: null,
  });

  const fetchLogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated. Please log in.");
      return;
    }

    try {
      const res = await axios.get("/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLogs(res.data);
      setFiltered(res.data);
      toast.success("📥 Logs loaded successfully");
    } catch (err) {
      console.error("Error loading logs", err);
      toast.error("❌ Failed to load logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, logs]);

  const applyFilters = () => {
    let result = [...logs];

    if (filters.status !== "all") {
      result = result.filter((log) =>
        filters.status === "phishing" ? log.prediction : !log.prediction
      );
    }

    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      result = result.filter((log) => {
        const time = new Date(log.timestamp).getTime();
        return time >= start.getTime() && time <= end.getTime();
      });
    }

    result = result.filter(
      (log) =>
        log.confidence >= filters.confidence[0] &&
        log.confidence <= filters.confidence[1]
    );

    setFiltered(result);
  };

  const clearFilters = () => {
    setFilters({ confidence: [0, 1], status: "all", dateRange: null });
    toast.info("🔄 Filters cleared");
  };

  return (
    <div className="email-logs">
      <h1 className="title">📥 Email Logs</h1>
      {loading ? (
        <div className="loader">Loading logs...</div>
      ) : (
        logs.length === 0 ? (
          <EmptyState message="No email logs found. Your system is clean!" />
        ) : (
          <>
            <SummaryCards logs={filtered} />
            <Filters
              filters={filters}
              setFilters={setFilters}
              clearFilters={clearFilters}
            />
            <div className="charts">
              <div className="chart-container">
                <PieChart logs={filtered} />
              </div>
            </div>
            <ExportButton logs={filtered} />
            <LogsTable logs={filtered} refreshLogs={fetchLogs} />
          </>
        )
      )}
    </div>
  );
}
