import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ username: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim()) { setError("Please enter your username."); return; }
    if (!form.password.trim()) { setError("Please enter your password.");  return; }

    setLoading(true);

    try {
      const res = await API.post(
        "/login/",
        { username: form.username.trim(), password: form.password.trim() },
        { headers: { "Content-Type": "application/json" } }
      );

      // Save tokens + user info
      localStorage.setItem("access_token",  res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("username",      res.data.user.username);
      localStorage.setItem("user_id",       res.data.user.id);
      localStorage.setItem("is_staff",      res.data.user.is_staff);

      // ── Redirect based on role ──────────────────────
      const isStaff = res.data.user.is_staff;
      console.log("User Role Check:", { username: res.data.user.username, isStaff });

      if (isStaff === true || String(isStaff).toLowerCase() === "true") {
        console.log("Redirecting to Admin Port...");
        window.location.href = process.env.REACT_APP_ADMIN_URL || "http://localhost:3001";
      } else {
        console.log("Redirecting to User Stations...");
        navigate("/stations");
      }

    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.error
          || err.response.data?.detail
          || "Login failed. Please try again.";
        setError(msg);
      } else if (err.request) {
        setError("Cannot connect to server. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Login to your EcoCharge account</p>

        {error && <div className="login-error-box">⚠️ {error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Username</label>
            <input type="text" name="username" placeholder="Enter your username"
              className="login-input" value={form.username}
              onChange={handleChange} autoComplete="username" />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" name="password" placeholder="Enter your password"
              className="login-input" value={form.password}
              onChange={handleChange} autoComplete="current-password" />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
