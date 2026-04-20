import React from "react";
import { Link } from "react-router-dom";

function AboutUs() {
  return (
    <div className="about-page">

      {/* ── Hero Banner ─────────────────────────────── */}
      <div className="about-hero">
        <div className="about-hero-content">
          <div className="about-hero-badge">⚡ Electric Vehicle Charging Platform</div>
          <h1>About <span>EcoCharge</span></h1>
          <p>
            A smart and efficient EV charging management platform designed to improve accessibility,
            convenience, and real-time station management.
          </p>
          <div className="about-hero-btns">
            <Link to="/stations" className="btn">Find Stations</Link>
            <Link to="/register" className="btn btn-outline-white">Get Started</Link>
          </div>
        </div>
      </div>

      {/* ── Overview ────────────────────────────────── */}
      <div className="about-section">
        <h2 className="about-section-title">What is EcoCharge?</h2>

        <p className="about-text">
          EcoCharge is a web-based platform designed to simplify electric vehicle charging management.
          It enables users to search for nearby charging stations, check real-time availability, and
          book charging slots in advance through a single, easy-to-use interface.
        </p>

        <p className="about-text">
          The platform focuses on improving accessibility, reducing waiting time, and ensuring efficient
          station utilization. With a user-friendly design and reliable system performance, it provides
          a seamless and convenient charging experience while supporting the growth of sustainable transportation.
        </p>

        <p className="about-text">
          Built using modern web technologies, the system ensures smooth performance, secure data handling,
          and scalability to support a growing number of users and charging stations.
        </p>
      </div>

      {/* ── Mission & Vision ─────────────────────────── */}
      <div className="about-mv-grid">
        <div className="about-mv-card mission">
          <div className="about-mv-icon">🎯</div>
          <h3>Mission</h3>
          <p>
            To make electric vehicle charging simple, accessible, and efficient by using smart technology
            to reduce waiting time and improve user convenience.
          </p>
        </div>

        <div className="about-mv-card vision">
          <div className="about-mv-icon">🌱</div>
          <h3>Vision</h3>
          <p>
            To support a future of clean and sustainable transportation by providing a reliable and
            technology-driven EV charging ecosystem.
          </p>
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────── */}
      <div className="about-section">
        <h2 className="about-section-title">How It Works</h2>

        <div className="about-steps">

          <div className="about-step">
            <div className="step-circle">1</div>
            <div className="step-content">
              <h4>Register & Login</h4>
              <p>
                Create an account and securely log in to access platform features.
              </p>
            </div>
          </div>

          <div className="step-connector" />

          <div className="about-step">
            <div className="step-circle">2</div>
            <div className="step-content">
              <h4>Find a Charging Station</h4>
              <p>
                Search and explore nearby charging stations with real-time availability status.
              </p>
            </div>
          </div>

          <div className="step-connector" />

          <div className="about-step">
            <div className="step-circle">3</div>
            <div className="step-content">
              <h4>Book Your Slot</h4>
              <p>
                Select a station and reserve a charging slot in advance to avoid waiting.
              </p>
            </div>
          </div>

          <div className="step-connector" />

          <div className="about-step">
            <div className="step-circle">4</div>
            <div className="step-content">
              <h4>Charge Your Vehicle</h4>
              <p>
                Visit the station at your booked time and complete your charging session smoothly.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Features ─────────────────────────────── */}
      <div className="about-section">
        <h2 className="about-section-title">Platform Features</h2>

        <div className="about-features-grid">

          <div className="about-feature-card">
            <span className="feature-icon">🗺️</span>
            <h4>Location-Based Search</h4>
            <p>Find nearby charging stations quickly using location-based services.</p>
          </div>

          <div className="about-feature-card">
            <span className="feature-icon">⚡</span>
            <h4>Real-Time Availability</h4>
            <p>Check live status of charging stations before booking.</p>
          </div>

          <div className="about-feature-card">
            <span className="feature-icon">📅</span>
            <h4>Advance Booking</h4>
            <p>Reserve charging slots in advance to save time and avoid waiting.</p>
          </div>

          <div className="about-feature-card">
            <span className="feature-icon">🔐</span>
            <h4>Secure Access</h4>
            <p>User authentication ensures safe and secure platform usage.</p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default AboutUs;