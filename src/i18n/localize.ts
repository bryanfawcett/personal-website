/**
 * Bilingual content records.
 *
 * Subject prose stays with its record in `src/data/` rather than moving into
 * the chrome dictionary, so `work.ts` remains the single source of truth for
 * the ecosystem grid. Each record carries the English inline and a `zh` block
 * holding only the fields that are actually translated — the mineral, the
 * href and the group are language-neutral and are never duplicated.
 */
import { type Lang } from './ui.js';

/** `T` with a Chinese override for exactly the translatable keys `K`. */
export type Bilingual<T, K extends keyof T> = T & { readonly zh: Readonly<Pick<T, K>> };

/** Resolve one record to a language. English records pass through untouched. */
export function inLang<T extends object, K extends keyof T>(
  entry: Bilingual<T, K>,
  lang: Lang,
): T {
  return lang === 'en' ? entry : { ...entry, ...entry.zh };
}

/** Resolve a list of records to a language. */
export function listInLang<T extends object, K extends keyof T>(
  entries: readonly Bilingual<T, K>[],
  lang: Lang,
): T[] {
  return entries.map((entry) => inLang(entry, lang));
}
