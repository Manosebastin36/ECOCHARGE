import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");  // clear error on typing
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Front-end validation
    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        {
          username: form.username.trim(),
          email:    form.email.trim(),
          password: form.password,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert(`Account created successfully! Welcome, ${res.data.user.username} `);
      navigate("/login");

    } catch (err) {
      if (err.response) {
        const data = err.response.data;

        // Django returns field-level errors as objects
        if (data.username)  { setError(`Username: ${data.username[0]}`);  return; }
        if (data.email)     { setError(`Email: ${data.email[0]}`);        return; }
        if (data.password)  { setError(`Password: ${data.password[0]}`);  return; }
        if (data.error)     { setError(data.error);                        return; }

        setError("Registration failed. Please try again.");
      } else if (err.request) {
        setError("Cannot connect to server. Make sure Django is running on port 8000.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join EcoCharge and start charging smarter</p>

        {/* Error box */}
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="register-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <p className="login-text">
            Already have an account? <a href="/login">Login</a>
          </p>

        </form>
      </div>
    </div>
  );
}

export default Register;
