import React, { useState, useEffect } from "react";
import ManageStations from "./pages/ManageStations";
import ManageUsers from "./pages/ManageUsers";
import ViewBookings from "./pages/ViewBookings";
import "./Admin.css";

function AdminPanel() {
  const [tab, setTab] = useState("stations");

  useEffect(() => {
    // Shared localStorage with the main site login
    const token = localStorage.getItem("access_token");
    const isStaff = localStorage.getItem("is_staff");
    
    if (!token || (isStaff !== "true" && isStaff !== true)) {
       // Redirect back to the main site login if not an admin
       window.location.href = process.env.REACT_APP_MAIN_SITE_URL || "http://localhost:3000/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = process.env.REACT_APP_MAIN_SITE_URL || "http://localhost:3000/login";
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">EcoCharge Admin</div>
        <nav className="admin-nav">
          <button className={tab === "stations" ? "active" : ""} onClick={() => setTab("stations")}>Stations</button>
          <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users</button>
          <button className={tab === "bookings" ? "active" : ""} onClick={() => setTab("bookings")}>Bookings</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>
      <main className="admin-main">
        {tab === "stations" && <ManageStations />}
        {tab === "users" && <ManageUsers />}
        {tab === "bookings" && <ViewBookings />}
      </main>
    </div>
  );
}

export default AdminPanel;
