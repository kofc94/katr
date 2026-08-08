import React from 'react';

export default function Schedule({
  venueName,
  venueAddress,
  raceCount = 5,
  happyHourTimeText = '4:30 PM',
  happyHourVenueName = 'Lantern Lounge',
  timelineItems = [
    {
      time: happyHourTimeText,
      title: 'Happy Hour Begins',
      desc: `Come early! Join us in the ${happyHourVenueName} for drinks and conversation, and catch up with friends before the doors open for the main event.`,
    },
    {
      time: '6:00 PM',
      title: 'Doors Open & Check-In',
      desc: `Check in at ${venueName} (${venueAddress}), pick up your official program, buy raffle tickets, and head to the cash bar.`,
    },
    {
      time: '6:30 PM',
      title: 'Buffet Dinner Served',
      desc: 'Enjoy a hot buffet dinner and appetizers with friends, family, and fellow community members before the races begin.',
    },
    {
      time: '7:15 PM',
      title: 'Post Time / First Race Begins',
      desc: `The trumpet sounds! Wagering windows open before each of the ${raceCount} races — place increments of $2 bets on any horse in the field to boost your odds.`,
    },
    {
      time: 'All Night',
      title: 'Cheer & Collect Your Winnings',
      desc: 'Cheer on the volunteer jockeys as they race wooden horses around the track. Winning tickets collect cash payouts right after each race!',
    },
    {
      time: '8:45 PM',
      title: 'Silent Auction Close & Last Raffle Drawn',
      desc: 'Final bids for silent auction and announcement of the last raffle winners of the night. Make sure to check your tickets!',
    },
    {
      time: '9:15 PM',
      title: `Grand Finale Race ${raceCount} and Grand Prize Raffle Drawing`,
      desc: 'Final feature race of the night with the biggest payout!',
    },
  ],
}) {
  return (
    <section id="schedule" className="section">
      <div className="section-header">
        <div className="section-tag">Race Night Timeline</div>
        <h2 className="section-title">Evening Schedule</h2>
        <p className="section-desc">
          Here's how the evening unfolds, from Happy Hour to the grand finale.
        </p>
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
