import type { EntryRef, Finding } from './types.ts';

export interface TranslationInput {
  /** The entry being published. */
  readonly entry: EntryRef;
  /** The other entries in its translation group (not including `entry`). */
  readonly siblings: readonly EntryRef[];
  /** Other entries of the same collection in the same locale as `entry` (not including `entry`). */
  readonly sameLocale: readonly EntryRef[];
  /** The source language. A non-default entry has to pair with an entry in this one. */
  readonly defaultLocale: string;
}

/** Pairing and slug rules for a translated collection. */
export function checkTranslations(input: TranslationInput): Finding[] {
  const out: Finding[] = [];
  const { entry, siblings, sameLocale, defaultLocale } = input;
  const locale = entry.locale ?? defaultLocale;

  if (locale !== defaultLocale) {
    const source = siblings.filter((s) => (s.locale ?? defaultLocale) === defaultLocale);
    if (source.length === 0) {
      out.push({
        rule: 'translation.orphan',
        severity: 'error',
        path: 'locale',
        message: `This is a "${locale}" entry but it is not linked to a "${defaultLocale}" entry, so readers could never reach it from its original. Create it from the "${defaultLocale}" entry's Translations panel (Add translation), or move its content into one made that way, then publish.`,
      });
    } else if (!source.some((s) => s.status === 'published')) {
      out.push({
        rule: 'translation.source-unpublished',
        severity: 'error',
        path: 'locale',
        message: `The "${defaultLocale}" entry this translates is not published yet, so this "${locale}" entry would not appear in any list. Publish the "${defaultLocale}" entry first, then publish this one.`,
      });
    }
  }

  if (entry.slug) {
    const clash = sameLocale.find((e) => e.slug === entry.slug);
    if (clash) {
      out.push({
        rule: 'translation.slug-duplicate',
        severity: 'error',
        path: 'slug',
        message: `Another "${locale}" entry already uses the address "${entry.slug}". Change this entry's slug to something unique before publishing.`,
      });
    }
  }
  return out;
}

export interface Alternate {
  readonly locale: string;
  readonly slug: string;
}

/**
 * The hreflang alternates a page may declare: itself plus every PUBLISHED translation in another locale.
 * An entry with no published translation returns an empty list, because an alternate pointing at a page
 * that is not a translation is a lie told to a search engine.
 */
export function hreflangAlternates(entry: EntryRef, siblings: readonly EntryRef[], defaultLocale: string): Alternate[] {
  const others = siblings.filter(
    (s) => s.status === 'published' && s.slug && (s.locale ?? defaultLocale) !== (entry.locale ?? defaultLocale),
  );
  if (others.length === 0 || !entry.slug) return [];
  return [
    { locale: entry.locale ?? defaultLocale, slug: entry.slug },
    ...others.map((s) => ({ locale: s.locale ?? defaultLocale, slug: s.slug as string })),
  ];
}
