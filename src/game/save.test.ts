import { describe, expect, it } from 'vitest';
import { decodeSave, newSave, readSave, SAVE_KEY, writeSave } from './save';
import { interact } from './story';
import { playerAt } from './maps';

describe('local saves', () => {
  it('round-trips a fresh journey and settings without sharing objects', () => {
    const save = newSave();
    save.settings.guidance = true;
    expect(decodeSave(JSON.stringify(save))).toEqual(save);
    expect(newSave().settings.guidance).toBe(false);
  });

  it('round-trips both completed outcomes', () => {
    for (const outcome of ['flood', 'preserve'] as const) {
      const save = newSave();
      for (const id of ['shrine', 'counterweight', 'reflector', 'bypass'] as const)
        save.state = interact(save.state, id).state;
      save.state = interact(save.state, 'sluice', outcome).state;
      save.state = interact(save.state, 'ilex').state;
      expect(decodeSave(JSON.stringify(save))).toEqual(save);
    }
  });

  it('rejects corrupt, unsupported, unreachable, or impossible data', () => {
    const save = newSave();
    for (const raw of [null, '', '{', 'null', '[]', '{"version":2}',
      JSON.stringify({ ...save, region: 'constructor' }),
      JSON.stringify({ ...save, region: 'passage' }),
      JSON.stringify({ ...save, player: playerAt(0, 0) }),
      JSON.stringify({ ...save, player: { ...save.player, x: 1e300 } }),
      JSON.stringify({ ...save, player: { ...save.player, x: -1 } }),
      JSON.stringify({ ...save, player: { ...save.player, w: 0 } }),
      JSON.stringify({ ...save, player: { ...save.player, y: '20' } }),
      JSON.stringify({ ...save, state: { ...save.state, completed: true } }),
    ]) expect(decodeSave(raw)).toBeNull();
  });

  it('does not apply invalid setting types', () => {
    const save = newSave();
    const decoded = decodeSave(JSON.stringify({ ...save, settings: { sound: 'yes', guidance: true } }));
    expect(decoded?.settings.sound).toBe(false);
    expect(decoded?.settings.guidance).toBe(true);
  });

  it('handles denied reads and quota failures without stopping play', () => {
    const storage = {
      getItem() { throw new Error('denied'); },
      setItem() { throw new Error('quota'); },
    };
    expect(readSave(storage)).toBeNull();
    expect(writeSave(storage, newSave())).toBe(false);
  });

  it('writes only the namespaced game save', () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => { data.set(key, value); },
    };
    expect(writeSave(storage, newSave())).toBe(true);
    expect([...data.keys()]).toEqual([SAVE_KEY]);
    expect(readSave(storage)).toEqual(newSave());
  });
});
