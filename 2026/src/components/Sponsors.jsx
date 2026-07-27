import React from 'react';
import { SponsorsSection } from '@common/components';
import CheckInSponsor from './sponsors/CheckInSponsor';
import TicketWindowSponsor from './sponsors/TicketWindowSponsor';
import BarSponsor from './sponsors/BarSponsor';
import RaffleTableSponsor from './sponsors/RaffleTableSponsor';
import KidsActivitySponsor from './sponsors/KidsActivitySponsor';

/**
 * 2026 Sponsors Panel
 * Renders the shared SponsorsSection container with 2026 specific sponsor cards.
 */
export default function Sponsors() {
  return (
    <SponsorsSection>
      <CheckInSponsor />
      <TicketWindowSponsor />
      <BarSponsor />
      <RaffleTableSponsor />
      <KidsActivitySponsor />
    </SponsorsSection>
  );
}
