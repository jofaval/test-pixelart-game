import type { Renderer } from '../engine/renderer';
import type { TileMap } from '../engine/tilemap';
import { TILE_SIZE as T } from '../engine/config';
import { PALETTE as P } from './palette';
import { WORLDS, type Building, type Landmark, type Region } from './maps';
import type { GameState } from './story';

export function terrain(r: Renderer, map: TileMap, region: Region, cx: number, cy: number, time: number): void {
  for (let row = Math.floor(cy / T); row <= Math.floor((cy + r.height) / T); row++) {
    for (let col = Math.floor(cx / T); col <= Math.floor((cx + r.width) / T); col++) {
      const tile = map.tileAt(col, row);
      if (!tile) continue;
      const x = col * T - cx;
      const y = row * T - cy;
      const noise = (col * 13 + row * 7) % 17;
      const stone = region === 'passage' ? P.shadow : P.stone;
      if (tile === '~') {
        r.rect(x, y, T, T, P.water);
        const phase = Math.floor(time * 3 + noise) % 12;
        r.rect(x + (noise % 8), y + phase, 5, 1, P.teal);
        r.rect(x + 8, y + (phase + 7) % 16, 3, 1, P.ripple);
        if (map.tileAt(col - 1, row) !== '~') r.rect(x, y, 1, 16, P.ripple);
      } else if (tile === '#') {
        r.rect(x, y, T, T, stone);
        r.rect(x, y, T, 2, P.stoneLight);
        r.rect(x, y + 14, T, 2, P.ink);
        r.rect(x + 7, y + 2, 1, 6, P.shadow);
        r.rect(x, y + 8, 16, 1, P.shadow);
        r.rect(x + 12, y + 9, 1, 5, P.shadow);
        if (noise < 4) r.rect(x + 2, y + 1, 4, 2, P.moss);
      } else if (tile === 'g') {
        r.rect(x, y, T, T, P.earth);
        for (let i = 0; i < 3; i++) {
          r.rect(x + 2 + i * 5, y + 4, 1, 10, P.shadow);
          r.rect(x + 1 + i * 5, y + 5, 4, 3, P.leaf);
          r.rect(x + 2 + i * 5, y + 3, 2, 6, P.moss);
        }
      } else if (tile === '.' || tile === 'P' || tile === 'R') {
        r.rect(x, y, T, T, P.grass);
        r.rect(x + noise % 12, y + noise % 11, 2, 3, P.moss);
        if (noise < 5) r.rect(x + 9, y + 11, 3, 1, P.leaf);
      } else {
        r.rect(x, y, T, T, tile === '=' ? P.earth : stone);
        r.rect(x + 1, y + 1, 14, 1, tile === '=' ? P.stone : P.stoneLight);
        r.rect(x + 14, y + 1, 1, 13, P.shadow);
        if (noise < 8) r.rect(x + 4, y + 9, 4, 1, P.shadow);
        if (tile === 's') {
          for (let step = 0; step < 4; step++) r.rect(x, y + step * 4, 16, 1, P.chalk);
        }
      }
    }
  }
}

