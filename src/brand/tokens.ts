/**
 * The site's design tokens.
 *
 * The site is a cyanotype — a real blueprint, but a print rather than a wash:
 * near-black ground with a blue cast, line work in white. Dark only: there is
 * no light ramp and no theme toggle by design.
 *
 * "Ink" here means the colour a line is drawn in, which on a cyanotype is the
 * pale one. The ground is the near-black.
 */

import { MINERALS } from './minerals.js';

/** The sheet itself — near-black, the blue only a cast in it. */
export const SHEET = {
  /** Deepest — the vignette and the media wells. */
  deep: '#02050A',
  /** Page ground. */
  base: '#05090F',
  /** One step up: grouped regions. */
  mid: '#080D15',
  /** Raised surfaces — menus, the title block, panels under the pointer. */
  raised: '#0F151E',
  /**
   * Panel fill.
   *
   * Opaque enough (0.86) that body copy sits on a settled ground rather than
   * on whatever the gradient happens to be doing behind it — that swing was
   * costing about two points of contrast at the lit corner.
   */
  wash: 'rgb(7 11 17 / 0.86)',
  /** Brighter wash for chips and inset fields. */
  washLight: 'rgb(20 28 39 / 0.8)',
} as const;

/**
 * The drawn line, at the weights a technical pen offers.
 *
 * White rather than the old pale blue: against a near-black ground the blue
 * cast only muddied it. Alpha steps are tuned so `base` and `body` clear WCAG
 * AA for text against SHEET.wash, and the fainter two are rules and grid only.
 */
export const INK = {
  /** Full-strength line and heading text. */
  base: '#F2F6FB',
  /** Body copy inside panels. */
  body: 'rgb(242 246 251 / 0.9)',
  /** Secondary text and dimension labels. */
  soft: 'rgb(242 246 251 / 0.72)',
  /** Major grid rule, panel borders, column rules. Non-text only. */
  faint: 'rgb(242 246 251 / 0.34)',
  /** Minor grid rule. Non-text only. */
  hair: 'rgb(242 246 251 / 0.17)',
  /** Fill inside stroked display type, so the outline still reads as solid. */
  drafted: 'rgb(242 246 251 / 0.34)',
} as const;

/**
 * Where the light falls across the sheet.
 *
 * These were inline in global.css, which broke the rule that no colour is
 * written outside src/brand.
 */
export const GROUND = {
  /** The lit corner, top left. */
  lit: 'rgb(20 40 64 / 0.34)',
  /** The shaded corner, bottom right. */
  shade: 'rgb(1 2 5 / 0.72)',
  /** A second, weaker source. */
  glow: 'rgb(14 32 52 / 0.22)',
  /** The pool of dark it leaves. */
  pool: 'rgb(1 3 6 / 0.55)',
  /** Fall-off at the margins, as a print has. */
  vignette: 'rgb(0 1 3 / 0.7)',
} as const;

/** Marks made by hand rather than by pen. */
export const MARKS = {
  /** Margin notes and the signature — chalk on a blueprint, not graphite. */
  pencil: '#E3BE86',
  /** The approval stamp. One red, used sparingly. */
  stamp: '#FF7A5C',
  /** Cast shadow under a drafted panel. */
  shadow: 'rgb(0 0 0 / 0.55)',
  /** The hairline inset that gives a panel its thickness. */
  inset: 'rgb(242 246 251 / 0.06)',
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

/** Grid geometry for the blueprint ruling. */
export const GRID = {
  minor: '24px',
  major: '120px',
} as const;

export const TYPE = {
  /** Display and body. */
  serif: "'Cormorant Garamond', ui-serif, Georgia, serif",
  /** Labels, figures, dimensions, the title block. */
  mono: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  /** Margin notes and the signature — written, not set. */
  hand: "'Caveat', ui-rounded, cursive",
  /*
   * Chinese.
   *
   * Nothing here is self-hosted. The three vendored families are Latin +
   * Latin Extended only, and a Han subset large enough to set this site
   * would be several megabytes against three woff2 files that currently
   * total well under one — a bad trade on the connections a lot of this
   * ecosystem is built for. So Chinese falls to the reader's own system
   * face, which every platform ships, and Latin runs first in the stack so
   * that a proper noun inside a Chinese sentence still sets in Cormorant.
   */
  cjk: "'Cormorant Garamond', ui-serif, 'Noto Serif CJK SC', 'Source Han Serif SC', 'Songti SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  /**
   * The mono equivalent: Latin from IBM Plex, Han from the system.
   *
   * `Mzizi CJK Label` is not a font — it is the size-adjusted alias declared in
   * global.css, and it has to sit ahead of the real family names so the Han in
   * a label is scaled up before the unadjusted faces are reached. Latin still
   * comes from Plex, which is listed first and is untouched by the adjust.
   */
  cjkMono:
    "'IBM Plex Mono', ui-monospace, 'Mzizi CJK Label', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
} as const;

/**
 * Render every token as CSS custom properties on `:root`.
 *
 * Generated at build time rather than hand-maintained, so the TypeScript above
 * stays the single source of truth and the two cannot drift.
 */
export function tokensToCss(): string {
  const lines: string[] = [':root {'];

  lines.push('  /* Mzizi minerals — the rail and the accents */');
  for (const m of MINERALS) {
    lines.push(`  --mineral-${m.name}: ${m.hex};`);
    lines.push(`  --mineral-${m.name}-container: ${m.container};`);
  }

  const groups: ReadonlyArray<readonly [string, string, Readonly<Record<string, string>>]> = [
    ['Sheet', 'sheet', SHEET],
    ['Ground', 'ground', GROUND],
    ['Ink', 'ink', INK],
    ['Measure', 'measure', MEASURE],
    ['Marks', '', MARKS],
    ['Grid', 'grid', GRID],
    ['Type', '', TYPE],
  ];

  for (const [label, prefix, group] of groups) {
    lines.push(`  /* ${label} */`);
    for (const [key, value] of Object.entries(group)) {
      lines.push(`  --${varName(prefix, key)}: ${value};`);
    }
  }

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
