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
  sponsorName = '',
  namePlaceholder = 'Your Name Here',
  websiteUrl = '',
  urlPlaceholder = 'yourwebsite.com',
  customButton = null,
}) {
  const isConfirmed = status === 'confirmed';
  // Show a bare domain rather than the full href — the cards are narrow.
  const websiteLabel = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const logoImg = sponsorLogo && (
    <img src={sponsorLogo} alt={sponsorName} className="sponsor-logo-img" />
  );

  return (
    <div className={`sponsor-card ${isConfirmed ? 'secured' : 'open-opportunity'}`}>
      <div className={`sponsor-badge ${isConfirmed ? 'confirmed' : 'available'}`}>
        {badgeText}
      </div>

      <div className="sponsor-category-title">{categoryTitle}</div>

      <div className={`sponsor-logo-box${sponsorLogo ? ' has-logo' : ''}`}>
        {sponsorLogo ? (
          websiteUrl ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-logo-link"
              aria-label={`Visit ${sponsorName || 'sponsor'} website`}
            >
              {logoImg}
            </a>
          ) : (
            logoImg
          )
        ) : (
          <div className="logo-placeholder">
            <span className="placeholder-icon">{icon}</span>
            <span className="placeholder-text">{placeholderText}</span>
          </div>
        )}
      </div>

      <div className="sponsor-info">
        <h3 className={`sponsor-name${sponsorName ? '' : ' is-placeholder'}`}>
          {sponsorName || namePlaceholder}
        </h3>

        {websiteUrl ? (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sponsor-url"
          >
            🌐 {websiteLabel}
          </a>
        ) : (
          <span className="sponsor-url is-placeholder">🌐 {urlPlaceholder}</span>
        )}
      </div>

      {customButton && <div className="sponsor-actions">{customButton}</div>}
    </div>
  );
}
