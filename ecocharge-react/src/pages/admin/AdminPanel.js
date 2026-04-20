import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ManageStations from "./ManageStations";
import ManageUsers    from "./ManageUsers";
import ViewBookings   from "./ViewBookings";

function AdminPanel() {
  const navigate   = useNavigate();
  const [tab, setTab] = useState("stations");

  // Guard — only admin can access
  useEffect(() => {
    const token   = localStorage.getItem("access_token");
    const isStaff = localStorage.getItem("is_staff");
    if (!token || isStaff !== "true") {
      alert("Access denied. Admins only.");
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "Admin";

  const tabs = [
    { key: "stations", label: " Manage Stations" },
    { key: "users",    label: " Manage Users"    },
    { key: "bookings", label: " View Bookings"   },
  ];

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-icon"></span>
          <span>EcoCharge</span>
        </div>
        <p className="admin-welcome">Hello, {username}</p>

        <nav className="admin-nav">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`admin-nav-btn ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h2 className="admin-page-title">
            {tabs.find((t) => t.key === tab)?.label}
          </h2>
          <span className="admin-badge">Admin Panel</span>
        </div>

        <div className="admin-content">
          {tab === "stations" && <ManageStations />}
          {tab === "users"    && <ManageUsers />}
          {tab === "bookings" && <ViewBookings />}
        </div>
      </main>

    </div>
  );
}

export default AdminPanel;
