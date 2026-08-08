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
      sponsorName="Happy Hour at the Lantern Lounge"
      description="Kick off the evening as the host of our 4:30 PM Happy Hour! Includes Lantern Lounge entrance banner, logo placement on lounge signage and drink tickets, and a welcome announcement as guests arrive."
      location="Lantern Lounge"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl=""
    />
  );
}
