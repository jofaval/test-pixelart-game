import { doorOpen, WORLDS, type Region } from './maps';
import { objective, type GameState } from './story';

/** Return the next visible landmark or doorway, not an arrow through a wall. */
export function destination(region: Region, state: GameState): { x: number; y: number } | null {
  const target = objective(state).target;
  const local = WORLDS[region].landmarks.find((point) => point.id === target);
  if (local) return local;
  const visited = new Set<Region>([region]);
  const queue = WORLDS[region].doors
    .filter((door) => doorOpen(door, state))
    .map((first) => ({ region: first.to, first }));
  while (queue.length) {
    const next = queue.shift()!;
    if (visited.has(next.region)) continue;
    visited.add(next.region);
    if (WORLDS[next.region].landmarks.some((point) => point.id === target)) return next.first;
    for (const door of WORLDS[next.region].doors) {
      if (doorOpen(door, state)) queue.push({ region: door.to, first: next.first });
    }
  }
  return null;
}
