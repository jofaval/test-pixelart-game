# Game design document

> Implemented browser slice. See the proposal for decisions still requiring approval.

## Player character & controls

The route-reader wears a teal coat and saffron scarf. Movement uses WASD or arrows;
E, Space, or Enter interacts with a nearby person, mechanism, or marked doorway.
J opens the sketchbook; Escape pauses. Native dialog buttons support Tab/Enter,
and E dismisses ordinary observations (never a consequential choice).
Menus pause movement. Restart requires confirmation and preserves settings.

## Exploration systems

Four connected, authored tile maps with solid architecture and water. Camera and
sprites remain pixel-snapped. Doorway interaction changes maps; the service gate
requires the counterweight, and the underpass requires resolved water flow.

The shrine teaches the sequence. Seat the courtyard counterweight, enter the
passage, align its reflector, then return to the courtyard sluice. Optional
investigation of later masonry in the passage opens the Concord bypass.
Operating the sluice presents explicit irreversible choices; inspection alone
never releases water. The crossing becomes traversable after either outcome.

## Discovery & lore delivery

The shrine and illuminated fastenings are essential discoveries. The ownership
seal and bypass are optional. The sketchbook records observations and
interpretations separately; repeated inspection never duplicates notes.
Residents react to the final water route, including the gardener's loss or relief.

## Progression

Knowledge and access, not stats or resources. Both flood and bypass routes restore
water and the crossing. Only the bypass preserves the garden. Report to Ilex to
complete the commission; exploration remains available afterward. Discovering the
bypass after flooding cannot retroactively repair the garden.

Versioned local saves store progress, position, region, and settings. Save on
actions, transitions, periodic updates, and page exit. Reject malformed saves,
inconsistent puzzle states, locked regions, and positions in solid terrain.
If storage is unavailable, play continues with a visible warning.

## World structure & regions

- **Reedbank:** inhabited hub, three residents, dry/restored village basin, garden.
- **Washed crossing:** broken royal monument, borrowed shrine, ownership seal.
- **Rain court:** reservoir, counterweight, sluice, entrance to service passage.
- **Beneath the enamel:** reflector, cut fastenings, bypass, drained underpass shortcut.

## UI / HUD

Keep the 320×180 world separate from readable browser-native dialogue. The frame
shows the commission, contextual action, and local-save status. The journal and
pause menu are keyboard-operable dialogs. Optional larger text, reduced motion,
and destination guidance are saved. Guidance identifies the next landmark or
doorway; it is not an automatic pathfinder. Keyboard is required in this slice.

## Audio

Opt-in, locally synthesized water texture and quiet ceramic tones; no third-party
assets or network requests. Audio suspends when the page is hidden. All progress
and clues remain available visually with sound disabled.
