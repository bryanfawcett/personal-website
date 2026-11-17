/**
 * The seven Mzizi minerals.
 *
 * Mirrored from the Mzizi registry's brand system (mzizi.dev/api/v1, `minerals` family)
 * so the site builds without a network call. Each mineral carries the origin
 * and meaning it was named for — that provenance is the point of the palette,
 * not decoration.
 *
 * The site is a cyanotype: pale line work on a deep blue ground. `hex` is
 * therefore Mzizi's dark-surface value, the one that holds contrast against
 * that ground. `onLight` keeps the paper-readable value so the same file can
 * serve a light property (StationKit, bundu.org) without a second source of
 * truth.
 */

export interface Mineral {
  /** Token name, used to build the CSS custom property `--mineral-<name>`. */
  readonly name: string;
  /** Value this site draws in. Holds contrast against the deep blue ground. */
  readonly hex: string;
  /** Paper-readable value, for a light property consuming the same tokens. */
  readonly onLight: string;
  /** Mzizi's dark container: a surface themed in this mineral. */
  readonly container: string;
  /** Mzizi's light container, for a paper property consuming these tokens. */
  readonly containerLight: string;
  /** Text and line work on the dark container — Mzizi's on-container value. */
  readonly onContainer: string;
  /** The same on the light container, for the light theme. */
  readonly onContainerLight: string;
  /** Where the stone is mined. */
  readonly origin: string;
  /** What it stands for in the system. */
  readonly symbolism: string;
  /** What it is for, in interface terms. */
  readonly usage: string;
}

export const MINERALS = [
  {
    name: 'cobalt',
    hex: '#00B0FF',
    onLight: '#0047AB',
    container: '#001F3F',
    containerLight: '#E3F2FD',
    onContainer: '#B3E5FC',
    onContainerLight: '#002966',
    origin: 'Katanga (DRC) and the Zambian Copperbelt',
    symbolism: 'Digital future, trust, knowledge',
    usage: 'Links, focus rings, informational states',
  },
  {
    name: 'tanzanite',
    hex: '#B388FF',
    onLight: '#4B0082',
    container: '#1A0033',
    containerLight: '#F3E5F5',
    onContainer: '#E1BEE7',
    onContainerLight: '#2E004D',
    origin: 'Merelani Hills, Tanzania',
    symbolism: 'Premium, creativity, connection',
    usage: 'Primary brand accent',
  },
  {
    name: 'malachite',
    hex: '#64FFDA',
    onLight: '#004D40',
    container: '#00251A',
    containerLight: '#E0F2F1',
    onContainer: '#A7FFEB',
    onContainerLight: '#00332B',
    origin: 'Congo Copper Belt',
    symbolism: 'Growth, nature, success',
    usage: 'Success states, positive actions',
  },
  {
    name: 'gold',
    hex: '#FFD740',
    onLight: '#5D4037', // the registry's gold on light (mzizi-tokens GOLD_LIGHT); was #9A6F00 until 2026-11-17
    container: '#332200',
    containerLight: '#FFF8E1',
    onContainer: '#FFECB3',
    onContainerLight: '#3E2723',
    origin: 'Ghana, South Africa, Mali',
    symbolism: 'Honey, rewards, warmth',
    usage: 'Achievements and highlights',
  },
  {
    name: 'terracotta',
    hex: '#E1B07E',
    onLight: '#A0522D',
    container: '#3E2817',
    containerLight: '#F5E6D3',
    onContainer: '#FFCCBC',
    onContainerLight: '#5D2906',
    origin: 'the Pan-African Sahel',
    symbolism: 'Earth, community, grounding',
    usage: 'Community surfaces, warmth',
  },
  {
    name: 'sodalite',
    hex: '#3D5AFE',
    onLight: '#283593',
    container: '#0D1442',
    containerLight: '#E8EAF6',
    onContainer: '#C5CAE9',
    onContainerLight: '#1A237E',
    origin: 'the Kunene River, Namibia and South Africa',
    symbolism: 'Intelligence, depth, reasoning',
    usage: 'AI surfaces, deep-reasoning states',
  },
  {
    name: 'copper',
    hex: '#FF8A65',
    onLight: '#BF5A36',
    container: '#3A1A0E',
    containerLight: '#FBE4DA',
    onContainer: '#FFCCBC',
    onContainerLight: '#5A2310',
    origin: 'the Central African Copperbelt, Zambia and DRC',
    symbolism: 'Connection, foundation, stewardship',
    usage: 'Ecosystem identity, the commons',
  },
] as const satisfies readonly Mineral[];

export type MineralName = (typeof MINERALS)[number]['name'];

const BY_NAME = new Map<string, Mineral>(MINERALS.map((m) => [m.name, m]));

/** Look a mineral up by name. Typed so a typo fails at compile time. */
export function mineral(name: MineralName): Mineral {
  const found = BY_NAME.get(name);
  /* c8 ignore next 3 -- unreachable while MineralName is derived from MINERALS */
  if (!found) {
    throw new Error(`Unknown mineral: ${name}`);
  }
  return found;
}

/** `var(--mineral-cobalt)` — for inline styles and component props. */
export function mineralVar(name: MineralName): string {
  return `var(--mineral-${name})`;
}
