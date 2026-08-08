import React from 'react';

export default function About({
  venueName,
  venueAddress,
  racesText,
  racesDesc = 'Races featuring wooden horses guided by volunteer jockeys around the track! Place your bets, support local charities and maybe select the winning horse!',
}) {
  return (
    <section id="about" className="section">
      <div className="section-header">
        <div className="section-tag">An Exciting Tradition</div>
        <h2 className="section-title">What is K'night at the Races?</h2>
        <p className="section-desc">
          Join us at {venueName} ({venueAddress}) for an exciting community gala! 
        </p>
        <p className="section-desc">
          Volunteer jockeys guide wooden horses around the track while attendees place bets and cheer on their favorites.
        </p>
        <p className="section-desc">
          Proceeds from each race are split 50/50 between area charities and the winners!
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🏇</div>
          <h3 className="feature-title">{racesText}</h3>
          <p className="feature-desc">{racesDesc}</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🍽️</div>
          <h3 className="feature-title">Buffet Dinner & Cash Bar</h3>
          <p className="feature-desc">
            Enjoy a delicious catered dinner and dessert, signature Derby cocktails, beer, and wine.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎨</div>
          <h3 className="feature-title">Kid's Activity Table</h3>
          <p className="feature-desc">
            Creative and fun activities designed for children and families attending the event.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎁</div>
          <h3 className="feature-title">Raffles & Silent Auction</h3>
          <p className="feature-desc">
            Bid on luxury gift baskets, gift certificates. Special Silent Auction item
          </p>
        </div>
      </div>
    </section>
  );
}
