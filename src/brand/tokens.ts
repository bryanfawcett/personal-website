/**
 * The site's design tokens.
 *
 * The site is a cyanotype — a real blueprint, but a print rather than a wash:
 * a matte board with a blue cast, line work in white, and the panels cut into
 * it as wells. Dark only: there is no light ramp and no theme toggle by design.
 *
 * "Ink" here means the colour a line is drawn in, which on a cyanotype is the
 * pale one. The sheet is the dark; the panels are darker still.
 */

import { MINERALS } from './minerals.js';

/**
 * The sheet, with wells cut into it.
 *
 * The model inverted here, and the reason is worth keeping. Panels used to sit
 * *above* the page ground and the ground was near-black, which left only one
 * direction to go for separation — up — and up is where the light is. So a
 * panel had to be lighter than the sheet to be seen at all, and the whole page
 * read as glossy: bright rectangles floating on black.
 *
 * Now the sheet is the matte board and the panels are recessed into it. The
 * near-black the site was built on (#05090F) is still there, but it is the
 * *panel* colour — which is where the reading happens, so the ink sits on the
 * darkest surface on the page rather than the lightest. Ink on a panel measures
 * Lc 105 against 99 before.
 *
 * The ladder is still monotonic and every step is still visible, measured in
 * CIE L* rather than by eye — APCA clamps to 0 between two near-black surfaces,
 * so it cannot judge this end of the range at all. Sheet to panel is dL* 9.7;
 * the pairing readers complained about was dL* 0.6.
 */
export const SHEET = {
  /**
   * The Mzizi surface ladder, dark mode (`@bundu/ui` styles/tokens.css,
   * generated from Mzizi canon). Literal here because a few things need a
   * hex rather than a var(): the QR, the social card, the contrast table on
   * /minerals. The values must match the package; `verify-stylesheet` reads
   * both.
   */
  /** Mzizi `pitch` — the deepest surface: media wells, the QR's frame. */
  deep: '#050505',
  /** Mzizi `surface` — cards and panels. */
  wash: '#131211',
  /** Mzizi `container` — chips, inset fields, grouped content. */
  washLight: '#1E1D1A',
  /** Mzizi `overlay` — overlays and the title block. */
  mid: '#23221F',
  /** Mzizi `base` — the page itself. */
  base: '#0E0D0C',
  /** Mzizi `raised` — menus, hover, things above the page. */
  raised: '#2E2C29',
} as const;

/**
 * The drawn line, at the weights a technical pen offers.
 *
 * Mzizi's dark `foreground`, #F0EFE9: a warm off-white that sits on the
 * warm-stone surfaces without the blue cast the old cyanotype ink carried.
 *
 * The alpha steps are the site's real contrast control. `faint` and `hair` are
 * line work only: see RULE below for why the grid does not share them.
 */
export const INK = {
  /** Full-strength line and heading text. */
  base: '#F0EFE9',
  /**
   * Body copy inside panels.
   *
   * These were all set about one step too light once. `soft` at 0.72 measured
   * Lc 62.6 on a panel, which APCA says needs 17.5px at weight 600 — while
   * every label using it ran at 10-11px. Raised until the sizes the design
   * actually uses are the sizes APCA allows.
   */
  body: 'rgb(240 239 233 / 0.97)',
  /** Secondary text and dimension labels. */
  soft: 'rgb(240 239 233 / 0.94)',
  /** Panel borders, column rules, section rules. Non-text only. */
  faint: 'rgb(240 239 233 / 0.42)',
  /** The lightest line work. Non-text only. */
  hair: 'rgb(240 239 233 / 0.24)',
  /** Fill inside stroked display type, so the outline still reads as solid. */
  drafted: 'rgb(240 239 233 / 0.34)',
} as const;

/**
 * Matte board, not a lit surface.
 *
 * These used to be four saturated radials at 0.22–0.72 alpha, and between them
 * they were what made the page read as glossy: a bright pool top left, a dark
 * one bottom right, and a blue cast over both. That is a sheen. A matte surface
 * scatters instead — it has a fall, but a shallow and almost colourless one,
 * and what texture it has comes from the tooth of the paper rather than from
 * the light.
 *
 * So the radials are held to a quarter of what they were and most of the blue
 * is out of them; the grain in global.css does the rest of the work and is
 * turned up to meet it. Raising these back up is how the gloss returns.
 */
