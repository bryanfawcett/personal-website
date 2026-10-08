/**
 * Two static checks on global.css — `pnpm verify:stylesheet`, and a CI gate.
 *
 * Both exist because `pnpm verify:contrast` structurally cannot see them. That
 * check reads rendered pixels, so it can only judge what was painted; a rule
 * that silently did not apply leaves nothing to measure. Each of these caught a
 * real bug that had already shipped:
 *
 *  1. **Every `var(--x)` resolves.** Four properties in the footer — `--void`,
 *     `--faint`, `--muted`, `--foreground` — survived the move to tokens.ts
 *     from an older vocabulary. Each fell back to `unset` and inherited, so the
 *     footer rendered at full ink and *looked* fine; the intended hierarchy was
 *     simply gone, and nothing could have told us.
 *
 *  2. **A base rule never pairs a class with an element outside `:where()`.**
 *     `.panel a` is specificity 0-1-1 and beats any single class. Scoped to one
 *     view that was harmless; merged into one stylesheet it went site-wide and
 *     beat `.btn`, painting the primary call to action in `--ink` on an `--ink`
 *     fill. White on white, on the home page, in both languages. `:where()`
 *     contributes nothing to specificity, so `.panel :where(a)` is a default a
 *     class can override by being a class.
 *
 * The second check is the one a comment could not enforce: the doctrine was
 * written into the file and contradicted 1,977 lines below it in the same
 * commit.
 */
import { readFileSync } from 'node:fs';
import { tokensToCss } from '../src/brand/tokens.ts';

const CSS_PATH = new URL('../src/styles/global.css', import.meta.url);
const css = readFileSync(CSS_PATH, 'utf8');

/* Properties set by markup rather than by the stylesheet. `--mineral`, and the
 * `--mineral-container` / `--mineral-on` pair that themes a surface in its
 * mineral, come from the `mineral` prop on Panel or from `keyedTo()`;
 * `--rail-thickness` from MineralBar's own inline style. Add to this list only
 * for a property a component genuinely sets inline, never to silence a typo. */
const SET_INLINE = new Set(['--mineral', '--mineral-container', '--mineral-on', '--rail-thickness']);

/*
 * Blank the comments out rather than deleting them: line numbers have to stay
 * aligned with the file so the report points at the right rule, and the
 * section boundary the second check needs is itself a comment.
 */
const body = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
const fail = [];

/* ---------- 1. every custom property resolves ---------- */
{
  const used = new Set([...body.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  const declared = new Set([...body.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
  const emitted = new Set(
    [...tokensToCss().matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
  );

  const unresolved = [...used].filter(
    (p) => !declared.has(p) && !emitted.has(p) && !SET_INLINE.has(p),
  );
  if (unresolved.length) {
    fail.push(
      `${unresolved.length} custom ${unresolved.length === 1 ? 'property is' : 'properties are'} referenced but never defined:\n` +
        unresolved.map((p) => `    var(${p})`).join('\n') +
        `\n  Define it in src/brand/tokens.ts, or fix the name. A var() that does not\n` +
        `  resolve falls back to \`unset\` and inherits — it fails silently.`,
    );
  }
  console.log(`  ${used.size} custom properties referenced, all resolve`);
}

/* ---------- 2. no base rule pairs a class with a bare element ---------- */
{
  /* Where the component rules start. Below this line a rule may be as specific
   * as it likes: those are the rules that need to win. Above it, a rule is a
   * base default and must not outrank a class. */
  const boundary = css.split('\n').findIndex((l) => l.includes('components and views'));
  if (boundary < 0) {
    console.error('  cannot find the components section header in global.css');
    process.exit(2);
  }

  const offenders = [];
  body.split('\n').forEach((line, i) => {
    const m = line.match(/^([^@{}/\s][^{}]*?)\s*\{\s*$/);
    if (!m) return;
    for (const sel of m[1].split(',')) {
      const s = sel.trim();
      if (!s || !s.startsWith('.')) continue;
      /* Remove every :where(...) — what it contains costs nothing. */
      const bare = s.replace(/:where\([^()]*\)/g, '');
      /* A descendant/child/sibling step landing on a bare element name. */
      if (/[\s>+~]+[a-z][a-z0-9]*(\s|$|:|\[)/.test(bare)) {
        offenders.push({ line: i + 1, sel: s, base: i < boundary });
      }
    }
  });

  const base = offenders.filter((o) => o.base);
  if (base.length) {
    fail.push(
      `${base.length} base ${base.length === 1 ? 'rule pairs' : 'rules pair'} a class with an element outside :where():\n` +
        base.map((o) => `    ${String(o.line).padStart(5)}  ${o.sel}`).join('\n') +
        `\n  These are specificity 0-1-1 and beat any single class on that element.\n` +
        `  Wrap the element in :where() so the rule is a default, not a decree.`,
    );
  }
  console.log(
    `  ${offenders.length - base.length} component rules pair a class with an element (allowed), 0 base rules do`,
  );
}

if (fail.length) {
  console.error(`\nglobal.css:\n\n${fail.map((f) => `  ${f}`).join('\n\n')}\n`);
  process.exit(1);
}
console.log('\nstylesheet: every property resolves, and no base rule outranks a class.');
