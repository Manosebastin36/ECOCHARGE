import React, { useState, useEffect, useCallback } from "react";
import API from "../../api";

const EMPTY = {
  name: "", location: "", status: "Available",
  charger_type: "Type 2", power_kw: "22", lat: "", lng: "",
};

function ManageStations() {
  const [stations, setStations] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState("");
  const [error, setError]       = useState("");

  const fetchStations = useCallback(async () => {
    try {
      const res = await API.get("/stations/");
      setStations(res.data);
    } catch {
      setError("Failed to load stations.");
    }
  }, []);

  useEffect(() => { fetchStations(); }, [fetchStations]);

  const flash = (msg, isErr = false) => {
    isErr ? setError(msg) : setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 3500);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); setMessage("");

    // Check token exists before sending
    const token = localStorage.getItem("access_token");
    if (!token) {
      flash("No access token found. Please login again as admin.", true);
      setLoading(false);
      return;
    }

    const api = API;

    try {
      if (editId) {
        await api.put(`/stations/${editId}/`, form);
        flash("Station updated successfully!");
      } else {
        await api.post("/stations/", form);
        flash("Station added successfully!");
      }
      setForm(EMPTY); setEditId(null); setShowForm(false);
      fetchStations();
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        flash(" 401 Unauthorized — Token expired or invalid. Please logout and login again.", true);
      } else if (status === 403) {
        flash(" 403 Forbidden — Your account is not an admin (is_staff=False).", true);
      } else {
        flash(err.response?.data?.error || "Operation failed. Check console.", true);
      }
      console.error("Station API error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name, location: s.location, status: s.status,
      charger_type: s.charger_type, power_kw: s.power_kw,
      lat: s.lat || "", lng: s.lng || "",
    });
    setEditId(s.id); setShowForm(true);
    setMessage(""); setError("");
  };

  const handleToggle = async (s) => {
    const newStatus = s.status === "Available" ? "Busy" : "Available";
    try {
      await API.patch(`/stations/${s.id}/`, { status: newStatus });
      flash(` ${s.name} → ${newStatus}`);
      fetchStations();
    } catch (err) {
      flash(err.response?.status === 401
        ? "401 Unauthorized — Login again as admin."
        : "Failed to update status.", true);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete station "${name}"?`)) return;
    try {
      await API.delete(`/stations/${id}/`);
      flash("Station deleted.");
      fetchStations();
    } catch (err) {
      flash(err.response?.status === 401
        ? "401 Unauthorized — Login again as admin."
        : "Failed to delete.", true);
    }
  };

  const available = stations.filter((s) => s.status === "Available").length;
  const busy      = stations.filter((s) => s.status === "Busy").length;
  const token     = localStorage.getItem("access_token");

  return (
    <div className="admin-section">

      {/* Token debug banner */}
      {!token && (
        <div className="admin-msg error">
          No access token found in localStorage. Please logout and login again as admin.
        </div>
      )}

      {/* Stats */}
      <div className="admin-stats-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="admin-stat-card">
          <span className="stat-num">{stations.length}</span>
          <span className="stat-label">Total Stations</span>
        </div>
        <div className="admin-stat-card green">
          <span className="stat-num">{available}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="admin-stat-card" style={{ borderTopColor: "#e74c3c" }}>
          <span className="stat-num">{busy}</span>
          <span className="stat-label">Busy</span>
        </div>
      </div>

      {/* Header */}
      <div className="admin-section-header">
        <p className="admin-count">{stations.length} stations in database</p>
        <button className="btn" onClick={() => {
          setShowForm(!showForm); setForm(EMPTY); setEditId(null);
          setMessage(""); setError("");
        }}>
          {showForm ? "✕ Cancel" : "+ Add Station"}
        </button>
      </div>

      {message && <div className="admin-msg success">{message}</div>}
      {error   && <div className="admin-msg error">{error}</div>}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="admin-form-box">
          <h3 className="admin-form-title">
            {editId ? " Edit Station" : "Add New Station"}
          </h3>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Station Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. City Center Station" required />
              </div>
              <div className="admin-form-group">
                <label>Location / City</label>
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Chennai" required />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Charger Type</label>
                <select name="charger_type" value={form.charger_type} onChange={handleChange}>
                  <option value="Type 2">Type 2</option>
                  <option value="CCS">CCS</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Power (kW)</label>
                <input name="power_kw" value={form.power_kw} onChange={handleChange}
                  type="number" min="1" placeholder="22" />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Latitude (map pin)</label>
                <input name="lat" value={form.lat} onChange={handleChange}
                  type="number" step="0.0001" placeholder="e.g. 13.0827" />
              </div>
              <div className="admin-form-group">
                <label>Longitude (map pin)</label>
                <input name="lng" value={form.lng} onChange={handleChange}
                  type="number" step="0.0001" placeholder="e.g. 80.2707" />
              </div>
            </div>
            <button className="btn btn-full" type="submit" disabled={loading}>
              {loading ? "Saving..." : editId ? "Update Station" : "Add Station"}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Station Name</th>
              <th>Location</th>
              <th>Charger</th>
              <th>Power</th>
              <th>Coordinates</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-empty">
                  No stations yet. Click "+ Add Station" to create one.
                </td>
              </tr>
            ) : (
              stations.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.location}</td>
                  <td>{s.charger_type}</td>
                  <td>{s.power_kw} kW</td>
                  <td style={{ fontSize: "0.76rem", color: "#888" }}>
                    {s.lat && parseFloat(s.lat) !== 0
                      ? `${s.lat}, ${s.lng}`
                      : <span style={{ color: "#f39c12" }}>No coordinates</span>}
                  </td>
                  <td>
                    <span className={`status ${s.status.toLowerCase()}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button className="admin-btn-toggle"
                      onClick={() => handleToggle(s)}>
                      {s.status === "Available" ? "Set Busy" : "Set Available"}
                    </button>
                    <button className="admin-btn-edit"
                      onClick={() => handleEdit(s)}>Edit</button>
                    <button className="admin-btn-delete"
                      onClick={() => handleDelete(s.id, s.name)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageStations;
