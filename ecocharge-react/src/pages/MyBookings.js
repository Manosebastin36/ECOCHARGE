import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [message, setMessage]   = useState("");
  const [filter, setFilter]     = useState("all");

  // Read once at mount — stable references
  const token    = localStorage.getItem("access_token")  || "";
  const username = localStorage.getItem("username")      || "User";

  // ── Fetch bookings from Django API ──────────────────
  const fetchBookings = useCallback(async () => {
    // Redirect to login if no token
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/bookings/",
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type":  "application/json",
          },
        }
      );

      // res.data is the array of bookings
      if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
        console.error("Unexpected response format:", res.data);
      }
    } catch (err) {
      console.error("Fetch bookings error:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.response?.status === 403) {
        setError("Access denied. Please login again.");
      } else if (!err.response) {
        setError("Cannot connect to server. Make sure Django is running on port 8000.");
      } else {
        setError("Failed to load bookings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // Run once on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Cancel a booking ────────────────────────────────
  const handleCancel = async (id, stationName) => {
    if (!window.confirm(`Cancel booking for "${stationName}"?`)) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/bookings/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(" Booking cancelled. Station is now Available.");
      setTimeout(() => setMessage(""), 3500);
      fetchBookings();
    } catch (err) {
      console.error("Cancel error:", err.response?.data);
      setError("Failed to cancel booking.");
      setTimeout(() => setError(""), 3500);
    }
  };

  // ── Filtered list ───────────────────────────────────
  const filtered = bookings.filter(
    (b) => filter === "all" || b.status === filter
  );

  // ── Summary stats ───────────────────────────────────
  const totalBookings = bookings.length;
  const confirmed     = bookings.filter((b) => b.status === "confirmed").length;
  const cancelled     = bookings.filter((b) => b.status === "cancelled").length;
  const totalSpent    = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

  // ── Render ──────────────────────────────────────────
  return (
    <div className="mybookings-page">

      {/* Page header */}
      <div className="mybookings-header">
        <div>
          <h2>My Bookings</h2>
          <p>
            Welcome back, <strong>{username}</strong> —
            here are all your bookings
          </p>
        </div>
        <button className="btn" onClick={() => navigate("/stations")}>
          + Book a Station
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="mybookings-stats">
        <div className="mystat-card">
          <span className="mystat-num">{totalBookings}</span>
          <span className="mystat-label">Total Bookings</span>
        </div>
        <div className="mystat-card green">
          <span className="mystat-num">{confirmed}</span>
          <span className="mystat-label">Confirmed</span>
        </div>
        <div className="mystat-card red">
          <span className="mystat-num">{cancelled}</span>
          <span className="mystat-label">Cancelled</span>
        </div>
        <div className="mystat-card green">
          <span className="mystat-num">₹{totalSpent.toFixed(0)}</span>
          <span className="mystat-label">Total Spent</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mybookings-filters">
        {["all", "confirmed", "cancelled"].map((f) => (
          <button
            key={f}
            className={`myfilter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="filter-count">
              {f === "all"       ? totalBookings
               : f === "confirmed" ? confirmed
               : cancelled}
            </span>
          </button>
        ))}
      </div>

      {/* Toast messages */}
      {message && <div className="mybooking-msg success">{message}</div>}
      {error   && (
        <div className="mybooking-msg error">
          {error}
          {error.includes("login") && (
            <button
              className="btn"
              style={{ marginLeft: "14px", padding: "6px 14px" }}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="mybookings-loading">
          <div className="loading-spinner" />
          <p>Loading your bookings...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="mybookings-empty">
          <div className="empty-icon"></div>
          <h3>No bookings found</h3>
          <p>
            {filter === "all"
              ? "You haven't booked any stations yet."
              : `No ${filter} bookings.`}
          </p>
          <button
            className="btn"
            style={{ marginTop: "16px" }}
            onClick={() => navigate("/stations")}
          >
            Find a Charging Station
          </button>
        </div>
      )}

      {/* Booking cards */}
      {!loading && filtered.length > 0 && (
        <div className="mybookings-list">
          {filtered.map((b) => (
            <div
              key={b.id}
              className={`mybooking-card ${b.status === "cancelled" ? "cancelled" : ""}`}
            >
              {/* Card top: station name + status badge */}
              <div className="mybooking-card-header">
                <div className="mybooking-station">
                  <span className="mybooking-icon"></span>
                  <div>
                    <h3>{b.station_name}</h3>
                    <p>{b.station_location}</p>
                  </div>
                </div>
                <span
                  className={`status ${
                    b.status === "confirmed" ? "available" : "busy"
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <hr className="divider" />

              {/* Details grid: 3 columns */}
              <div className="mybooking-details">
                <div className="mybooking-detail-item">
                  <span className="detail-label">Booking ID</span>
                  <span className="detail-value">
                    #ECO{String(b.id).padStart(4, "0")}
                  </span>
                </div>

                <div className="mybooking-detail-item">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">
                    {b.payment_method === "Card" && ""}
                    {b.payment_method === "UPI"  && ""}
                    {b.payment_method === "Cash" && ""}
                    {b.payment_method}
                  </span>
                </div>

                <div className="mybooking-detail-item">
                  <span className="detail-label">Date & Time</span>
                  <span className="detail-value">
                    {new Date(b.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                    {" · "}
                    {new Date(b.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="mybooking-detail-item">
                  <span className="detail-label">Booking Fee</span>
                  <span className="detail-value">₹{b.booking_fee}</span>
                </div>

                <div className="mybooking-detail-item">
                  <span className="detail-label">Charging Fee</span>
                  <span className="detail-value">₹{b.charging_fee}</span>
                </div>

                <div className="mybooking-detail-item">
                  <span className="detail-label">Total Paid</span>
                  <span className="detail-value total-paid">
                    ₹{b.total_amount}
                  </span>
                </div>
              </div>

              {/* Cancel button — only for confirmed */}
              {b.status === "confirmed" && (
                <div style={{ marginTop: "14px" }}>
                  <button
                    className="mybooking-cancel-btn"
                    onClick={() => handleCancel(b.id, b.station_name)}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default MyBookings;
