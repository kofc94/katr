import React from 'react';
import BaseSponsorCard from '@common/components/sponsors/BaseSponsorCard';

export default function RaffleTableSponsor() {
  return (
    <BaseSponsorCard
      status="available"
      badgeText="Sponsorship Open"
      categoryTitle="Raffle Table Sponsor"
      icon="🎁"
      placeholderText="Your Logo Here"
      sponsorLogo=""
      sponsorName="Raffle & Silent Auction Table"
      description="Prominently featured where attendees browse and bid on high-value gift baskets and raffle items. Includes tabletop display & program recognition."
      location="Auction & Prize Center"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl=""
    />
  );
}
