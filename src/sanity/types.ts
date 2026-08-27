import type { MineralName } from '../brand/minerals.js';

/** A Sanity image reference, as it comes back from a projection. */
export interface SanityImage {
  readonly asset?: { readonly _ref?: string } | undefined;
  readonly alt?: string | undefined;
  readonly caption?: string | undefined;
}

/** One entry in the list — enough to draw a card, not the whole body. */
export interface AdventureCard {
  readonly _id: string;
  readonly title: string;
  readonly slug: string;
  readonly publishedAt: string;
  readonly place?: string | undefined;
  readonly excerpt?: string | undefined;
  readonly mineral?: MineralName | undefined;
  readonly cover?: SanityImage | undefined;
  /**
   * The Chinese translation, when one exists.
   *
   * Present on the English record rather than the other way round, because the
   * Chinese list is built from the English one: every adventure appears there,
   * and this is what decides whether it shows translated or carries the
   * ENGLISH ONLY mark.
   */
  readonly zh?: {
    readonly title: string;
    readonly slug: string;
    readonly excerpt?: string | undefined;
    readonly place?: string | undefined;
  } | null;
}

/** A full adventure, body included. */
export interface Adventure extends Omit<AdventureCard, 'zh'> {
  readonly language: 'en' | 'zh';
  readonly body?: readonly unknown[] | undefined;
  /** On a Chinese adventure: the English one it translates. */
  readonly original?: { readonly slug: string } | null;
  /** On an English adventure: its Chinese translation, if there is one. */
  readonly translation?: { readonly slug: string } | null;
}

/** Cobalt is the fallback so an entry without a mineral still gets its bar. */
export const DEFAULT_MINERAL: MineralName = 'cobalt';
