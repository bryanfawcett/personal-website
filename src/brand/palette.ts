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
    darkHex: "#7986CB",
    lightHex: "#4527A0",
    origin: "Indigofera, West Africa textile tradition",
    symbolism: "Dusk, depth, the dyer's craft",
    usage: "Twilight surfaces, deep atmosphere, mini-app moods",
  },
  {
    name: "savanna",
    darkHex: "#E5C158",
    lightHex: "#8D6E1A",
    origin: "Sub-Saharan grasslands",
    symbolism: "Sun-dried grass, open land, the dry season",
    usage: "Warm grassland surfaces, daylight atmosphere",
  },
  {
    name: "baobab",
    darkHex: "#A1887F",
    lightHex: "#4E342E",
    origin: "Adansonia, across the African continent",
    symbolism: "The tree of life, age, shelter",
    usage: "Earthy surfaces, grounded atmosphere, bark tones",
  },
  {
    name: "sunset",
    darkHex: "#FF7043",
    lightHex: "#D84315",
    origin: "The African horizon at dusk",
    symbolism: "Day's end, warmth, the gathering hour",
    usage: "Warm accent surfaces, golden-hour atmosphere",
  },
  {
    name: "river",
    darkHex: "#4DD0E1",
    lightHex: "#006064",
    origin: "The great African rivers — Zambezi, Nile, Congo",
    symbolism: "Flow, life, the journey",
    usage: "Cool surfaces, flowing atmosphere, water tones",
  },
  {
    name: "hematite",
    darkHex: "#90A4AE",
    lightHex: "#546E7A",
    origin: "Sishen & Thabazimbi, South Africa",
    symbolism: "Foundation, endurance, the substrate",
    usage: "Neutral anchor, mini-app surfaces, atmosphere",
  },
  {
    name: "kalahari",
    darkHex: "#E8D9B5",
    lightHex: "#C9B589",
    origin: "Kalahari & Namib, Southern Africa",
    symbolism: "Openness, space, the light pole",
    usage: "Light anchor, warm backgrounds, mini-app surfaces",
  },
] as const satisfies readonly HeritageColor[];

export const EXPERIMENTAL = [
  {
    name: "ember",
    darkHex: "#DA8766",
    lightHex: "#843D20",
    uiDark: "#BB562D",
    uiLight: "#CD5F33",
  },
  {
    name: "acacia",
    darkHex: "#93A528",
    lightHex: "#4D5615",
    uiDark: "#768420",
    uiLight: "#7E8C22",
  },
  {
    name: "fern",
    darkHex: "#2CB42B",
    lightHex: "#175E17",
    uiDark: "#228D22",
    uiLight: "#259725",
  },
  {
    name: "lagoon",
    darkHex: "#2AAE9B",
    lightHex: "#165B51",
    uiDark: "#218A7A",
    uiLight: "#249383",
  },
  {
    name: "storm",
    darkHex: "#7E9BE0",
    lightHex: "#284CA6",
    uiDark: "#426CD1",
    uiLight: "#577BD6",
  },
  {
    name: "dusk",
    darkHex: "#BA87E2",
    lightHex: "#742AAD",
    uiDark: "#9749D3",
    uiLight: "#A35DD8",
  },
  {
    name: "protea",
    darkHex: "#DF7BB4",
    lightHex: "#932464",
    uiDark: "#CA3188",
    uiLight: "#D34998",
  },
] as const satisfies readonly ExperimentalColor[];

export type HeritageName = (typeof HERITAGE)[number]['name'];
export type ExperimentalName = (typeof EXPERIMENTAL)[number]['name'];

/** `var(--color-river)`: the token @bundu/ui defines for every family. */
export function colorVar(name: HeritageName | ExperimentalName): string {
  return `var(--color-${name})`;
}
