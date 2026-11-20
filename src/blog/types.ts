import type { ToneName } from '../brand/palette.js';

/** A resolved image: what an `<img>` needs and nothing about where it came from. */
export interface BlogImage {
  readonly src: string;
  readonly alt: string;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
  readonly caption?: string | undefined;
}

/**
 * A credited author, made safe: every string is plain text within a cap, every URL is https and has
 * passed `classifyLink`, the image is an on-site path or https. See `bylineOf` in normalize.ts.
 */
export interface Byline {
  /** EmDash's byline slug (`^[a-z][a-z0-9-]*$`), the stable part of the JSON-LD `@id`. */
  readonly slug: string;
  readonly name: string;
  /** The profile URL (EmDash's `website_url`): `article:author`, and the Person's `url`. */
  readonly url?: string | undefined;
  /** Job title (custom field `job_title`). */
  readonly role?: string | undefined;
  readonly bio?: string | undefined;
  /** The photo (EmDash's avatar media). */
  readonly image?: BlogImage | undefined;
  /** LinkedIn, GitHub, X and the rest of `same_as_other`: https only, de-duplicated. */
  readonly sameAs: readonly string[];
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
  readonly mineral?: ToneName | undefined;
  readonly cover?: BlogImage | undefined;
  /** When EmDash published it (the system field), distinct from `date`, the adventure's own date. */
  readonly publishedAt?: string | undefined;
  readonly updatedAt?: string | undefined;
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
    readonly updatedAt?: string | undefined;
  } | null;
}

/** A full adventure, body included. */
export interface Adventure extends Omit<AdventureCard, 'zh'> {
  readonly language: 'en' | 'zh';
  readonly body?: readonly unknown[] | undefined;
  /** The post's credited authors in order; empty when it has none (the head then names the site's owner, as before). */
  readonly bylines: readonly Byline[];
  /** On a Chinese adventure: the English one it translates. */
  readonly original?: { readonly slug: string } | null;
  /** On an English adventure: its Chinese translation, if there is one. */
  readonly translation?: { readonly slug: string } | null;
}

/** Any of the 21 Mzizi families can be chosen (the CMS select is generated from the palette); cobalt is the fallback so an entry without a mineral still gets its bar. */
export const DEFAULT_MINERAL: ToneName = 'cobalt';
