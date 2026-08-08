import React from 'react';
import BaseSponsorCard from '@common/components/sponsors/BaseSponsorCard';
import ndBalletLogo from '@year/assets/sponsors/nd-ballet.png';

/**
 * Check-In Table Sponsor Card (2026)
 * Easily edit this file to customize sponsor name, logo, or website URL.
 */
export default function CheckInSponsor() {
  return (
    <BaseSponsorCard
      status="confirmed"
      badgeText="Sponsor Confirmed"
      categoryTitle="Check-In Table Sponsor"
      icon="📋"
      sponsorLogo={ndBalletLogo}
      sponsorName="N&D Ballet"
      websiteUrl="https://www.nadballet.com/"
    />
  );
}
