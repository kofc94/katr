import React from 'react';
import Countdown from './Countdown';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <div className="event-tag">
          <span>🛡️ Presented by Knights of Columbus Council #94</span>
        </div>

        <h1 className="hero-title">K'NIGHT AT THE RACES 2026</h1>
        <p className="hero-subtitle">
          An unforgettable evening of live wooden horse racing jockeyed by guests around the track, delicious dinner, wagering, silent auctions, and community fellowship!
        </p>

        {/* Official Graphic Showcase */}
        <div className="hero-graphic-card">
          <img
            src="assets/official_graphic.jpg"
            alt="Knights of Columbus K'night at the Races Official Graphic"
            className="official-graphic-img"
          />
        </div>

        <div className="hero-meta-grid">
          <div className="meta-card">
            <div className="meta-icon">📅</div>
            <div className="meta-label">Date</div>
            <div className="meta-value">Sat, Sep 12, 2026</div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">⏰</div>
            <div className="meta-label">Time</div>
            <div className="meta-value">6:00 PM EST</div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">📍</div>
            <div className="meta-label">Venue</div>
            <div className="meta-value">Heritage Hall</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              177 Bedford St, Lexington
            </div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">🏆</div>
            <div className="meta-label">Races</div>
            <div className="meta-value">5 Action Races</div>
          </div>
        </div>

        <div className="hero-actions">
          <a href="#tickets" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}>
            <span>🎟️ Get Tickets Online</span>
          </a>
          <a href="#sponsors" className="btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
            <span>⭐ Sponsor an Area</span>
          </a>
        </div>

        <Countdown />
      </div>
    </section>
  );
}
