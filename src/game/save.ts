import { createMap, playerAt, WORLDS, type Region } from './maps';
import { initialState, restoreState, type GameState } from './story';
import type { Rect } from '../engine/math';

export const SAVE_KEY = 'borrowed-stone.save.v1';
export interface Settings {
  largeText: boolean;
  guidance: boolean;
  sound: boolean;
  reducedMotion: boolean;
}
export interface Save {
  version: 1;
  state: GameState;
  region: Region;
  player: Rect;
  settings: Settings;
}
export const DEFAULT_SETTINGS: Settings = {
  largeText: false,
  guidance: false,
  sound: false,
  reducedMotion: false,
};

export function newSave(settings: Settings = DEFAULT_SETTINGS): Save {
  return {
    version: 1,
    state: initialState(),
    region: 'settlement',
    player: playerAt(13, 10),
    settings: { ...settings },
  };
}

/** Local data is untrusted; never resume a locked region or a solid tile. */
export function decodeSave(raw: string | null): Save | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || typeof data.region !== 'string' ||
        !Object.hasOwn(WORLDS, data.region)) return null;
    const state = restoreState(data.state);
    if (!state || (data.region === 'passage' && !state.counterweight)) return null;
    const player = data.player;
    if (!player || !Number.isFinite(player.x) || !Number.isFinite(player.y) ||
        player.w !== 10 || player.h !== 8) return null;
    const map = createMap(data.region, state);
    if (player.x < 0 || player.y < 0 || player.x + 10 > map.width ||
        player.y + 8 > map.height || map.collides(player)) return null;
    const settings = { ...DEFAULT_SETTINGS };
    for (const key of Object.keys(settings) as (keyof Settings)[]) {
      if (typeof data.settings?.[key] === 'boolean') settings[key] = data.settings[key];
    }
    return { version: 1, state, region: data.region, player: { ...player }, settings };
  } catch {
    return null;
  }
}

export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readSave(storage: SaveStorage): Save | null {
  try {
    return decodeSave(storage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

export function writeSave(storage: SaveStorage, save: Save): boolean {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}
