/**
 * The seven Mzizi minerals.
 *
 * Mirrored from the Mzizi design system (mzizi.dev/api/v1, `minerals` family)
 * so the site builds without a network call. Each mineral carries the origin
 * and meaning it was named for — that provenance is the point of the palette,
 * not decoration.
 *
 * This site is drawn on parchment, so `hex` is Mzizi's paper-readable value —
 * the one that holds contrast against a light ground. `vivid` keeps the
 * saturated dark-surface value, which is what the mineral rail is drawn in:
 * a 6px band of pure colour needs no contrast ratio, body text does.
 */

export interface Mineral {
  /** Token name, used to build the CSS custom property `--mineral-<name>`. */
  readonly name: string;
  /** Paper-readable value. Safe for text and rules on parchment. */
  readonly hex: string;
  /** Saturated value. For the mineral rail and other non-text fills only. */
  readonly vivid: string;
  /** Pale companion tone for container fills. */
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
    hex: '#0047AB',
    vivid: '#00B0FF',
    container: '#E3F2FD',
    origin: 'Katanga (DRC) and the Zambian Copperbelt',
    symbolism: 'Digital future, trust, knowledge',
    usage: 'Links, focus rings, informational states',
  },
  {
    name: 'tanzanite',
    hex: '#4B0082',
    vivid: '#B388FF',
    container: '#F3E5F5',
    origin: 'Merelani Hills, Tanzania',
    symbolism: 'Premium, creativity, connection',
    usage: 'Primary brand accent',
  },
  {
    name: 'malachite',
    hex: '#004D40',
    vivid: '#64FFDA',
    container: '#E0F2F1',
    origin: 'Congo Copper Belt',
    symbolism: 'Growth, nature, success',
    usage: 'Success states, positive actions',
  },
  {
    name: 'gold',
    hex: '#9A6F00',
    vivid: '#FFD740',
    container: '#FFF8E1',
    origin: 'Ghana, South Africa, Mali',
    symbolism: 'Honey, rewards, warmth',
    usage: 'Achievements and highlights',
  },
  {
    name: 'terracotta',
    hex: '#A0522D',
    vivid: '#E1B07E',
    container: '#F5E6D3',
    origin: 'the Pan-African Sahel',
    symbolism: 'Earth, community, grounding',
    usage: 'Community surfaces, warmth',
  },
  {
    name: 'sodalite',
    hex: '#283593',
    vivid: '#3D5AFE',
    container: '#E8EAF6',
    origin: 'the Kunene River, Namibia and South Africa',
    symbolism: 'Intelligence, depth, reasoning',
    usage: 'AI surfaces, deep-reasoning states',
  },
  {
    name: 'copper',
    hex: '#BF5A36',
    vivid: '#FF8A65',
    container: '#FBE4DA',
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
