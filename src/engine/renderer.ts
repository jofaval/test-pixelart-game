import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './config';
import { integerScale } from './scaling';

/**
 * Owns the canvas. Draws at a fixed low resolution and lets CSS scale the canvas
 * by an integer factor with `image-rendering: pixelated`.
 */
export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  readonly width = VIRTUAL_WIDTH;
  readonly height = VIRTUAL_HEIGHT;

  readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context not available');
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    const scale = integerScale(window.innerWidth, window.innerHeight, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    this.canvas.style.width = `${VIRTUAL_WIDTH * scale}px`;
    this.canvas.style.height = `${VIRTUAL_HEIGHT * scale}px`;
  }

  clear(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  rect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  image(source: CanvasImageSource, x: number, y: number): void {
    this.ctx.drawImage(source, Math.round(x), Math.round(y));
  }

  text(message: string, x: number, y: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.font = '8px monospace';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(message, Math.round(x), Math.round(y));
  }
}
