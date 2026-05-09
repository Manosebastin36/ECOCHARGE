import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../api";

function Location() {
  const [stations, setStations] = useState([]);
  const [city, setCity]         = useState("");
  const [selected, setSelected] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const mapDivRef  = useRef(null);
  const mapRef     = useRef(null);
  const markersRef = useRef([]);

  // ── 1. Load Leaflet CSS + JS ───────────────────────────
  useEffect(() => {
    // Inject CSS once
    if (!document.getElementById("leaflet-css")) {
      const css = document.createElement("link");
      css.id    = "leaflet-css";
      css.rel   = "stylesheet";
      css.href  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(css);
    }

    // If already loaded skip
    if (window.L) { setMapReady(true); return; }

    // Inject JS
    const existing = document.getElementById("leaflet-js");
    if (existing) {
      existing.addEventListener("load", () => setMapReady(true));
      return;
    }

    const script    = document.createElement("script");
    script.id       = "leaflet-js";
    script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async    = true;
    script.onload   = () => setMapReady(true);
    script.onerror  = () => console.error("Leaflet load failed");
    document.body.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ── 2. Init map once Leaflet ready AND div in DOM ──────
  useEffect(() => {
    if (!mapReady) return;
    if (!mapDivRef.current) return;
    if (mapRef.current) return;   // already initialised

    const L = window.L;

    // Fix broken default icons in React/Webpack
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapDivRef.current, {
      center: [10.5, 78.5],
      zoom:   7,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    // Crucial: call invalidateSize multiple times
    // to handle React rendering delays
    map.invalidateSize();
    setTimeout(() => map.invalidateSize(), 200);
    setTimeout(() => map.invalidateSize(), 600);
    setTimeout(() => map.invalidateSize(), 1200);
  }, [mapReady]);   // only runs when mapReady flips to true

  // ── 3. Fetch stations from Django ─────────────────────
  const fetchStations = useCallback(async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/stations/");
      setStations(res.data);
    } catch {
      setStations([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
    window.addEventListener("focus", fetchStations);
    return () => window.removeEventListener("focus", fetchStations);
  }, [fetchStations]);

  // ── 4. Add markers whenever stations change ────────────
  useEffect(() => {
    const map = mapRef.current;
    const L   = window.L;
    if (!map || !L) return;

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    stations.forEach((s) => {
      if (!s.lat || !s.lng || parseFloat(s.lat) === 0) return;

      const isAvail = s.status === "Available";
      const color   = isAvail ? "#2db243" : "#e74c3c";

      const icon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
          <path d="M15 0C6.7 0 0 6.7 0 15c0 11.3 15 23 15 23S30 26.3 30 15C30 6.7 23.3 0 15 0z" fill="${color}"/>
          <circle cx="15" cy="15" r="8" fill="white"/>
          <text x="15" y="20" text-anchor="middle" font-size="10"
            font-family="Arial" font-weight="bold" fill="${color}"></text>
        </svg>`,
        className: "", iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -38],
      });

      const marker = L.marker([parseFloat(s.lat), parseFloat(s.lng)], {
        icon, title: s.name,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Arial;min-width:170px;padding:4px;">
            <b style="font-size:0.9rem;color:#1a1a2e;"> ${s.name}</b><br/>
            <span style="font-size:0.8rem;color:#666;">${s.location}</span><br/>
            <span style="display:inline-block;margin-top:5px;padding:2px 10px;
              border-radius:20px;font-size:0.75rem;font-weight:bold;
              background:${isAvail ? "#d4f5e0" : "#fde8e8"};
              color:${isAvail ? "#1a7a35" : "#c0392b"};">${s.status}</span>
            <div style="font-size:0.74rem;color:#999;margin-top:5px;">
               ${s.charger_type || "Type 2"} | ${s.power_kw || 22} kW
            </div>
          </div>`, { maxWidth: 220 });

      marker.on("click", () => setSelected(s));
      markersRef.current.push(marker);
    });
  }, [stations, mapReady]);

  // ── 5. Filter + search ─────────────────────────────────
  const filtered = city.trim()
    ? stations.filter((s) =>
        s.location.toLowerCase().includes(city.toLowerCase()) ||
        s.name.toLowerCase().includes(city.toLowerCase())
      )
    : stations;

  // Show/hide markers based on search
  useEffect(() => {
    const map = mapRef.current;
    const L   = window.L;
    if (!map || !L) return;

    markersRef.current.forEach((m) => {
      const match = filtered.some((s) => s.name === m.options.title);
      match ? map.addLayer(m) : map.removeLayer(m);
    });

    if (city.trim() && filtered.length > 0) {
      const first = filtered.find((s) => s.lat && parseFloat(s.lat) !== 0);
      if (first) map.flyTo([parseFloat(first.lat), parseFloat(first.lng)], 11, { duration: 1 });
    } else if (!city.trim()) {
      map.flyTo([10.5, 78.5], 7, { duration: 1 });
    }
  }, [city, filtered]);

  // ── 6. Click card → fly ────────────────────────────────
  const handleCardClick = (s) => {
    setSelected(s);
    const map = mapRef.current;
    if (!map || !s.lat || parseFloat(s.lat) === 0) return;
    map.flyTo([parseFloat(s.lat), parseFloat(s.lng)], 13, { duration: 1 });
    setTimeout(() => {
      markersRef.current.forEach((m) => {
        if (m.options.title === s.name) m.openPopup();
      });
    }, 1000);
  };

  const availableCount = stations.filter((s) => s.status === "Available").length;
  const busyCount      = stations.filter((s) => s.status === "Busy").length;

  return (
    <div className="location-page">

      {/* Header */}
      <div className="location-header">
        <h2>Find Nearby Charging Stations</h2>
        <p>Click any card or pin to view station details</p>
        <div className="stations-stats" style={{ marginTop: "10px" }}>
          <span className="stat available"> {availableCount} Available</span>
          <span className="stat busy"> {busyCount} Busy</span>
        </div>
      </div>

      {/* Search */}
      <div className="location-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search city or station name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <span className="search-count">
          {filtered.length} station{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Layout — map + list ALWAYS rendered (map div must stay in DOM) */}
      <div className="location-layout">

        {/* ── Map wrapper ── */}
        <div className="loc-map-wrapper">

          {/* Map div — NEVER conditional, always mounted */}
          <div ref={mapDivRef} className="loc-map-div" />

          {/* Loading overlay on top of map until tiles load */}
          {!mapReady && (
            <div className="loc-map-overlay">
              <div className="map-spinner" />
              <p>Loading map...</p>
            </div>
          )}

          {/* Legend */}
          <div className="map-legend">
            <span className="legend-dot available" /> Available
            <span className="legend-dot busy" style={{ marginLeft: "12px" }} /> Busy
          </div>
        </div>

        {/* ── Station list ── */}
        <div className="location-list">
          {dataLoading ? (
            <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
              Loading stations...
            </p>
          ) : filtered.length === 0 ? (
            <div className="no-results">
              {city ? `No stations found for "${city}"` : "No stations added yet."}
            </div>
          ) : (
            filtered.map((s) => (
              <div key={s.id}
                className={`loc-card
                  ${selected?.id === s.id ? "loc-card-active" : ""}
                  ${s.status === "Busy"   ? "loc-card-busy"   : ""}
                `}
                onClick={() => handleCardClick(s)}
              >
                <div className="loc-card-top">
                  <strong>{s.name}</strong>
                  <span className={`status ${s.status.toLowerCase()}`}>
                    {s.status}
                  </span>
                </div>
                <p className="loc-card-city">{s.location}</p>
                <p className="loc-card-info">
                  {s.charger_type || "Type 2"} · {s.power_kw || 22} kW
                  {(!s.lat || parseFloat(s.lat) === 0) && (
                    <span style={{ color:"#f39c12", marginLeft:"6px", fontSize:"0.72rem" }}>
                      (no map pin)
                    </span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Location;
