import React, { useState } from "react";
import axios from "../services/api";
import "./Predict.css";
import { toast } from "react-toastify";

const Predict = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.startsWith("http")) {
      setError("Please enter a valid URL (starting with http or https)");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "/predict",
        { url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(res.data);
      toast.success("Phishing check complete!");
    } catch (err) {
      console.error(err);
      setError("Prediction failed. Please try again.");
      toast.error("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predict-container">
      <h2>🔍 AI URL Phishing Scanner</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a URL to scan..."
          value={url}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Scanning..." : "Scan"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className={`result-card ${result.prediction ? "phishing" : "safe"}`}>
          <h3>{result.prediction ? "🚨 Phishing URL Detected!" : "✅ Safe URL"}</h3>
          <p>
            Confidence:{" "}
            <span className="confidence">
              {(result.confidence * 100).toFixed(2)}%
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Predict;
