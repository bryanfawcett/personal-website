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
