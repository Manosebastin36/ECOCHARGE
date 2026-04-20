import React from "react";
import { useNavigate } from "react-router-dom";

function StationCard({ id, name, location, status, charger_type, power_kw }) {
  const navigate = useNavigate();

  const handleBook = () => {
    // ✅ Only pass plain serializable data — NO functions in navigate state
    navigate("/booking", {
      state: {
        id,
        name,
        location,
        status,
        charger_type: charger_type || "Type 2",
        power_kw:     power_kw     || 22,
      },
    });
  };

  return (
    <div className={`station-card ${status === "Busy" ? "card-busy" : ""}`}>
      <h3>{name}</h3>
      <p>{location}</p>
      <p style={{ fontSize: "0.82rem", color: "#888" }}>
         {charger_type || "Type 2"} &nbsp;|&nbsp;  {power_kw || 22} kW
      </p>

      <div className="card-footer">
        <span className={`status ${status.toLowerCase()}`}>
          {status}
        </span>

        {status === "Available" ? (
          <button className="btn" onClick={handleBook}>
            Book Now
          </button>
        ) : (
          <button className="btn btn-disabled" disabled>
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}

export default StationCard;
