import { Camera } from '../engine/camera';
import { TILE_SIZE } from '../engine/config';
import type { Input } from '../engine/input';
import { rectsOverlap, type Rect } from '../engine/math';
import type { Renderer } from '../engine/renderer';
import type { Scene } from '../engine/scene';
import { moveAndCollide, TileMap } from '../engine/tilemap';
import { LEGEND, TEST_MAP } from './maps';
import { PALETTE } from './palette';
import type { Sprites } from './sprites';

/** Pixels per second. */
const PLAYER_SPEED = 60;

interface Relic {
  rect: Rect;
  found: boolean;
}

/**
 * Placeholder exploration scene: walk around a tile map, collide with walls,
 * and discover relics. Exists to prove the engine works end to end.
 */
export class WorldScene implements Scene {
  readonly map = new TileMap(TEST_MAP, LEGEND, TILE_SIZE);
  readonly camera: Camera;
  /** Player hitbox in world pixels (feet area, smaller than the sprite). */
  player: Rect;
  relics: Relic[];
  private message = 'Explore. Find the relics. [WASD/Arrows]';
  private messageTimer = 4;

  private readonly sprites: Sprites;

  constructor(sprites: Sprites, viewWidth: number, viewHeight: number) {
    this.sprites = sprites;
    this.camera = new Camera(viewWidth, viewHeight);
    const start = this.map.find('P')[0] ?? { col: 1, row: 1 };
    this.player = { x: start.col * TILE_SIZE + 3, y: start.row * TILE_SIZE + 6, w: 10, h: 8 };
    this.relics = this.map.find('R').map(({ col, row }) => ({
      rect: { x: col * TILE_SIZE + 4, y: row * TILE_SIZE + 4, w: 8, h: 8 },
      found: false,
    }));
  }

  update(dt: number, input: Input): void {
    const axis = input.axis();
    this.player = moveAndCollide(this.map, this.player, axis.x * PLAYER_SPEED * dt, axis.y * PLAYER_SPEED * dt);

    for (const relic of this.relics) {
      if (!relic.found && rectsOverlap(this.player, relic.rect)) {
        relic.found = true;
        const count = this.relics.filter((r) => r.found).length;
        this.showMessage(`A fragment of a forgotten age (${count}/${this.relics.length})`);
      }
    }

    if (this.messageTimer > 0) this.messageTimer -= dt;
    this.camera.follow(
      { x: this.player.x + this.player.w / 2, y: this.player.y + this.player.h / 2 },
      this.map.width,
      this.map.height,
    );
  }

  render(r: Renderer): void {
    r.clear(PALETTE.void);
    const cam = this.camera;
    const firstCol = Math.floor(cam.x / TILE_SIZE);
    const firstRow = Math.floor(cam.y / TILE_SIZE);
    const lastCol = Math.floor((cam.x + r.width) / TILE_SIZE);
    const lastRow = Math.floor((cam.y + r.height) / TILE_SIZE);

    for (let row = firstRow; row <= lastRow; row++) {
      for (let col = firstCol; col <= lastCol; col++) {
        const tile = this.map.tileAt(col, row);
        if (tile === undefined) continue;
        const x = col * TILE_SIZE - cam.x;
        const y = row * TILE_SIZE - cam.y;
        if (tile === '#') {
          r.image(this.sprites.wall, x, y);
        } else {
          r.rect(x, y, TILE_SIZE, TILE_SIZE, PALETTE.shadow);
          r.image(this.sprites.floor, x, y);
        }
      }
    }

    for (const relic of this.relics) {
      if (!relic.found) r.image(this.sprites.relic, relic.rect.x - cam.x, relic.rect.y - cam.y);
    }

    // Sprite is 10x14; align its bottom with the bottom of the hitbox.
    r.image(this.sprites.player, this.player.x - cam.x, this.player.y + this.player.h - 13 - cam.y);

    if (this.messageTimer > 0) {
      r.rect(0, r.height - 14, r.width, 14, PALETTE.ink);
      r.text(this.message, 4, r.height - 11, PALETTE.bone);
    }
  }

  private showMessage(text: string): void {
    this.message = text;
    this.messageTimer = 3;
  }
}
