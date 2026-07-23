import React from 'react';
import BaseSponsorCard from './BaseSponsorCard';

/**
 * Bar Sponsor Card
 * Easily edit this file to customize sponsor name, logo, contact, description, or website URL.
 */
export default function BarSponsor() {
  return (
    <BaseSponsorCard
      status="available" // Set to 'confirmed' when a sponsor is secured
      badgeText="Sponsorship Open"
      categoryTitle="Bar Sponsor"
      icon="🍻"
      placeholderText="Your Logo Here"
      sponsorLogo="" // Add sponsor logo image URL here
      sponsorName="Bar & Refreshment Station"
      description="Sponsor the central social hub of the event! Includes main bar area banner, logo placement on drink menus, and special announcements."
      location="Main Hall Bar & Lounge"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl="" // Add sponsor website URL here when confirmed
    />
  );
}