export const GROUND = {
  /** The lit corner, top left — a fall of light, not a highlight. */
  lit: 'rgb(48 46 42 / 0.12)',
  /** The shaded corner, bottom right. */
  shade: 'rgb(0 0 0 / 0.30)',
  /** A second, weaker source. */
  glow: 'rgb(40 38 34 / 0.07)',
  /** The pool of dark it leaves. */
  pool: 'rgb(0 0 0 / 0.22)',
  /** Fall-off at the margins, as a board has where it has been handled. */
  vignette: 'rgb(0 0 0 / 0.42)',
} as const;

/** Marks made by hand rather than by pen. */
export const MARKS = {
  /**
   * Margin notes and the signature — chalk on a blueprint, not graphite.
   *
   * Lightened from `#E3BE86`, which measured Lc 69 over the painted ground and
   * so wanted a 20px minimum for a note set at 17px in Chinese. Chalk is the
   * paler mark anyway.
   */
  pencil: '#EDD0A6',
  /**
   * The approval stamp's red — rules, borders and the focus ring.
   *
   * Non-text, and comfortably over the 3:1 WCAG 2.2 (1.4.11) asks of a focus
   * indicator. Do not use it for lettering: see `stampInk`.
   */
  stamp: '#FF7A5C',
  /**
   * The stamp's lettering.
   *
   * A 2px rule and a 15px word have different contrast floors — Lc 45 against
   * Lc 75 — and the stamp is both at once. Setting the words in the rule's red
   * measured Lc 34, which APCA puts at a 67px minimum: unreadable at any size
   * the stamp could be. So the red stays the red for everything drawn, and the
   * words take a paler tint of it. Keeping one colour for both means either an
   * illegible stamp or a washed-out focus ring.
   */
  stampInk: '#FFBCAC',
  /** Cast shadow under a drafted panel. */
  shadow: 'rgb(0 0 0 / 0.55)',
  /** The hairline inset that gives a panel its thickness. */
  inset: 'rgb(240 239 233 / 0.06)',
} as const;

/**
 * Line-length caps.
 *
 * Measured, not guessed. Cormorant is an unusually narrow face — about 6.8px
 * per character at 18px — so a 37rem column runs to 87 characters, well past
 * the 45-85 that stays comfortable to track. Anything holding running prose
 * takes `--measure`; larger type takes `--measure-wide`, which is the same
 * character count at a bigger size.
 */
export const MEASURE = {
  base: '33rem',
  wide: '28rem',
} as const;

/**
 * The mono label — one size floor and one weight, set once.
 *
 * APCA's minimum size is a function of contrast *and* weight, and the two
 * trade against each other: at the ink these labels use, weight 400 asks for
 * 16.5px and weight 600 asks for 14.6px. The labels are tracked uppercase in
 * a mono face, where 15px is the size the layout wants and 400 is simply too
 * light to carry it — which is the other half of what readers meant by "the
 * text is too thin".
 *
 * So the weight is a token, not a per-rule decision: `base` is the smallest a
 * label may be anywhere, `lg` is for the ones carrying a section's name rather
 * than a figure number, and `weight` goes with both. Dropping the weight back
 * to 400 puts every label using it under the APCA floor.
 */
export const LABEL = {
  base: '0.9375rem',
  lg: '1rem',
  weight: '600',
} as const;

/**
 * The spacing scale.
 *
 * There wasn't one. Padding, margin and gap were written as literals and had
 * drifted to twenty-seven distinct values between 0.125rem and 4rem — 1.1rem
 * next to 1.125rem next to 1.25rem, none of them meaning anything different.
 * A scale nobody can name is a scale nobody can adjust: tightening the site by
 * a notch meant finding two hundred declarations and deciding each one again.
 *
 * These ten are the values the design was already reaching for most often, so
 * adopting them moved nothing on the page. The genuine one-offs that remain
 * are left as literals rather than snapped to the nearest step — a number that
 * is deliberately not on the scale should look like one.
 */
export const SPACE = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '2rem',
  8: '2.5rem',
  9: '3rem',
  10: '4rem',
} as const;

