/**
 * Untrusted values out of EmDash, made safe to use. Pure functions with no EmDash import, so they
 * run under `node --test` (scripts/tests/blog-untrusted.test.mjs) without a build.
 *
 * Everything the CMS returns is treated as untrusted input however trusted its editors are (Mzizi
 * N4): a compromised account, a bad import or a plugin bug all arrive through the same fields.
 */
import { MZIZI_PALETTE } from '../brand/mzizi-palette.generated.js';
import type { ToneName } from '../brand/palette.js';
import type { BlogImage } from './types.js';

/** Every family the palette has: the CMS select is generated from the same keys (scripts/build-seed-minerals.mjs). */
const FAMILIES: ReadonlySet<string> = new Set(Object.keys(MZIZI_PALETTE));

/** A non-empty string, or undefined. Numbers, objects and arrays are not strings. */
export function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * An ISO date, or the epoch for anything that is not a real date. Never throws: a hostile value
 * (a Symbol, an object whose `toString` throws, an absurd year) must not take the page down.
 * The Rust prototype's parser had to be taught the same (a multibyte offset panicked it).
 */
export function isoDate(value: unknown): string {
  const EPOCH = new Date(0).toISOString();
  try {
    let d: Date;
    if (value instanceof Date) d = value;
    else if (typeof value === 'string' && value.length <= 40) d = new Date(value);
    else if (typeof value === 'number') d = new Date(value);
    else return EPOCH;
    return Number.isNaN(d.getTime()) ? EPOCH : d.toISOString();
  } catch {
    return EPOCH;
  }
}

/** A mineral that the site can draw: one of the palette's families, never a hex or anything else. */
export function mineralOf(value: unknown): ToneName | undefined {
  return typeof value === 'string' && FAMILIES.has(value) ? (value as ToneName) : undefined;
}

/** A URL a page may load an image from: an on-site path or https. No scheme tricks, no whitespace. */
export function isSafeImageSrc(src: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /^(\/(?!\/)|https:\/\/)/.test(src) && !/[\\\u0000- \u007f-\u009f]/.test(src);
}

/** A positive pixel size, or undefined (NaN, Infinity, negatives and absurd values are dropped). */
export function pixels(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 20000
    ? Math.round(value)
    : undefined;
}

/** An EmDash image field, or undefined when it has no usable file. Alt is required by the sheet, not by the CMS. */
export function imageOf(value: unknown): BlogImage | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const v = value as Record<string, unknown>;
  // A local-provider image carries no `src`: the file is named by its storage key (or, failing that,
  // its media id) and served by EmDash's own file route, which the Worker answers first.
  const meta = (v['meta'] && typeof v['meta'] === 'object' ? v['meta'] : {}) as Record<string, unknown>;
  const key = str(meta['storageKey']) ?? str(v['id']);
  const src = str(v['src']) ?? (key && /^[A-Za-z0-9._-]+$/.test(key) ? `/_emdash/api/media/file/${key}` : undefined);
  if (!src || !isSafeImageSrc(src)) return undefined;
  return {
    src,
    alt: str(v['alt']) ?? '',
    width: pixels(v['width']),
    height: pixels(v['height']),
    caption: str(v['caption']),
  };
}

/** Longest slug asked of the CMS; anything longer is a 404 without a query. */
export const MAX_SLUG_LENGTH = 200;

/** A slug worth looking up: bounded, and with no control character or path separator in it. */
export function isPlausibleSlug(slug: string): boolean {
  // eslint-disable-next-line no-control-regex
  return slug.length > 0 && slug.length <= MAX_SLUG_LENGTH && !/[\u0000-\u001f\u007f-\u009f/\\]/.test(slug);
}
