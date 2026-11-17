//! The build-dependent parts of the document, taken from a page Astro already built.
//!
//! The header, footer and schematics come from the Rust `components` crate. What the crate
//! cannot know is what the *build* produced: the content-hashed stylesheet and script URLs
//! (`/_astro/BaseLayout.<hash>.css`), the inlined design tokens, the router and the unroll
//! transition. Those change on every deploy, so the Worker reads them out of the prerendered
//! `/404` page it is deployed next to, through the assets binding, once per isolate. It
//! keeps everything in that page's `<head>` except what this page says for itself (title,
//! description, canonical, hreflang, Open Graph, JSON-LD), plus the mineral rail and the two
//! module scripts that sit in `<body>`.
//!
//! A page that cannot be read gives [`Shell::bare`]: unstyled, but a complete and correct
//! document. The Worker never fails because an asset did.

/// Pieces of the donor page, as markup.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Shell {
    /// Head elements to keep, in the donor's order.
    pub head: String,
    /// `@bundu/ui`'s mineral rail.
    pub mineral_strip: String,
    /// The header's own module script (between `</header>` and `<main>`).
    pub header_tail: String,
    /// What follows the footer: the scroll-reveal module.
    pub body_tail: String,
    /// ` data-astro-transition-scope="…"` for `<main>`, so the unroll style matches.
    pub main_attrs: String,
}

impl Shell {
    pub fn bare() -> Shell {
        Shell::default()
    }

    pub fn from_donor(html: &str) -> Option<Shell> {
        let head_open = html.find("<head>")? + "<head>".len();
        let head_close = head_open + html[head_open..].find("</head>")?;
        let head: String = elements(&html[head_open..head_close]).into_iter().filter(|e| keep(e)).collect();

        let mineral_strip = html
            .find("<div class=\"mineral-strip\"")
            .and_then(|s| html[s..].find("</div>").map(|e| html[s..s + e + "</div>".len()].to_string()))
            .unwrap_or_default();

        let main_at = html.find("<main")?;
        let header_tail = html
            .find("class=\"mzizi-header\"")
            .and_then(|h| html[h..].find("</header>").map(|e| h + e + "</header>".len()))
            .filter(|end| *end <= main_at)
            .map(|end| html[end..main_at].to_string())
            .unwrap_or_default();

        let main_tag = &html[main_at..main_at + html[main_at..].find('>')?];
        let main_attrs = attr(main_tag, "data-astro-transition-scope")
            .map(|v| format!(" data-astro-transition-scope=\"{v}\""))
            .unwrap_or_default();

        let body_tail = html
            .rfind("</footer>")
            .and_then(|f| {
                let from = f + "</footer>".len();
                html[from..].find("</body>").map(|e| html[from..from + e].to_string())
            })
            .unwrap_or_default();

        Some(Shell { head, mineral_strip, header_tail, body_tail, main_attrs })
    }
}

/// The value of `name="…"` inside one tag, if it is there and plain enough to copy.
fn attr<'a>(tag: &'a str, name: &str) -> Option<&'a str> {
    let key = format!("{name}=\"");
    let at = tag.find(&key)? + key.len();
    let value = &tag[at..at + tag[at..].find('"')?];
    // It is written back into a double-quoted attribute: only copy what cannot break out.
    value.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_').then_some(value)
}

/// What this page replaces rather than inherits.
fn keep(el: &str) -> bool {
    const DROP: [&str; 10] = [
        "<title",
        "<meta charset",
        "<meta name=\"viewport\"",
        "<meta name=\"description\"",
        "<link rel=\"canonical\"",
        "<link rel=\"alternate\"",
        "<meta property=\"og:",
        "<meta name=\"twitter:card\"",
        "<meta name=\"generator\"",
        "<script type=\"application/ld+json\"",
    ];
    !DROP.iter().any(|d| el.starts_with(d))
}

/// Split a head into its top-level elements. A tolerant scanner, not a parser: it knows
/// that `<style>`, `<script>` and `<title>` run to their closing tag and that `>` inside
/// a quoted attribute does not end a tag. Text between elements is dropped.
fn elements(head: &str) -> Vec<&str> {
    let mut out = Vec::new();
    let mut i = 0;
    while let Some(rel) = head[i..].find('<') {
        let start = i + rel;
        let rest = &head[start..];
        let end = if rest.starts_with("<!--") {
            rest.find("-->").map(|e| start + e + 3)
        } else if let Some(name) = ["style", "script", "title"].iter().find(|n| {
            rest.get(1..1 + n.len()) == Some(n) && rest[1 + n.len()..].starts_with(['>', ' ', '\n', '\t'])
        }) {
            let close = format!("</{name}>");
            rest.find(&close).map(|e| start + e + close.len())
        } else {
            tag_end(rest).map(|e| start + e)
        };
        let Some(end) = end else { break };
        out.push(&head[start..end]);
        i = end;
    }
    out
}

