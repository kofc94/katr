import React, { useEffect, useState } from 'react';
import GameModal from './GameModal';
import { getHighScore } from '../game/highscore.js';

/**
 * The `#game` marketing section. Shows a teaser card with a Play button that
 * opens the fullscreen game modal. Kept intentionally light — the game itself
 * only mounts (and loads its assets) once the visitor opts in.
 */
export default function GameSection({ donateHref = '#tickets' }) {
  const [open, setOpen] = useState(false);
  const [best, setBest] = useState(0);

  // read the stored best each time the section is interacted with / mounted
  useEffect(() => {
    setBest(getHighScore());
  }, [open]);

  // lock page scroll while the modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <section id="game" className="section">
      <div className="section-header">
        <div className="section-tag">While You Wait</div>
        <h2 className="section-title">Play “Ride for the Cause”</h2>
        <p className="section-desc">
          Race a wooden horse down the track, leap the obstacles, and collect
          coins for the cause. A quick bit of fun while the countdown ticks!
        </p>
      </div>

      <div className="game-teaser">
        <div className="game-teaser-art" aria-hidden="true">🐎💨</div>
        <div className="game-teaser-body">
          <h3>Ready, set, gallop!</h3>
          <p>One-button endless runner — works on your phone or computer.</p>
          {best > 0 && <p className="game-teaser-best">Your best: {best.toLocaleString()}</p>}
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <span>▶ Play Now</span>
          </button>
        </div>
      </div>

      {open && <GameModal onClose={() => setOpen(false)} donateHref={donateHref} />}
    </section>
  );
}
