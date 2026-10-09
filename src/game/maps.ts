import type { TileType } from '../engine/tilemap';
import { TileMap } from '../engine/tilemap';
import { TILE_SIZE } from '../engine/config';
import type { GameState, InteractionId } from './story';

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
  '~': { solid: true },
  '=': { solid: false },
  ':': { solid: false },
  g: { solid: false },
  w: { solid: false },
  s: { solid: false },
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

export type Region = 'settlement' | 'crossing' | 'courtyard' | 'passage';
export interface Landmark {
  id: InteractionId;
  label: string;
  x: number;
  y: number;
}
export interface Door {
  label: string;
  x: number;
  y: number;
  to: Region;
  arrival: { x: number; y: number };
  requires?: 'counterweight' | 'resolution';
}
export interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'home' | 'kiln' | 'tower';
}
export interface World {
  name: string;
  subtitle: string;
  ground: '.' | ':';
  landmarks: Landmark[];
  doors: Door[];
  buildings: Building[];
}

export const WORLDS: Record<Region, World> = {
  settlement: {
    name: 'REEDBANK',
    subtitle: 'New lives. Borrowed foundations.',
    ground: '.',
    landmarks: [
      { id: 'ilex', label: 'Ilex · route steward', x: 15, y: 12 },
      { id: 'mara', label: 'Mara · gardener', x: 23, y: 15 },
      { id: 'tovan', label: 'Tovan · ceramic mender', x: 9, y: 12 },
    ],
    doors: [
      { label: 'The washed crossing', x: 29, y: 14, to: 'crossing', arrival: { x: 3, y: 14 } },
      { label: 'Reservoir courtyard', x: 15, y: 2, to: 'courtyard', arrival: { x: 15, y: 19 } },
    ],
    buildings: [
      { x: 4, y: 8, w: 6, h: 3, kind: 'home' },
      { x: 21, y: 8, w: 6, h: 3, kind: 'home' },
      { x: 5, y: 17, w: 5, h: 3, kind: 'kiln' },
    ],
  },
  crossing: {
    name: 'THE WASHED CROSSING',
    subtitle: 'A king became a bridge.',
    ground: '.',
    landmarks: [
      { id: 'shrine', label: 'The borrowed shrine', x: 8, y: 10 },
      { id: 'seal', label: 'Glazed ownership seal', x: 10, y: 18 },
    ],
    doors: [
      { label: 'Reedbank', x: 2, y: 14, to: 'settlement', arrival: { x: 28, y: 14 } },
      { label: 'Reservoir courtyard', x: 6, y: 2, to: 'courtyard', arrival: { x: 3, y: 14 } },
      { label: 'Under the crossing', x: 28, y: 14, to: 'passage', arrival: { x: 26, y: 18 }, requires: 'resolution' },
    ],
    buildings: [{ x: 23, y: 6, w: 3, h: 3, kind: 'tower' }],
  },
  courtyard: {
    name: 'THE RAIN COURT',
    subtitle: 'Once, even rain had an owner.',
    ground: ':',
    landmarks: [
      { id: 'counterweight', label: 'Ceramic counterweight', x: 25, y: 12 },
      { id: 'sluice', label: 'The old sluice', x: 16, y: 15 },
    ],
    doors: [
      { label: 'Reedbank', x: 15, y: 20, to: 'settlement', arrival: { x: 15, y: 3 } },
      { label: 'The washed crossing', x: 2, y: 14, to: 'crossing', arrival: { x: 6, y: 3 } },
      { label: 'Buried service passage', x: 29, y: 14, to: 'passage', arrival: { x: 3, y: 10 }, requires: 'counterweight' },
    ],
    buildings: [
      { x: 4, y: 5, w: 3, h: 3, kind: 'tower' },
      { x: 24, y: 5, w: 3, h: 3, kind: 'tower' },
    ],
  },
  passage: {
    name: 'BENEATH THE ENAMEL',
    subtitle: 'Someone opened this from within.',
    ground: ':',
    landmarks: [
      { id: 'reflector', label: 'Maintenance reflector', x: 12, y: 10 },
      { id: 'bypass', label: 'Later masonry · bypass', x: 24, y: 6 },
    ],
    doors: [
      { label: 'Return to the rain court', x: 2, y: 10, to: 'courtyard', arrival: { x: 28, y: 14 } },
      { label: 'The drained underpass', x: 27, y: 18, to: 'crossing', arrival: { x: 27, y: 14 }, requires: 'resolution' },
    ],
    buildings: [],
  },
};

/** Authored footprints; architecture is drawn above its collision base. */
export function createMap(region: Region, state: GameState): TileMap {
  const world = WORLDS[region];
  const grid = Array.from({ length: 22 }, (_, y) =>
    Array.from({ length: 32 }, (_, x): string =>
      x === 0 || y === 0 || x === 31 || y === 21 ? '#' : world.ground),
  );
  const fill = (x: number, y: number, w: number, h: number, tile: string) => {
    for (let row = y; row < y + h; row++)
      for (let col = x; col < x + w; col++) grid[row][col] = tile;
  };
  fill(1, 14, 30, 2, '=');
  if (region === 'settlement') {
    fill(15, 1, 2, 20, '=');
    fill(21, 17, 7, 3, state.resolution === 'flood' ? '~' : 'g');
    fill(14, 7, 4, 3, '#');
  } else if (region === 'crossing') {
    fill(6, 1, 2, 14, '=');
    fill(14, 1, 5, 20, '~');
    fill(12, 8, 2, 3, '#');
    fill(19, 8, 2, 3, '#');
    if (state.resolution) fill(14, 14, 5, 2, 's');
  } else if (region === 'courtyard') {
    fill(15, 14, 2, 7, '=');
    fill(11, 6, 11, 1, '#');
    fill(11, 7, 1, 6, '#');
    fill(21, 7, 1, 6, '#');
    fill(12, 7, 9, 6, state.resolution ? ':' : '~');
  } else {
    fill(1, 1, 30, 2, '#');
    fill(5, 4, 3, 4, '#');
    fill(5, 13, 3, 6, '#');
    fill(17, 3, 2, 5, '#');
    fill(17, 13, 2, 6, '#');
    fill(20, 11, 10, 2, state.resolution ? 's' : '~');
    fill(9, 10, 20, 1, '=');
  }
  for (const b of world.buildings) fill(b.x, b.y, b.w, b.h, '#');
  return new TileMap(grid.map((row) => row.join('')), LEGEND, TILE_SIZE);
}

export function doorOpen(door: Door, state: GameState): boolean {
  return !door.requires || Boolean(state[door.requires]);
}

export function playerAt(x: number, y: number) {
  return { x: x * TILE_SIZE + 3, y: y * TILE_SIZE + 6, w: 10, h: 8 };
}
