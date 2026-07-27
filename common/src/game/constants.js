// Ride for the Cause — tunable constants.
// All gameplay values live here so balancing is a one-file job.

// Logical (design-time) resolution. The canvas is scaled to fit the viewport
// while physics always run in this coordinate space, so behavior is identical
// on every screen size.
export const VIEW_W = 800;
export const VIEW_H = 450;

// Ground: y of the top of the ground band. Entities and the horse rest here.
export const GROUND_Y = 372;

// Player (horse)
export const PLAYER_X = 96; // fixed horizontal position; world scrolls past it
export const PLAYER_W = 96;
export const PLAYER_H = 72;
export const PLAYER_HITBOX_INSET_X = 0.2; // trims the sprite's empty margins
export const PLAYER_HITBOX_INSET_Y = 0.12;

// Jump physics (px, seconds). Tuned for a ~140px, ~0.7s hop.
export const GRAVITY = 2200;
export const JUMP_VELOCITY = 780;
export const HOLD_GRAVITY_SCALE = 0.55; // lighter gravity while rising + held
export const JUMP_CUT_SCALE = 0.5; // clip upward velocity on early release

// Scroll speed and difficulty ramp
export const BASE_SPEED = 300; // px/s at the start
export const MAX_SPEED = 620;
export const SPEED_RAMP = 0.02; // extra px/s per px traveled
export const SPEED_BOOST_MULT = 1.4; // carrot
export const MUD_SLOW_MULT = 0.55;

// Distance -> meters for scoring/display
export const PX_PER_METER = 40;
export const COIN_POINTS = 25;

// Lives & invincibility
export const START_LIVES = 3;
export const HIT_IFRAMES = 1.2; // post-hit grace (seconds), horse blinks
export const INVINCIBLE_DURATION = 6; // golden horseshoe
export const SPEED_DURATION = 5; // carrot boost

// Spawn cadence (seconds between spawns). Interval shrinks with distance but is
// floored so obstacles are always clearable with a single jump.
export const OBSTACLE_INTERVAL_START = 1.5;
export const OBSTACLE_INTERVAL_MIN = 0.85;
export const OBSTACLE_INTERVAL_RAMP = 0.00005; // per px traveled
export const PICKUP_INTERVAL = 2.6; // power-ups / collectibles
