import React, { useState, useEffect, useCallback } from "react";
import API from "../api";

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

  useEffect(() => { 
    fetchStations(); 
  }, [fetchStations]);

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
    try {
      if (editId) {
        await API.put(`/stations/${editId}/`, form);
        flash("Station updated!");
      } else {
        await API.post("/stations/", form);
        flash("Station added!");
      }
      setForm(EMPTY); setEditId(null); setShowForm(false);
      fetchStations();
    } catch (err) {
      flash(err.response?.data?.error || "Error", true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (s) => {
    const next = s.status === "Available" ? "Busy" : "Available";
    try {
      await API.patch(`/stations/${s.id}/`, { status: next });
      fetchStations();
    } catch {
      flash("Failed to toggle", true);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await API.delete(`/stations/${id}/`);
      fetchStations();
    } catch {
      flash("Delete failed", true);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Manage Stations</h2>
        <button className="btn" onClick={() => { setShowForm(!showForm); setForm(EMPTY); setEditId(null); }}>
          {showForm ? "Cancel" : "Add Station"}
        </button>
      </div>

      {message && <div className="admin-msg success">{message}</div>}
      {error && <div className="admin-msg error">{error}</div>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
          <button className="btn" type="submit" disabled={loading}>Save</button>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Location</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {stations.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.location}</td>
              <td>{s.status}</td>
              <td>
                <button onClick={() => handleToggle(s)}>Toggle</button>
                <button onClick={() => { setEditId(s.id); setForm(s); setShowForm(true); }}>Edit</button>
                <button onClick={() => handleDelete(s.id, s.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageStations;
