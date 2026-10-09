# Art direction

> Slice direction: **weathered enamel, living cloth**. Procedural pixel scenes
> establish the look; a broader bespoke asset pipeline is not yet committed.

## Technical baseline (already implemented)

- Virtual resolution: 320x180, integer-scaled to the window.
- Tile size: 16x16. Route-reader sprite: 10x14.
- Palette defined in `src/game/palette.ts`.

## Aesthetic

Three-quarter overhead 2D. Sharp, limited-palette marks, not bloom or depth-of-field.
Chalk monuments and mineral water contrast with fabric, repaired pottery, and
garden rows. Architecture rises above its collision footprint; depth sorting
places walkers behind or before facades. Every draw position is pixel-snapped.

## Palette

All game and interface colors come from `src/game/palette.ts`: aubergine shadows,
chalk limestone, oxidized teal, rust-red enamel, restrained saffron, and living
greens. Meaning also uses shapes and labels, never color alone.

## Characters & animation

Saffron scarf and teal coat distinguish the route-reader. Residents have unique
clothing and contextual names. Small walking motion, cloth flutter, water
ripples, and moving counterweights supply life without smoothing. Reduced-motion
mode freezes ambient animation and removes the walk bob.

## Environments

Dominion towers use repeated geometry, narrow recesses, and ownership marks.
Concord repairs interrupt that order with practical cuts and mismatched masonry.
Reedbank adds striped awnings, laundry, kiln light, and cultivated soil. The
settlement's basin visibly fills after a repair; the garden stays green or floods.
The crossing and service passage gain walkable steps when water drains.

## UI & typography

The browser-native frame resembles field notes: restrained serif titles,
plain readable body text, saffron section labels, and dark surfaces. Dialogue
remains outside the low-resolution canvas so text enlargement does not compromise
pixel art. Native dialogs provide keyboard focus containment and scrolling.
