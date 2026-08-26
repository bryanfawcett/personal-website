/**
 * The site's design tokens.
 *
 * Surfaces, borders and semantics come from Mzizi's dark ramp; the typographic
 * identity stays bryanfawcett.com's own (Dancing Script wordmark, Noto Serif
 * headings, Poppins body). Noto Serif is common to both systems, and JetBrains
 * Mono is Mzizi's mono, so the only real divergence is the display and body
 * faces — which are what make this site look like this site.
 *
 * Dark only. There is no light ramp here and no theme toggle by design.
 */

import { MINERALS } from './minerals.js';

export const SURFACES = {
  /** Deepest surface — media wells, the hero. */
  pitch: '#050505',
  /** App shell behind the base. */
  void: '#080807',
  /** Page background. */
  base: '#0E0D0C',
  /** Card and panel surface. */
  surface: '#131211',
  /** Neutral containers, grouped content. */
  container: '#1E1D1A',
  /** Overlays and dialogs. */
  overlay: '#23221F',
  /** Menus and toasts, above overlay. */
  raised: '#2E2C29',
} as const;

export const INK = {
  /** Primary text. */
  foreground: '#F5F4F1',
  /** Secondary text, descriptions. */
  muted: '#A09C93',
  /** Metadata, timestamps, eyebrow labels. */
  faint: '#6E6A63',
} as const;

export const LINES = {
  /** Canonical border — warm stone, not cool grey. */
  border: '#2A2927',
  /** Border on hover or focus-within. */
  borderStrong: '#413F3B',
} as const;

/**
 * The blueprint ground.
 *
 * The whole site sits on drafting paper: a fine grid with a heavier rule every
 * fifth line, drawn in cobalt — the mineral for knowledge and precision. Panels
 * do not float above it on shadows; they are drawn onto it, with the grid
 * showing faintly through and corner ticks where a draughtsman would mark a
 * cut. That is what makes a container read as part of the drawing rather than
 * a card dropped on top of it.
 *
 * Kept deliberately low-contrast: the grid must never compete with body text.
 */
export const BLUEPRINT = {
  /** Fine grid line. */
  gridLine: 'rgb(0 176 255 / 0.045)',
  /** Every fifth line, heavier. */
  gridLineMajor: 'rgb(0 176 255 / 0.075)',
  /** Spacing of the fine grid. */
  gridSize: '28px',
  /** Spacing of the heavy rule. */
  gridSizeMajor: '140px',
  /** Panel fill — translucent, so the grid reads through it. */
  panelFill: 'rgb(19 18 17 / 0.72)',
  /** Panel fill on hover. */
  panelFillActive: 'rgb(30 29 26 / 0.85)',
  /** Corner tick and annotation rule colour. */
  tick: 'rgb(0 176 255 / 0.4)',
} as const;

export const SEMANTIC = {
  /** Primary brand action — tanzanite. */
  primary: '#B388FF',
  /** Links and informational states — cobalt, never primary. */
  info: '#00B0FF',
  success: '#64FFDA',
  warning: '#FFD866',
  error: '#F2B8B5',
  /** Focus ring — cobalt, 2px wide at 2px offset. */
  ring: '#00B0FF',
} as const;

export const TYPE = {
  /** Wordmark and signature moments only. */
  display: "'Dancing Script', ui-serif, cursive",
  /** Headings. Shared with Mzizi. */
  serif: "'Noto Serif', ui-serif, Georgia, serif",
  /** Body and UI. */
  sans: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  /** Eyebrow labels, metadata, code. Mzizi's mono. */
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

/** Mzizi's radius system: 7, 12, 14, 17. Buttons are always pill. */
export const RADII = {
  sm: '7px',
  md: '12px',
  lg: '14px',
  xl: '17px',
  full: '9999px',
} as const;

/**
 * Render every token as CSS custom properties on `:root`.
 *
 * Generated at build time rather than hand-maintained, so the TypeScript above
 * stays the single source of truth and the two cannot drift.
 */
export function tokensToCss(): string {
  const lines: string[] = [':root {'];

  lines.push('  /* Mzizi minerals */');
  for (const m of MINERALS) {
    lines.push(`  --mineral-${m.name}: ${m.hex};`);
    lines.push(`  --mineral-${m.name}-container: ${m.container};`);
  }

  const groups: ReadonlyArray<readonly [string, Readonly<Record<string, string>>]> = [
    ['Surfaces', SURFACES],
    ['Ink', INK],
    ['Lines', LINES],
    ['Blueprint', BLUEPRINT],
    ['Semantic', SEMANTIC],
    ['Type', TYPE],
    ['Radii', RADII],
  ];

  for (const [label, group] of groups) {
    lines.push(`  /* ${label} */`);
    for (const [key, value] of Object.entries(group)) {
      lines.push(`  --${kebab(key)}: ${value};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
