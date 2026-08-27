/**
 * Every GROQ query the blog runs.
 *
 * Kept together rather than inline in the pages so the shape of what the site
 * asks for is readable in one place — and so the projections stay in step with
 * `types.ts`, which is hand-written against them.
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
    "zh": *[_type == "adventure" && language == "zh" && translationOf._ref == ^._id][0] {
      title,
      "slug": slug.current,
      excerpt,
      place
    }
  }
`;

/** One English adventure, with a pointer to its translation if it has one. */
export const ADVENTURE_EN = `
*[_type == "adventure" && language == "en" && slug.current == $slug][0] {
  ${CARD_FIELDS},
  language,
  body,
  "translation": *[_type == "adventure" && language == "zh" && translationOf._ref == ^._id][0] {
    "slug": slug.current
  }
}
`;

/** One Chinese adventure, with a pointer back to the English original. */
export const ADVENTURE_ZH = `
*[_type == "adventure" && language == "zh" && slug.current == $slug][0] {
  ${CARD_FIELDS},
  language,
  body,
  "original": translationOf-> {
    "slug": slug.current
  }
}
`;
