import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEvStation } from "react-icons/md";

function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Read user info from localStorage
  const [user, setUser] = useState({
    username: localStorage.getItem("username") || "",
    isStaff:  localStorage.getItem("is_staff") === "true",
    token:    localStorage.getItem("access_token") || "",
  });

  // Dropdown ref — close when clicking outside
  const dropdownRef = useRef(null);

  // Re-read user info when localStorage changes (after login/logout)
  useEffect(() => {
    const syncUser = () => {
      setUser({
        username: localStorage.getItem("username") || "",
        isStaff:  localStorage.getItem("is_staff") === "true",
        token:    localStorage.getItem("access_token") || "",
      });
    };
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus",   syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus",   syncUser);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser({ username: "", isStaff: false, token: "" });
    setProfileOpen(false);
    navigate("/login");
  };

  // Avatar initials from username
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  const isLoggedIn = !!user.token;

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="logo-area">
        <MdEvStation className="nav-icon" />
        <h2 className="logo">EcoCharge Web Platform</h2>
      </div>

      {/* Hamburger — mobile only */}
      <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation">
        <span style={{ transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
        <span style={{ opacity: menuOpen ? 0 : 1 }} />
        <span style={{ transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
      </button>

      {/* Nav links */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/"         onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/about"    onClick={() => setMenuOpen(false)}>About Us</Link>
        <Link to="/location" onClick={() => setMenuOpen(false)}>Find Location</Link>
        <Link to="/stations" onClick={() => setMenuOpen(false)}>Stations</Link>
        <Link to="/contact"  onClick={() => setMenuOpen(false)}>Contact</Link>

        {/* Show Login link only when not logged in */}
        {!isLoggedIn && (
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
        )}
      </div>

      {/* ── User profile avatar (right corner) ── */}
      {isLoggedIn ? (
        <div className="profile-wrap" ref={dropdownRef}>

          {/* Avatar button */}
          <button
            className="profile-avatar"
            onClick={() => setProfileOpen(!profileOpen)}
            title={user.username}
          >
            {initials}
            {user.isStaff && <span className="admin-dot" title="Admin" />}
          </button>

          {/* Dropdown panel */}
          {profileOpen && (
            <div className="profile-dropdown">

              {/* User info header */}
              <div className="profile-info">
                <div className="profile-avatar-lg">{initials}</div>
                <div className="profile-details">
                  <strong>{user.username}</strong>
                  <span className={`profile-role ${user.isStaff ? "admin" : "user"}`}>
                    {user.isStaff ? " Admin" : " User"}
                  </span>
                </div>
              </div>

              <hr className="profile-divider" />

              {/* Menu items */}
              <Link to="/my-bookings" className="profile-menu-item"
                onClick={() => setProfileOpen(false)}>
                My Bookings
              </Link>

              {user.isStaff && (
                <a 
                  href={process.env.REACT_APP_ADMIN_URL || "http://localhost:3001"} 
                  className="profile-menu-item"
                  rel="noopener noreferrer"
                >
                  Admin Panel
                </a>
              )}

              <hr className="profile-divider" />

              <button className="profile-menu-item logout"
                onClick={handleLogout}>
                Logout
              </button>

            </div>
          )}
        </div>
      ) : null}

    </nav>
  );
}

export default Navbar;
