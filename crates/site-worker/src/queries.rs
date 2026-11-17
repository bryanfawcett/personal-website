//! The three GROQ queries, ported byte for byte from `src/sanity/queries.ts`.
//!
//! `tests/queries-parity.mjs` imports the TypeScript, takes its three exported strings and
//! compares them with these, so the two cannot drift without a failing check. The
//! `macro_rules!` shape mirrors the TypeScript template functions: `CARD_FIELDS` is shared,
//! and `translation_in!` is `translationIn(language, projection)`.

/// Sanity project and dataset: public identifiers (they appear in every image URL).
pub const SANITY_PROJECT_ID: &str = "zsx9erk1";
pub const SANITY_DATASET: &str = "production";
/// GROQ is versioned by date; pinned, as in `client.ts`.
pub const API_VERSION: &str = "2025-02-19";

macro_rules! card_fields {
    () => {
        "\n  _id,\n  title,\n  \"slug\": slug.current,\n  publishedAt,\n  place,\n  mineral,\n  excerpt,\n  cover\n"
    };
}

macro_rules! translation_in {
    ($lang:literal, $projection:literal) => {
        concat!(
            "\n  *[_type == \"translation.metadata\" && references(^._id)][0]\n    .translations[language == \"",
            $lang,
            "\"][0]\n    .value->{ ",
            $projection,
            " }\n"
        )
    };
}

/// The English list; each row carries its Chinese translation if there is one.
pub const ADVENTURE_LIST: &str = concat!(
    "\n*[_type == \"adventure\" && language == \"en\" && defined(slug.current)]\n  | order(publishedAt desc) {\n    ",
    card_fields!(),
    ",\n    \"zh\": ",
    translation_in!("zh", "title, \"slug\": slug.current, excerpt, place"),
    "\n  }\n"
);

/// One English adventure, with a pointer to its translation if it has one.
pub const ADVENTURE_EN: &str = concat!(
    "\n*[_type == \"adventure\" && language == \"en\" && slug.current == $slug][0] {\n  ",
    card_fields!(),
    ",\n  language,\n  body,\n  \"translation\": ",
    translation_in!("zh", "\"slug\": slug.current"),
    "\n}\n"
);

/// One Chinese adventure, with a pointer back to the English original.
pub const ADVENTURE_ZH: &str = concat!(
    "\n*[_type == \"adventure\" && language == \"zh\" && slug.current == $slug][0] {\n  ",
    card_fields!(),
    ",\n  language,\n  body,\n  \"original\": ",
    translation_in!("en", "\"slug\": slug.current"),
    "\n}\n"
);
