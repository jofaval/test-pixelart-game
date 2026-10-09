import { describe, expect, it } from 'vitest';
import { FixedStep, MAX_FRAME_TIME } from './loop';

describe('FixedStep', () => {
  it('runs whole steps and carries the remainder', () => {
    // Binary-exact values avoid floating point noise in assertions.
    const fixed = new FixedStep(0.125);
    expect(fixed.advance(0.1875)).toBe(1);
    expect(fixed.alpha).toBe(0.5);
    expect(fixed.advance(0.0625)).toBe(1);
  });

  it('caps very long frames', () => {
    const fixed = new FixedStep(1 / 64);
    expect(fixed.advance(10)).toBe(MAX_FRAME_TIME * 64);
  });

  it('ignores negative time', () => {
    const fixed = new FixedStep(0.1);
    expect(fixed.advance(-1)).toBe(0);
  });
});
