import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('tracks held and pressed actions', () => {
    const input = new Input();
    expect(input.keyDown('KeyW')).toBe(true);
    expect(input.isDown('up')).toBe(true);
    expect(input.wasPressed('up')).toBe(true);
    input.endFrame();
    expect(input.wasPressed('up')).toBe(false);
    input.keyDown('KeyW'); // key repeat should not re-trigger a press
    expect(input.wasPressed('up')).toBe(false);
    input.keyUp('KeyW');
    expect(input.isDown('up')).toBe(false);
  });

  it('ignores unbound keys', () => {
    expect(new Input().keyDown('KeyZ')).toBe(false);
  });

  it('normalises diagonal movement', () => {
    const input = new Input();
    input.keyDown('ArrowRight');
    input.keyDown('ArrowDown');
    const { x, y } = input.axis();
    expect(Math.hypot(x, y)).toBeCloseTo(1);
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
  });
});
