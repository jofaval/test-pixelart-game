import { Camera } from '../engine/camera';
import { TILE_SIZE } from '../engine/config';
import type { Input } from '../engine/input';
import type { Renderer } from '../engine/renderer';
import type { Scene } from '../engine/scene';
import { moveAndCollide } from '../engine/tilemap';
import { createMap, doorOpen, playerAt, WORLDS, type Door, type Landmark } from './maps';
import { destination } from './navigation';
import { PALETTE as P } from './palette';
import { interact, type Panel, type Resolution } from './story';
import { newSave, type Save } from './save';
import type { Sprites } from './sprites';
import { building, landmark, surroundings, terrain, locationLabel } from './worldArt';

interface Events {
  panel(panel: Panel): void;
  changed(): void;
  menu(): void;
  journal(): void;
  prompt(text: string): void;
}

/** Rendering and movement stay separate from the testable narrative state. */
export class WorldScene implements Scene {
  readonly camera: Camera;
  save: Save;
  map;
  paused = true;
  private time = 0;
  private walking = false;
  private readonly sprites: Sprites;
  private readonly events: Events;

  constructor(sprites: Sprites, viewWidth: number, viewHeight: number, events: Events, save = newSave()) {
    this.sprites = sprites;
    this.camera = new Camera(viewWidth, viewHeight);
    this.events = events;
    this.save = save;
    this.map = createMap(save.region, save.state);
    this.follow();
  }

  restore(save: Save): void {
    this.save = save;
    this.map = createMap(save.region, save.state);
    this.follow();
    this.events.changed();
  }

  private follow(): void {
    this.camera.follow(
      { x: this.save.player.x + 5, y: this.save.player.y + 4 },
      this.map.width, this.map.height,
    );
  }

  nearest(): Landmark | Door | undefined {
    const world = WORLDS[this.save.region];
    const player = this.save.player;
    return [...world.landmarks, ...world.doors]
      .map((point) => ({ point, distance: Math.hypot(point.x * TILE_SIZE + 8 - player.x - 5, point.y * TILE_SIZE + 8 - player.y - 4) }))
      .filter(({ distance }) => distance < 27)
      .sort((a, b) => a.distance - b.distance)[0]?.point;
  }

  activate(choice?: Resolution): void {
    const point = this.nearest();
    if (!point) return;
    if ('to' in point) {
      if (!doorOpen(point, this.save.state)) {
        this.events.panel({
          title: point.label,
          paragraphs: [point.requires === 'counterweight'
            ? 'The service gate hangs beneath a ceramic weight. Its crank stands just west of here.'
            : 'Water still fills the underpass. The sluice in the rain court can drain it.'],
        });
        return;
      }
      this.save.region = point.to;
      this.save.player = playerAt(point.arrival.x, point.arrival.y);
      this.map = createMap(this.save.region, this.save.state);
      this.follow();
      this.events.changed();
      return;
    }
    const result = interact(this.save.state, point.id, choice);
    this.save.state = result.state;
    this.map = createMap(this.save.region, this.save.state);
    this.events.changed();
    this.events.panel(result.panel);
  }

  update(dt: number, input: Input): void {
    if (!this.save.settings.reducedMotion) this.time += dt;
    if (this.paused) return;
    if (input.wasPressed('menu')) { this.events.menu(); return; }
    if (input.wasPressed('journal')) { this.events.journal(); return; }
    const axis = input.axis();
    this.walking = axis.x !== 0 || axis.y !== 0;
    this.save.player = moveAndCollide(this.map, this.save.player, axis.x * 68 * dt, axis.y * 68 * dt);
    this.follow();
    if (input.wasPressed('interact')) this.activate();
    const near = this.nearest();
    this.events.prompt(near ? `E · ${near.label}` : 'WASD / Arrows · walk');
  }

  render(r: Renderer): void {
    r.clear(P.ink);
    const { region, state, settings, player } = this.save;
    const { x: cx, y: cy } = this.camera;
    terrain(r, this.map, region, cx, cy, this.time);
    surroundings(r, region, state, cx, cy, this.time);
    for (const door of WORLDS[region].doors) {
      const x = door.x * TILE_SIZE - cx;
      const y = door.y * TILE_SIZE - cy;
      r.rect(x, y + 1, 16, 14, P.shadow);
      r.rect(x + 1, y + 2, 14, 2, doorOpen(door, state) ? P.saffron : P.stoneLight);
      r.rect(x + 3, y + 6, 10, 1, P.chalk);
      r.rect(x + 5, y + 9, 6, 1, P.chalk);
      r.rect(x + 7, y + 12, 2, 1, P.chalk);
    }
    const layers: { y: number; draw(): void }[] = [
      ...WORLDS[region].buildings.map((b) => ({ y: (b.y + b.h) * TILE_SIZE, draw: () => building(r, b, cx, cy, this.time) })),
      ...WORLDS[region].landmarks.map((p) => ({ y: p.y * TILE_SIZE + 14, draw: () => landmark(r, p, state, cx, cy, this.time) })),
      { y: player.y + player.h, draw: () => {
        r.rect(player.x - cx, player.y + 5 - cy, 11, 4, P.shadow);
        const bob = this.walking && !this.paused && !settings.reducedMotion ? Math.floor(this.time * 9) % 2 : 0;
        r.image(this.sprites.player, player.x - cx, player.y - 5 - cy - bob);
      } },
    ];
    layers.sort((a, b) => a.y - b.y).forEach((layer) => layer.draw());
    const near = this.nearest();
    if (near && !this.paused) {
      const x = near.x * TILE_SIZE - cx;
      const y = near.y * TILE_SIZE - cy;
      r.rect(x - 2, y + 15, 20, 1, P.saffron);
      r.rect(x - 2, y + 12, 1, 3, P.saffron);
      r.rect(x + 17, y + 12, 1, 3, P.saffron);
    }
    if (settings.guidance && !state.completed) {
      const target = destination(region, state);
      if (target) {
        const x = Math.max(8, Math.min(r.width - 12, target.x * TILE_SIZE + 8 - cx));
        const y = Math.max(25, Math.min(r.height - 18, target.y * TILE_SIZE - 30 - cy));
        r.rect(x - 3, y, 7, 2, P.saffron);
        r.rect(x - 2, y + 2, 5, 2, P.saffron);
        r.rect(x - 1, y + 4, 3, 2, P.saffron);
        r.rect(x, y + 6, 1, 2, P.saffron);
      }
    }
    r.rect(0, 0, r.width, 15, P.ink);
    r.rect(5, 5, 3, 3, P.saffron);
    r.text(locationLabel(region), 13, 3, P.bone);
    r.rect(0, r.height - 3, r.width, 3, P.ink);
  }
}
