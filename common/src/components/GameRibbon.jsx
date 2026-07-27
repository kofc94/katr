import React from 'react';

/**
 * Fixed diagonal ribbon in the top-right corner (desktop only — hidden on
 * mobile via CSS, where the hero banner is shown instead). Clicking it invokes
 * onPlay, which opens the shared game modal owned by App.
 */
export default function GameRibbon({ onPlay }) {
  return (
    <div className="game-ribbon">
      <button
        type="button"
        className="game-ribbon-band"
        onClick={onPlay}
        title="Can't wait for the big day? Play Ride for the Cause!"
        aria-label="Play the Ride for the Cause game"
      >
        <span className="ribbon-l1">🐎 Can’t wait for the big day?</span>
        <span className="ribbon-l2">Play Ride for the Cause!</span>
      </button>
    </div>
  );
}