/**
 * How a mineral is drawn, wherever it is drawn.
 *
 * A mineral is never the colour of a word (see MINERALS and CLAUDE.md — on this
 * ground the seven measure Lc 25-48 as lettering). It is a mark beside the word
 * or under it, and this is how thick that mark is. It was written `3px` in five
 * separate rules across four views; now the rules read the token and the weight
 * of every mineral mark on the site is one edit.
 */
export const MINERAL = {
  weight: '3px',
} as const;

/** Grid geometry for the blueprint ruling. */
export const GRID = {
  minor: '24px',
  major: '120px',
} as const;

/**
 * The ruling's own ink, held well below the drawn line's.
 *
 * The blueprint grid used to be painted in `--ink-faint` and `--ink-hair` —
 * the same two tokens that draw the column rules and the panel borders. That
 * coupling is what made the ruling the site's worst contrast problem: those
 * alphas exist to make *line work* read, and raising them for that purpose
 * raised the grid with them. Under `plus-lighter` a major crossing was
 * compositing to rgb(106 112 120) over a ground of rgb(5 9 15), so any text
 * unlucky enough to cross one was scored against a ground twenty times
 * brighter than the sheet.
 *
 * These are the ruling's alphas and nothing else's. A major line lands about
 * 19/255 above the sheet and a crossing about 36 — legible as ground, far too
 * dark to eat a text block's contrast. Raising them is not a styling choice;
 * it is a contrast regression.
 */
export const RULE = {
  /** Major grid line, at 120px. */
  major: 'rgb(240 239 233 / 0.16)',
  /** Minor grid line, at 24px. */
  minor: 'rgb(240 239 233 / 0.09)',
} as const;

export const TYPE = {
  /**
   * The Mzizi type standard: Noto Serif for H1–H3 and the display lockups.
   *
   * Mzizi chose Noto for its coverage — African names and diacritics set in
   * the same face as the sentence around them — and the same family carries
   * the Han the Chinese pages set, so the two languages share a design.
   */
  display: "'Noto Serif', 'Noto Serif SC', ui-serif, Georgia, serif",
  /** Noto Sans: everything a reader reads, H4 and below, and the UI. */
  sans: "'Noto Sans', ui-sans-serif, system-ui, sans-serif",
  /** JetBrains Mono: figure tags, dimensions, the title block — technical marks. */
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  /** Margin notes and the signature — written, not set. Not part of Mzizi. */
  hand: "'Caveat', ui-rounded, cursive",
  /*
   * Chinese body text, and every face in it is a sans.
   *
   * Body is Noto Sans under Mzizi, so Chinese body text is a sans too, and
   * every entry here is one — the pairing does not change with the platform.
   * (This stack once mixed serifs and sans, so a Mac set the body in Songti
   * and Windows in Microsoft YaHei; a mixed stack is a different page per OS.)
   *
   * None of these is vendored. Every platform ships a good Chinese sans, so
   * Chinese body text costs no download at all; the vendored Noto Serif SC is
   * reserved for headings (`cjkDisplay`). Latin runs first so a proper noun in
   * a Chinese sentence still sets in Noto Sans.
   */
  cjk: "'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', 'Source Han Sans SC', sans-serif",
  /**
   * Chinese headings: Noto Serif with its Han sibling, Noto Serif SC, vendored
   * as GB2312 Level 1 (see the @font-face in global.css), so H1–H3 match the
   * Latin headings' Noto Serif on every platform.
   */
  cjkDisplay:
    "'Noto Serif', 'Noto Serif SC', 'Noto Serif CJK SC', 'Source Han Serif SC', 'Songti SC', 'STSong', 'SimSun', serif",
  /**
   * Han in the chrome — the language switcher, and nothing else.
   *
   * Deliberately *without* the vendored `Noto Serif SC`. `unicode-range`
   * gates a download on whether the page sets a character in the range, and
   * the switcher puts 中文 on every English page — so listing the vendored face
   * here made an English reader download 690 kB of Chinese to draw two glyphs.
   */
  cjkChrome:
    "'JetBrains Mono', ui-monospace, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif",
  /**
   * The mono equivalent: Latin from JetBrains Mono, Han from the system sans.
   *
   * `Mzizi CJK Label` is not a font — it is the size-adjusted alias declared
   * in global.css, and it sits ahead of the real family names so the Han in a
   * label is scaled up before the unadjusted faces are reached. Latin comes
   * from JetBrains Mono, listed first and untouched by the adjust.
   */
  cjkMono:
    "'JetBrains Mono', ui-monospace, 'Mzizi CJK Label', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif",
} as const;

