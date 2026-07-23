// Sprite manifest + preloader.
//
// Each PNG is imported so Vite fingerprints and bundles it. To swap in real
// commissioned art later, replace the file in ../assets/game/ with one of the
// same dimensions (and matching frame count for animated strips) — no code
// change needed.

import horse from '../assets/game/horse.png';
import fence from '../assets/game/fence.png';
import haybale from '../assets/game/haybale.png';
import mud from '../assets/game/mud.png';
import horseshoe from '../assets/game/horseshoe.png';
import carrot from '../assets/game/carrot.png';
import shield from '../assets/game/shield.png';
import coin from '../assets/game/coin.png';

// key -> { src, frameW, frameH, frames, fps }
// Animated strips (frames > 1) are laid out horizontally.
export const SPRITES = {
  horse: { src: horse, frameW: 96, frameH: 72, frames: 2, fps: 12 },
  fence: { src: fence, frameW: 54, frameH: 64, frames: 1 },
  haybale: { src: haybale, frameW: 62, frameH: 56, frames: 1 },
  mud: { src: mud, frameW: 96, frameH: 28, frames: 1 },
  horseshoe: { src: horseshoe, frameW: 42, frameH: 42, frames: 1 },
  carrot: { src: carrot, frameW: 40, frameH: 44, frames: 1 },
  shield: { src: shield, frameW: 40, frameH: 46, frames: 1 },
  coin: { src: coin, frameW: 32, frameH: 32, frames: 1 },
};

/** Preload every sprite. Resolves to a { key: HTMLImageElement } map. */
export function loadAssets() {
  const entries = Object.entries(SPRITES);
  return Promise.all(
    entries.map(
      ([key, meta]) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve([key, img]);
          img.onerror = () => reject(new Error(`Failed to load sprite: ${key}`));
          img.src = meta.src;
        })
    )
  ).then((pairs) => Object.fromEntries(pairs));
}
