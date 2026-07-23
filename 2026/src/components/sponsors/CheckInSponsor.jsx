import React from 'react';
import BaseSponsorCard from './BaseSponsorCard';

/**
 * Check-In Table Sponsor Card
 * Easily edit this file to customize sponsor name, logo, contact, description, or website URL.
 */
export default function CheckInSponsor() {
  return (
    <BaseSponsorCard
      status="available" // Set to 'confirmed' when a sponsor is secured
      badgeText="Sponsorship Open"
      categoryTitle="Check-In Table Sponsor"
      icon="📋"
      placeholderText="Your Logo Here"
      sponsorLogo="" // Add sponsor logo image URL here (e.g. 'assets/sponsors/checkin-sponsor.png')
      sponsorName="Check-In Table"
      description="Welcome every attendee as they arrive! Includes prominent signage and promotional banner placement right at the event entry and registration table."
      location="Welcome & Entry Desk"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl="" // Add sponsor website URL here when confirmed
    />
  );
}
