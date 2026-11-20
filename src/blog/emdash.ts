/**
 * Reading Bryan's Adventures out of EmDash.
 *
 * Content lives in D1 (via EmDash's live collection), so publishing in the admin is live without
 * a build, and these routes stay on-demand while every other route is prerendered.
 *
 * Every function here returns a `Result` and never throws. On an on-demand route an uncaught throw
 * is a 500 for the whole document, masthead and all, and a blog outage should only degrade the one
 * route that needs the data.
 */
import { getEmDashCollection, getEmDashEntry, getTranslations } from 'emdash';

import type { Lang } from '../i18n/ui.js';
import { bylinesOf, imageOf, isPlausibleSlug, isoDate, mineralOf, str } from './normalize.js';
import type { Adventure, AdventureCard } from './types.js';

/** The data layer was reachable and answered. */
export interface Ok<T> {
  readonly ok: true;
  readonly data: T;
}

/**
 * The data layer was not reachable, or answered with something unusable. Deliberately distinct from
 * "there are no adventures yet": collapsing them tells a reader the writing is gone when the
 * service is merely down.
 */
export interface Failed {
  readonly ok: false;
  readonly reason: string;
}

export type Result<T> = Ok<T> | Failed;

const COLLECTION = 'adventures';
function fail(error: unknown): Failed {
  return { ok: false, reason: error instanceof Error ? error.message : String(error) };
}

interface Row {
  readonly id: string;
  readonly data: Record<string, unknown>;
}

/** A real date as ISO, or undefined (unlike `isoDate`, which falls back to the epoch). */
function optionalDate(value: unknown): string | undefined {
  const iso = isoDate(value);
  return iso === new Date(0).toISOString() ? undefined : iso;
}

function card(row: Row): AdventureCard {
  const d = row.data;
  return {
    id: str(d['id']) ?? row.id,
    title: str(d['title']) ?? '',
    // `row.id` is the slug for the default locale but `zh/<slug>` for the others; `data.slug` is bare.
    slug: str(d['slug']) ?? row.id.replace(/^[a-z]{2}\//, ''),
    date: isoDate(d['adventure_date'] ?? d['publishedAt']),
    place: str(d['place']),
    excerpt: str(d['excerpt']),
    mineral: mineralOf(d['mineral']),
    cover: imageOf(d['cover']),
    publishedAt: optionalDate(d['publishedAt']),
    updatedAt: optionalDate(d['updatedAt']),
  };
}

/**
 * The English list. Each row carries its Chinese translation if there is one, so the Chinese list
 * (the same query, read differently) can never show an adventure the English one does not.
 */
export async function listAdventures(): Promise<Result<AdventureCard[]>> {
  try {
    const { entries, error } = await getEmDashCollection(COLLECTION, {
      status: 'published',
      locale: 'en',
      orderBy: { adventure_date: 'desc' },
    });
    if (error) return fail(error);

    const cards = await Promise.all(
      (entries as unknown as Row[]).map(async (row): Promise<AdventureCard> => {
        const base = card(row);
        const zh = await translationOf(base.id, 'zh');
        return {
          ...base,
          zh: zh ? { title: zh.title, slug: zh.slug, excerpt: zh.excerpt, place: zh.place, updatedAt: zh.updatedAt } : null,
        };
      }),
    );
    return { ok: true, data: cards.filter((c) => c.slug && c.title) };
  } catch (error) {
    return fail(error);
  }
}

/** The published sibling of `id` in `locale`, or null. A draft translation does not count. */
async function translationOf(id: string, locale: Lang): Promise<AdventureCard | null> {
  const { translations, error } = await getTranslations(COLLECTION, id);
  if (error) throw error;
  const sibling = translations.find((t) => t.locale === locale && t.status === 'published' && t.slug);
  if (!sibling) return null;
  const { entry } = await getEmDashEntry(COLLECTION, sibling.slug ?? '', { locale });
  if (!entry || (entry as unknown as Row).data['locale'] !== locale) return null;
  return card(entry as unknown as Row);
}

/** One adventure in `lang`, or `null` when there is none (which the page turns into a real 404). */
export async function getAdventure(lang: Lang, slug: string): Promise<Result<Adventure | null>> {
  // A slug that cannot be one is a 404 without asking the CMS (and without a lookup per junk URL).
  if (!isPlausibleSlug(slug)) return { ok: true, data: null };
  try {
    const { entry, error } = await getEmDashEntry(COLLECTION, slug, { locale: lang });
    if (error) return fail(error);
    if (!entry) return { ok: true, data: null };
    const row = entry as unknown as Row;
    if (row.data['status'] !== 'published') return { ok: true, data: null };
    // A lookup in a locale with no entry falls back to the default locale's entry of that slug, so a
    // Chinese URL for an English-only post would serve the English text. Only the requested
    // language's own entry counts; anything else is a real 404.
    if (row.data['locale'] !== lang) return { ok: true, data: null };

    const base = card(row);
    const other = await translationOf(base.id, lang === 'en' ? 'zh' : 'en');
    const body = row.data['body'];
    return {
      ok: true,
      data: {
        ...base,
        language: lang,
        body: Array.isArray(body) ? body : undefined,
        // Hydrated by EmDash onto `data.bylines`: the explicit credits, or the byline linked to the
        // entry's author when there are none. Strict per locale, so a Chinese post is credited by
        // the Chinese variant of a byline, and a post with no variant in its language has none.
        bylines: bylinesOf(row.data['bylines']),
        translation: lang === 'en' && other ? { slug: other.slug } : null,
        original: lang === 'zh' && other ? { slug: other.slug } : null,
      },
    };
  } catch (error) {
    return fail(error);
  }
}
