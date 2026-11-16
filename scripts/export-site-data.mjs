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
import { bunduWork, nyuchiWork, schoolWork } from '../src/data/origins.ts';
import { NAV, PROFILE, profileInLang, socialsInLang } from '../src/data/profile.ts';
import { ui as UI, useTranslations } from '../src/i18n/ui.ts';
import { MINERALS, mineral } from '../src/brand/minerals.ts';
import { INK, INK_LIGHT, SHEET_LIGHT } from '../src/brand/tokens.ts';

const OUT = new URL('../src/data/generated/site.json', import.meta.url);
const UI_OUT = new URL('../src/data/generated/ui.json', import.meta.url);

const ui = useTranslations('en');
const workItems = (items) =>
  items.map(({ title, detail, href }) => ({ title, detail, ...(href ? { href } : {}) }));

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
  // The localised descriptive lines, for the Rust components (name, email and socials do not change).
  profile_zh: (() => {
    const p = profileInLang('zh');
    return { title: p.title, roles: p.roles.map(({ title, org }) => ({ title, org })) };
  })(),
  // The Origins page's "What I'm working on", in English, so the deck's work slide
  // is built from the same records and strings and the two cannot drift.
  origins_work: {
    heading: ui('origins.now_heading'),
    lede: ui('origins.now_lede'),
    columns: [
      { heading: ui('origins.now_sas'), items: workItems(schoolWork('en')) },
      { heading: ui('origins.now_nyuchi'), items: workItems(nyuchiWork('en')) },
      { heading: ui('origins.now_bundu'), items: workItems(bunduWork('en')) },
    ],
    note: ui('origins.now_aside'),
  },
  // What the shared chrome (header, footer) reads, so the Rust components render
  // it from data rather than from a copy of the TypeScript.
  nav: NAV.map(({ labelKey, href, header }) => ({ labelKey, href, header })),
  socials: {
    en: socialsInLang('en').map(({ name, href }) => ({ name, href })),
    zh: socialsInLang('zh').map(({ name, href }) => ({ name, href })),
  },
  minerals: MINERALS.map((m) => m.name),
  booking_url: BOOKING_URL,
  qr: {
    dark: { dark: INK.base, light: mineral('cobalt').container },
    light: { dark: INK_LIGHT.base, light: SHEET_LIGHT.wash },
  },
};
const json = JSON.stringify(site, null, 2) + '\n';
const uiJson = JSON.stringify(UI, null, 2) + '\n';

const files = [
  [OUT, json, 'src/data/generated/site.json'],
  [UI_OUT, uiJson, 'src/data/generated/ui.json'],
];

if (process.argv.includes('--check')) {
  let stale = false;
  for (const [url, text, label] of files) {
    let current = '';
    try {
      current = readFileSync(url, 'utf8');
    } catch {}
    if (current !== text) {
      console.error(`${label} is stale. Run \`pnpm site-data\` and commit the result.`);
      stale = true;
    }
  }
  if (stale) process.exit(1);
  console.log('site.json and ui.json are up to date');
} else {
  for (const [url, text, label] of files) writeFileSync(url, text);
  console.log('wrote src/data/generated/site.json and ui.json');
}
