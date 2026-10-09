import { describe, expect, it } from 'vitest';
import {
  initialState,
  interact,
  journalEntries,
  objective,
  restoreState,
} from './story';
import type { GameState, InteractionId, Resolution } from './story';

function advance(ids: InteractionId[], state = initialState()): GameState {
  return ids.reduce((current, id) => interact(current, id).state, state);
}

function readyState(): GameState {
  return advance(['shrine', 'counterweight', 'reflector']);
}

function resolvedState(resolution: Resolution): GameState {
  const ready = resolution === 'preserve' ? advance(['bypass'], readyState()) : readyState();
  return interact(ready, 'sluice', resolution).state;
}

function freeze(state: GameState): GameState {
  Object.freeze(state.notes);
  return Object.freeze(state);
}

describe('Borrowed Stone progression', () => {
  it('starts with independent, empty states and an objective at the shrine', () => {
    const first = initialState();
    const second = initialState();
    expect(first).toEqual({
      notes: [],
      counterweight: false,
      reflector: false,
      bypass: false,
      resolution: null,
      completed: false,
    });
    expect(first).not.toBe(second);
    expect(first.notes).not.toBe(second.notes);
    first.notes.push('seal');
    expect(second.notes).toEqual([]);
    expect(objective(second).target).toBe('shrine');
    expect(journalEntries(second)).toEqual([]);
  });

  it('follows the shrine, counterweight, reflector, sluice, and report chain', () => {
    const start = initialState();
    const shrine = interact(start, 'shrine');
    expect(shrine.state.notes).toEqual(['shrine']);
    expect(shrine.panel.paragraphs.join(' ')).toMatch(/reused sluice maintenance diagram/i);
    expect(objective(shrine.state).target).toBe('counterweight');

    const counterweight = interact(shrine.state, 'counterweight');
    expect(counterweight.state.counterweight).toBe(true);
    expect(counterweight.state.notes).toEqual(['shrine']);
    expect(counterweight.panel.paragraphs.join(' ')).toMatch(/service passage stands open/i);
    expect(objective(counterweight.state).target).toBe('reflector');

    const reflector = interact(counterweight.state, 'reflector');
    expect(reflector.state.reflector).toBe(true);
    expect(reflector.state.notes).toEqual(['shrine', 'toolmarks']);
    expect(reflector.panel.paragraphs.join(' ')).toMatch(/deliberately cut Dominion fastenings/i);
    expect(reflector.panel.paragraphs.join(' ')).toMatch(/freed rain.*cut dependent districts off/i);
    expect(objective(reflector.state).target).toBe('sluice');

    const sluice = interact(reflector.state, 'sluice');
    expect(sluice.state).toEqual(reflector.state);
    expect(sluice.panel.choices?.map((choice) => choice.action)).toEqual(['flood']);
    expect(sluice.panel.paragraphs.join(' ')).toMatch(/destroys Mara’s garden/i);
    expect(sluice.panel.paragraphs.join(' ')).toMatch(/cannot be undone/i);

    const released = interact(sluice.state, 'sluice', 'flood');
    expect(released.state.resolution).toBe('flood');
    expect(released.state.completed).toBe(false);
    expect(objective(released.state).target).toBe('ilex');
    expect(released.panel.choices).toBeUndefined();

    const report = interact(released.state, 'ilex');
    expect(report.state.completed).toBe(true);
    expect(objective(report.state)).toEqual({
      text: expect.stringMatching(/complete.*explore freely/i),
      target: 'ilex',
    });
    expect(report.panel.paragraphs.join(' ')).toMatch(/work is complete/i);
    expect(start).toEqual(initialState());
  });

  it('blocks the counterweight before reading the shrine', () => {
    const state = freeze(initialState());
    const result = interact(state, 'counterweight');
    expect(result.state).toEqual(state);
    expect(result.panel.paragraphs.join(' ')).toMatch(/shrine/i);
  });

  it.each([
    ['before the shrine', []],
    ['after the shrine', ['shrine']],
  ] as [string, InteractionId[]][])('blocks the reflector %s without the counterweight', (_, ids) => {
    const state = freeze(advance(ids));
    const result = interact(state, 'reflector');
    expect(result.state).toEqual(state);
    expect(result.panel.paragraphs.join(' ')).toMatch(/counterweight/i);
  });

  it.each([
    ['before the shrine', [], 'shrine'],
    ['before the counterweight', ['shrine'], 'counterweight'],
    ['before the reflector', ['shrine', 'counterweight'], 'reflector'],
  ] as [string, InteractionId[], InteractionId][])(
    'leaves the sluice locked %s, even with a supplied choice',
    (_, ids, target) => {
      const state = freeze(advance(ids));
      for (const choice of [undefined, 'flood', 'preserve'] as const) {
        const result = interact(state, 'sluice', choice);
        expect(result.state).toEqual(state);
        expect(result.panel.choices).toBeUndefined();
        expect(result.panel.paragraphs).toContain(objective(state).text);
        expect(objective(result.state).target).toBe(target);
      }
    },
  );

  it('does not finish the mission by speaking to Ilex before resolving the sluice', () => {
    for (const state of [initialState(), readyState(), advance(['bypass'], readyState())]) {
      expect(interact(freeze(state), 'ilex').state).toEqual(state);
    }
  });
});

