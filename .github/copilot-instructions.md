# Copilot instructions

2D pixel art exploration game running in the browser (TypeScript + HTML canvas, Vite).

- Commands: `npm run dev`, `npm run lint` (tsc), `npm test` (Vitest), `npm run build`.
- `src/engine/` is game-agnostic (renderer, fixed-timestep loop, input, camera, tilemap, sprites).
  `src/game/` holds content and scenes. Keep that split.
- Pixel-perfect rules: draw at the 320x180 virtual resolution from `src/engine/config.ts`,
  round draw positions, never enable image smoothing, take colours from `src/game/palette.ts`.
- `tsconfig.json` enables `erasableSyntaxOnly`: no enums, namespaces or constructor parameter
  properties — declare class fields explicitly.
- Unit tests live next to the code as `*.test.ts` and run in Node (no DOM); keep engine logic
  DOM-free where possible so it stays testable.
- Design documents (proposal, GDD, lore, art direction) live in `docs/`.
