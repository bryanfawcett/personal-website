/**
 * Guards the hand-rolled Sanity image URL builder.
 *
 * `src/sanity/image.ts` parses an asset reference and assembles a CDN URL
 * itself rather than pulling in `@sanity/image-url`. That is a good trade
 * right up until the format assumption is wrong, and a wrong URL fails as a
 * broken image on a live page rather than as a build error — so the format is
 * pinned here instead. Same reason `verify-fonts.py` exists.
 *
 *     node --experimental-strip-types --import ./scripts/ts-specifier-hook.mjs \
 *       scripts/verify-image-urls.mjs
 */
import { parseImageRef, resolveImage } from '../src/sanity/image.ts';

let fail = 0;
const eq = (label, got, want) => {
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? '✓' : '✗'} ${label}\n    got  ${got}\n    want ${want}`);
};

// A real-shaped reference: image-<assetId>-<w>x<h>-<ext>
const REF = 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1333-jpg';
const parsed = parseImageRef(REF);
console.log('parsed:', JSON.stringify(parsed));

const img = { asset: { _ref: REF }, alt: 'A flooded track' };

const free = resolveImage(img, { width: 600 });
eq('keeps source aspect (2000x1333 → 600x400)', `${free.width}x${free.height}`, '600x400');
eq(
  'src asks for 2x and webp',
  free.src,
  'https://cdn.sanity.io/images/zsx9erk1/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1333.jpg?w=1200&fm=webp&q=72&fit=max',
);
eq('srcset carries both densities', free.srcset.split(', ').length, 2);
eq('alt passes through', free.alt, 'A flooded track');

const cropped = resolveImage(img, { width: 600, aspect: 3 / 2 });
eq('crops to the asked aspect (3:2 → 600x400)', `${cropped.width}x${cropped.height}`, '600x400');
eq('crop uses the editor hotspot', cropped.src.includes('crop=focalpoint'), true);
eq('crop passes an explicit height', cropped.src.includes('h=800'), true);

// Degradation
eq('missing field → null', resolveImage(undefined, { width: 400 }), null);
eq('missing asset → null', resolveImage({ alt: 'x' }, { width: 400 }), null);
eq('malformed ref → null', resolveImage({ asset: { _ref: 'file-abc-pdf' } }, { width: 400 }), null);
eq('truncated ref → null', parseImageRef('image-abc-2000-jpg'), null);
eq('alt absent → empty string, not undefined', resolveImage(img, { width: 10 }).alt !== undefined, true);

console.log(fail === 0 ? '\nimage URLs: all checks pass' : `\n${fail} FAILING`);
process.exit(fail === 0 ? 0 : 1);