describe('optional discoveries and journal', () => {
  it.each([
    ['before the mission', initialState()],
    ['with the controls lit', readyState()],
    ['after completion', advance(['ilex'], resolvedState('flood'))],
  ])('allows the Dominion seal to be read %s', (_, state) => {
    const before = freeze(state as GameState);
    const result = interact(before, 'seal');
    expect(result.state.notes).toEqual([...before.notes, 'seal']);
    expect(result.panel.paragraphs.join(' ')).toMatch(/property of the Dominion/i);
    expect(result.state.resolution).toBe(before.resolution);
    expect(objective(result.state)).toEqual(objective(before));
    expect(interact(result.state, 'seal').state).toEqual(result.state);
  });

  it.each([
    ['before the shrine', []],
    ['before the counterweight', ['shrine']],
    ['before the reflector', ['shrine', 'counterweight']],
  ] as [string, InteractionId[]][])('cannot read or use the bypass %s', (_, ids) => {
    const state = freeze(advance(ids));
    const result = interact(state, 'bypass');
    expect(result.state).toEqual(state);
    expect(result.state.notes).not.toContain('bypass');
    expect(result.panel.paragraphs.join(' ')).toMatch(/align the reflector/i);
  });

  it('finds and opens the Concord bypass only once the reflector is aligned', () => {
    const ready = freeze(readyState());
    const result = interact(ready, 'bypass');
    expect(result.state.bypass).toBe(true);
    expect(result.state.notes).toEqual(['shrine', 'toolmarks', 'bypass']);
    expect(result.panel.paragraphs.join(' ')).toMatch(/Concord bypass plan/i);
    expect(interact(result.state, 'bypass').state).toEqual(result.state);
    expect(interact(result.state, 'sluice').panel.choices?.map((choice) => choice.action))
      .toEqual(['flood', 'preserve']);
    expect(result.state.resolution).toBeNull();
  });

  it('never lets optional conversations or the seal replace required steps', () => {
    const state = advance(['ilex', 'mara', 'tovan', 'seal', 'bypass', 'reflector', 'counterweight']);
    expect(state).toEqual({ ...initialState(), notes: ['seal'] });
    expect(objective(state).target).toBe('shrine');
    expect(advance(['shrine', 'counterweight', 'reflector'], state).reflector).toBe(true);
  });

  it('keeps observations and interpretations distinct and in discovery order', () => {
    const state = advance(['seal', 'shrine', 'counterweight', 'reflector', 'bypass']);
    const entries = journalEntries(freeze(state));
    expect(entries).toHaveLength(4);
    expect(entries.map((entry) => entry.title)).toEqual([
      'Who owned the rain?',
      'A diagram under the offerings',
      'Cut, not collapsed',
      'A Concord repair',
    ]);
    for (const entry of entries) {
      expect(entry.title).not.toBe('');
      expect(entry.fact).not.toBe('');
      expect(entry.interpretation).not.toBe('');
      expect(entry.fact).not.toBe(entry.interpretation);
    }
    expect(entries[2].fact).toMatch(/deliberately cut/i);
    expect(entries[2].interpretation).toMatch(/freed the rain.*cut dependent districts off/i);
    entries[0].title = 'Changed by a caller';
    expect(journalEntries(state)[0].title).toBe('Who owned the rain?');
  });
});

