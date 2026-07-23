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
} from './components';
import { eventConfig } from '@year/config/eventConfig';
import Sponsors from '@year/components/Sponsors';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero
          title={eventConfig.title}
          tagline={eventConfig.tagline}
          presenter={eventConfig.presenter}
          dateText={eventConfig.dateText}
          timeText={eventConfig.timeText}
          venueName={eventConfig.venueName}
          venueAddress={eventConfig.venueAddress}
          racesCountText={eventConfig.racesCountText}
          targetDate={eventConfig.targetDate}
          graphicImgSrc={eventConfig.graphicImgSrc}
        />
        <About
          venueName={eventConfig.venueName}
          venueAddress={eventConfig.venueAddress}
        />
        <Tickets
          zeffyFormUrl={eventConfig.zeffyFormUrl}
          zeffyEmbedSrc={eventConfig.zeffyEmbedSrc}
        />
        <HowItWorks
          venueName={eventConfig.venueName}
          venueAddress={eventConfig.venueAddress}
          raceCount={eventConfig.raceCount}
        />
        <Sponsors />
        <Schedule
          venueName={eventConfig.venueName}
          venueAddress={eventConfig.venueAddress}
        />
        <FAQ />
      </main>
      <Footer currentYear={eventConfig.year} />
    </div>
  );
}
