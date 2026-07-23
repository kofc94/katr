import React from 'react';

export default function Schedule({
  venueName,
  venueAddress,
  timelineItems = [
    {
      time: '6:00 PM',
      title: 'Doors Open & Registration',
      desc: `Check-in at ${venueName} (${venueAddress}), pick up your program, explore the silent auction, and head to the cash bar.`,
    },
    {
      time: '6:30 PM',
      title: 'Buffet Dinner Served',
      desc: 'Enjoy a delicious dinner buffet and appetizers with your table.',
    },
    {
      time: '7:15 PM',
      title: 'First Post / Race 1 Begins',
      desc: 'The trumpet sounds! Wagering window opens for Race 1.',
    },
    {
      time: '8:45 PM',
      title: 'Silent Auction Close & 50/50 Raffle',
      desc: 'Final bids for silent auction items and announcement of half-the-pot raffle winner.',
    },
    {
      time: '9:15 PM',
      title: 'Grand Finale Race 5',
      desc: 'Final feature race of the night with the biggest payout!',
    },
  ],
}) {
  return (
    <section id="schedule" className="section">
      <div className="section-header">
        <div className="section-tag">Race Night Timeline</div>
        <h2 className="section-title">Evening Schedule</h2>
      </div>

      <div className="timeline">
        {timelineItems.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-time">{item.time}</div>
            <h3 className="timeline-title">{item.title}</h3>
            <p className="timeline-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
