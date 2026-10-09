export type InteractionId =
  | 'ilex'
  | 'mara'
  | 'tovan'
  | 'shrine'
  | 'counterweight'
  | 'reflector'
  | 'bypass'
  | 'sluice'
  | 'seal';

export type Resolution = 'flood' | 'preserve';

export interface GameState {
  notes: ('shrine' | 'toolmarks' | 'seal' | 'bypass')[];
  counterweight: boolean;
  reflector: boolean;
  bypass: boolean;
  resolution: Resolution | null;
  completed: boolean;
}

export interface Panel {
  title: string;
  paragraphs: string[];
  choices?: { label: string; action: Resolution }[];
}

type Note = GameState['notes'][number];
type JournalEntry = { title: string; fact: string; interpretation: string };

const JOURNAL: Record<Note, JournalEntry> = {
  shrine: {
    title: 'A diagram under the offerings',
    fact: 'The shrine reuses a sluice maintenance diagram: seat the counterweight, then align the reflector.',
    interpretation: 'People made a place of care from working stone. Its older purpose can still help them.',
  },
  toolmarks: {
    title: 'Cut, not collapsed',
    fact: 'Aligned light reveals deliberately cut Dominion fastenings, not breaks from a failed reservoir.',
    interpretation: 'Dismantling the network freed the rain from Dominion control, but cut dependent districts off from water.',
  },
  seal: {
    title: 'Who owned the rain?',
    fact: 'A Dominion seal claims ownership of rain and permits its release only by official allocation.',
    interpretation: 'The network supplied connected districts while making their water someone else’s property.',
  },
  bypass: {
    title: 'A Concord repair',
    fact: 'A Concord bypass runs around Mara’s garden. Its intake can be opened under the aligned reflector.',
    interpretation: 'Repairers answered the severed supply with an adaptation, not a return to Dominion rule.',
  },
};

export function initialState(): GameState {
  return {
    notes: [],
    counterweight: false,
    reflector: false,
    bypass: false,
    resolution: null,
    completed: false,
  };
}

function discover(state: GameState, note: Note): void {
  if (!state.notes.includes(note)) state.notes.push(note);
}

function residentPanel(state: GameState, id: 'ilex' | 'mara' | 'tovan'): Panel {
  switch (id) {
    case 'ilex':
      if (state.resolution === 'preserve') {
        return {
          title: 'Ilex — Borrowed Stone',
          paragraphs: [
            '“Water in the village channel, a dry crossing, and Mara’s beds still standing. That is a route I can keep open.”',
            '“We will tend the bypass together. You found a way through; keeping it working belongs to all of us.”',
            'Your work is complete. The village and ruins remain open to explore.',
          ],
        };
      }
      if (state.resolution === 'flood') {
        return {
          title: 'Ilex — Borrowed Stone',
          paragraphs: [
            '“The village has water and the crossing is open. Mara’s garden paid for it. I will not leave that out when I tell people.”',
            '“I can organise seed and hands for new beds. Thank you for the route; now we have work to do for our neighbour.”',
            'Your work is complete. The village and ruins remain open to explore.',
          ],
        };
      }
      return {
        title: 'Ilex — Route steward',
        paragraphs: [
          '“The waterways shifted, flooding the washed crossing while leaving our supply dry. Could you restore village water and the route? Start at the shrine in the washed crossing.”',
          '“Mara grows food below its outlet. Speak to people, read the stone, and come back when you have made your choice. We need a usable route, not a restored empire.”',
        ],
      };
    case 'mara':
      if (state.resolution === 'preserve') {
        return {
          title: 'Mara — Room to keep growing',
          paragraphs: [
            '“Water in the channel, and not a root washed out. I have been checking each row because I can scarcely believe it.”',
            '“I will help clear that bypass. These beds are our work, not something waiting for an older world to return.”',
          ],
        };
      }
      if (state.resolution === 'flood') {
        return {
          title: 'Mara — After the water',
          paragraphs: [
            '“The village needed water. I know. That does not make it easy to see years of growing washed away.”',
            '“I saved some seed on the high shelf. If we choose new ground together, I will plant again. Today, let me be angry.”',
          ],
        };
      }
      return {
        title: 'Mara — Gardener',
        paragraphs: [
          '“Those beds below the outlet feed people now. Open the old flood channel and the water will destroy my garden.”',
          '“I want the village supplied too. Look for another way before you decide that living roots matter less than old stone.”',
        ],
      };
    case 'tovan':
      if (state.resolution === 'preserve') {
        return {
          title: 'Tovan — A useful repair',
          paragraphs: [
            '“A Concord bypass, still useful. Like a repaired cup: not what its first maker intended, and no less worth keeping.”',
            '“Cutting the Dominion’s network freed the rain, but left dependent districts dry. Today you joined a channel without putting its water back under a seal.”',
          ],
        };
      }
      if (state.resolution === 'flood') {
        return {
          title: 'Tovan — What a repair costs',
          paragraphs: [
            '“I can bring Mara pots for the seedlings she saved. Restoring a channel is not the same as repairing everything it touches.”',
            '“The network was deliberately dismantled: rain was freed from Dominion ownership, and dependent districts lost their supply. A necessary freedom could still leave damage to mend.”',
          ],
        };
      }
      return {
        title: 'Tovan — Ceramic repairer',
        paragraphs: [
          '“They say the reservoirs simply failed. I mend ceramics; a crack and a tool cut leave different edges. Look at the fastenings when you can get some light on them.”',
          '“Dominion channels carried water, and Dominion seals decided who could have it. Neither fact tells us that people here live lesser lives.”',
        ],
      };
  }
}

