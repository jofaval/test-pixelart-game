import './style.css';
import { TICK_RATE } from './engine/config';
import { Input } from './engine/input';
import { startLoop } from './engine/loop';
import { Renderer } from './engine/renderer';
import { PALETTE } from './game/palette';
import { newSave, readSave, writeSave } from './game/save';
import { Soundscape } from './game/sound';
import { loadSprites } from './game/sprites';
import { GameUI } from './game/ui';
import { WorldScene } from './game/worldScene';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('Missing #game canvas');

for (const [name, color] of Object.entries(PALETTE)) {
  document.documentElement.style.setProperty(`--${name}`, color);
}
const renderer = new Renderer(canvas);
const input = new Input();
input.attach(window);

const sound = new Soundscape();
let storage: Storage | null = null;
try { storage = window.localStorage; } catch { /* Storage is optional in private browsers. */ }
const saved = storage ? readSave(storage) : null;
const fresh = newSave();
fresh.settings.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let started = false;
let ui: GameUI;
const persist = () => {
  if (!started) return;
  const success = storage && writeSave(storage, scene.save);
  document.querySelector('#save-status')!.textContent = success
    ? 'LOCAL SAVE · up to date'
    : 'Save unavailable · keep this tab open to continue';
};
const scene = new WorldScene(loadSprites(), renderer.width, renderer.height, {
  panel: (panel) => ui.panel(panel),
  changed: () => { ui.refresh(); persist(); },
  menu: () => ui.menu(),
  journal: () => ui.journal(),
  prompt: (text) => {
    const prompt = document.querySelector('#prompt')!;
    if (prompt.textContent !== text) prompt.textContent = text;
  },
}, saved ?? fresh);

ui = new GameUI({
  save: () => scene.save,
  begin: (resume) => {
    started = true;
    if (!resume) scene.restore(newSave(scene.save.settings));
    ui.refresh();
    persist();
    sound.setEnabled(scene.save.settings.sound);
  },
  pause: () => { scene.paused = true; input.clear(); },
  resume: () => {
    scene.paused = false;
    input.clear();
    canvas.focus();
    sound.setEnabled(scene.save.settings.sound);
    persist();
  },
  choose: (choice) => scene.activate(choice),
  settings: () => {
    ui.refresh();
    sound.setEnabled(scene.save.settings.sound);
    persist();
  },
}, Boolean(saved));
ui.refresh();
ui.intro();
window.setInterval(persist, 2000);
window.addEventListener('pagehide', persist);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    input.clear();
    persist();
    sound.setEnabled(false);
    if (started) ui.menu();
  }
});

startLoop(TICK_RATE, {
  update(dt) {
    scene.update(dt, input);
    input.endFrame();
  },
  render(alpha) {
    void alpha;
    scene.render(renderer);
  },
});
