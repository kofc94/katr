import React from 'react';
import BaseSponsorCard from '@common/components/sponsors/BaseSponsorCard';

export default function BarSponsor() {
  return (
    <BaseSponsorCard
      status="available"
      badgeText="Sponsorship Open"
      categoryTitle="Bar Sponsor"
      icon="🍻"
      placeholderText="Your Logo Here"
      sponsorLogo=""
      sponsorName=""
      websiteUrl=""
    />
  );
}
