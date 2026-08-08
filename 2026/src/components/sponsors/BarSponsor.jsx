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
      sponsorName="Bar & Refreshment Station"
      description="Sponsor the central social hub of the event! Includes main bar area banner, logo placement on drink menus, and special announcements."
      location="Main Hall Bar & Lounge"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl=""
    />
  );
}
