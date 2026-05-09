import React, { useState, useEffect } from "react";
import axios from "axios";

function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/admin/bookings/", { headers });
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBookings(); }, []);

  const flash = (msg, isErr = false) => {
    isErr ? setError(msg) : setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 3000);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/bookings/${id}/`, { headers });
      flash(" Booking cancelled. Station set back to Available.");
      fetchBookings();
    } catch {
      flash("Failed to cancel booking.", true);
    }
  };

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) =>
      (b.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.station_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.station_location || "").toLowerCase().includes(search.toLowerCase())
    );

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

  return (
    <div className="admin-section">

      {/* Stats */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="stat-num">{bookings.length}</span>
          <span className="stat-label">Total Bookings</span>
        </div>
        <div className="admin-stat-card green">
          <span className="stat-num">
            {bookings.filter((b) => b.status === "confirmed").length}
          </span>
          <span className="stat-label">Confirmed</span>
        </div>
        <div className="admin-stat-card" style={{ borderTopColor: "#e74c3c" }}>
          <span className="stat-num">
            {bookings.filter((b) => b.status === "cancelled").length}
          </span>
          <span className="stat-label">Cancelled</span>
        </div>
        <div className="admin-stat-card green">
          <span className="stat-num">₹{totalRevenue.toFixed(0)}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="admin-section-header">
        <div className="admin-filter-tabs">
          {["all", "confirmed", "cancelled"].map((f) => (
            <button key={f}
              className={`admin-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input className="admin-search"
          placeholder="Search user, station, city..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {message && <div className="admin-msg success">{message}</div>}
      {error && <div className="admin-msg error">{error}</div>}

      {loading ? (
        <p className="admin-loading">Loading bookings from database...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Station</th>
                <th>City</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="admin-empty">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td><strong>{b.username}</strong></td>
                    <td>{b.station_name}</td>
                    <td>{b.station_location}</td>
                    <td>{b.payment_method}</td>
                    <td><strong>₹{b.total_amount}</strong></td>
                    <td>
                      <span className={`status ${b.status === "confirmed" ? "available" : "busy"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      {new Date(b.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      {b.status === "confirmed" ? (
                        <button className="admin-btn-delete"
                          onClick={() => handleCancel(b.id)}>
                          Cancel
                        </button>
                      ) : (
                        <span style={{ color: "#aaa", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ViewBookings;
