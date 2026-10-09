import { bakeSprite, parseSprite, type Palette } from '../engine/sprite';
import { PALETTE } from './palette';

const SPRITE_PALETTE: Palette = {
  k: PALETTE.ink,
  b: PALETTE.bone,
  e: PALETTE.ember,
  s: PALETTE.stone,
  l: PALETTE.stoneLight,
  m: PALETTE.moss,
};

/** 10x14 placeholder wanderer. */
export const PLAYER_ROWS = [
  '...kkkk...',
  '..kbbbbk..',
  '..kbkbkk..',
  '..kbbbbk..',
  '...kkkk...',
  '..ksssskk.',
  '.kssssssk.',
  '.kslsslsk.',
  '.kssssssk.',
  '..ksssskk.',
  '..kskkskk.',
  '..ks..sk..',
  '..kk..kk..',
  '..........',
];

/** 16x16 floor and wall tiles. */
export const FLOOR_ROWS = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => ((x * 7 + y * 13) % 23 === 0 ? 'm' : '.')).join(''),
);

export const WALL_ROWS = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    const brickRow = Math.floor(y / 4);
    const offset = brickRow % 2 === 0 ? 0 : 4;
    if (y % 4 === 3 || (x + offset) % 8 === 7) return 'k';
    return y % 4 === 0 ? 'l' : 's';
  }).join(''),
);

/** Glowing relic marker. */
export const RELIC_ROWS = [
  '...ee...',
  '..ebbe..',
  '.ebbbbe.',
  'ebbeebbe',
  'ebbeebbe',
  '.ebbbbe.',
  '..ebbe..',
  '...ee...',
];

export function loadSprites() {
  return {
    player: bakeSprite(parseSprite(PLAYER_ROWS, SPRITE_PALETTE)),
    floor: bakeSprite(parseSprite(FLOOR_ROWS, SPRITE_PALETTE)),
    wall: bakeSprite(parseSprite(WALL_ROWS, SPRITE_PALETTE)),
    relic: bakeSprite(parseSprite(RELIC_ROWS, SPRITE_PALETTE)),
  };
}

export type Sprites = ReturnType<typeof loadSprites>;
