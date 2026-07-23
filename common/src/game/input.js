// Input binding: keyboard (Space / ArrowUp) + pointer (tap/hold anywhere on the
// canvas). Tap = jump, hold = higher jump. Returns a detach function.
//
// preventDefault on Space and pointerdown stops the page from scrolling while
// the player is jumping. The canvas should also set `touch-action: none`.

export function attachInput(game, canvas) {
  const isJumpKey = (code) => code === 'Space' || code === 'ArrowUp';

  const onKeyDown = (e) => {
    if (!isJumpKey(e.code)) return;
    e.preventDefault();
    if (!e.repeat) game.jumpStart();
  };
  const onKeyUp = (e) => {
    if (!isJumpKey(e.code)) return;
    e.preventDefault();
    game.jumpRelease();
  };
  const onPointerDown = (e) => {
    e.preventDefault();
    game.jumpStart();
  };
  const onPointerUp = () => {
    game.jumpRelease();
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);
  // listen on window for up so a release off-canvas still counts
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  };
}
