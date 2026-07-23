// Ride for the Cause — core game. Framework-agnostic: holds state, steps
// physics in update(dt), and paints to a 2D context in render(ctx). React only
// reads getHud() and subscribes via onEvent().

import {
  VIEW_W,
  VIEW_H,
  GROUND_Y,
  PLAYER_X,
  PLAYER_HITBOX_INSET_X,
  PLAYER_HITBOX_INSET_Y,
  GRAVITY,
  JUMP_VELOCITY,
  HOLD_GRAVITY_SCALE,
  JUMP_CUT_SCALE,
  BASE_SPEED,
  MAX_SPEED,
  SPEED_RAMP,
  SPEED_BOOST_MULT,
  MUD_SLOW_MULT,
  PX_PER_METER,
  COIN_POINTS,
  START_LIVES,
  HIT_IFRAMES,
  INVINCIBLE_DURATION,
  SPEED_DURATION,
  PICKUP_INTERVAL,
} from './constants.js';
import { SPRITES } from './assets.js';
import { aabb, hitbox } from './collision.js';
import { createPlayer } from './entities.js';
import { obstacleInterval, makeObstacle, makePickups } from './spawner.js';

export class Game {
  constructor(images) {
    this.images = images;
    this.onGameOver = null;
    this.onLifeLost = null;
    this.reset();
  }

  reset() {
    this.state = 'idle'; // 'idle' | 'running' | 'gameover'
    this.player = createPlayer();
    this.entities = [];
    this.worldX = 0;
    this.collectedPoints = 0;
    this.lives = START_LIVES;
    this.iFrames = 0;
    this.invincibleTimer = 0; // golden horseshoe
    this.speedTimer = 0; // carrot
    this.slowTimer = 0; // mud
    this.shield = false;
    this.obstacleTimer = 0.6;
    this.pickupTimer = PICKUP_INTERVAL;
    this.pickupIsPowerup = true;
  }

  start() {
    if (this.state !== 'running') {
      this.reset();
      this.state = 'running';
    }
  }

  get score() {
    return Math.floor(this.worldX / PX_PER_METER) + this.collectedPoints;
  }

  get distance() {
    return Math.floor(this.worldX / PX_PER_METER);
  }

  currentSpeed() {
    let speed = Math.min(MAX_SPEED, BASE_SPEED + this.worldX * SPEED_RAMP);
    if (this.speedTimer > 0) speed *= SPEED_BOOST_MULT;
    if (this.slowTimer > 0) speed *= MUD_SLOW_MULT;
    return speed;
  }

  // --- input intents ---
  jumpStart() {
    if (this.state !== 'running') return;
    if (this.player.grounded) {
      this.player.vy = -JUMP_VELOCITY;
      this.player.grounded = false;
      this.player.holding = true;
    }
  }

  jumpRelease() {
    this.player.holding = false;
    if (this.player.vy < 0) this.player.vy *= JUMP_CUT_SCALE;
  }

  // --- simulation ---
  update(dt) {
    if (this.state !== 'running') return;

    // timers
    this.iFrames = Math.max(0, this.iFrames - dt);
    this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
    this.speedTimer = Math.max(0, this.speedTimer - dt);
    this.slowTimer = Math.max(0, this.slowTimer - dt);

    const speed = this.currentSpeed();
    this.worldX += speed * dt;

    this.updatePlayer(dt);
    this.updateSpawns(dt);
    this.updateEntities(dt, speed);
  }

  updatePlayer(dt) {
    const p = this.player;
    p.animTime += dt;
    const rising = p.vy < 0;
    const g = p.holding && rising ? GRAVITY * HOLD_GRAVITY_SCALE : GRAVITY;
    p.vy += g * dt;
    p.y += p.vy * dt;
    const floor = GROUND_Y - p.h;
    if (p.y >= floor) {
      p.y = floor;
      p.vy = 0;
      p.grounded = true;
      p.holding = false;
    }
  }

  updateSpawns(dt) {
    this.obstacleTimer -= dt;
    if (this.obstacleTimer <= 0) {
      this.entities.push(makeObstacle());
      this.obstacleTimer = obstacleInterval(this.worldX);
    }
    this.pickupTimer -= dt;
    if (this.pickupTimer <= 0) {
      this.entities.push(...makePickups(this.pickupIsPowerup));
      this.pickupIsPowerup = !this.pickupIsPowerup;
      this.pickupTimer = PICKUP_INTERVAL;
    }
  }

  updateEntities(dt, speed) {
    const pbox = hitbox(this.player, PLAYER_HITBOX_INSET_X, PLAYER_HITBOX_INSET_Y);
    for (const e of this.entities) {
      e.x -= speed * dt;
      if (e.x + e.w < -20) e.dead = true;
      if (e.dead) continue;
      if (aabb(pbox, hitbox(e, 0.14))) this.handleCollision(e);
    }
    this.entities = this.entities.filter((e) => !e.dead);
  }

