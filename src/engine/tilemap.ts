import type { Rect } from './math';

export interface TileType {
  solid: boolean;
}

/**
 * Grid of tile characters (one string per row). Characters are looked up in a legend,
 * which keeps hand-authored maps readable in source code.
 */
export class TileMap {
  readonly cols: number;
  readonly rows: number;
  readonly tileSize: number;
  private readonly grid: readonly string[];
  private readonly legend: Readonly<Record<string, TileType>>;

  constructor(grid: readonly string[], legend: Readonly<Record<string, TileType>>, tileSize: number) {
    this.grid = grid;
    this.legend = legend;
    this.tileSize = tileSize;
    if (grid.length === 0) throw new Error('TileMap needs at least one row');
    this.rows = grid.length;
    this.cols = grid[0].length;
    for (const [i, row] of grid.entries()) {
      if (row.length !== this.cols) throw new Error(`TileMap row ${i} has length ${row.length}, expected ${this.cols}`);
      for (const ch of row) {
        if (!(ch in legend)) throw new Error(`TileMap has unknown tile '${ch}' in row ${i}`);
      }
    }
  }

  get width(): number {
    return this.cols * this.tileSize;
  }

  get height(): number {
    return this.rows * this.tileSize;
  }

  /** Tile character at a grid position, or undefined outside the map. */
  tileAt(col: number, row: number): string | undefined {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return undefined;
    return this.grid[row][col];
  }

  /** Outside the map counts as solid so entities cannot leave it. */
  isSolid(col: number, row: number): boolean {
    const ch = this.tileAt(col, row);
    return ch === undefined || this.legend[ch].solid;
  }

  /** True if any tile touched by the rectangle (in world pixels) is solid. */
  collides(rect: Rect): boolean {
    const left = Math.floor(rect.x / this.tileSize);
    const right = Math.floor((rect.x + rect.w - 1) / this.tileSize);
    const top = Math.floor(rect.y / this.tileSize);
    const bottom = Math.floor((rect.y + rect.h - 1) / this.tileSize);
    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (this.isSolid(col, row)) return true;
      }
    }
    return false;
  }

  /** Grid positions of every occurrence of a tile character. */
  find(ch: string): { col: number; row: number }[] {
    const result: { col: number; row: number }[] = [];
    this.grid.forEach((line, row) => {
      for (let col = 0; col < line.length; col++) if (line[col] === ch) result.push({ col, row });
    });
    return result;
  }
}

/**
 * Moves a rectangle by (dx, dy), resolving each axis separately so entities slide along walls.
 * Movement is done pixel by pixel, which is exact for the small speeds used in pixel art games.
 */
export function moveAndCollide(map: TileMap, rect: Rect, dx: number, dy: number): Rect {
  const result = { ...rect };
  for (const axis of ['x', 'y'] as const) {
    const delta = axis === 'x' ? dx : dy;
    const sign = Math.sign(delta);
    let remaining = Math.abs(delta);
    while (remaining > 0) {
      const stepSize = Math.min(1, remaining);
      const next = { ...result, [axis]: result[axis] + sign * stepSize };
      if (map.collides(next)) break;
      result[axis] = next[axis];
      remaining -= stepSize;
    }
  }
  return result;
}
