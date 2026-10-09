# Design documents

This folder records Borrowed Stone's proposal, implemented browser slice, visual
direction, and author-facing lore. Stakeholder questions remain in the proposal;
further production is not implied by the slice.

| File | Purpose |
| --- | --- |
| [`proposal.md`](proposal.md) | Pitch-level game proposal and open questions for the stakeholder |
| [`gdd.md`](gdd.md) | Game design document (mechanics, systems, progression) |
| [`lore.md`](lore.md) | World bible: history, civilizations, places, factions |
| [`art-direction.md`](art-direction.md) | Aesthetic, palette, resolution, animation rules |

## Kick-off prompt

Use this prompt in a new session to start the proposal phase:

> Create a pixel art game in 2D. Base it around exploration. Deep lore, with great world
> building. Dark fantasy but not a horror game. Ancient stories, with lost to story
> civilizations are the way to go. Use a unique aesthetic, the game should be playable.
> With this in mind, create the proposal and ask questions as if you were a game
> development agency and I was an important stakeholder.

## Technical constraints to keep in mind

- Runs in the browser: TypeScript + canvas, built with Vite (`npm run dev`).
- Virtual resolution 320x180, 16x16 tiles, integer scaling (see `src/engine/config.ts`).
- The engine in `src/engine/` is small on purpose; extend it rather than adding a
  heavy framework unless the proposal justifies it.
- Content in `src/game/` is placeholder and can be replaced freely.
