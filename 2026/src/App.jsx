import React from 'react';
import {
  Navbar,
  Hero,
  About,
  Tickets,
  HowItWorks,
  Schedule,
  FAQ,
  Footer,
} from '@common/components';
import Sponsors from './components/Sponsors';
import { eventConfig2026 } from './config/eventConfig';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero
          title={eventConfig2026.title}
          tagline={eventConfig2026.tagline}
          presenter={eventConfig2026.presenter}
          dateText={eventConfig2026.dateText}
          timeText={eventConfig2026.timeText}
          venueName={eventConfig2026.venueName}
          venueAddress={eventConfig2026.venueAddress}
          racesCountText={eventConfig2026.racesCountText}
          targetDate={eventConfig2026.targetDate}
          graphicImgSrc={eventConfig2026.graphicImgSrc}
        />
        <About
          venueName={eventConfig2026.venueName}
          venueAddress={eventConfig2026.venueAddress}
        />
        <Tickets
          zeffyFormUrl={eventConfig2026.zeffyFormUrl}
          zeffyEmbedSrc={eventConfig2026.zeffyEmbedSrc}
        />
        <HowItWorks
          venueName={eventConfig2026.venueName}
          venueAddress={eventConfig2026.venueAddress}
          raceCount={eventConfig2026.raceCount}
        />
        <Sponsors />
        <Schedule
          venueName={eventConfig2026.venueName}
          venueAddress={eventConfig2026.venueAddress}
        />
        <FAQ />
      </main>
      <Footer currentYear={eventConfig2026.year} />
    </div>
  );
}