describe('water choices and endings', () => {
  it('does not release water merely by visiting an available sluice', () => {
    for (const state of [readyState(), advance(['bypass'], readyState())]) {
      const result = interact(freeze(state), 'sluice');
      expect(result.state).toEqual(state);
      expect(result.state.resolution).toBeNull();
      expect(result.panel.choices).toBeDefined();
    }
  });

  it('rejects preserve without the bypass while leaving exploration available', () => {
    const ready = freeze(readyState());
    const blocked = interact(ready, 'sluice', 'preserve');
    expect(blocked.state).toEqual(ready);
    expect(blocked.panel.paragraphs.join(' ')).toMatch(/not available without the Concord bypass/i);
    expect(blocked.panel.choices?.map((choice) => choice.action)).toEqual(['flood']);
    const found = interact(blocked.state, 'bypass').state;
    expect(interact(found, 'sluice', 'preserve').state.resolution).toBe('preserve');
  });

  it('ignores an unknown runtime choice instead of treating it as consent', () => {
    const state = freeze(readyState());
    expect(interact(state, 'sluice', 'unknown' as Resolution).state).toEqual(state);
  });

  it('restores water and the route through flooding while acknowledging the garden loss', () => {
    const result = interact(readyState(), 'sluice', 'flood');
    expect(result.state.resolution).toBe('flood');
    expect(result.state.bypass).toBe(false);
    expect(result.state.completed).toBe(false);
    expect(result.panel.paragraphs.join(' ')).toMatch(/restored village water and the crossing.*destroyed Mara’s garden/i);
  });

  it('preserves the garden, water supply, and route with the bypass', () => {
    const ready = advance(['bypass'], readyState());
    const result = interact(ready, 'sluice', 'preserve');
    expect(result.state.resolution).toBe('preserve');
    expect(result.state.bypass).toBe(true);
    expect(result.state.completed).toBe(false);
    expect(result.panel.paragraphs.join(' ')).toMatch(/supply and crossing are restored.*beds remain intact/i);
  });

  it('still permits the flood choice when the bypass has been found', () => {
    const state = advance(['bypass'], readyState());
    expect(interact(state, 'sluice', 'flood').state.resolution).toBe('flood');
  });

  it.each(['flood', 'preserve'] as const)('never changes a settled %s decision', (resolution) => {
    const settled = freeze(resolvedState(resolution));
    for (const choice of [undefined, 'flood', 'preserve'] as const) {
      const result = interact(settled, 'sluice', choice);
      expect(result.state).toEqual(settled);
      expect(result.panel.choices).toBeUndefined();
    }
  });

  it.each(['flood', 'preserve'] as const)('only completes the %s outcome on returning to Ilex', (resolution) => {
    const resolved = resolvedState(resolution);
    const explored = advance(['mara', 'tovan', 'shrine', 'counterweight', 'reflector', 'seal', 'bypass', 'sluice'], resolved);
    expect(explored.completed).toBe(false);
    const report = interact(explored, 'ilex');
    expect(report.state.completed).toBe(true);
    expect(report.state.resolution).toBe(resolution);
    expect(report.panel.paragraphs.join(' ')).toMatch(/remain open to explore/i);
    expect(interact(report.state, 'ilex')).toEqual(report);
  });

  it('allows late discoveries after completion without rewriting a flood ending', () => {
    const complete = advance(['ilex'], resolvedState('flood'));
    const bypass = interact(freeze(complete), 'bypass');
    expect(bypass.panel.paragraphs.join(' ')).toMatch(/cannot restore the beds/i);
    const explored = advance(['seal', 'mara', 'tovan'], bypass.state);
    expect(explored.notes).toEqual(['shrine', 'toolmarks', 'bypass', 'seal']);
    expect(explored.completed).toBe(true);
    expect(explored.resolution).toBe('flood');
    expect(interact(explored, 'sluice', 'preserve').state).toEqual(explored);
    expect(objective(explored).text).toMatch(/complete/i);
  });

  it.each(['ilex', 'mara', 'tovan'] as const)('gives %s distinct initial, flood, and preserve dialogue', (id) => {
    const initial = interact(initialState(), id).panel.paragraphs.join(' ');
    const flooded = interact(resolvedState('flood'), id).panel.paragraphs.join(' ');
    const preserved = interact(resolvedState('preserve'), id).panel.paragraphs.join(' ');
    expect(new Set([initial, flooded, preserved]).size).toBe(3);
  });

  it('lets residents voice present needs and the costs of both history and repair', () => {
    expect(interact(initialState(), 'ilex').panel.paragraphs.join(' ')).toMatch(/usable route, not a restored empire/i);
    expect(interact(initialState(), 'mara').panel.paragraphs.join(' ')).toMatch(/feed people now/i);
    expect(interact(initialState(), 'tovan').panel.paragraphs.join(' ')).toMatch(/crack and a tool cut/i);
    expect(interact(resolvedState('flood'), 'mara').panel.paragraphs.join(' ')).toMatch(/let me be angry/i);
    expect(interact(resolvedState('preserve'), 'tovan').panel.paragraphs.join(' ')).toMatch(/freed the rain.*dependent districts dry/i);
  });
});

