import { describe, expect, it } from 'vitest';
import { parseSprite } from './sprite';

describe('parseSprite', () => {
  it('maps characters to colours and treats unknown as transparent', () => {
    const data = parseSprite(['a.', '.a'], { a: '#fff' });
    expect(data).toEqual({ width: 2, height: 2, pixels: ['#fff', null, null, '#fff'] });
  });

  it('rejects ragged rows', () => {
    expect(() => parseSprite(['aa', 'a'], {})).toThrow();
  });
});
