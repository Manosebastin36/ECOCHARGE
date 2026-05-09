import React, { useState, useEffect, useCallback } from "react";
import API from "../api";

function ViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/bookings/");
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchBookings(); 
  }, [fetchBookings]);

  return (
    <div className="admin-section">
      <h3>View Bookings</h3>
      {error && <div className="admin-msg error">{error}</div>}
      <table className="admin-table">
        <thead><tr><th>User</th><th>Station</th><th>Status</th></tr></thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.username}</td>
              <td>{b.station_name}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewBookings;
