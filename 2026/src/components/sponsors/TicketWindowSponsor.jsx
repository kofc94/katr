import React from 'react';
import BaseSponsorCard from '@common/components/sponsors/BaseSponsorCard';

export default function TicketWindowSponsor() {
  return (
    <BaseSponsorCard
      status="available"
      badgeText="Sponsorship Open"
      categoryTitle="Horse Race Ticket Window Sponsor"
      icon="🎟️"
      placeholderText="Your Logo Here"
      sponsorLogo=""
      sponsorName="Ticket Window"
      description="High-traffic visibility at the race wagering windows where every guest places their bets! Includes custom branded counters and signage."
      location="Wagering & Betting Windows"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl=""
    />
  );
}