/**
 * Mzizi's radius scale, its `--color-*` families (all 21) and `--ring` are not
 * defined here: they come from `@bundu/ui/styles/tokens.css`, which
 * BaseLayout loads ahead of these tokens, so there is one source for them.
 *
 * The site's one primary colour: Mzizi heritage **river** (dark value), the
 * great rivers — Zambezi, Nile, Congo — flow and the journey. Chosen by Bryan
 * from the heritage and experimental families, and used alone: the primary
 * action, the nav button and link underlines. The pillar cards keep their own
 * brand minerals, because those say which pillar is which.
 *
 * `onBrand` is Mzizi's dark `base`: Lc 69 on river, so a 16px/600 label clears
 * APCA comfortably. River also reads as text on the page (Lc 68).
 */
export const SEMANTIC = {
  brand: '#4DD0E1',
  onBrand: '#0E0D0C',
} as const;

/*
 * ------------------------------------------------------------------------
 * The light theme.
 *
 * Everything above is the dark theme. These are its light counterparts, for
 * the groups that change with the scheme; measure, labels, spacing, grid
 * geometry and type do not. Surfaces are Mzizi's light ladder (cards are
 * white on the warm-paper base, as @bundu/ui's light --card is), ink is
 * Mzizi's light foreground, and the primary is river's light tone.
 *
 * The page follows the device: light unless the reader's system asks for
 * dark, and an explicit choice from the header's theme toggle
 * (`data-theme` on <html>) wins over either.
 * ------------------------------------------------------------------------
 */

export const SHEET_LIGHT: Record<keyof typeof SHEET, string> = {
  deep: '#FAFAFA',
  wash: '#FFFFFF',
  washLight: '#E5E4E1',
  mid: '#E0DFDC',
  base: '#F3F3F1',
  raised: '#D6D5D1',
};

export const INK_LIGHT: Record<keyof typeof INK, string> = {
  base: '#1A1A17',
  body: 'rgb(26 26 23 / 0.94)',
  soft: 'rgb(26 26 23 / 0.86)',
  faint: 'rgb(26 26 23 / 0.36)',
  hair: 'rgb(26 26 23 / 0.18)',
  drafted: 'rgb(26 26 23 / 0.12)',
};

export const GROUND_LIGHT: Record<keyof typeof GROUND, string> = {
  lit: 'rgb(255 255 255 / 0.30)',
  shade: 'rgb(0 0 0 / 0.04)',
  glow: 'rgb(255 255 255 / 0.15)',
  pool: 'rgb(0 0 0 / 0.03)',
  vignette: 'rgb(0 0 0 / 0.06)',
};

export const MARKS_LIGHT: Record<keyof typeof MARKS, string> = {
  /** Graphite on paper, where the dark theme has chalk on a board. */
  pencil: '#6B4A1F',
  stamp: '#C23A1E',
  stampInk: '#9E2A12',
  shadow: 'rgb(0 0 0 / 0.12)',
  inset: 'rgb(0 0 0 / 0.04)',
};

/** Dark lines on paper: the ruling is drawn darker than the ground here. */
export const RULE_LIGHT: Record<keyof typeof RULE, string> = {
  /*
   * Held low for the same reason as the dark ruling: at 0.10 a major
   * crossing multiplied the paper down to rgb(225 225 224), and body text
   * that crossed one was scored against that rather than the page.
   */
  major: 'rgb(26 26 23 / 0.06)',
  minor: 'rgb(26 26 23 / 0.035)',
};

/**
 * River's light tone, #006064, with white text: Lc 87.9, so the 700-weight
 * labels on it have room to spare.
 */
export const SEMANTIC_LIGHT: Record<keyof typeof SEMANTIC, string> = {
  brand: '#006064',
  onBrand: '#FFFFFF',
};

/**
 * How the blueprint layers composite. On a dark board the ruling is lighter
 * than the ground and adds light; on paper it is darker and takes it away.
 */
