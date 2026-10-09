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

  it('binds the sketchbook and clears both held and queued input on pause', () => {
    const input = new Input();
    input.keyDown('KeyJ');
    input.keyDown('KeyW');
    expect(input.wasPressed('journal')).toBe(true);
    input.clear();
    expect(input.wasPressed('journal')).toBe(false);
    expect(input.isDown('up')).toBe(false);
    input.keyDown('KeyW');
    expect(input.wasPressed('up')).toBe(true);
  });
});