describe('immutable and repeat-safe interaction', () => {
  const ids: InteractionId[] = ['ilex', 'mara', 'tovan', 'shrine', 'counterweight', 'reflector', 'bypass', 'sluice', 'seal'];

  it.each(ids)('never mutates the input when interacting with %s', (id) => {
    for (const state of [initialState(), readyState(), resolvedState('flood'), resolvedState('preserve')]) {
      const snapshot = structuredClone(state);
      const result = interact(freeze(state), id);
      expect(state).toEqual(snapshot);
      expect(result.state).not.toBe(state);
      expect(result.state.notes).not.toBe(state.notes);
      expect(restoreState(result.state)).toEqual(result.state);
      result.state.notes.push('seal');
      expect(state).toEqual(snapshot);
    }
  });

  it.each(ids)('is repeat-safe for %s at every stage', (id) => {
    for (const state of [initialState(), advance(['shrine']), readyState(), resolvedState('flood'), resolvedState('preserve')]) {
      const first = interact(freeze(state), id);
      const repeated = interact(freeze(first.state), id);
      expect(repeated).toEqual(first);
      expect(new Set(repeated.state.notes).size).toBe(repeated.state.notes.length);
    }
  });

  it.each(ids.filter((id) => id !== 'sluice'))('does not interpret a choice sent to %s as a release', (id) => {
    for (const choice of ['flood', 'preserve'] as const) {
      const state = advance(['bypass'], readyState());
      expect(interact(state, id, choice).state.resolution).toBeNull();
    }
  });

  it('does not mutate a state while reading its objective and journal', () => {
    for (const state of [initialState(), advance(['shrine']), readyState(), resolvedState('preserve')]) {
      const snapshot = structuredClone(state);
      objective(freeze(state));
      journalEntries(state);
      expect(state).toEqual(snapshot);
    }
  });
});

