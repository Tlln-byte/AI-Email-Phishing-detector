import React, { useEffect, useState } from "react";
import axios from "../services/api";

// AdminEducativeTips: Admin UI for managing phishing awareness tips
const AdminEducativeTips = () => {
  // State for tips
  const [tips, setTips] = useState([]);
  // State for new tip input
  const [newTip, setNewTip] = useState("");
  // State for editing
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  // State for loading/error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch tips from backend
  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/educative-tips");
      setTips(res.data.tips || []);
      setLoading(false);
    } catch (e) {
      setError("Could not load tips.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  // Add a new tip
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTip.trim()) return;
    try {
      await axios.post("/educative-tips", { content: newTip });
      setNewTip("");
      setSuccess("Tip added.");
      fetchTips();
    } catch (e) {
      setError("Failed to add tip.");
    }
  };

  // Start editing a tip
  const startEdit = (idx) => {
    setEditingId(idx);
    setEditingContent(tips[idx]);
  };

  // Save edited tip
  const handleEdit = async (idx) => {
    try {
      // Get tip id from backend (fetch all tips with ids)
      const res = await axios.get("/educative-tips", { params: { with_ids: true } });
      const tipId = res.data.ids[idx];
      await axios.put(`/educative-tips/${tipId}`, { content: editingContent });
      setEditingId(null);
      setEditingContent("");
      setSuccess("Tip updated.");
      fetchTips();
    } catch (e) {
      setError("Failed to update tip.");
    }
  };

  // Delete a tip
  const handleDelete = async (idx) => {
    if (!window.confirm("Delete this tip?")) return;
    try {
      // Get tip id from backend (fetch all tips with ids)
      const res = await axios.get("/educative-tips", { params: { with_ids: true } });
      const tipId = res.data.ids[idx];
      await axios.delete(`/educative-tips/${tipId}`);
      setSuccess("Tip deleted.");
      fetchTips();
    } catch (e) {
      setError("Failed to delete tip.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2em auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <h2>Manage Educative Tips</h2>
      {error && <div style={{ color: "#b00" }}>{error}</div>}
      {success && <div style={{ color: "#080" }}>{success}</div>}
      <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={newTip}
          onChange={e => setNewTip(e.target.value)}
          placeholder="Add a new tip..."
          style={{ width: "70%", padding: 8, marginRight: 8 }}
        />
        <button type="submit">Add</button>
      </form>
      {loading ? <div>Loading...</div> : (
        <ul style={{ listStyle: "decimal inside", padding: 0 }}>
          {tips.map((tip, idx) => (
            <li key={idx} style={{ marginBottom: 12 }}>
              {editingId === idx ? (
                <>
                  <input
                    type="text"
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    style={{ width: "60%", padding: 6 }}
                  />
                  <button onClick={() => handleEdit(idx)} style={{ marginLeft: 8 }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ marginLeft: 4 }}>Cancel</button>
                </>
              ) : (
                <>
                  {tip}
                  <button onClick={() => startEdit(idx)} style={{ marginLeft: 12 }}>Edit</button>
                  <button onClick={() => handleDelete(idx)} style={{ marginLeft: 4, color: "#b00" }}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminEducativeTips; 