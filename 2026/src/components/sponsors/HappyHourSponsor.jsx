import React from 'react';
import BaseSponsorCard from '@common/components/sponsors/BaseSponsorCard';

export default function HappyHourSponsor() {
  return (
    <BaseSponsorCard
      status="available"
      badgeText="Sponsorship Open"
      categoryTitle="Happy Hour Sponsor"
      icon="🍸"
      placeholderText="Your Logo Here"
      sponsorLogo=""
      sponsorName=""
      websiteUrl=""
    />
  );
}
