import React, { useState } from "react";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">

        {/* Page Header */}
        <div className="contact-header">
          <h2>Contact EcoCharge</h2>
          <p>We'd love to hear from you. Reach out with questions, feedback, or partnership enquiries.</p>
        </div>

        <div className="contact-content">

          {/* ── Left: Contact Form ── */}
          <div className="contact-form-box">
            <h3 className="contact-box-title">Send a Message</h3>

            {sent ? (
              <div className="contact-success">
                <div style={{ fontSize: "2.2rem" }}></div>
                <strong>Message Sent!</strong>
                <p>Thanks {form.name}, we'll get back to you within 24 hours.</p>
                <button className="btn" style={{ marginTop: "12px" }} onClick={() => setSent(false)}>
                  Send Another
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    placeholder="Write your message here..."
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button className="btn contact-submit-btn" type="submit">
                  Send Message →
                </button>
              </form>
            )}
          </div>

          {/* ── Right: Info + Socials ── */}
          <div className="contact-right">

            {/* Office Info */}
            <div className="contact-info-box">
              <h3 className="contact-box-title">Our Office</h3>

              <div className="contact-info-item">
                <span className="contact-icon"></span>
                <div>
                  <strong>Address</strong>
                  <p>EcoCharge Pvt Ltd, Anna Salai,<br />Chennai – 600002, Tamil Nadu, India</p>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-icon"></span>
                <div>
                  <strong>Email</strong>
                  <p>support@ecocharge.com</p>
                  <p>business@ecocharge.com</p>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-icon"></span>
                <div>
                  <strong>Phone</strong>
                  <p>+91 98765 43210</p>
                  <p>+91 91234 56789</p>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-icon"></span>
                <div>
                  <strong>Working Hours</strong>
                  <p>Mon – Sat: 9:00 AM – 6:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="contact-social-box">
              <h3 className="contact-box-title">Follow Us</h3>
              <p className="social-subtitle">Stay updated with latest EV news & offers</p>

              <div className="social-links">

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn instagram"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  Instagram
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter / X
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn linkedin"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>

              </div>
            </div>

          </div>
        </div>

        {/* Bottom: Map embed */}
        <div className="contact-map">
          <h3 className="contact-box-title">Find Us on Map</h3>
          <iframe
            title="EcoCharge Location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=80.2507%2C13.0527%2C80.2907%2C13.1127&layer=mapnik&marker=13.0827%2C80.2707"
            width="100%"
            height="260"
            style={{ border: "none", borderRadius: "10px" }}
            allowFullScreen
          />
        </div>

      </div>
    </div>
  );
}

export default Contact;
