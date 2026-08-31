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

/**
 * The sheet itself — near-black, the blue only a cast in it.
 *
 * These five are a ladder, and the order matters: every step is lighter than
 * the one before it, by enough to see. It did not used to be — `raised` sat
 * *below* `washLight`, and the panel fill was two values away from the page
 * ground, which is why readers said the cards were the same as the
 * background. Keep it monotonic, and keep the steps visible.
 */
export const SHEET = {
  /** Deepest — the vignette and the media wells. */
  deep: '#02050A',
  /** Page ground. */
  base: '#05090F',
  /** One step up: grouped regions. */
  mid: '#0B1119',
  /** Raised surfaces — menus, the title block, panels under the pointer. */
  raised: '#2A3749',
  /**
   * Panel fill.
   *
   * This used to be `rgb(7 11 17 / 0.86)`, which composited over the ground to
   * about rgb(7 11 17) against a ground of rgb(5 9 15) — two values apart out
   * of 255. A panel was, measurably, the same colour as the page it sat on,
   * and readers said so.
   *
   * The obvious worry about lightening it is that pale text loses contrast.
   * Measured with APCA, it does not: from rgb(5 9 15) to rgb(26 35 48) — a
   * step nobody could miss — full-strength ink goes from Lc 101.5 to Lc 99.1.
   * Two points, for a surface that finally reads as one.
   *
   * Opaque so body copy sits on a settled ground rather than on whatever the
   * lighting gradient happens to be doing behind it.
   */
  wash: 'rgb(26 35 48 / 0.97)',
  /** Brighter wash for chips and inset fields. */
  washLight: 'rgb(38 50 67 / 0.96)',
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
  /**
   * Body copy inside panels.
   *
   * The alpha steps below are the site's real contrast control, and they were
   * all set about one step too light. `soft` at 0.72 measured Lc 62.6 on a
   * panel, which APCA says needs 17.5px at weight 600 — while every label
   * using it ran at 10–11px. Raised until the sizes the design actually uses
   * are the sizes APCA allows.
   */
  body: 'rgb(242 246 251 / 0.96)',
  /** Secondary text and dimension labels. */
  soft: 'rgb(242 246 251 / 0.92)',
  /** Major grid rule, panel borders, column rules. Non-text only. */
  faint: 'rgb(242 246 251 / 0.46)',
  /** Minor grid rule. Non-text only. */
  hair: 'rgb(242 246 251 / 0.26)',
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
  major: 'rgb(242 246 251 / 0.16)',
  /** Minor grid line, at 24px. */
  minor: 'rgb(242 246 251 / 0.09)',
} as const;

export const TYPE = {
  /**
   * The big drafted lockups, and nothing else.
   *
   * Cormorant's x-height is 0.386 em — measured off the vendored file, against
   * 0.46–0.53 for a face cut for running text. At a 17px body size its
   * lowercase renders about 6.6px tall, which is why readers called the text
   * thin: it is not the weight, it is that the letters are a third smaller
   * than the size implies. At 4rem, in a two-word lockup, that delicacy is
   * exactly what makes it worth keeping.
   */
  display: "'Cormorant Garamond', ui-serif, Georgia, serif",
  /**
   * Everything a reader actually reads.
   *
   * IBM Plex Serif sits at 0.516 and is the sibling of the Plex Mono already
   * carrying every label on the site, so the voice stays industrial rather
   * than literary — which suits a drawing sheet better than a Garamond did.
   */
  serif: "'IBM Plex Serif', ui-serif, Georgia, serif",
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
  cjk: "'IBM Plex Serif', ui-serif, 'Noto Serif CJK SC', 'Source Han Serif SC', 'Songti SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
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
    ['Label', 'label', LABEL],
    ['Grid', 'grid', GRID],
    ['Rule', 'rule', RULE],
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
