/**
 * The seven Mzizi minerals.
 *
 * Mirrored from the Mzizi design system (mzizi.dev/api/v1, `minerals` family)
 * so the site builds without a network call. Each mineral carries the origin
 * and meaning it was named for — that provenance is the point of the palette,
 * not decoration.
 *
 * This site renders dark only, so `hex` here is the dark-surface value.
 */

export interface Mineral {
  /** Token name, used to build the CSS custom property `--mineral-<name>`. */
  readonly name: string;
  /** Value tuned for dark surfaces. This site never renders light. */
  readonly hex: string;
  /** Deep companion tone for containers and washes. */
  readonly container: string;
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
    container: '#001F3F',
    origin: 'Katanga (DRC) and the Zambian Copperbelt',
    symbolism: 'Digital future, trust, knowledge',
    usage: 'Links, focus rings, informational states',
  },
  {
    name: 'tanzanite',
    hex: '#B388FF',
    container: '#1A0033',
    origin: 'Merelani Hills, Tanzania',
    symbolism: 'Premium, creativity, connection',
    usage: 'Primary brand accent',
  },
  {
    name: 'malachite',
    hex: '#64FFDA',
    container: '#00251A',
    origin: 'Congo Copper Belt',
    symbolism: 'Growth, nature, success',
    usage: 'Success states, positive actions',
  },
  {
    name: 'gold',
    hex: '#FFD740',
    container: '#332200',
    origin: 'Ghana, South Africa, Mali',
    symbolism: 'Honey, rewards, warmth',
    usage: 'Achievements and highlights',
  },
  {
    name: 'terracotta',
    hex: '#E1B07E',
    container: '#3E2817',
    origin: 'the Pan-African Sahel',
    symbolism: 'Earth, community, grounding',
    usage: 'Community surfaces, warmth',
  },
  {
    name: 'sodalite',
    hex: '#3D5AFE',
    container: '#0D1442',
    origin: 'the Kunene River, Namibia and South Africa',
    symbolism: 'Intelligence, depth, reasoning',
    usage: 'AI surfaces, deep-reasoning states',
  },
  {
    name: 'copper',
    hex: '#FF8A65',
    container: '#3A1A0E',
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
