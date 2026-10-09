import { describe, expect, it } from 'vitest';
import { integerScale } from './scaling';

describe('integerScale', () => {
  it('picks the largest integer factor that fits', () => {
    expect(integerScale(1920, 1080, 320, 180)).toBe(6);
    expect(integerScale(1000, 1000, 320, 180)).toBe(3);
  });

  it('never goes below 1', () => {
    expect(integerScale(100, 100, 320, 180)).toBe(1);
  });
});
