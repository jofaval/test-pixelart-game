import type { TileType } from '../engine/tilemap';

/**
 * Map legend:
 *   #  wall
 *   .  floor
 *   P  player start (floor)
 *   R  relic / point of interest (floor)
 */
export const LEGEND: Readonly<Record<string, TileType>> = {
  '#': { solid: true },
  '.': { solid: false },
  P: { solid: false },
  R: { solid: false },
};

/** Placeholder test map — replace with real level content. */
export const TEST_MAP = [
  '##############################',
  '#P.......#...................#',
  '#........#.......#####.......#',
  '#..####..#.......#...#...R...#',
  '#..#..#..........#...#.......#',
  '#..#R.#..#.......##.##.......#',
  '#..####..#...................#',
  '#........######....######....#',
  '#..................#....#....#',
  '#####..#######.....#.R..#....#',
  '#..........#.......#....#....#',
  '#..R.......#.......###.##....#',
  '#..........#.................#',
  '#..........#.................#',
  '##############################',
];
