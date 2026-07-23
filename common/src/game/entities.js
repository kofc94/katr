// Entity definitions and factories.
//
// Every entity is a plain object carrying its own sprite key, size, and a
// small behavior descriptor. The Game reads these generically, so adding a new
// obstacle/power-up is just a new table row (plus a sprite).

import { GROUND_Y, PLAYER_X, PLAYER_W, PLAYER_H } from './constants.js';

// hazard: 'life'  -> costs a life on contact (must be jumped)
//         'slow'  -> temporarily slows the horse, no life lost
export const OBSTACLE_TYPES = [
  { key: 'fence', sprite: 'fence', w: 54, h: 64, hazard: 'life', weight: 3 },
  { key: 'haybale', sprite: 'haybale', w: 62, h: 56, hazard: 'life', weight: 3 },
  { key: 'mud', sprite: 'mud', w: 96, h: 28, hazard: 'slow', weight: 2 },
];

// effect consumed by the Game when collected
export const POWERUP_TYPES = [
  { key: 'horseshoe', sprite: 'horseshoe', w: 42, h: 42, effect: 'invincible' },
  { key: 'carrot', sprite: 'carrot', w: 40, h: 44, effect: 'speed' },
  { key: 'shield', sprite: 'shield', w: 40, h: 46, effect: 'shield' },
];

export const COLLECTIBLE_TYPE = { key: 'coin', sprite: 'coin', w: 32, h: 32 };

export function createPlayer() {
  return {
    x: PLAYER_X,
    y: GROUND_Y - PLAYER_H,
    w: PLAYER_W,
    h: PLAYER_H,
    vy: 0,
    grounded: true,
    holding: false,
    animTime: 0,
  };
}

/**
 * Build a moving entity positioned just off the right edge.
 * Ground obstacles rest on GROUND_Y; airborne pickups get an explicit `y`.
 */
export function createEntity(kind, type, spawnX, y) {
  const onGround = kind === 'obstacle';
  return {
    kind, // 'obstacle' | 'powerup' | 'collectible'
    type,
    sprite: type.sprite,
    x: spawnX,
    y: onGround ? groundTop(type) : y,
    w: type.w,
    h: type.h,
    dead: false,
  };
}

/** y of a ground obstacle so its base sits on the track. Mud sinks in a touch. */
function groundTop(type) {
  if (type.hazard === 'slow') return GROUND_Y - Math.round(type.h * 0.7);
  return GROUND_Y - type.h;
}

/** Weighted random pick from OBSTACLE_TYPES. */
export function pickObstacle() {
  const total = OBSTACLE_TYPES.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of OBSTACLE_TYPES) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return OBSTACLE_TYPES[0];
}
