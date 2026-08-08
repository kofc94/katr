import React from 'react';

export default function About({
  venueName,
  venueAddress,
  racesText,
  racesDesc = 'Exciting races featuring wooden horses jockeyed live by event guests around the track! Place your bets and win cash & raffle prizes.',
}) {
  return (
    <section id="about" className="section">
      <div className="section-header">
        <div className="section-tag">An Exciting Tradition</div>
        <h2 className="section-title">What is K'night at the Races?</h2>
        <p className="section-desc">
          Join us at {venueName} ({venueAddress}) for an exciting community gala! Event guests jockey wooden horses around the track while attendees place bets and cheer on their favorites.
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
          <h3 className="feature-title">Buffet Dinner & Drinks</h3>
          <p className="feature-desc">
            Enjoy a delicious catered dinner, snacks, signature Derby drinks, beer, and wine at our cash bar.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎨</div>
          <h3 className="feature-title">Kid's Activity Table</h3>
          <p className="feature-desc">
            Fun crafts, games, and creative activities designed specifically for children and families attending the event.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎁</div>
          <h3 className="feature-title">Silent Auction & Raffles</h3>
          <p className="feature-desc">
            Bid on luxury gift baskets, sports memorabilia, restaurant gift certificates, and win 50/50 cash raffles.
          </p>
        </div>
      </div>
    </section>
  );
}
