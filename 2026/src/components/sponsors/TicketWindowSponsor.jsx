import React from 'react';
import BaseSponsorCard from './BaseSponsorCard';

/**
 * Horse Race Ticket Window Sponsor Card
 * Easily edit this file to customize sponsor name, logo, contact, description, or website URL.
 */
export default function TicketWindowSponsor() {
  return (
    <BaseSponsorCard
      status="available" // Set to 'confirmed' when a sponsor is secured
      badgeText="Sponsorship Open"
      categoryTitle="Horse Race Ticket Window Sponsor"
      icon="🎟️"
      placeholderText="Your Logo Here"
      sponsorLogo="" // Add sponsor logo image URL here
      sponsorName="Ticket Window"
      description="High-traffic visibility at the race wagering windows where every guest places their bets! Includes custom branded counters and signage."
      location="Wagering & Betting Windows"
      contactEmail="sponsorships@lexingtonkofc.org"
      websiteUrl="" // Add sponsor website URL here when confirmed
    />
  );
}
