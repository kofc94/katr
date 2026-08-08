import React from 'react';

/**
 * BaseSponsorCard Component
 * Reusable layout card for sponsorships.
 */
export default function BaseSponsorCard({
  status = 'available', // 'available' | 'confirmed'
  badgeText = 'Sponsorship Open',
  categoryTitle,
  icon = '⭐',
  placeholderText = 'Your Logo Here',
  sponsorLogo = '',
  sponsorName,
  description,
  location,
  contactEmail = 'sponsorships@lexingtonkofc.org',
  websiteUrl = '',
  customButton = null,
}) {
  const isConfirmed = status === 'confirmed';

  return (
    <div className={`sponsor-card ${isConfirmed ? 'secured' : 'open-opportunity'}`}>
      <div className={`sponsor-badge ${isConfirmed ? 'confirmed' : 'available'}`}>
        {badgeText}
      </div>

      <div className="sponsor-category-title">{categoryTitle}</div>

      <div className="sponsor-logo-box">
        {sponsorLogo ? (
          <img src={sponsorLogo} alt={sponsorName} className="sponsor-logo-img" />
        ) : (
          <div className="logo-placeholder">
            <span className="placeholder-icon">{icon}</span>
            <span className="placeholder-text">{placeholderText}</span>
          </div>
        )}
      </div>

      <div className="sponsor-info">
        <h3 className="sponsor-name">{sponsorName}</h3>
        <p className="sponsor-desc">{description}</p>

        <div className="sponsor-meta">
          {location && (
            <div className="meta-item">
              <span className="meta-icon">📍</span> Location: {location}
            </div>
          )}
          {contactEmail && (
            <div className="meta-item">
              <span className="meta-icon">✉️</span> Contact:{' '}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          )}
        </div>
      </div>

      <div className="sponsor-actions">
        {customButton ? (
          customButton
        ) : isConfirmed && websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sponsor-website-link"
          >
            🌐 Visit Sponsor Website
          </a>
        ) : (
          <a
            href={`mailto:${contactEmail}?subject=Inquiry%3A%20${encodeURIComponent(
              categoryTitle
            )}`}
            className="btn-primary sponsor-btn"
          >
            <span>⭐ Become This Sponsor</span>
          </a>
        )}
      </div>
    </div>
  );
}
