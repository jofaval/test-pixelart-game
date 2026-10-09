/**
 * Sprites are authored as text: each character is a pixel, looked up in a palette.
 * '.' (or any character missing from the palette) is transparent.
 * This lets art live in source code until a real asset pipeline is chosen.
 */
export type Palette = Readonly<Record<string, string>>;

export interface PixelData {
  width: number;
  height: number;
  /** Row-major colours; null = transparent. */
  pixels: (string | null)[];
}

export function parseSprite(rows: readonly string[], palette: Palette): PixelData {
  const height = rows.length;
  const width = height === 0 ? 0 : rows[0].length;
  const pixels: (string | null)[] = [];
  for (const [i, row] of rows.entries()) {
    if (row.length !== width) throw new Error(`Sprite row ${i} has length ${row.length}, expected ${width}`);
    for (const ch of row) pixels.push(palette[ch] ?? null);
  }
  return { width, height, pixels };
}

/** Rasterises pixel data into an offscreen canvas that can be drawn with drawImage. */
export function bakeSprite(data: PixelData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = data.width;
  canvas.height = data.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context not available');
  data.pixels.forEach((color, i) => {
    if (!color) return;
    ctx.fillStyle = color;
    ctx.fillRect(i % data.width, Math.floor(i / data.width), 1, 1);
  });
  return canvas;
}
