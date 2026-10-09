import { describe, expect, it } from 'vitest';
import { moveAndCollide, TileMap } from './tilemap';

const legend = { '#': { solid: true }, '.': { solid: false } };
const map = new TileMap(['#####', '#...#', '#...#', '#####'], legend, 10);

describe('TileMap', () => {
  it('reports size and solidity', () => {
    expect(map.width).toBe(50);
    expect(map.height).toBe(40);
    expect(map.isSolid(0, 0)).toBe(true);
    expect(map.isSolid(1, 1)).toBe(false);
    expect(map.isSolid(-1, 1)).toBe(true);
  });

  it('detects rectangle collisions', () => {
    expect(map.collides({ x: 10, y: 10, w: 10, h: 10 })).toBe(false);
    expect(map.collides({ x: 9, y: 10, w: 10, h: 10 })).toBe(true);
  });

  it('rejects malformed maps', () => {
    expect(() => new TileMap(['##', '#'], legend, 10)).toThrow();
    expect(() => new TileMap(['#?'], legend, 10)).toThrow();
  });

  it('finds tiles', () => {
    expect(map.find('.')).toHaveLength(6);
  });
});

describe('moveAndCollide', () => {
  it('moves freely in open space', () => {
    expect(moveAndCollide(map, { x: 10, y: 10, w: 5, h: 5 }, 3, 2)).toMatchObject({ x: 13, y: 12 });
  });

  it('stops at walls and slides along them', () => {
    const moved = moveAndCollide(map, { x: 12, y: 12, w: 5, h: 5 }, -10, 4);
    expect(moved).toMatchObject({ x: 10, y: 16 });
  });
});
