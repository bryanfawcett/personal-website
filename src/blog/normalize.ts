/**
 * Untrusted values out of EmDash, made safe to use. Pure functions with no EmDash import, so they
 * run under `node --test` (scripts/tests/blog-untrusted.test.mjs) without a build.
 *
 * Everything the CMS returns is treated as untrusted input however trusted its editors are (Mzizi
 * N4): a compromised account, a bad import or a plugin bug all arrive through the same fields.
 */
import { MZIZI_PALETTE } from '../brand/mzizi-palette.generated.js';
import type { ToneName } from '../brand/palette.js';
import { classifyLink } from '../../packages/emdash-plugins/core/src/index.ts';
import type { BlogImage, Byline } from './types.js';

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

/* ------------------------------------------------------------------ bylines */

/** Caps on what a byline may say: far above any real author, low enough that no field can swell a page or a JSON-LD block. */
export const BYLINE_LIMITS = { name: 80, role: 120, bio: 500, url: 300, sameAs: 6, bylines: 5 } as const;

/** Control, zero-width and bidi-override characters: no business in a name or a bio. */
// eslint-disable-next-line no-control-regex
const INVISIBLE = new RegExp('[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u202a-\\u202e\\u2028\\u2029\\u2060-\\u2064\\u2066-\\u2069\\ufeff]', 'g');

/**
 * Plain text from an untrusted string: no markup, no control or bidi characters, one line, at most
 * `max` code points. `<script>` and `<style>` lose their contents along with their tags; any other
 * tag loses only itself. Output is still escaped by whoever writes it; this is what makes "no
 * markup" true of the value itself (a bio that is a `<script>` tag must not survive as `alert(1)`).
 */
export function plainText(value: unknown, max: number, ellipsis = false): string | undefined {
  if (typeof value !== 'string') return undefined;
  // Bound the work before any regex: a megabyte of `<` must not cost a megabyte of scanning.
  const text = value
    .slice(0, max * 8 + 64)
    .replace(/<\s*(script|style)\b[\s\S]*?(<\s*\/\s*\1\s*>|$)/gi, ' ')
    .replace(/<[^<>]*>/g, ' ')
    .replace(/[<>]/g, ' ')
    .replace(INVISIBLE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return undefined;
  const points = Array.from(text);
  if (points.length <= max) return text;
  return ellipsis ? `${points.slice(0, max - 1).join('').trimEnd()}…` : points.slice(0, max).join('').trimEnd();
}

/** An https URL for a person's page or profile: it passed `classifyLink`, has no credentials, and is bounded. Otherwise undefined. */
export function webUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const href = value.trim();
  if (!href || href.length > BYLINE_LIMITS.url) return undefined;
  if (!classifyLink(href)) return undefined;
  try {
    const url = new URL(href);
    if (url.protocol !== 'https:' || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

const BYLINE_SLUG = /^[a-z][a-z0-9-]{0,62}$/;

/**
 * One EmDash byline (`BylineSummary`, as `entry.data.bylines[].byline` carries it) made safe, or
 * undefined when it cannot be one: no usable slug or no name. Fixed columns: `displayName` -> name,
 * `websiteUrl` -> url, `bio`, the avatar's storage key -> image. Custom fields: `job_title`,
 * `linkedin_url`, `github_url`, `x_url`, `same_as_other` (one URL per line).
 */
export function bylineOf(value: unknown): Byline | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const v = value as Record<string, unknown>;
  const slug = typeof v['slug'] === 'string' && BYLINE_SLUG.test(v['slug']) ? v['slug'] : undefined;
  const name = plainText(v['displayName'], BYLINE_LIMITS.name);
  if (!slug || !name) return undefined;

  const fields = (v['customFields'] && typeof v['customFields'] === 'object' ? v['customFields'] : {}) as Record<string, unknown>;
  const url = webUrl(v['websiteUrl']);
  const lines = typeof fields['same_as_other'] === 'string' ? fields['same_as_other'].slice(0, 4000).split(/\r?\n/) : [];
  const sameAs = [
    ...new Set(
      [fields['linkedin_url'], fields['github_url'], fields['x_url'], ...lines]
        .map(webUrl)
        .filter((u): u is string => u !== undefined && u !== url),
    ),
  ].slice(0, BYLINE_LIMITS.sameAs);

  const key = str(v['avatarStorageKey']) ?? str(v['avatarMediaId']);
  const image = key ? imageOf({ meta: { storageKey: key }, alt: plainText(v['avatarAlt'], 200) }) : undefined;

  return {
    slug,
    name,
    url,
    role: plainText(fields['job_title'], BYLINE_LIMITS.role),
    bio: plainText(v['bio'], BYLINE_LIMITS.bio, true),
    image,
    sameAs,
  };
}

/** The credits on an entry (`entry.data.bylines`): in `sortOrder`, de-duplicated by slug, at most `BYLINE_LIMITS.bylines`. */
export function bylinesOf(value: unknown): Byline[] {
  if (!Array.isArray(value)) return [];
  const credits = value
    .slice(0, 50)
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .map((c, i) => ({ c, order: typeof c['sortOrder'] === 'number' && Number.isFinite(c['sortOrder']) ? c['sortOrder'] : i }))
    .sort((a, b) => a.order - b.order);
  const out: Byline[] = [];
  for (const { c } of credits) {
    const b = bylineOf(c['byline']);
    if (b && !out.some((o) => o.slug === b.slug)) out.push(b);
    if (out.length >= BYLINE_LIMITS.bylines) break;
  }
  return out;
}
