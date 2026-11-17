import type { MineralName } from '../brand/minerals.js';

/** A resolved image: what an `<img>` needs and nothing about where it came from. */
export interface BlogImage {
  readonly src: string;
  readonly alt: string;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
  readonly caption?: string | undefined;
}

/** One entry in the list — enough to draw a card, not the whole body. */
export interface AdventureCard {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  /** ISO date of the adventure (not of the writing). */
  readonly date: string;
  readonly place?: string | undefined;
  readonly excerpt?: string | undefined;
  readonly mineral?: MineralName | undefined;
  readonly cover?: BlogImage | undefined;
  /**
   * The Chinese translation, when one exists.
   *
   * The Chinese list is built from the English entries, so every adventure
   * appears there: translated where this is set, marked ENGLISH ONLY where it
   * is not.
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
