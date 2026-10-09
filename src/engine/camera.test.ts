import { describe, expect, it } from 'vitest';
import { Camera } from './camera';

describe('Camera', () => {
  it('centres on the target', () => {
    const cam = new Camera(100, 50);
    cam.follow({ x: 200, y: 100 }, 1000, 1000);
    expect(cam).toMatchObject({ x: 150, y: 75 });
  });

  it('clamps to world bounds', () => {
    const cam = new Camera(100, 50);
    cam.follow({ x: 0, y: 1000 }, 1000, 1000);
    expect(cam).toMatchObject({ x: 0, y: 950 });
  });

  it('centres worlds smaller than the view', () => {
    const cam = new Camera(100, 50);
    cam.follow({ x: 10, y: 10 }, 60, 50);
    expect(cam).toMatchObject({ x: -20, y: 0 });
  });
});
