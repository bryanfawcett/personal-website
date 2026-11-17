/**
 * The adventure `mineral` select offers exactly the Mzizi families the palette has.
 *
 * `seed/seed.json` lists the options for the `mineral` field. Typed by hand that list would drift
 * from `src/brand/mzizi-palette.generated.ts` (the `mzizi-tokens` output), and the CMS could then
 * offer a family the site cannot draw. This writes the palette's keys into the seed, in palette
 * order, and `--check` (CI) fails if they differ. It also fails if a family has no
 * `[data-mineral="..."]` rule in the generated `src/styles/tokens.css`, because an option with no
 * rule would render the sheet's fallback colour while looking chosen.
 *
 *   node ... scripts/build-seed-minerals.mjs           rewrite the options in seed/seed.json
 *   node ... scripts/build-seed-minerals.mjs --check   exit 1 when the seed or tokens.css disagree
 *
 * Only the options array is rewritten (a text edit), so the rest of the seed keeps its layout.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEED = join(root, 'seed/seed.json');
const TOKENS = join(root, 'src/styles/tokens.css');

const { MZIZI_PALETTE } = await import('../src/brand/mzizi-palette.generated.ts');
const families = Object.keys(MZIZI_PALETTE);

/** The `mineral` field's options in a parsed seed, or null if the field is missing. */
function seedOptions(seed) {
  const field = seed.collections
    ?.find((c) => c.slug === 'adventures')
    ?.fields?.find((f) => f.slug === 'mineral');
  return field?.validation?.options ?? null;
}

function families21() {
  return families;
}

/** Families with no `[data-mineral="x"]` rule in tokens.css. */
function missingFromTokens(tokensCss, names = families) {
  return names.filter((n) => !tokensCss.includes(`[data-mineral="${n}"]`));
}

const text = readFileSync(SEED, 'utf8');
const current = seedOptions(JSON.parse(text));
const same = JSON.stringify(current) === JSON.stringify(families);
const missing = missingFromTokens(readFileSync(TOKENS, 'utf8'));

if (process.argv.includes('--check')) {
  let bad = false;
  if (!same) {
    console.error(`seed/seed.json mineral options are stale.\n  seed:    ${JSON.stringify(current)}\n  palette: ${JSON.stringify(families)}\nRun: pnpm seed:minerals`);
    bad = true;
  }
  if (missing.length) {
    console.error(`no [data-mineral] rule in src/styles/tokens.css for: ${missing.join(', ')}. Run: pnpm tokens`);
    bad = true;
  }
  if (!bad) console.log(`seed mineral options match the palette (${families.length} families, all keyed in tokens.css)`);
  process.exit(bad ? 1 : 0);
}

if (current === null) {
  console.error('seed/seed.json has no adventures.mineral field');
  process.exit(1);
}
if (missing.length) {
  console.error(`no [data-mineral] rule in src/styles/tokens.css for: ${missing.join(', ')}. Run: pnpm tokens`);
  process.exit(1);
}
// The options array of the mineral field: from `"options": [` to its closing bracket.
const re = /("slug": "mineral"[\s\S]*?"options": )\[[^\]]*\]/;
if (!re.test(text)) {
  console.error('could not find the mineral options in seed/seed.json');
  process.exit(1);
}
const next = text.replace(re, (_, head) => `${head}[${families.map((f) => JSON.stringify(f)).join(', ')}]`);
if (next === text) console.log('seed/seed.json already current');
else {
  writeFileSync(SEED, next);
  console.log(`seed/seed.json: ${families.length} mineral options written`);
}
