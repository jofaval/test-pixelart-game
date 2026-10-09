import { describe, expect, it } from 'vitest';
import { TILE_SIZE } from '../engine/config';
import { TileMap } from '../engine/tilemap';
import { parseSprite } from '../engine/sprite';
import { LEGEND, TEST_MAP } from './maps';
import { FLOOR_ROWS, PLAYER_ROWS, RELIC_ROWS, WALL_ROWS } from './sprites';

describe('game content', () => {
  it('test map is valid and has exactly one player start', () => {
    const map = new TileMap(TEST_MAP, LEGEND, TILE_SIZE);
    expect(map.find('P')).toHaveLength(1);
  });

  it('sprites are rectangular and tiles match TILE_SIZE', () => {
    for (const rows of [PLAYER_ROWS, RELIC_ROWS]) expect(() => parseSprite(rows, {})).not.toThrow();
    for (const rows of [FLOOR_ROWS, WALL_ROWS]) {
      const data = parseSprite(rows, {});
      expect([data.width, data.height]).toEqual([TILE_SIZE, TILE_SIZE]);
    }
  });
});
