import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div
      className="home-page"
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/home-bg1.jpg)` }}
    >

      {/* Dark overlay */}
      <div className="home-overlay" />

      {/* All content sits above overlay */}
      <div className="home-content">

        <div className="home-badge">100% Electric · Zero Emissions</div>

        <div className="home-title">
          <h1>Welcome to <span>EcoCharge</span></h1>
        </div>
        <div className="buttons">
          <Link to="/stations" className="btn">Find Station</Link>
          <Link to="/login"    className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-outline">Register</Link>
        </div>

      </div>
    </div>
  );
}

export default Home;
