/**
 * The site's design tokens.
 *
 * The site is a draughtsman's sheet: aged parchment, a blueprint grid ruled in
 * ink, and every container drafted onto the paper with ruler-graduated corners.
 * The Mzizi minerals survive as the vertical brand rail and as accents; the
 * surface palette is parchment rather than Mzizi's dark ramp, because the
 * drawing only reads on paper.
 *
 * Light only. There is no dark ramp here and no theme toggle by design.
 */

import { MINERALS } from './minerals.js';

/** The paper itself. */
export const PARCHMENT = {
  light: '#EDDCB6',
  mid: '#E0CB9E',
  dark: '#C7AC7C',
  /** Translucent parchment for panel fills, so the grid reads through. */
  wash: 'rgba(236, 222, 190, 0.55)',
  /** Slightly brighter wash for chips and inset fields. */
  washLight: 'rgba(255, 248, 228, 0.4)',
} as const;

/** Drafting ink, at the weights a technical pen actually offers. */
export const INK = {
  /** Full-strength line and body text. */
  base: '#1E3A5F',
  /** Secondary text, dimension labels, rule graduations. */
  soft: 'rgba(30, 58, 95, 0.55)',
  /** Major grid rule. */
  faint: 'rgba(30, 58, 95, 0.26)',
  /** Minor grid rule. */
  hair: 'rgba(30, 58, 95, 0.14)',
  /** Body copy inside panels — a touch lighter than a drawn line. */
  body: 'rgba(30, 58, 95, 0.78)',
} as const;

/** Marks made by hand rather than by pen. */
export const MARKS = {
  /** Graphite margin notes and signatures. */
  pencil: '#5A4A32',
  /** The approval stamp. One red, used sparingly. */
  stamp: '#8C3B22',
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

  lines.push('  /* Mzizi minerals — the brand rail and accents */');
  for (const m of MINERALS) {
    lines.push(`  --mineral-${m.name}: ${m.hex};`);
    lines.push(`  --mineral-${m.name}-vivid: ${m.vivid};`);
    lines.push(`  --mineral-${m.name}-container: ${m.container};`);
  }

  const groups: ReadonlyArray<readonly [string, string, Readonly<Record<string, string>>]> = [
    ['Parchment', 'parch', PARCHMENT],
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
 * `--parch-light`, `--ink-soft`, `--pencil`.
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
