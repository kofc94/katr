import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Hero,
  About,
  Tickets,
  HowItWorks,
  Schedule,
  FAQ,
  Footer,
  GameRibbon,
} from './components';
import GameModal from './components/GameModal';
import { eventConfig } from '@year/config/eventConfig';
import Sponsors from '@year/components/Sponsors';

export default function App() {
  // The game can be launched from the desktop corner ribbon or the mobile
  // hero banner, so the modal state lives here and both trigger it.
  const [gameOpen, setGameOpen] = useState(false);
  const openGame = () => setGameOpen(true);

  useEffect(() => {
    if (!gameOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [gameOpen]);

  return (
    <div className="app">
      <GameRibbon onPlay={openGame} />
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
          onPlay={openGame}
        />
        <About
          venueName={eventConfig.venueName}
          venueAddress={eventConfig.venueAddress}
          racesText={eventConfig.racesCountText}
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
      <Footer
        currentYear={eventConfig.year}
        availableYears={eventConfig.availableYears}
      />
      {gameOpen && <GameModal onClose={() => setGameOpen(false)} donateHref="#tickets" />}
    </div>
  );
}