function resolvedSluice(state: GameState): Panel {
  return {
    title: 'Sluice — Water restored',
    paragraphs: [
      state.resolution === 'preserve'
        ? 'The Concord bypass carries water around Mara’s garden. The village supply and crossing are restored; the beds remain intact.'
        : 'The flood channel has restored village water and the crossing, but destroyed Mara’s garden. Closing it now cannot undo that loss.',
      state.completed
        ? 'Ilex has heard your report. You can keep exploring and speaking with the residents.'
        : 'The decision is settled. Return to Ilex at the village to report what happened.',
    ],
  };
}

export function interact(
  state: GameState,
  id: InteractionId,
  choice?: Resolution,
): { state: GameState; panel: Panel } {
  const next: GameState = { ...state, notes: [...state.notes] };
  let panel: Panel;

  switch (id) {
    case 'ilex':
    case 'mara':
    case 'tovan':
      if (id === 'ilex' && next.resolution !== null) next.completed = true;
      panel = residentPanel(next, id);
      break;
    case 'shrine':
      discover(next, 'shrine');
      panel = {
        title: 'Shrine — Borrowed stone',
        paragraphs: [
          'Fresh offerings rest in a reused sluice maintenance diagram. Someone has kept both the flowers and the old lettering clear.',
          'The diagram gives an order: seat the counterweight to open the service passage, then align the reflector to illuminate the sluice controls.',
          'From the washed crossing, go west, then north to the rain court. Its counterweight and sluice belong to this diagram; the service passage entrance lies east of the counterweight.',
        ],
      };
      break;
    case 'counterweight':
      if (!next.notes.includes('shrine')) {
        panel = {
          title: 'Counterweight — An unfamiliar mechanism',
          paragraphs: ['The stone could move, but its safe position is unclear. The shrine in the washed crossing may preserve instructions.'],
        };
        break;
      }
      next.counterweight = true;
      panel = {
        title: 'Counterweight — Service passage open',
        paragraphs: [
          'Following the shrine’s maintenance diagram, the counterweight rests securely in its cradle. The service passage stands open.',
          'Enter the passage east of the counterweight. Beyond it, the reflector can direct light onto the rain court’s dark sluice controls.',
        ],
      };
      break;
    case 'reflector':
      if (!next.counterweight) {
        panel = {
          title: 'Reflector — Out of reach',
          paragraphs: ['The closed service passage blocks the reflector. Seat the counterweight in the rain court first; the shrine in the washed crossing explains how.'],
        };
        break;
      }
      next.reflector = true;
      discover(next, 'toolmarks');
      panel = {
        title: 'Reflector — Cut, not collapsed',
        paragraphs: [
          'The aligned light reveals deliberately cut Dominion fastenings. These reservoirs did not simply fail: someone dismantled their connections.',
          'Cutting the network freed rain from Dominion control, but cut dependent districts off from their supply. Freedom and loss share these toolmarks.',
          'The sluice controls in the rain court are now readable. A side inscription also marks a Concord bypass worth examining before releasing water.',
        ],
      };
      break;
    case 'seal':
      discover(next, 'seal');
      panel = {
        title: 'Dominion seal — Ownership of rain',
        paragraphs: [
          '“RAIN IS THE PROPERTY OF THE DOMINION. RELEASE BY ALLOCATION.” The seal claims ownership, not merely responsibility for maintenance.',
          'Its channels once supplied many homes. The same network made their water conditional on someone else’s permission.',
        ],
      };
      break;
    case 'bypass':
      if (!next.reflector) {
        panel = {
          title: 'Bypass — In shadow',
          paragraphs: ['The side inscription and intake markings are unreadable in the dark. Align the reflector before attempting to use them.'],
        };
        break;
      }
      next.bypass = true;
      discover(next, 'bypass');
      panel = {
        title: 'Bypass — A Concord repair',
        paragraphs: [
          'The light picks out a Concord bypass plan. You open its intake: this side channel can carry water around Mara’s garden.',
          next.resolution === 'flood'
            ? 'The repair can help maintain the supply, but it cannot restore the beds already lost to the flood.'
            : next.resolution === 'preserve'
              ? 'The bypass now keeps the village supplied and the route open, with Mara’s garden intact.'
              : 'At the sluice in the rain court, you can now preserve the garden while restoring both village water and the route.',
        ],
      };
      break;
    case 'sluice':
      if (next.resolution !== null) {
        panel = resolvedSluice(next);
        break;
      }
      if (!next.reflector) {
        panel = {
          title: 'Sluice — Not ready',
          paragraphs: [
            'The release remains closed. Nothing will be flooded until you can read the controls and explicitly choose a route for the water.',
            objective(next).text,
          ],
        };
        break;
      }
      if (choice === 'flood' || (choice === 'preserve' && next.bypass)) {
        next.resolution = choice;
        panel = resolvedSluice(next);
        break;
      }
      panel = {
        title: 'Sluice — Choose where the water goes',
        paragraphs: [
          'Flood restores village water and opens the route, but destroys Mara’s garden. This decision cannot be undone.',
          next.bypass
            ? 'Preserve uses the Concord bypass: village water and the route are restored, and Mara’s garden stays intact. This decision is also final.'
            : 'Preserve is not available without the Concord bypass. You can leave the controls untouched and search for it in the reflector’s light.',
        ],
        choices: [
          { label: 'Flood — garden lost', action: 'flood' },
          ...(next.bypass ? [{ label: 'Preserve — garden intact', action: 'preserve' as const }] : []),
        ],
      };
      break;
  }

  return { state: next, panel };
}