describe('save restoration', () => {
  it('round-trips every reachable stage, both outcomes, and late discoveries', () => {
    const states = [
      initialState(),
      advance(['seal']),
      advance(['shrine']),
      advance(['shrine', 'counterweight']),
      readyState(),
      advance(['bypass'], readyState()),
      resolvedState('flood'),
      resolvedState('preserve'),
      advance(['ilex'], resolvedState('flood')),
      advance(['ilex'], resolvedState('preserve')),
      advance(['ilex', 'bypass', 'seal'], resolvedState('flood')),
      advance(['seal', 'shrine', 'counterweight', 'reflector', 'bypass']),
    ];
    for (const state of states) {
      expect(restoreState(JSON.parse(JSON.stringify(state)))).toEqual(state);
      const restored = restoreState(freeze(state));
      expect(restored).toEqual(state);
      expect(restored).not.toBe(state);
      expect(restored?.notes).not.toBe(state.notes);
    }
  });

  it.each([null, undefined, false, true, 0, 1, '', 'saved game', [], ['shrine'], {}].map((value) => ({ value })))(
    'rejects non-state input $value',
    ({ value }) => {
      expect(restoreState(value)).toBeNull();
    },
  );

  it.each(['notes', 'counterweight', 'reflector', 'bypass', 'resolution', 'completed'])(
    'rejects a missing %s field',
    (field) => {
      const missing: Record<string, unknown> = { ...initialState() };
      delete missing[field];
      expect(restoreState(missing)).toBeNull();
    },
  );

  it('rejects a state whose fields are inherited rather than saved', () => {
    expect(restoreState(Object.create(initialState()))).toBeNull();
  });

  it.each(['counterweight', 'reflector', 'bypass', 'completed'])(
    'does not coerce the %s boolean',
    (field) => {
      for (const value of [0, 1, 'true', 'false', null, undefined, [], {}]) {
        expect(restoreState({ ...initialState(), [field]: value })).toBeNull();
      }
    },
  );

  it.each(['', 'FLOOD', 'unknown', 0, false, undefined, {}, []].map((resolution) => ({ resolution })))(
    'rejects an invalid resolution $resolution',
    ({ resolution }) => {
      expect(restoreState({ ...readyState(), resolution })).toBeNull();
    },
  );

  it.each([
    null,
    undefined,
    'shrine',
    {},
    ['unknown'],
    ['SHRINE'],
    ['shrine', 'shrine'],
    [null],
    [undefined],
    [1],
    [{}],
    [['shrine']],
    new Array(1),
  ].map((notes) => ({ notes })))('rejects malformed or duplicated notes $notes', ({ notes }) => {
    expect(restoreState({ ...initialState(), notes })).toBeNull();
  });

  it.each([
    ['counterweight without shrine', { ...initialState(), counterweight: true }],
    ['reflector without counterweight', { ...readyState(), counterweight: false }],
    ['reflector without toolmarks', { ...readyState(), notes: ['shrine'] }],
    ['toolmarks without reflector', { ...readyState(), reflector: false }],
    ['bypass flag without its note', { ...readyState(), bypass: true }],
    ['bypass note without its flag', { ...readyState(), notes: ['shrine', 'toolmarks', 'bypass'] }],
    ['bypass without reflector', { ...advance(['shrine', 'counterweight']), bypass: true, notes: ['shrine', 'bypass'] }],
    ['flood without reflector', { ...initialState(), resolution: 'flood' }],
    ['preserve without reflector', { ...initialState(), resolution: 'preserve' }],
    ['preserve without bypass', { ...readyState(), resolution: 'preserve' }],
    ['completion without resolution', { ...readyState(), completed: true }],
  ])('rejects inconsistent progress: %s', (_, state) => {
    expect(restoreState(state)).toBeNull();
  });

  it('does not require optional lore or bypass discovery to restore a flood ending', () => {
    const flooded = resolvedState('flood');
    expect(flooded.notes).toEqual(['shrine', 'toolmarks']);
    expect(restoreState({ ...flooded, completed: true })).toEqual({ ...flooded, completed: true });
  });

  it('does not require notes to be in a particular discovery order', () => {
    const valid = { ...resolvedState('preserve'), notes: ['bypass', 'seal', 'toolmarks', 'shrine'] };
    expect(restoreState(valid)).toEqual(valid);
  });

  it('copies restored notes so callers cannot mutate the saved input', () => {
    const saved = readyState();
    const restored = restoreState(saved);
    expect(restored).not.toBeNull();
    restored!.notes.push('seal');
    expect(saved.notes).toEqual(['shrine', 'toolmarks']);
  });
});
