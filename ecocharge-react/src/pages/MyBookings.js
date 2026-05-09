import React, { useState, useEffect, useCallback } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [message, setMessage]   = useState("");
  const [filter, setFilter]     = useState("all");

  const username = localStorage.getItem("username") || "User";

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/bookings/");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load bookings.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id, stationName) => {
    if (!window.confirm(`Cancel booking for "${stationName}"?`)) return;
    try {
      await API.delete(`/bookings/${id}/`);
      setMessage("Booking cancelled.");
      setTimeout(() => setMessage(""), 3500);
      fetchBookings();
    } catch {
      setError("Failed to cancel booking.");
      setTimeout(() => setError(""), 3500);
    }
  };

  const filtered = bookings.filter((b) => filter === "all" || b.status === filter);

  return (
    <div className="mybookings-page">
      <div className="mybookings-header">
        <div>
          <h2>My Bookings</h2>
          <p>Welcome back, <strong>{username}</strong></p>
        </div>
        <button className="btn" onClick={() => navigate("/stations")}>+ Book Station</button>
      </div>

      <div className="mybookings-filters">
        {["all", "confirmed", "cancelled"].map((f) => (
          <button key={f} className={`myfilter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {message && <div className="mybooking-msg success">{message}</div>}
      {error && <div className="mybooking-msg error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="mybookings-list">
          {filtered.map((b) => (
            <div key={b.id} className="mybooking-card">
              <h3>{b.station_name}</h3>
              <p>{b.station_location} - ₹{b.total_amount}</p>
              <p>Status: <span className={`status ${b.status}`}>{b.status}</span></p>
              {b.status === "confirmed" && (
                <button className="mybooking-cancel-btn" onClick={() => handleCancel(b.id, b.station_name)}>
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
