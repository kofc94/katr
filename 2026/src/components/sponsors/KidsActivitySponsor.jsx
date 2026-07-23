import React from 'react';
import BaseSponsorCard from './BaseSponsorCard';

/**
 * Kids Activity Table Sponsor Card
 * Easily edit this file to customize sponsor name, logo, contact, description, or website URL.
 */
export default function KidsActivitySponsor() {
  return (
    <BaseSponsorCard
      status="available" // Set to 'confirmed' when a sponsor is secured
      badgeText="Sponsorship Open"
      categoryTitle="Kids Activity Table Sponsor"
      icon="🎨"
      placeholderText="Your Logo Here"
      sponsorLogo="" // Add sponsor logo image URL here
      sponsorName="Kids Activity Table"
      description="Support engaging craft projects, games, and entertainment for children attending with families. Includes dedicated activity banner & family recognition."
      location="Family Fun & Activity Zone"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl="" // Add sponsor website URL here when confirmed
    />
  );
}
