import React from 'react';

export default function Schedule() {
  return (
    <section id="schedule" className="section">
      <div className="section-header">
        <div className="section-tag">Race Night Timeline</div>
        <h2 className="section-title">Evening Schedule</h2>
      </div>

      <div className="timeline">
        <div className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-time">6:00 PM</div>
          <h3 className="timeline-title">Doors Open & Registration</h3>
          <p className="timeline-desc">
            Check-in at Heritage Hall (177 Bedford St), pick up your program, explore the silent auction, and head to the cash bar.
          </p>
        </div>

        <div className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-time">6:30 PM</div>
          <h3 className="timeline-title">Buffet Dinner Served</h3>
          <p className="timeline-desc">
            Enjoy a delicious dinner buffet and appetizers with your table.
          </p>
        </div>

        <div className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-time">7:15 PM</div>
          <h3 className="timeline-title">First Post / Race 1 Begins</h3>
          <p className="timeline-desc">
            The trumpet sounds! Wagering window opens for Race 1.
          </p>
        </div>

        <div className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-time">8:45 PM</div>
          <h3 className="timeline-title">Silent Auction Close & 50/50 Raffle</h3>
          <p className="timeline-desc">
            Final bids for silent auction items and announcement of half-the-pot raffle winner.
          </p>
        </div>

        <div className="timeline-item">
          <div className="timeline-dot"></div>
          <div className="timeline-time">9:15 PM</div>
          <h3 className="timeline-title">Grand Finale Race 5</h3>
          <p className="timeline-desc">
            Final feature race of the night with the biggest payout!
          </p>
        </div>
      </div>
    </section>
  );
}