export function objective(state: GameState): { text: string; target: InteractionId } {
  if (state.completed) return { text: 'Complete — water and the route restored. Explore freely or visit Ilex.', target: 'ilex' };
  if (state.resolution !== null) return { text: 'Return to Ilex and report how you restored the water and route.', target: 'ilex' };
  if (!state.notes.includes('shrine')) return { text: 'Read the maintenance diagram at the shrine in the washed crossing.', target: 'shrine' };
  if (!state.counterweight) return { text: 'Seat the counterweight in the rain court to open the service passage.', target: 'counterweight' };
  if (!state.reflector) return { text: 'Enter the passage east of the counterweight and align the reflector.', target: 'reflector' };
  return { text: 'Choose at the sluice in the rain court. A Concord bypass may spare Mara’s garden.', target: 'sluice' };
}

export function journalEntries(state: GameState): JournalEntry[] {
  return state.notes.map((note) => ({ ...JOURNAL[note] }));
}

function isNote(value: unknown): value is Note {
  return value === 'shrine' || value === 'toolmarks' || value === 'seal' || value === 'bypass';
}

export function restoreState(value: unknown): GameState | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const saved = value as Record<string, unknown>;
  const fields = ['notes', 'counterweight', 'reflector', 'bypass', 'resolution', 'completed'];
  if (!fields.every((field) => Object.hasOwn(saved, field))) return null;
  if (!Array.isArray(saved.notes)) return null;

  const notes = [...saved.notes];
  if (!notes.every(isNote) || new Set(notes).size !== notes.length) return null;
  const { counterweight, reflector, bypass, resolution, completed } = saved;
  if (
    typeof counterweight !== 'boolean'
    || typeof reflector !== 'boolean'
    || typeof bypass !== 'boolean'
    || typeof completed !== 'boolean'
  ) return null;
  if (resolution !== null && resolution !== 'flood' && resolution !== 'preserve') return null;

  if (counterweight && !notes.includes('shrine')) return null;
  if (reflector && !counterweight) return null;
  if (reflector !== notes.includes('toolmarks')) return null;
  if (bypass !== notes.includes('bypass') || (bypass && !reflector)) return null;
  if (resolution !== null && !reflector) return null;
  if (resolution === 'preserve' && !bypass) return null;
  if (completed && resolution === null) return null;

  return { notes, counterweight, reflector, bypass, resolution, completed };
}
