import React from 'react';

export default function Footer({
  currentYear = '2026',
  qrCodeSrc = 'assets/katr_qr_code.png',
  availableYears = ['2026'],
}) {
  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    if (selectedYear) {
      window.location.href = `/${selectedYear}/`;
    }
  };

  return (
    <footer>
      <div className="footer-container">
        <div className="footer-col">
          <div className="footer-brand">🐎 KATR.ORG</div>
          <p className="footer-desc">
            Official home of the annual K'night at the Races fundraiser hosted by Lexington Knights of Columbus Council #94 at Heritage Hall, 177 Bedford St, Lexington.
          </p>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><a href="#about">About Event</a></li>
            <li><a href="#tickets">Get Tickets</a></li>
            <li><a href="#sponsors">Our Sponsors</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#schedule">Schedule</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Lexington KofC #94</h4>
          <ul>
            <li><a href="https://lexingtonkofc.org" target="_blank" rel="noopener noreferrer">Lexington KofC Website</a></li>
            <li><a href="https://lexingtonkofc.org/news-events" target="_blank" rel="noopener noreferrer">News & Events</a></li>
            <li><a href="mailto:sponsorships@lexingtonkofc.org">Sponsorship Inquiries</a></li>
          </ul>
        </div>

        {qrCodeSrc && (
          <div className="footer-col" style={{ textAlign: 'center' }}>
            <h4>Scan & Share</h4>
            <img
              src={qrCodeSrc}
              alt="Scan QR Code for katr.org"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--accent-gold)',
                marginBottom: '0.5rem',
                background: 'transparent',
                padding: '4px',
              }}
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Scan to visit katr.org</p>
          </div>
        )}

        <div className="footer-col">
          <h4>Event Archives</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Event Year:</p>
          <select
            id="yearSelect"
            className="year-selector"
            defaultValue={currentYear}
            onChange={handleYearChange}
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr} {yr === currentYear ? '(Current Event)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="footer-bottom">
        <div>&copy; {currentYear} Knights of Columbus Council #94. All rights reserved.</div>
        <div>Hosted on S3 & CloudFront via OpenTofu</div>
      </div>
    </footer>
  );
}
