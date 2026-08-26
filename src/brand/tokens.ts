/**
 * The site's design tokens.
 *
 * The site is a cyanotype — a real blueprint. Deep Prussian-blue ground, pale
 * line work, every container drafted onto the sheet with ruler-graduated
 * corners. Dark only: there is no light ramp and no theme toggle by design.
 *
 * "Ink" here means the colour a line is drawn in, which on a cyanotype is the
 * pale one. The ground is the blue.
 */

import { MINERALS } from './minerals.js';

/** The sheet itself — Prussian blue, deepening toward the edges. */
export const SHEET = {
  /** Deepest — the vignette and the media wells. */
  deep: '#050C15',
  /** Page ground. */
  base: '#0A1826',
  /** One step up: grouped regions. */
  mid: '#0E2032',
  /** Raised surfaces — menus, the title block. */
  raised: '#14293F',
  /** Panel fill. Translucent so the ruling reads through it. */
  wash: 'rgb(16 36 57 / 0.55)',
  /** Brighter wash for chips and inset fields. */
  washLight: 'rgb(30 58 88 / 0.45)',
} as const;

/**
 * The drawn line, at the weights a technical pen offers.
 *
 * Alpha steps are tuned so `base` and `body` clear WCAG AA for text against
 * SHEET.base, and the fainter two are only ever used for rules and grid.
 */
export const INK = {
  /** Full-strength line and heading text. */
  base: '#DCE9F7',
  /** Body copy inside panels. */
  body: 'rgb(220 233 247 / 0.82)',
  /** Secondary text, dimension labels, rule graduations. */
  soft: 'rgb(220 233 247 / 0.62)',
  /** Major grid rule and panel borders. Non-text only. */
  faint: 'rgb(220 233 247 / 0.24)',
  /** Minor grid rule. Non-text only. */
  hair: 'rgb(220 233 247 / 0.12)',
} as const;

/** Marks made by hand rather than by pen. */
export const MARKS = {
  /** Margin notes and the signature — chalk on a blueprint, not graphite. */
  pencil: '#E3BE86',
  /** The approval stamp. One red, used sparingly. */
  stamp: '#FF7A5C',
  /** Cast shadow under a drafted panel. */
  shadow: 'rgb(0 0 0 / 0.45)',
  /** The hairline inset that gives a panel its thickness. */
  inset: 'rgb(220 233 247 / 0.06)',
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
    ['Ink', 'ink', INK],
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
