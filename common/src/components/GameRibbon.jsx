import React, { useEffect, useState } from 'react';
import GameModal from './GameModal';

/**
 * Fixed diagonal ribbon in the top-right corner of the window. Clicking it
 * opens the fullscreen game modal. The game (and its assets) only mount once
 * the visitor opts in.
 */
export default function GameRibbon({ donateHref = '#tickets' }) {
  const [open, setOpen] = useState(false);

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
    <>
      <div className="game-ribbon">
        <button
          type="button"
          className="game-ribbon-band"
          onClick={() => setOpen(true)}
          title="Can't wait for the big day? Play Ride for the Cause!"
          aria-label="Play the Ride for the Cause game"
        >
          <span className="ribbon-l1">🐎 Can’t wait for the big day?</span>
          <span className="ribbon-l2">Play Ride for the Cause!</span>
        </button>
      </div>

      {open && <GameModal onClose={() => setOpen(false)} donateHref={donateHref} />}
    </>
  );
}
