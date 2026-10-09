import { clamp, type Vec2 } from './math';

/** Camera that centres on a target and stays within world bounds. */
export class Camera {
  x = 0;
  y = 0;

  readonly viewWidth: number;
  readonly viewHeight: number;

  constructor(viewWidth: number, viewHeight: number) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }

  follow(target: Vec2, worldWidth: number, worldHeight: number): void {
    this.x = this.clampAxis(target.x - this.viewWidth / 2, worldWidth, this.viewWidth);
    this.y = this.clampAxis(target.y - this.viewHeight / 2, worldHeight, this.viewHeight);
  }

  private clampAxis(value: number, world: number, view: number): number {
    // Worlds smaller than the view are centred.
    if (world <= view) return Math.round((world - view) / 2);
    return Math.round(clamp(value, 0, world - view));
  }
}