/// Offset just past the `>` that ends the tag at the start of `s`.
fn tag_end(s: &str) -> Option<usize> {
    let mut quote: Option<char> = None;
    for (i, c) in s.char_indices() {
        match (quote, c) {
            (None, '"' | '\'') => quote = Some(c),
            (Some(q), c) if c == q => quote = None,
            (None, '>') => return Some(i + 1),
            _ => {}
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    const DONOR: &str = concat!(
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"w\">",
        "<title>Sheet not found | Bryan Fawcett</title><meta name=\"description\" content=\"d\">",
        "<link rel=\"canonical\" href=\"https://bryanfawcett.com/404\">",
        "<meta name=\"theme-color\" content=\"#F3F3F1\" media=\"(prefers-color-scheme: light)\">",
        "<link rel=\"alternate\" hreflang=\"en\" href=\"x\"><meta property=\"og:title\" content=\"t\">",
        "<link rel=\"preload\" href=\"/fonts/a.woff2\" as=\"font\" type=\"font/woff2\" crossorigin>",
        "<style>:root { --a: 1; } a > b { c: d }</style>",
        "<script>var x = '</'+'b>'; if (a < b) {}</script>",
        "<script type=\"application/ld+json\">{\"@type\":\"Person\"}</script>",
        "<script type=\"module\" src=\"/_astro/page.Bx2KSkeL.js\"></script>",
        "<link rel=\"stylesheet\" href=\"/_astro/BaseLayout.CJChhoSW.css\">",
        "</head><body><div class=\"sheet-ground\"></div>",
        "<div class=\"mineral-strip\" aria-hidden=\"true\"><span data-mineral=\"cobalt\"></span></div>",
        "<div class=\"page\"><header class=\"mzizi-header\" data-slot=\"mzizi-header\"><nav></nav></header>",
        "<script type=\"module\" src=\"/_astro/MziziHeader.CCqh1zz0.js\"></script>",
        "<main data-astro-transition-scope=\"astro-wugk46rw-2\" id=\"main\" class=\"shell\">x</main></div>",
        "<footer class=\"mzizi-footer\">f</footer><script type=\"module\">var e;</script></body></html>"
    );

    #[test]
    fn keeps_the_build_and_drops_what_the_page_replaces() {
        let s = Shell::from_donor(DONOR).unwrap();
        for kept in ["theme-color", "preload", "--a: 1", "page.Bx2KSkeL.js", "BaseLayout.CJChhoSW.css", "a < b"] {
            assert!(s.head.contains(kept), "missing {kept}: {}", s.head);
        }
        for dropped in ["<title", "canonical", "hreflang", "og:title", "ld+json", "viewport", "name=\"description\""] {
            assert!(!s.head.contains(dropped), "kept {dropped}: {}", s.head);
        }
    }

    #[test]
    fn finds_the_rail_the_header_script_the_tail_and_the_scope() {
        let s = Shell::from_donor(DONOR).unwrap();
        assert_eq!(s.mineral_strip, "<div class=\"mineral-strip\" aria-hidden=\"true\"><span data-mineral=\"cobalt\"></span></div>");
        assert_eq!(s.header_tail, "<script type=\"module\" src=\"/_astro/MziziHeader.CCqh1zz0.js\"></script>");
        assert_eq!(s.body_tail, "<script type=\"module\">var e;</script>");
        assert_eq!(s.main_attrs, " data-astro-transition-scope=\"astro-wugk46rw-2\"");
    }

    #[test]
    fn a_hostile_scope_value_is_not_copied() {
        let evil = DONOR.replace("astro-wugk46rw-2\" id", "x\" onclick=\"alert(1)\" id");
        // The scanner stops at the first quote, so the attribute value is `x`, which is safe;
        // what must never happen is the rest being written back.
        let s = Shell::from_donor(&evil).unwrap();
        assert!(!s.main_attrs.contains("onclick"));
    }

    #[test]
    fn not_a_page_is_none_and_bare_is_empty() {
        assert_eq!(Shell::from_donor("<html>nothing</html>"), None);
        assert_eq!(Shell::bare().head, "");
    }

    #[test]
    fn the_real_built_404_parses_when_present() {
        let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../.cloudflare/output/v0/workers/default/assets/404.html");
        let Ok(html) = std::fs::read_to_string(path) else { return };
        let s = Shell::from_donor(&html).unwrap();
        assert!(s.head.contains("rel=\"stylesheet\" href=\"/_astro/BaseLayout."));
        assert!(s.head.contains("--measure"), "tokens inlined");
        assert!(s.mineral_strip.contains("data-mineral=\"cobalt\""));
        assert!(s.header_tail.contains("MziziHeader"));
        assert!(s.body_tail.contains("IntersectionObserver"));
        assert!(s.main_attrs.contains("data-astro-transition-scope"));
    }
}
