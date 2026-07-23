import React from 'react';

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section"
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-gold)',
      }}
    >
      <div className="section-header">
        <div className="section-tag">Easy Step-by-Step Guide</div>
        <h2 className="section-title">How The Evening Works</h2>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">1️⃣</div>
          <h3 className="feature-title">Arrive & Check In</h3>
          <p className="feature-desc">
            Doors open at 6:00 PM at Heritage Hall (177 Bedford St, Lexington). Pick up your official program and explore the venue.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">2️⃣</div>
          <h3 className="feature-title">Enjoy Buffet Dinner</h3>
          <p className="feature-desc">
            Relax and enjoy a hot buffet dinner with friends, family, and fellow community members before the races begin.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">3️⃣</div>
          <h3 className="feature-title">Place Your Wagers</h3>
          <p className="feature-desc">
            Wagering windows open before each of the 5 races. Place $2 bets on any horse in the field to boost your odds of winning!
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">4️⃣</div>
          <h3 className="feature-title">Cheer & Collect Winnings</h3>
          <p className="feature-desc">
            Cheer on guest jockeys as they race wooden horses around the track. Winning tickets collect cash payouts right after each race!
          </p>
        </div>
      </div>
    </section>
  );
}
