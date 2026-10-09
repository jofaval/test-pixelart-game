import './style.css';
import { TICK_RATE } from './engine/config';
import { Input } from './engine/input';
import { startLoop } from './engine/loop';
import { Renderer } from './engine/renderer';
import type { Scene } from './engine/scene';
import { loadSprites } from './game/sprites';
import { WorldScene } from './game/worldScene';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('Missing #game canvas');

const renderer = new Renderer(canvas);
const input = new Input();
input.attach(window);

const scene: Scene = new WorldScene(loadSprites(), renderer.width, renderer.height);

startLoop(TICK_RATE, {
  update(dt) {
    scene.update(dt, input);
    input.endFrame();
  },
  render(alpha) {
    scene.render(renderer, alpha);
  },
});
