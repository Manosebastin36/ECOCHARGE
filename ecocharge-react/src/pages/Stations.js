import React, { useState, useEffect, useCallback } from "react";
import StationCard from "../components/StationCard";
import axios from "axios";

function Stations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Fetch stations from Django API
  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/stations/");
      setStations(res.data);
    } catch {
      setError("Failed to load stations. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
    // Re-fetch when tab gets focus (picks up admin changes + booking status)
    window.addEventListener("focus", fetchStations);
    return () => window.removeEventListener("focus", fetchStations);
  }, [fetchStations]);

  const availableCount = stations.filter((s) => s.status === "Available").length;
  const busyCount      = stations.filter((s) => s.status === "Busy").length;

  return (
    <div className="stations-page">
      <div className="stations-header">
        <h2>Charging Stations</h2>
        <p>Find available EV charging stations near you</p>
        <div className="stations-stats">
          <span className="stat available">{availableCount} Available</span>
          <span className="stat busy">{busyCount} Busy</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="stations-loading">
          <div className="loading-spinner" />
          <p>Loading stations...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="stations-error">
          {error}
          <button className="btn" style={{ marginLeft: "14px" }}
            onClick={fetchStations}>
            Retry
          </button>
        </div>
      )}

      {/* Grid — NO onBookingDone prop passed */}
      {!loading && !error && (
        <div className="station-grid">
          {stations.length === 0 ? (
            <p className="no-stations">
              No stations found. Admin can add stations from the Admin Panel.
            </p>
          ) : (
            stations.map((station) => (
              <StationCard
                key={station.id}
                id={station.id}
                name={station.name}
                location={station.location}
                status={station.status}
                charger_type={station.charger_type}
                power_kw={station.power_kw}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Stations;
