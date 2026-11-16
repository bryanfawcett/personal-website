/**
 * Write src/data/generated/site.json: the few values the Rust tools need that
 * live in TypeScript (the contact record and the QR's source and colours).
 *
 * Same idea as tokens.css: the content stays typed in src/data/, and anything
 * that is not TypeScript reads this file instead of parsing source. Edit the
 * source, never the JSON.
 *
 *     pnpm site-data           # regenerate
 *     pnpm site-data --check   # fail if the committed file is stale (CI)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { BOOKING_URL } from '../src/data/booking.ts';
import { PROFILE } from '../src/data/profile.ts';
import { mineral } from '../src/brand/minerals.ts';
import { INK, INK_LIGHT, SHEET_LIGHT } from '../src/brand/tokens.ts';

const OUT = new URL('../src/data/generated/site.json', import.meta.url);

const site = {
  _generated: 'by scripts/export-site-data.mjs from src/data and src/brand. Do not edit.',
  profile: {
    name: PROFILE.name,
    title: PROFILE.title,
    email: PROFILE.email,
    location: PROFILE.location,
    tagline: PROFILE.tagline,
    roles: PROFILE.roles.map(({ title, org }) => ({ title, org })),
    socials: PROFILE.socials.map(({ name, handle, href }) => ({ name, handle, href })),
  },
  booking_url: BOOKING_URL,
  qr: {
    dark: { dark: INK.base, light: mineral('cobalt').container },
    light: { dark: INK_LIGHT.base, light: SHEET_LIGHT.wash },
  },
};
const json = JSON.stringify(site, null, 2) + '\n';

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {}
  if (current !== json) {
    console.error('src/data/generated/site.json is stale. Run `pnpm site-data` and commit the result.');
    process.exit(1);
  }
  console.log('site.json is up to date');
} else {
  writeFileSync(OUT, json);
  console.log('wrote src/data/generated/site.json');
}
