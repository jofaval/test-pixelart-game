/** Upper bound for a single frame's delta, avoids a "spiral of death" after tab switches. */
export const MAX_FRAME_TIME = 0.25;

/**
 * Fixed-timestep accumulator. Feed it real elapsed time; it tells you how many
 * fixed simulation steps to run and the interpolation factor for rendering.
 */
export class FixedStep {
  private accumulator = 0;

  readonly step: number;

  constructor(step: number) {
    this.step = step;
  }

  /** Returns the number of simulation steps to run for `elapsedSeconds` of real time. */
  advance(elapsedSeconds: number): number {
    this.accumulator += Math.min(Math.max(elapsedSeconds, 0), MAX_FRAME_TIME);
    let steps = 0;
    while (this.accumulator >= this.step) {
      this.accumulator -= this.step;
      steps++;
    }
    return steps;
  }

  /** Fraction (0..1) of the next step already accumulated. */
  get alpha(): number {
    return this.accumulator / this.step;
  }
}

export interface LoopCallbacks {
  update(dt: number): void;
  render(alpha: number): void;
}

/** Starts a requestAnimationFrame loop. Returns a function that stops it. */
export function startLoop(tickRate: number, callbacks: LoopCallbacks): () => void {
  const fixed = new FixedStep(1 / tickRate);
  let last = performance.now();
  let handle = 0;

  const frame = (now: number) => {
    const steps = fixed.advance((now - last) / 1000);
    last = now;
    for (let i = 0; i < steps; i++) callbacks.update(fixed.step);
    callbacks.render(fixed.alpha);
    handle = requestAnimationFrame(frame);
  };

  handle = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(handle);
}
