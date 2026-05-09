import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ManageStations from "./ManageStations";
import ManageUsers from "./ManageUsers";
import ViewBookings from "./ViewBookings";

function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("stations");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const isStaff = localStorage.getItem("is_staff");
    if (!token || isStaff !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <button onClick={() => setTab("stations")}>Stations</button>
        <button onClick={() => setTab("users")}>Users</button>
        <button onClick={() => setTab("bookings")}>Bookings</button>
        <button onClick={handleLogout}>Logout</button>
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