export const BLEND = { ground: 'plus-lighter' } as const;
export const BLEND_LIGHT: Record<keyof typeof BLEND, string> = { ground: 'multiply' };

/**
 * Show one element per theme without a theme selector in the stylesheet:
 * `display: var(--show-dark-only)`. The header's sun and moon, and the
 * contact card's two QR codes, use it.
 */
export const SHOW = { darkOnly: 'block', lightOnly: 'none' } as const;
export const SHOW_LIGHT: Record<keyof typeof SHOW, string> = { darkOnly: 'none', lightOnly: 'block' };

type Group = Readonly<Record<string, string>>;

/** Groups whose values do not change with the theme. */
const INVARIANT: ReadonlyArray<readonly [string, string, Group]> = [
  ['Measure', 'measure', MEASURE],
  ['Label', 'label', LABEL],
  ['Space', 'space', SPACE],
  ['Mineral', 'mineral', MINERAL],
  ['Grid', 'grid', GRID],
  ['Type', '', TYPE],
];

/** Groups that do, as [label, prefix, dark, light]. */
const THEMED: ReadonlyArray<readonly [string, string, Group, Group]> = [
  ['Sheet', 'sheet', SHEET, SHEET_LIGHT],
  ['Ground', 'ground', GROUND, GROUND_LIGHT],
  ['Ink', 'ink', INK, INK_LIGHT],
  ['Marks', '', MARKS, MARKS_LIGHT],
  ['Rule', 'rule', RULE, RULE_LIGHT],
  ['Semantic', '', SEMANTIC, SEMANTIC_LIGHT],
  ['Blend', 'blend', BLEND, BLEND_LIGHT],
  ['Show', 'show', SHOW, SHOW_LIGHT],
];

function themed(scheme: 'light' | 'dark', indent: string): string[] {
  const out: string[] = [];
  out.push(`${indent}/* Mzizi minerals, ${scheme} */`);
  for (const m of MINERALS) {
    const dark = scheme === 'dark';
    out.push(`${indent}--mineral-${m.name}: ${dark ? m.hex : m.onLight};`);
    out.push(`${indent}--mineral-${m.name}-container: ${dark ? m.container : m.containerLight};`);
    out.push(
      `${indent}--mineral-${m.name}-on-container: ${dark ? m.onContainer : m.onContainerLight};`,
    );
  }
  for (const [label, prefix, dark, light] of THEMED) {
    out.push(`${indent}/* ${label} */`);
    for (const [key, value] of Object.entries(scheme === 'dark' ? dark : light)) {
      out.push(`${indent}--${varName(prefix, key)}: ${value};`);
    }
  }
  return out;
}

/**
 * Render every token as CSS custom properties.
 *
 * Generated at build time rather than hand-maintained, so the TypeScript above
 * stays the single source of truth and the two cannot drift. The selectors
 * match @bundu/ui's color-scheme.css: light on :root, dark under the device
 * preference unless the reader chose light, and dark whenever they chose it.
 */
export function tokensToCss(): string {
  const lines: string[] = [':root {'];
  for (const [label, prefix, group] of INVARIANT) {
    lines.push(`  /* ${label} */`);
    for (const [key, value] of Object.entries(group)) {
      lines.push(`  --${varName(prefix, key)}: ${value};`);
    }
  }
  lines.push(...themed('light', '  '));
  lines.push('}');

  lines.push('@media (prefers-color-scheme: dark) {');
  lines.push('  :root:where(:not([data-theme="light"], .light)) {');
  lines.push(...themed('dark', '    '));
  lines.push('  }');
  lines.push('}');

  lines.push(':root:where([data-theme="dark"], .dark) {');
  lines.push(...themed('dark', '  '));
  lines.push('}');
  return lines.join('\n');
}

/**
 * `--sheet-deep`, `--ink-soft`, `--pencil`.
 *
 * A `base` key means "the group's own name", so INK.base becomes `--ink`
 * rather than `--ink-base`.
 */
function varName(prefix: string, key: string): string {
  const kebabbed = kebab(key);
  if (!prefix) return kebabbed;
  return kebabbed === 'base' ? prefix : `${prefix}-${kebabbed}`;
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
