// Local high score persistence. Guarded so private-mode / disabled storage
// never throws into the game loop.

const KEY = 'katr.game.highscore';

export function getHighScore() {
  try {
    return parseInt(window.localStorage.getItem(KEY), 10) || 0;
  } catch {
    return 0;
  }
}

export function setHighScore(value) {
  try {
    window.localStorage.setItem(KEY, String(Math.floor(value)));
  } catch {
    /* ignore */
  }
}