export function building(r: Renderer, b: Building, cx: number, cy: number, time: number): void {
  const x = b.x * T - cx;
  const base = (b.y + b.h) * T - cy;
  const w = b.w * T;
  const h = b.kind === 'tower' ? 79 : 58;
  r.rect(x + 5, base, w + 8, 7, P.shadow);
  r.rect(x, base - h, w, h, P.chalk);
  r.rect(x + w - 10, base - h, 10, h, P.stone);
  r.rect(x + 3, base - h + 3, w - 16, 4, P.bone);
  for (let row = base - h + 12; row < base; row += 12) {
    r.rect(x, row, w - 10, 1, P.stoneLight);
    r.rect(x + (Math.floor(row / 12) % 2 ? 18 : 31), row - 10, 1, 10, P.stoneLight);
  }
  r.rect(x + 7, base - 6, w - 14, 6, P.stoneLight);
  if (b.kind === 'tower') {
    r.rect(x - 3, base - h, w + 6, 6, P.teal);
    r.rect(x + 8, base - h - 9, w - 16, 9, P.stoneLight);
    r.rect(x + 13, base - 58, 18, 33, P.shadow);
    r.rect(x + 18, base - 54, 8, 24, P.teal);
    r.rect(x + 19, base - 42, 6, 2, P.saffron);
    r.rect(x + 21, base - 47, 2, 12, P.saffron);
    r.rect(x + 4, base - 19, 5, 13, P.moss);
  } else {
    r.rect(x - 4, base - h - 6, w + 8, 10, P.ember);
    for (let roof = 0; roof < w; roof += 9) r.rect(x + roof, base - h - 4, 2, 5, P.cloth);
    r.rect(x + 13, base - 25, 16, 25, P.shadow);
    r.rect(x + 15, base - 22, 12, 22, b.kind === 'kiln' ? P.ember : P.earth);
    r.rect(x + w - 32, base - 35, 14, 16, P.ink);
    r.rect(x + w - 30, base - 33, 10, 12, P.saffron);
    r.rect(x + w - 26, base - 33, 2, 12, P.earth);
    const flutter = Math.floor(Math.sin(time * 2 + b.x) * 2);
    for (let strip = 0; strip < w - 12; strip += 8) {
      r.rect(x + 6 + strip, base - 30, 8, 9 + ((strip / 8) % 2 ? flutter : 0),
        (strip / 8) % 2 ? P.bone : P.teal);
    }
    r.rect(x + 6, base - 30, 1, 29, P.earth);
    r.rect(x + w - 6, base - 30, 1, 29, P.earth);
  }
}

export function landmark(r: Renderer, point: Landmark, state: GameState, cx: number, cy: number, time: number): void {
  const x = point.x * T - cx;
  const y = point.y * T - cy;
  r.rect(x + 1, y + 10, 14, 4, P.shadow);
  if (point.id === 'ilex' || point.id === 'mara' || point.id === 'tovan') {
    const cloth = point.id === 'ilex' ? P.cloth : point.id === 'mara' ? P.leaf : P.teal;
    r.rect(x + 3, y - 4, 10, 8, P.ink);
    r.rect(x + 4, y - 3, 7, 6, P.bone);
    r.rect(x + 8, y - 1, 1, 1, P.ink);
    r.rect(x + 2, y + 3, 12, 8, cloth);
    r.rect(x + 4, y + 10, 3, 4, P.ink);
    r.rect(x + 9, y + 10, 3, 4, P.ink);
    r.rect(x + 3, y - 5, 10, 2, cloth);
    if (point.id === 'tovan') r.rect(x + 12, y + 5, 5, 5, P.ember);
  } else if (point.id === 'shrine') {
    r.rect(x - 6, y + 2, 28, 11, P.stone);
    r.rect(x - 8, y, 32, 4, P.chalk);
    r.rect(x, y - 16, 16, 16, P.teal);
    r.rect(x + 2, y - 14, 12, 2, P.ripple);
    r.rect(x + 6, y - 12, 3, 10, P.saffron);
    r.rect(x - 4, y - 5, 4, 5, P.cloth);
    r.rect(x + 16, y - 4, 4, 4, P.leaf);
  } else if (point.id === 'counterweight') {
    r.rect(x - 2, y - 25, 3, 39, P.earth);
    r.rect(x + 17, y - 25, 3, 39, P.earth);
    r.rect(x - 2, y - 25, 22, 3, P.chalk);
    r.rect(x + 8, y - 22, 1, 28, P.bone);
    const lift = state.counterweight ? 14 : 0;
    r.rect(x + 2, y - 3 - lift, 13, 14, P.ember);
    r.rect(x + 4, y - 1 - lift, 9, 2, P.saffron);
    r.rect(x + 12, y - 1 - lift, 2, 10, P.earth);
  } else if (point.id === 'reflector') {
    r.rect(x + 6, y - 8, 3, 20, P.chalk);
    r.rect(x, y - 12, 16, 12, P.saffron);
    r.rect(x + 2, y - 10, 12, 8, state.reflector ? P.bone : P.stone);
    if (state.reflector) {
      for (let i = 1; i < 9; i++) r.rect(x + i * 16, y - i * 3, 8, 1, P.saffron);
    }
  } else if (point.id === 'sluice') {
    r.rect(x - 8, y - 9, 32, 20, P.stoneLight);
    r.rect(x - 5, y - 6, 26, 14, P.teal);
    r.rect(x + 5, y - 11, 4, 25, P.earth);
    r.rect(x - 1, y - 8, 17, 3, P.saffron);
    if (state.resolution) r.rect(x - 5, y + 7, 26, 4, P.ripple);
  } else if (point.id === 'bypass') {
    r.rect(x - 4, y - 9, 24, 22, P.stoneLight);
    r.rect(x - 2, y - 7, 20, 5, P.ember);
    r.rect(x + 4, y - 1, 8, 12, P.teal);
    r.rect(x + (state.bypass ? 3 : 7), y + 2, state.bypass ? 10 : 2, state.bypass ? 2 : 9, P.bone);
  } else {
    r.rect(x - 2, y + 1, 20, 11, P.stoneLight);
    r.rect(x, y + 3, 16, 6, P.ember);
    r.rect(x + 6, y + 3, 3, 6, P.saffron);
  }
  const bob = Math.floor(Math.sin(time * 3) * 1);
  r.rect(x + 7, y - 24 + bob, 2, 2, P.bone);
}

