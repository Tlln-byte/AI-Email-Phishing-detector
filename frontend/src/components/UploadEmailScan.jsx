import React, { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import EmptyState from "./EmptyState";
import { handleApiError } from "../services/api";

const UploadEmailScan = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.eml')) {
        toast.error('Only .eml files are allowed.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a .eml file to scan.");
      return;
    }
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("eml_file", file);
    try {
      const res = await API.post("/scan-eml", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      toast.success("Scan complete!");
    } catch (err) {
      handleApiError(err, "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-email-scan-container" style={{ maxWidth: 500, margin: "2em auto", background: "rgba(34,40,49,0.9)", borderRadius: 12, padding: "2em", textAlign: "center" }}>
      <h2 style={{ color: "#00ffc3", marginBottom: "1em" }}>🛡️ Upload Email for Phishing Scan</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".eml" onChange={handleFileChange} style={{ marginBottom: "1em" }} />
        <br />
        <button type="submit" disabled={loading} style={{ background: "#00ffc3", color: "#232526", fontWeight: 700, border: "none", borderRadius: 6, padding: "0.7em 2em", cursor: "pointer" }}>
          {loading ? "Scanning..." : "Scan Email"}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: "2em" }}>
          {result.is_phishing ? (
            <>
              <EmptyState message="Phishing detected! This email is dangerous and has been quarantined." />
              {result.phishing_reasons && result.phishing_reasons.length > 0 && (
                <div style={{ color: "#ff8080", marginTop: "1em", textAlign: "left" }}>
                  <strong>Reasons flagged:</strong>
                  <ul>
                    {result.phishing_reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <EmptyState message="No phishing detected. This email appears safe." />
              {result.phishing_reasons && result.phishing_reasons.length > 0 && (
                <div style={{ color: "#ffd700", marginTop: "1em", textAlign: "left" }}>
                  <strong>Potentially suspicious indicators (not enough to flag as phishing):</strong>
                  <ul>
                    {result.phishing_reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {result.confidence !== undefined && (
            <div style={{ color: "#fff", marginTop: "1em" }}>
              <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadEmailScan; 