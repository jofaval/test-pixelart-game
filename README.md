# Borrowed Stone

**The old world is gone. Its stones are still useful.**

A playable, combat-free dark-fantasy exploration slice for desktop browsers.
Read ruins, reopen a water route, and decide what an ancient repair should mean
for the people living there now. TypeScript + HTML canvas, bundled with Vite;
all pixel art and opt-in audio are generated locally, without external assets.

## Quick start

Requires Node.js 22.12+ (CI uses 22).

```sh
npm install
npm run dev       # start the dev server, open the printed URL
npm run lint      # type-check (tsc)
npm test          # unit tests (Vitest)
npm run build     # type-check + production build into dist/
```

## Deployment

The `Deploy to GitHub Pages` workflow builds and deploys the game whenever changes
are pushed to `main` (or when started manually). In the repository settings, set
**Pages → Build and deployment → Source** to **GitHub Actions**. The published site
uses the repository path `/test-pixelart-game/`.

Controls: **WASD / Arrow keys** to move, **E / Space / Enter** to interact,
**J** for sketchbook, **Esc** to pause. Use **Tab / Enter** in menus. Approach a
marked doorway and interact to travel. Keyboard required; touch controls are not
implemented.

The pause menu offers larger dialogue text, navigation assistance, reduced motion,
opt-in sound, and a confirmed restart. Progress and settings autosave locally in
this browser, not an account or cloud. If storage is denied or full, the frame
warns you and play continues. Clearing site data removes the save.

## Your commission

Meet Ilex, Mara, and Tovan in Reedbank. Investigate the reused shrine at the washed
crossing, then follow its maintenance diagram into the rain court and buried
service passage. The sketchbook separates physical observations from interpretations.
Explore before releasing water: a later adaptation can spare a living garden.
Report to Ilex to finish the commission; the changed world remains explorable.

The slice includes four connected areas, one environmental puzzle chain, two
optional discoveries, and two persistent outcomes. It is not a full-length game.

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
src/game/               Game-specific content and progression
  palette.ts            Shared enamel-and-cloth palette (world and interface)
  sprites.ts            Pixel sprites authored as character grids
  maps.ts               Authored regions, landmarks, doors and changing terrain
  story.ts              Pure narrative state, interactions, journal, save invariants
  save.ts               Versioned local saves and location validation
  navigation.ts         Optional next-destination guidance
  worldScene.ts         Movement, interactions, map transitions and depth sorting
  worldArt.ts           Pixel architecture, residents, mechanisms and scenery
  ui.ts                 Accessible dialogue, title, sketchbook and settings
  sound.ts              Opt-in procedural water and ceramic soundscape
docs/                   Proposal, GDD, art direction and author-facing lore
```

## Pixel art conventions

- Everything is drawn at a fixed **320x180** virtual resolution and scaled up by an
  **integer** factor (`image-rendering: pixelated`, image smoothing disabled).
- Draw positions are rounded to whole pixels.
- Colours come from `src/game/palette.ts` only.
- The route-reader uses a text-grid sprite; maps have authored footprints and
  architecture is drawn with pixel primitives. A larger asset pipeline is deferred.

## Next steps

See [`docs/README.md`](docs/README.md) for the design documents and
[`docs/proposal.md`](docs/proposal.md) for the remaining stakeholder questions.
