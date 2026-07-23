import React, { useState } from 'react';

export default function Navbar({ ctaText = '🎟️ Get Tickets', ctaHref = '#tickets' }) {
  const [navActive, setNavActive] = useState(false);

  const toggleNav = () => setNavActive((prev) => !prev);
  const closeNav = () => setNavActive(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        <a href="#" className="logo" onClick={closeNav}>
          <span>🐎 K'NIGHT AT THE RACES</span>
        </a>

        <nav>
          <ul className={`nav-links ${navActive ? 'active' : ''}`} id="navLinks">
            <li><a href="#about" className="nav-link" onClick={closeNav}>About</a></li>
            <li><a href="#tickets" className="nav-link" onClick={closeNav}>Tickets</a></li>
            <li><a href="#sponsors" className="nav-link" onClick={closeNav}>Our Sponsors</a></li>
            <li><a href="#game" className="nav-link" onClick={closeNav}>Play 🐎</a></li>
            <li><a href="#how-it-works" className="nav-link" onClick={closeNav}>How It Works</a></li>
            <li><a href="#schedule" className="nav-link" onClick={closeNav}>Schedule</a></li>
            <li><a href="#faq" className="nav-link" onClick={closeNav}>FAQ</a></li>
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href={ctaHref} className="btn-primary" onClick={closeNav}>
            <span>{ctaText}</span>
          </a>
          <button
            className="mobile-nav-toggle"
            id="mobileNavToggle"
            aria-label="Toggle Navigation"
            onClick={toggleNav}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
