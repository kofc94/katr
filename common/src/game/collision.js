// Pure geometry helpers — no game state, easy to unit-test.

/** Axis-aligned bounding-box overlap test. Boxes are {x, y, w, h}. */
export function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Shrink a sprite rect to a fairer hitbox by trimming a fraction of empty
 * margin from each side. insetX/insetY are fractions of width/height.
 */
export function hitbox(e, insetX = 0.16, insetY = insetX) {
  const dx = e.w * insetX;
  const dy = e.h * insetY;
  return { x: e.x + dx, y: e.y + dy, w: e.w - dx * 2, h: e.h - dy * 2 };
}
