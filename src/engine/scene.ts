import type { Input } from './input';
import type { Renderer } from './renderer';

/** A self-contained game state (title screen, world, menu, ...). */
export interface Scene {
  update(dt: number, input: Input): void;
  render(renderer: Renderer, alpha: number): void;
}
