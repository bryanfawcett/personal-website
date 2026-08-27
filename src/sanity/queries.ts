/**
 * Every GROQ query the blog runs.
 *
 * Kept together rather than inline in the pages so the shape of what the site
 * asks for is readable in one place — and so the projections stay in step with
 * `types.ts`, which is hand-written against them.
 *
 * Translations are joined through `translation.metadata`, the document
 * `@sanity/document-internationalization` maintains. Neither adventure carries
 * a pointer to the other: the metadata document references both, which is what
 * lets the Studio offer a Translations menu and what keeps an English-only
 * adventure a perfectly ordinary document rather than one with an empty field.
 *
 * `references(^._id)` is the documented way in — and it is an indexed filter,
 * so this stays cheap as the blog grows.
 *
 * The language lives in a `language` field on each array item. It used to be
 * the item's `_key`; plugin v6 moved it, because `_key` is what Sanity uses
 * for array identity and diffing. Querying `_key == "zh"` here would silently
 * match nothing.
 */

/** Fields a card needs. Shared so the two list queries cannot drift apart. */
const CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  place,
  mineral,
  excerpt,
  cover
`;

/** The sibling adventure in `$lang`, resolved through the metadata document. */
const translationIn = (language: string, projection: string): string => `
  *[_type == "translation.metadata" && references(^._id)][0]
    .translations[language == "${language}"][0]
    .value->{ ${projection} }
`;

/**
 * The English list.
 *
 * Each row carries its Chinese translation if there is one — the Chinese list
 * is the same query, read differently, so an adventure can never appear in one
 * language's list and not the other.
 */
export const ADVENTURE_LIST = `
*[_type == "adventure" && language == "en" && defined(slug.current)]
  | order(publishedAt desc) {
    ${CARD_FIELDS},
    "zh": ${translationIn('zh', 'title, "slug": slug.current, excerpt, place')}
  }
`;

/** One English adventure, with a pointer to its translation if it has one. */
export const ADVENTURE_EN = `
*[_type == "adventure" && language == "en" && slug.current == $slug][0] {
  ${CARD_FIELDS},
  language,
  body,
  "translation": ${translationIn('zh', '"slug": slug.current')}
}
`;

/** One Chinese adventure, with a pointer back to the English original. */
export const ADVENTURE_ZH = `
*[_type == "adventure" && language == "zh" && slug.current == $slug][0] {
  ${CARD_FIELDS},
  language,
  body,
  "original": ${translationIn('en', '"slug": slug.current')}
}
`;