  handleCollision(e) {
    if (e.kind === 'collectible') {
      this.collectedPoints += COIN_POINTS;
      e.dead = true;
      return;
    }
    if (e.kind === 'powerup') {
      this.applyPowerup(e.type.effect);
      e.dead = true;
      return;
    }
    // obstacle
    if (e.type.hazard === 'slow') {
      this.slowTimer = 0.15; // refreshed while overlapping the puddle
      return;
    }
    // life hazard
    if (this.invincibleTimer > 0 || this.iFrames > 0) return;
    if (this.shield) {
      this.shield = false;
      this.iFrames = HIT_IFRAMES;
      e.dead = true;
      return;
    }
    this.lives -= 1;
    this.iFrames = HIT_IFRAMES;
    e.dead = true;
    if (this.onLifeLost) this.onLifeLost(this.lives);
    if (this.lives <= 0) this.gameOver();
  }

  applyPowerup(effect) {
    if (effect === 'invincible') this.invincibleTimer = INVINCIBLE_DURATION;
    else if (effect === 'speed') this.speedTimer = SPEED_DURATION;
    else if (effect === 'shield') this.shield = true;
  }

  gameOver() {
    this.state = 'gameover';
    if (this.onGameOver) this.onGameOver(this.score);
  }

  /** Snapshot for the React HUD (called on demand, not per physics tick). */
  getHud() {
    let effect = null;
    if (this.invincibleTimer > 0) effect = { type: 'invincible', remaining: this.invincibleTimer };
    else if (this.speedTimer > 0) effect = { type: 'speed', remaining: this.speedTimer };
    return {
      state: this.state,
      score: this.score,
      distance: this.distance,
      lives: this.lives,
      shield: this.shield,
      effect,
    };
  }

  // --- rendering ---
  render(ctx) {
    this.drawBackground(ctx);
    for (const e of this.entities) this.drawSprite(ctx, e.sprite, e.x, e.y, e.w, e.h);
    this.drawPlayer(ctx);
  }

  drawBackground(ctx) {
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#0b1830');
    sky.addColorStop(1, '#1b3a5b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, GROUND_Y);

    // rolling hills (slow parallax)
    ctx.fillStyle = '#173b3a';
    const hillOff = (this.worldX * 0.2) % 400;
    for (let x = -hillOff; x < VIEW_W; x += 400) {
      ctx.beginPath();
      ctx.arc(x + 120, GROUND_Y, 160, Math.PI, 0);
      ctx.arc(x + 320, GROUND_Y, 120, Math.PI, 0);
      ctx.fill();
    }

    // ground
    ctx.fillStyle = '#3b2c17';
    ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    ctx.fillStyle = '#4a6b3a'; // grass strip along the top of the track
    ctx.fillRect(0, GROUND_Y, VIEW_W, 8);

    // white rail line just above the ground, scrolling with the world
    ctx.strokeStyle = 'rgba(245,245,245,0.5)';
    ctx.lineWidth = 3;
    const dash = (this.worldX % 60);
    ctx.beginPath();
    for (let x = -dash; x < VIEW_W; x += 60) {
      ctx.moveTo(x, GROUND_Y + 22);
      ctx.lineTo(x + 34, GROUND_Y + 22);
    }
    ctx.stroke();
  }

  drawPlayer(ctx) {
    const p = this.player;
    // blink during post-hit i-frames
    if (this.iFrames > 0 && Math.floor(this.iFrames * 12) % 2 === 0) return;

    // active-effect aura behind the horse
    if (this.invincibleTimer > 0) this.drawAura(ctx, 'rgba(251,191,36,0.45)');
    else if (this.shield) this.drawAura(ctx, 'rgba(80,150,230,0.4)');
    else if (this.speedTimer > 0) this.drawAura(ctx, 'rgba(233,124,42,0.35)');

    const meta = SPRITES.horse;
    const frame = p.grounded ? Math.floor(p.animTime * meta.fps) % meta.frames : 1;
    ctx.drawImage(
      this.images.horse,
      frame * meta.frameW, 0, meta.frameW, meta.frameH,
      PLAYER_X, p.y, p.w, p.h
    );
  }

  drawAura(ctx, color) {
    const p = this.player;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(PLAYER_X + p.w / 2, p.y + p.h / 2, p.w * 0.62, p.h * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawSprite(ctx, key, x, y, w, h) {
    const img = this.images[key];
    if (img) ctx.drawImage(img, x, y, w, h);
  }
}
