import React from 'react';
import CheckInSponsor from './sponsors/CheckInSponsor';
import TicketWindowSponsor from './sponsors/TicketWindowSponsor';
import BarSponsor from './sponsors/BarSponsor';
import RaffleTableSponsor from './sponsors/RaffleTableSponsor';
import KidsActivitySponsor from './sponsors/KidsActivitySponsor';

/**
 * Sponsors Section Panel
 * Displays community partnerships and individual sponsor cards.
 */
export default function Sponsors() {
  return (
    <section id="sponsors" className="section">
      <div className="section-header">
        <div className="section-tag">Community Partnerships</div>
        <h2 className="section-title">Thank You to Our Sponsors</h2>
        <p className="section-desc">
          We are deeply grateful to our community partners who make K'night at the Races possible. 100% of event proceeds directly fund Knights of Columbus Council #94 local charities.
        </p>
      </div>

      <div className="sponsors-grid">
        <CheckInSponsor />
        <TicketWindowSponsor />
        <BarSponsor />
        <RaffleTableSponsor />
        <KidsActivitySponsor />
      </div>
    </section>
  );
}
