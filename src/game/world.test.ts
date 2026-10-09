import { describe, expect, it } from 'vitest';
import { createMap, doorOpen, playerAt, WORLDS, type Region } from './maps';
import { destination } from './navigation';
import { initialState, interact, type GameState } from './story';
import { newSave } from './save';
import { WorldScene } from './worldScene';
import type { Sprites } from './sprites';
import { Input } from '../engine/input';

function reachable(region: Region, state: GameState, x: number, y: number) {
  const map = createMap(region, state);
  const visited = new Set<string>();
  const queue = [{ x, y }];
  while (queue.length) {
    const next = queue.shift()!;
    const key = `${next.x},${next.y}`;
    if (visited.has(key) || map.isSolid(next.x, next.y)) continue;
    visited.add(key);
    queue.push({ x: next.x + 1, y: next.y }, { x: next.x - 1, y: next.y },
      { x: next.x, y: next.y + 1 }, { x: next.x, y: next.y - 1 });
  }
  return visited;
}

const prepared = () => {
  let state = initialState();
  for (const id of ['shrine', 'counterweight', 'reflector', 'bypass'] as const)
    state = interact(state, id).state;
  return state;
};

describe('authored world routes', () => {
  it('every required landmark and unlocked doorway is reachable at each puzzle phase', () => {
    const stages = [initialState()];
    for (const id of ['shrine', 'counterweight', 'reflector', 'bypass'] as const)
      stages.push(interact(stages.at(-1)!, id).state);
    stages.push(interact(prepared(), 'sluice', 'flood').state);
    stages.push(interact(prepared(), 'sluice', 'preserve').state);
    const starts = { settlement: [13, 15], crossing: [3, 14], courtyard: [15, 19], passage: [3, 10] };
    for (const state of stages) {
      for (const region of Object.keys(WORLDS) as Region[]) {
        if (region === 'passage' && !state.counterweight) continue;
        const [x, y] = starts[region];
        const tiles = reachable(region, state, x, y);
        for (const point of WORLDS[region].landmarks)
          expect(tiles.has(`${point.x},${point.y}`), `${region}: ${point.id}`).toBe(true);
        for (const door of WORLDS[region].doors) {
          if (!doorOpen(door, state)) continue;
          expect(tiles.has(`${door.x},${door.y}`), `${region}: ${door.label}`).toBe(true);
          expect(createMap(door.to, state).collides(playerAt(door.arrival.x, door.arrival.y))).toBe(false);
        }
      }
    }
  });

  it('only resolving the sluice opens the crossing and visibly affects the garden', () => {
    const before = prepared();
    expect(createMap('crossing', before).isSolid(16, 14)).toBe(true);
    const flooded = interact(before, 'sluice', 'flood').state;
    const preserved = interact(before, 'sluice', 'preserve').state;
    for (const state of [flooded, preserved])
      expect(createMap('crossing', state).isSolid(16, 14)).toBe(false);
    expect(createMap('settlement', flooded).tileAt(23, 18)).toBe('~');
    expect(createMap('settlement', preserved).tileAt(23, 18)).toBe('g');
  });

  it('guides to local objectives or the correct unlocked doorway', () => {
    expect(destination('settlement', initialState())).toMatchObject({ to: 'crossing' });
    expect(destination('crossing', initialState())).toMatchObject({ id: 'shrine' });
    const state = interact(interact(initialState(), 'shrine').state, 'counterweight').state;
    expect(destination('courtyard', state)).toMatchObject({ to: 'passage' });
    expect(destination('passage', state)).toMatchObject({ id: 'reflector' });
  });
});

describe('scene integration without a DOM', () => {
  function setup() {
    const panels: string[] = [];
    const scene = new WorldScene({} as Sprites, 320, 180, {
      panel: (panel) => { panels.push(panel.title); },
      changed: () => {},
      menu: () => {},
      journal: () => {},
      prompt: () => {},
    });
    return { scene, panels };
  }

  it('pauses movement and restores the journey position', () => {
    const { scene } = setup();
    const input = new Input();
    input.keyDown('KeyD');
    const start = { ...scene.save.player };
    scene.update(0.1, input);
    expect(scene.save.player).toEqual(start);
    scene.paused = false;
    scene.update(0.1, input);
    expect(scene.save.player.x).toBeGreaterThan(start.x);
    scene.restore(newSave());
    expect(scene.save.player).toEqual(start);
  });

  it('transitions only on interaction and refuses locked doors', () => {
    const { scene, panels } = setup();
    scene.save.player = playerAt(29, 14);
    scene.activate();
    expect(scene.save.region).toBe('crossing');
    scene.save.player = playerAt(6, 2);
    scene.activate();
    expect(scene.save.region).toBe('courtyard');
    scene.save.player = playerAt(29, 14);
    scene.activate();
    expect(scene.save.region).toBe('courtyard');
    expect(panels).toEqual(['Buried service passage']);
  });

  it('applies both choices to the map and preserves them after reporting to Ilex', () => {
    for (const resolution of ['flood', 'preserve'] as const) {
      const { scene } = setup();
      scene.restore({ ...newSave(), state: prepared(), region: 'courtyard', player: playerAt(16, 15) });
      scene.activate();
      expect(scene.save.state.resolution).toBeNull();
      scene.activate(resolution);
      expect(scene.save.state.resolution).toBe(resolution);
      scene.save.player = playerAt(15, 20);
      scene.activate();
      expect(scene.save.region).toBe('settlement');
      scene.save.player = playerAt(15, 12);
      scene.activate();
      expect(scene.save.state.completed).toBe(true);
      expect(scene.map.tileAt(23, 18)).toBe(resolution === 'flood' ? '~' : 'g');
    }
  });
});
