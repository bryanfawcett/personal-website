/**
 * The rest of the Mzizi palette: the heritage seven and the experimental seven.
 *
 * `minerals.ts` mirrors the first seven; this mirrors the other fourteen, so the
 * Minerals page can show all 21 families without a network call. Generated from
 * the registry's published palette (mzizi-dev/mzizi-registry,
 * plugin/skills/mzizi-design/tokens/palette.json, doctrine 4.1.0) on 16 November
 * 2026. The registry is canonical: re-sync from it, never edit values here.
 *
 * What each set carries differs, and the page says so rather than papering over it:
 * - **Heritage** tones are named for the African landscape and carry an origin, a
 *   meaning and a use, as the minerals do.
 * - **Experimental** families are a computed heptagon (hues offset 17 degrees) and
 *   carry colour values only: no origin and no meaning yet.
 *
 * `darkHex` is the dark-surface value, the one this site draws in. The CSS custom
 * property for each is `--color-<name>`, defined by @bundu/ui's tokens.
 */

import { MZIZI_PALETTE } from './mzizi-palette.generated.js';

export interface HeritageColor {
  readonly name: string;
  /** Dark-surface value: the one that holds contrast on this site's ground. */
  readonly darkHex: string;
  readonly lightHex: string;
  readonly origin: string;
  readonly symbolism: string;
  readonly usage: string;
}

export interface ExperimentalColor {
  readonly name: string;
  readonly darkHex: string;
  readonly lightHex: string;
  /** The value for UI fills in each theme. */
  readonly uiDark: string;
  readonly uiLight: string;
}

export const HERITAGE = [
  {
    name: "indigo",
    darkHex: MZIZI_PALETTE.indigo.dark,
    lightHex: MZIZI_PALETTE.indigo.light,
    origin: "Indigofera, West Africa textile tradition",
    symbolism: "Dusk, depth, the dyer's craft",
    usage: "Twilight surfaces, deep atmosphere, mini-app moods",
  },
  {
    name: "savanna",
    darkHex: MZIZI_PALETTE.savanna.dark,
    lightHex: MZIZI_PALETTE.savanna.light,
    origin: "Sub-Saharan grasslands",
    symbolism: "Sun-dried grass, open land, the dry season",
    usage: "Warm grassland surfaces, daylight atmosphere",
  },
  {
    name: "baobab",
    darkHex: MZIZI_PALETTE.baobab.dark,
    lightHex: MZIZI_PALETTE.baobab.light,
    origin: "Adansonia, across the African continent",
    symbolism: "The tree of life, age, shelter",
    usage: "Earthy surfaces, grounded atmosphere, bark tones",
  },
  {
    name: "sunset",
    darkHex: MZIZI_PALETTE.sunset.dark,
    lightHex: MZIZI_PALETTE.sunset.light,
    origin: "The African horizon at dusk",
    symbolism: "Day's end, warmth, the gathering hour",
    usage: "Warm accent surfaces, golden-hour atmosphere",
  },
  {
    name: "river",
    darkHex: MZIZI_PALETTE.river.dark,
    lightHex: MZIZI_PALETTE.river.light,
    origin: "The great African rivers — Zambezi, Nile, Congo",
    symbolism: "Flow, life, the journey",
    usage: "Cool surfaces, flowing atmosphere, water tones",
  },
  {
    name: "hematite",
    darkHex: MZIZI_PALETTE.hematite.dark,
    lightHex: MZIZI_PALETTE.hematite.light,
    origin: "Sishen & Thabazimbi, South Africa",
    symbolism: "Foundation, endurance, the substrate",
    usage: "Neutral anchor, mini-app surfaces, atmosphere",
  },
  {
    name: "kalahari",
    darkHex: MZIZI_PALETTE.kalahari.dark,
    lightHex: MZIZI_PALETTE.kalahari.light,
    origin: "Kalahari & Namib, Southern Africa",
    symbolism: "Openness, space, the light pole",
    usage: "Light anchor, warm backgrounds, mini-app surfaces",
  },
] as const satisfies readonly HeritageColor[];

export const EXPERIMENTAL = [
  {
    name: "ember",
    darkHex: MZIZI_PALETTE.ember.dark,
    lightHex: MZIZI_PALETTE.ember.light,
    uiDark: "#BB562D",
    uiLight: "#CD5F33",
  },
  {
    name: "acacia",
    darkHex: MZIZI_PALETTE.acacia.dark,
    lightHex: MZIZI_PALETTE.acacia.light,
    uiDark: "#768420",
    uiLight: "#7E8C22",
  },
  {
    name: "fern",
    darkHex: MZIZI_PALETTE.fern.dark,
    lightHex: MZIZI_PALETTE.fern.light,
    uiDark: "#228D22",
    uiLight: "#259725",
  },
  {
    name: "lagoon",
    darkHex: MZIZI_PALETTE.lagoon.dark,
    lightHex: MZIZI_PALETTE.lagoon.light,
    uiDark: "#218A7A",
    uiLight: "#249383",
  },
  {
    name: "storm",
    darkHex: MZIZI_PALETTE.storm.dark,
    lightHex: MZIZI_PALETTE.storm.light,
    uiDark: "#426CD1",
    uiLight: "#577BD6",
  },
  {
    name: "dusk",
    darkHex: MZIZI_PALETTE.dusk.dark,
    lightHex: MZIZI_PALETTE.dusk.light,
    uiDark: "#9749D3",
    uiLight: "#A35DD8",
  },
  {
    name: "protea",
    darkHex: MZIZI_PALETTE.protea.dark,
    lightHex: MZIZI_PALETTE.protea.light,
    uiDark: "#CA3188",
    uiLight: "#D34998",
  },
] as const satisfies readonly ExperimentalColor[];

import type { MineralName } from './minerals.js';

export type HeritageName = (typeof HERITAGE)[number]['name'];
export type ExperimentalName = (typeof EXPERIMENTAL)[number]['name'];

/** Any family of the 21 that can key a surface with `data-mineral`. */
export type ToneName = MineralName | HeritageName | ExperimentalName;
