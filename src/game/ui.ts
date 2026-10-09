import { journalEntries, objective, type Panel, type Resolution } from './story';
import type { Save, Settings } from './save';

interface Commands {
  save(): Save;
  begin(resume: boolean): void;
  pause(): void;
  resume(): void;
  choose(choice: Resolution): void;
  settings(): void;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

/** Native dialog provides keyboard focus containment; lore is always plain text. */
export class GameUI {
  private readonly dialog: HTMLDialogElement;
  private readonly commands: Commands;
  private started = false;
  private canContinue: boolean;
  private dismiss: () => void = () => {};
  private advance: (() => void) | null = null;

  constructor(commands: Commands, canContinue: boolean) {
    this.commands = commands;
    this.canContinue = canContinue;
    this.dialog = document.querySelector<HTMLDialogElement>('#overlay')!;
    this.dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.dismiss();
    });
    this.dialog.addEventListener('keydown', (event) => {
      if (event.code === 'KeyE' && this.advance && !event.repeat) {
        event.preventDefault();
        this.advance();
      }
    });
    document.querySelector('#journal-button')!.addEventListener('click', () => this.journal());
    document.querySelector('#menu-button')!.addEventListener('click', () => this.menu());
  }

  private page(title: string, eyebrow: string, kind = ''): void {
    this.commands.pause();
    this.advance = null;
    this.dialog.className = kind;
    this.dialog.replaceChildren();
    this.dialog.append(element('div', eyebrow, 'eyebrow'));
    const heading = element('h1', title);
    heading.id = 'panel-title';
    this.dialog.append(heading);
    if (!this.dialog.open) this.dialog.showModal();
    this.dialog.scrollTop = 0;
    this.dismiss = () => this.close();
  }

  private buttons(items: { label: string; run(): void; style?: string }[]): void {
    const actions = element('div', undefined, 'actions');
    for (const item of items) {
      const button = element('button', item.label, item.style);
      button.type = 'button';
      button.addEventListener('click', item.run);
      actions.append(button);
    }
    this.dialog.append(actions);
    (actions.querySelector<HTMLButtonElement>('button:not(.danger)') ?? actions.querySelector('button'))?.focus();
  }

  private close(): void {
    if (!this.started) { this.intro(); return; }
    this.dialog.close();
    this.commands.resume();
  }

  intro(): void {
    this.page('BORROWED STONE', '01 / THE RAIN WE INHERIT', 'intro');
    this.dialog.append(
      element('p', 'The old world is gone. Its stones are still useful.', 'lede'),
      element('p', 'You are a route-reader. A washed-out crossing has left Reedbank without water. Read what the ruins remember. Find a way forward for the people living among them.'),
      element('p', 'An exploration story in weathered enamel and living cloth. No combat. No clock.'),
    );
    this.buttons([
      { label: this.canContinue ? 'Continue your journey' : 'Begin your journey', style: 'primary', run: () => {
        const resume = this.canContinue;
        this.started = true;
        this.commands.begin(resume);
        this.close();
      } },
      { label: 'Reading & settings', run: () => this.menu() },
    ]);
    this.dialog.append(element('div', 'WASD / arrows — walk · E / Space / Enter — interact\nJ — sketchbook · Esc — pause\nKeyboard required · progress saved on this browser', 'controls'));
    this.dismiss = () => {};
  }

  panel(panel: Panel): void {
    const ending = this.commands.save().state.completed && panel.title === 'Ilex — Borrowed Stone';
    this.page(panel.title, ending ? 'COMMISSION COMPLETE / REEDBANK' : 'FIELD CONVERSATION / OBSERVATION');
    for (const paragraph of panel.paragraphs) this.dialog.append(element('p', paragraph));
    const choices = panel.choices?.map((choice) => ({
      label: choice.label,
      run: () => this.commands.choose(choice.action),
      style: choice.action === 'flood' ? 'danger' : 'primary',
    })) ?? [];
    this.buttons([
      ...choices,
      { label: choices.length ? 'Not yet — keep exploring' : 'Continue exploring [E]', run: () => this.close() },
    ]);
    if (!choices.length) this.advance = () => this.close();
  }

  journal(): void {
    this.page('A route-reader’s sketchbook', 'EVIDENCE IS NOT THE SAME AS CERTAINTY');
    this.dialog.append(element('p', objective(this.commands.save().state).text, 'lede'));
    const entries = journalEntries(this.commands.save().state);
    if (!entries.length) this.dialog.append(element('p', 'Blank pages, for now. Look for altered stonework at the washed crossing, east of Reedbank.'));
    for (const entry of entries) {
      const section = element('section', undefined, 'note');
      section.append(element('h2', entry.title), element('strong', 'Observed'),
        element('p', entry.fact), element('strong', 'Interpretation'), element('p', entry.interpretation));
      this.dialog.append(section);
    }
    this.buttons([{ label: 'Close sketchbook', run: () => this.close() }]);
  }

  menu(): void {
    this.page('Set down your pack', 'BORROWED STONE / PAUSED');
    this.dialog.append(element('p', 'Take your time. Every clue can be read again; the sketchbook keeps observations separate from interpretations.'));
    const settings = this.commands.save().settings;
    const labels: [keyof Settings, string][] = [
      ['largeText', 'Larger text and dialogue'],
      ['guidance', 'Navigation assistance · mark the next destination'],
      ['reducedMotion', 'Reduced motion · still water and cloth'],
      ['sound', 'Quiet soundscape · water and ceramic tones'],
    ];
    for (const [key, text] of labels) {
      const label = element('label', undefined, 'setting');
      const input = element('input');
      input.type = 'checkbox';
      input.checked = settings[key];
      input.addEventListener('change', () => {
        this.commands.save().settings[key] = input.checked;
        this.commands.settings();
      });
      label.append(input, element('span', text));
      this.dialog.append(label);
    }
    this.buttons([
      { label: this.started ? 'Return to the world' : 'Back to title', style: 'primary', run: () => this.close() },
      ...(this.started || this.canContinue ? [{ label: 'Start a new journey', run: () => this.restart() }] : []),
    ]);
    this.dialog.append(element('div', 'WASD / arrows: walk · E / Space / Enter: interact · J: sketchbook · Esc: pause. Tab and Enter operate these menus. Saves stay on this device; private browsing or clearing site data may remove them.', 'controls'));
  }

  private restart(): void {
    this.page('Leave this journey behind?', 'NEW JOURNEY');
    this.dialog.append(element('p', 'Starting again replaces this browser’s saved journey. Your reading and sound settings will be kept.'));
    this.buttons([
      { label: 'Keep my journey', style: 'primary', run: () => this.menu() },
      { label: 'Replace save and restart', style: 'danger', run: () => {
        this.started = true;
        this.canContinue = false;
        this.commands.begin(false);
        this.close();
      } },
    ]);
    this.dismiss = () => this.menu();
  }

  refresh(): void {
    const save = this.commands.save();
    document.documentElement.classList.toggle('large-text', save.settings.largeText);
    document.querySelector('#objective')!.textContent = objective(save.state).text;
  }
}