export function surroundings(r: Renderer, region: Region, state: GameState, cx: number, cy: number, time: number): void {
  if (region === 'settlement') {
    const x = 14 * T - cx;
    const y = 7 * T - cy;
    r.rect(x - 2, y - 5, 68, 53, P.stone);
    r.rect(x + 4, y + 1, 56, 40, state.resolution ? P.water : P.earth);
    r.rect(x + 5, y + 3, 54, 2, state.resolution ? P.ripple : P.stoneLight);
    r.rect(x + 26, y + 12, 8, 15, P.chalk);
    r.rect(x + 29, y + 12, 2, 6, P.teal);
    const lineX = 10 * T - cx;
    const lineY = 9 * T - cy;
    r.rect(lineX, lineY, 11 * T, 1, P.earth);
    for (let i = 0; i < 6; i++) {
      const dy = Math.floor(Math.sin(time * 2 + i) * 2);
      r.rect(lineX + 12 + i * 25, lineY + 1, 13, 15 + dy, i % 2 ? P.cloth : P.bone);
      r.rect(lineX + 16 + i * 25, lineY + 3, 1, 10, P.stoneLight);
    }
    for (const [col, row] of [[10, 12], [11, 12], [22, 12], [25, 16], [11, 19]]) {
      const px = col * T - cx;
      const py = row * T - cy;
      r.rect(px, py + 8, 10, 4, P.shadow);
      r.rect(px + 1, py + 2, 8, 9, P.ember);
      r.rect(px + 2, py, 6, 3, P.cloth);
      r.rect(px + 3, py + 1, 4, 1, P.ink);
      r.rect(px + 2, py + 4, 1, 4, P.bone);
    }
    const markerX = 20 * T - cx;
    const markerY = 17 * T - cy;
    r.rect(markerX, markerY - 5, 9, 21, P.stoneLight);
    r.rect(markerX + 2, markerY - 2, 4, 2, P.teal);
    r.rect(markerX + 2, markerY + 3, 5, 1, P.ink);
    r.rect(markerX + 1, markerY + 12, 9, 4, P.moss);
  }
  if (region === 'crossing') {
    const x = 12 * T - cx;
    const y = 8 * T - cy;
    r.rect(x - 10, y - 9, 42, 15, P.chalk);
    r.rect(x - 5, y - 4, 23, 2, P.stone);
    r.rect(x + 8, y - 8, 2, 11, P.stone);
    r.rect(x + 7 * T, y - 3, 29, 9, P.chalk);
    r.rect(x + 7 * T + 5, y - 9, 18, 8, P.stoneLight);
  }
  if (region === 'courtyard') {
    r.rect(11 * T - cx, 6 * T - cy - 8, 11 * T, 7, P.teal);
    for (let i = 0; i < 9; i++) {
      r.rect((12 + i) * T - cx + 3, 6 * T - cy - 6, 3, 3, P.saffron);
    }
  }
  if (region === 'passage' && state.reflector) {
    r.rect(23 * T - cx, 4 * T - cy, 5 * T, 1, P.saffron);
    for (let i = 0; i < 6; i++) {
      r.rect(23 * T - cx + i * 12, 4 * T - cy + 5, 5, 2, P.chalk);
      r.rect(23 * T - cx + i * 12 + 2, 4 * T - cy + 2, 1, 8, P.ink);
    }
  }
}

export function locationLabel(region: Region): string {
  return WORLDS[region].name;
}
