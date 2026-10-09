# test-pixelart-game

Foundation for a 2D pixel art exploration game. It ships a tiny, dependency-free
engine (TypeScript + HTML canvas, bundled with Vite) and a placeholder playable scene,
so game design and content work can start immediately.

## Quick start

Requires Node.js 22.12+ (CI uses 22).

```sh
npm install
npm run dev       # start the dev server, open the printed URL
npm run lint      # type-check (tsc)
npm test          # unit tests (Vitest)
npm run build     # type-check + production build into dist/
```

Controls: **WASD / Arrow keys** to move, **E / Space / Enter** to interact, **Esc** for menu
(interact and menu are bound but not yet used by the placeholder scene).

## Project layout

```
index.html              Entry page with the #game canvas
src/main.ts             Bootstraps renderer, input, loop and the first scene
src/engine/             Reusable, game-agnostic code
  config.ts             Virtual resolution (320x180), tile size (16), tick rate (60)
  renderer.ts           Canvas wrapper, integer scaling, pixel-snapped drawing
  scaling.ts            Integer scale calculation
  loop.ts               Fixed-timestep game loop
  input.ts              Keyboard -> action mapping (held / pressed)
  scene.ts              Scene interface (update + render)
  camera.ts             Follow camera clamped to world bounds
  tilemap.ts            Text-authored tile maps, collision, move-and-slide
  sprite.ts             Text-authored sprites baked to offscreen canvases
  math.ts               Vec2, Rect, helpers
src/game/               Game-specific content (all placeholder, safe to replace)
  palette.ts            Limited colour palette
  sprites.ts            Pixel sprites authored as character grids
  maps.ts               Tile legend and test map
  worldScene.ts         Placeholder exploration scene
docs/                   Design documents (proposal, GDD, lore bible templates)
```

## Pixel art conventions

- Everything is drawn at a fixed **320x180** virtual resolution and scaled up by an
  **integer** factor (`image-rendering: pixelated`, image smoothing disabled).
- Draw positions are rounded to whole pixels.
- Colours come from `src/game/palette.ts` only.
- Sprites and maps are authored as text grids for now; swap in image assets
  (e.g. Aseprite/Tiled exports placed under `public/`) when the art pipeline is decided.

## Next steps

See [`docs/README.md`](docs/README.md) for the design workflow and the prompt to
kick off the game proposal.
