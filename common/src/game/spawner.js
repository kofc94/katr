// Spawn scheduling helpers (pure). The Game owns the timers and entity list;
// these functions decide *when* and *what* to spawn.

import {
  VIEW_W,
  GROUND_Y,
  OBSTACLE_INTERVAL_START,
  OBSTACLE_INTERVAL_MIN,
  OBSTACLE_INTERVAL_RAMP,
} from './constants.js';
import {
  POWERUP_TYPES,
  COLLECTIBLE_TYPE,
  createEntity,
  pickObstacle,
} from './entities.js';

/** Seconds until the next obstacle — shrinks with distance, floored so the
 *  cadence always leaves enough reaction time for a single jump. */
export function obstacleInterval(worldX) {
  const interval = OBSTACLE_INTERVAL_START - worldX * OBSTACLE_INTERVAL_RAMP;
  const jitter = 0.85 + Math.random() * 0.4; // ±, keeps rhythm from feeling robotic
  return Math.max(OBSTACLE_INTERVAL_MIN, interval) * jitter;
}

const SPAWN_X = VIEW_W + 40;

export function makeObstacle() {
  return createEntity('obstacle', pickObstacle(), SPAWN_X);
}

/** Alternate between a power-up and a short run of collectibles. */
export function makePickups(preferPowerup) {
  const y = GROUND_Y - (70 + Math.random() * 90); // reachable jump-arc height
  if (preferPowerup) {
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
    return [createEntity('powerup', type, SPAWN_X, y)];
  }
  // a little arc of 3–5 coins
  const count = 3 + Math.floor(Math.random() * 3);
  const coins = [];
  for (let i = 0; i < count; i++) {
    coins.push(createEntity('collectible', COLLECTIBLE_TYPE, SPAWN_X + i * 46, y));
  }
  return coins;
}
