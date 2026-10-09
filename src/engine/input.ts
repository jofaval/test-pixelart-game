export type Action = 'up' | 'down' | 'left' | 'right' | 'interact' | 'menu' | 'journal';

/** Default keyboard bindings (KeyboardEvent.code -> action). */
export const DEFAULT_BINDINGS: Readonly<Record<string, Action>> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  KeyE: 'interact',
  Space: 'interact',
  Enter: 'interact',
  Escape: 'menu',
  KeyJ: 'journal',
};

/**
 * Tracks which actions are held, and which were pressed since the last `endFrame()`.
 * Decoupled from the DOM so it can be unit tested; call `attach()` to listen to a window.
 */
export class Input {
  private held = new Set<Action>();
  private pressed = new Set<Action>();

  private readonly bindings: Readonly<Record<string, Action>>;

  constructor(bindings: Readonly<Record<string, Action>> = DEFAULT_BINDINGS) {
    this.bindings = bindings;
  }

  attach(target: Window): void {
    target.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLElement &&
          e.target.closest('button, input, select, textarea, [contenteditable="true"]')) return;
      if (this.keyDown(e.code)) e.preventDefault();
    });
    target.addEventListener('keyup', (e) => this.keyUp(e.code));
    target.addEventListener('blur', () => this.clear());
  }

  /** Returns true if the key is bound to an action. */
  keyDown(code: string): boolean {
    const action = this.bindings[code];
    if (!action) return false;
    if (!this.held.has(action)) this.pressed.add(action);
    this.held.add(action);
    return true;
  }

  keyUp(code: string): void {
    const action = this.bindings[code];
    if (action) this.held.delete(action);
  }

  isDown(action: Action): boolean {
    return this.held.has(action);
  }

  /** True only on the first update after the action was pressed. */
  wasPressed(action: Action): boolean {
    return this.pressed.has(action);
  }

  /** Call once per simulation step, after the scene update. */
  endFrame(): void {
    this.pressed.clear();
  }

  clear(): void {
    this.held.clear();
    this.pressed.clear();
  }

  /** Normalised movement direction from the directional actions. */
  axis(): { x: number; y: number } {
    let x = (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
    let y = (this.isDown('down') ? 1 : 0) - (this.isDown('up') ? 1 : 0);
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  }
}
