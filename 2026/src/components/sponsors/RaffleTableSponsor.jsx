import React from 'react';
import BaseSponsorCard from './BaseSponsorCard';

/**
 * Raffle Table Sponsor Card
 * Easily edit this file to customize sponsor name, logo, contact, description, or website URL.
 */
export default function RaffleTableSponsor() {
  return (
    <BaseSponsorCard
      status="available" // Set to 'confirmed' when a sponsor is secured
      badgeText="Sponsorship Open"
      categoryTitle="Raffle Table Sponsor"
      icon="🎁"
      placeholderText="Your Logo Here"
      sponsorLogo="" // Add sponsor logo image URL here
      sponsorName="Raffle & Silent Auction Table"
      description="Prominently featured where attendees browse and bid on high-value gift baskets and raffle items. Includes tabletop display & program recognition."
      location="Auction & Prize Center"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl="" // Add sponsor website URL here when confirmed
    />
  );
}
