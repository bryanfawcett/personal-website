//! What the queries return, read defensively.
//!
//! The dataset is public and written by people; the Worker never assumes a shape. A record
//! missing its title or slug is skipped (one bad card must not blank the list), and every
//! optional field is optional. Nothing here panics on any JSON.

use serde_json::Value;

#[derive(Debug, Clone, PartialEq)]
pub struct Translated {
    pub title: String,
    pub slug: String,
    pub excerpt: Option<String>,
    pub place: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Card {
    pub title: String,
    pub slug: String,
    pub published_at: String,
    pub place: Option<String>,
    pub excerpt: Option<String>,
    pub mineral: Option<String>,
    pub cover: Option<Value>,
    pub zh: Option<Translated>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Adventure {
    pub card: Card,
    pub body: Vec<Value>,
    /// On an English adventure: its Chinese translation's slug.
    pub translation: Option<String>,
    /// On a Chinese adventure: the English original's slug.
    pub original: Option<String>,
}

fn text(v: &Value, key: &str) -> Option<String> {
    v.get(key).and_then(Value::as_str).filter(|s| !s.trim().is_empty()).map(str::to_string)
}

fn slug_of(v: &Value) -> Option<String> {
    text(v, "slug")
}

fn translated(v: Option<&Value>) -> Option<Translated> {
    let v = v?;
    Some(Translated { title: text(v, "title")?, slug: slug_of(v)?, excerpt: text(v, "excerpt"), place: text(v, "place") })
}

pub fn parse_card(v: &Value) -> Option<Card> {
    Some(Card {
        title: text(v, "title")?,
        slug: slug_of(v)?,
        published_at: text(v, "publishedAt").unwrap_or_default(),
        place: text(v, "place"),
        excerpt: text(v, "excerpt"),
        mineral: text(v, "mineral"),
        cover: v.get("cover").filter(|c| c.is_object()).cloned(),
        zh: translated(v.get("zh")),
    })
}

/// The list query's result. Anything that is not an array is an empty list.
pub fn parse_list(v: &Value) -> Vec<Card> {
    v.as_array().map(|a| a.iter().filter_map(parse_card).collect()).unwrap_or_default()
}

/// A single adventure query's result: `None` for `null` (no such adventure) and for a
/// record too broken to draw.
pub fn parse_adventure(v: &Value) -> Option<Adventure> {
    let card = parse_card(v)?;
    let pointer = |key: &str| v.get(key).filter(|p| p.is_object()).and_then(slug_of);
    Some(Adventure {
        card,
        body: v.get("body").and_then(Value::as_array).cloned().unwrap_or_default(),
        translation: pointer("translation"),
        original: pointer("original"),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn a_broken_card_is_skipped_not_fatal() {
        let list = parse_list(&json!([
            { "title": "ok", "slug": "ok", "publishedAt": "2026-01-01" },
            { "slug": "no-title" },
            { "title": "no slug" },
            { "title": "  ", "slug": "blank" },
            5, null, "x",
        ]));
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].slug, "ok");
    }

    #[test]
    fn not_an_array_is_an_empty_list() {
        for v in [json!(null), json!({}), json!("x"), json!(3)] {
            assert!(parse_list(&v).is_empty());
        }
    }

    #[test]
    fn a_translation_needs_both_title_and_slug() {
        let c = parse_card(&json!({ "title": "t", "slug": "s", "zh": { "title": "标题" } })).unwrap();
        assert!(c.zh.is_none());
        let c = parse_card(&json!({ "title": "t", "slug": "s", "zh": { "title": "标题", "slug": "zs", "place": "马纳" } })).unwrap();
        assert_eq!(c.zh.unwrap().place.as_deref(), Some("马纳"));
    }

    #[test]
    fn pointers_and_missing() {
        assert_eq!(parse_adventure(&json!(null)), None);
        let a = parse_adventure(&json!({ "title": "t", "slug": "s", "translation": { "slug": "zs" }, "body": [] })).unwrap();
        assert_eq!(a.translation.as_deref(), Some("zs"));
        assert_eq!(a.original, None);
        let a = parse_adventure(&json!({ "title": "t", "slug": "s", "translation": null })).unwrap();
        assert_eq!(a.translation, None);
    }
}
