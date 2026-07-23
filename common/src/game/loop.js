// Fixed-timestep game loop over requestAnimationFrame.
//
// update() runs in fixed STEP increments (deterministic physics regardless of
// refresh rate); render() runs once per animation frame. The loop keeps
// rendering while paused so the frozen frame stays on screen.

const STEP = 1 / 120; // physics tick (seconds)
const MAX_FRAME = 0.25; // clamp long stalls (tab switch) to avoid spiral-of-death

export function createLoop(update, render) {
  let rafId = null;
  let last = 0;
  let acc = 0;
  let running = false;
  let paused = false;

  const now = () => performance.now() / 1000;

  function frame() {
    if (!running) return;
    const t = now();
    let dt = t - last;
    last = t;
    if (dt > MAX_FRAME) dt = MAX_FRAME;

    if (!paused) {
      acc += dt;
      while (acc >= STEP) {
        update(STEP);
        acc -= STEP;
      }
    }
    render();
    rafId = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      paused = false;
      last = now();
      acc = 0;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
    pause() {
      paused = true;
    },
    resume() {
      if (!paused) return;
      paused = false;
      last = now(); // drop the paused interval so dt doesn't spike
    },
    get isPaused() {
      return paused;
    },
    get isRunning() {
      return running;
    },
  };
}
