import API from "../api";

function Booking() {
  const location = useLocation();
  const navigate  = useNavigate();

  // ✅ Only plain data comes through state — no functions
  const station = location.state;

  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [confirmed, setConfirmed]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const bookingFee  = 30;
  const chargingFee = 200;
  const totalAmount = bookingFee + chargingFee;

  if (!station) {
    return (
      <div className="container">
        <h2>No station selected</h2>
        <button className="btn" onClick={() => navigate("/stations")}>
          Go Back
        </button>
      </div>
    );
  }

  // Save booking to MySQL via Django API
  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Please login to book a station.");
      navigate("/login");
      return;
    }

    try {
      await API.post(
        "/bookings/",
        {
          station_id:       station.id,
          station_name:     station.name,
          station_location: station.location,
          payment_method:   paymentMethod,
        }
      );

      // Update localStorage — Stations page will re-fetch on focus
      const saved    = localStorage.getItem("bookedStations");
      const existing = saved ? JSON.parse(saved) : [];
      if (!existing.includes(station.id)) {
        localStorage.setItem(
          "bookedStations",
          JSON.stringify([...existing, station.id])
        );
      }

      setConfirmed(true);

    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(err.response?.data?.error || "Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Confirmed screen ──────────────────────────────────
  if (confirmed) {
    return (
      <div className="booking-container">
        <div className="booking-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.8rem", marginBottom: "10px" }}>✅</div>
          <h3 style={{ color: "#2db243" }}>Booking Confirmed!</h3>

          <div className="confirmed-detail">
            <p><strong>Station:</strong>  {station.name}</p>
            <p><strong>Location:</strong> {station.location}</p>
            <p><strong>Charger:</strong>  {station.charger_type} · {station.power_kw} kW</p>
            <p><strong>Payment:</strong>  {paymentMethod}</p>
          </div>

          <div className="confirmed-badge">
            Slot Status changed to{" "}
            <span style={{ color: "#c0392b" }}>BUSY</span>
          </div>

          <p style={{
            fontSize: "1.2rem", color: "#2db243",
            fontWeight: "bold", marginTop: "12px",
          }}>
            Total Paid: ₹{totalAmount}
          </p>

          <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            <button
              className="btn"
              style={{ flex: 1, padding: "12px" }}
              onClick={() => navigate("/my-bookings")}
            >
               My Bookings
            </button>
            <button
              className="btn btn-outline"
              style={{ flex: 1, padding: "12px" }}
              onClick={() => navigate("/stations")}
            >
              Back to Stations
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking form ──────────────────────────────────────
  return (
    <div className="booking-container">
      <h2>Booking Page</h2>

      <div className="booking-card">

        {/* Station info */}
        <h3>{station.name}</h3>
        <p><strong>Location:</strong> {station.location}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`status ${station.status.toLowerCase()}`}>
            {station.status}
          </span>
        </p>

        <hr className="divider" />

        {/* Slot info */}
        <div className="booking-field">
          <label>Slot Info</label>
          <p style={{ fontSize: "0.88rem", color: "#666" }}>
             {station.charger_type} &nbsp;|&nbsp;  {station.power_kw} kW Fast Charger
          </p>
          <p style={{ fontSize: "0.88rem", color: "#666" }}>
            Duration: 1 Hour (fixed slot)
          </p>
        </div>

        <hr className="divider" />

        {/* Price breakdown */}
        <div className="booking-field">
          <label>Price Breakdown</label>
          <div className="amount-summary">
            <span>Booking Fee</span>
            <span>₹{bookingFee}</span>
          </div>
          <div className="amount-summary">
            <span>Charging Fee</span>
            <span>₹{chargingFee}</span>
          </div>
          <div className="amount-summary total-row">
            <span>Total Amount</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        <hr className="divider" />

        {/* Payment method */}
        <div className="booking-field">
          <label>Payment Method</label>
          <div className="payment-options">
            {["Card", "UPI", "Cash"].map((method) => (
              <button
                key={method}
                className={`payment-btn ${paymentMethod === method ? "active" : ""}`}
                onClick={() => setPaymentMethod(method)}
              >
                {method === "Card" && ""}
                {method === "UPI"  && ""}
                {method === "Cash" && ""}
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p style={{
            color: "#e74c3c", fontSize: "0.85rem",
            background: "#fde8e8", padding: "8px 12px",
            borderRadius: "6px", border: "1px solid #f5c6c6",
          }}>
            {error}
          </p>
        )}

        <p className="booking-note">
           After booking, this slot will be marked as <strong>Busy</strong>.
        </p>

        {/* Confirm button */}
        <button
          className="btn"
          style={{ marginTop: "6px", width: "100%", padding: "13px" }}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Processing..." : `Confirm & Pay ₹${totalAmount}`}
        </button>

        {/* Cancel */}
        <button
          onClick={() => navigate("/stations")}
          style={{
            background: "none", border: "none", color: "#888",
            cursor: "pointer", fontSize: "0.85rem",
            textAlign: "center", marginTop: "4px",
          }}
        >
          ← Cancel
        </button>

      </div>
    </div>
  );
}

export default Booking;
