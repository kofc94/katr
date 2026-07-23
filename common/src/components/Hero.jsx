import React from 'react';
import Countdown from './Countdown';
import defaultOfficialGraphic from '../assets/official_graphic.jpg';

export default function Hero({
  title,
  tagline,
  presenter,
  dateText,
  timeText,
  venueName,
  venueAddress,
  racesCountText,
  targetDate,
  graphicImgSrc = defaultOfficialGraphic,
}) {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <div className="event-tag">
          <span>🛡️ Presented by {presenter}</span>
        </div>

        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{tagline}</p>

        {/* Official Graphic Showcase */}
        {graphicImgSrc && (
          <div className="hero-graphic-card">
            <img
              src={graphicImgSrc}
              alt="Knights of Columbus K'night at the Races Official Graphic"
              className="official-graphic-img"
            />
          </div>
        )}

        <div className="hero-meta-grid">
          <div className="meta-card">
            <div className="meta-icon">📅</div>
            <div className="meta-label">Date</div>
            <div className="meta-value">{dateText}</div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">⏰</div>
            <div className="meta-label">Time</div>
            <div className="meta-value">{timeText}</div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">📍</div>
            <div className="meta-label">Venue</div>
            <div className="meta-value">{venueName}</div>
            {venueAddress && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {venueAddress}
              </div>
            )}
          </div>
          <div className="meta-card">
            <div className="meta-icon">🏆</div>
            <div className="meta-label">Races</div>
            <div className="meta-value">{racesCountText}</div>
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

        <Countdown targetDate={targetDate} />
      </div>
    </section>
  );
}
