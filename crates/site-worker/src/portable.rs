//! Portable Text to HTML, through an allow-list.
//!
//! The Astro site uses `@portabletext/to-html`. This is the same job done as a closed
//! renderer: the output can only contain the elements and attributes named below, whatever
//! the dataset holds. Sanity text is untrusted (Mzizi N4): a stray `<script>`, a
//! `javascript:` link or a quote in an alt text must come out inert.
//!
//! What is emitted, and nothing else:
//!
//! * blocks `p`, `h2`, `h3`, `blockquote` (any other style, `h1` included, becomes `p`:
//!   the adventure title is the page's only `h1`, and a stray one would break heading order);
//! * lists `ul`/`ol`/`li`, nested by `level`;
//! * marks `strong`, `em`, `code`, `u`, `del`, and `a` (with `href` only, plus
//!   `target`/`rel` when it leaves the site);
//! * `figure.adventure__figure > img + figcaption` for an image block, `src`/`srcset`
//!   built by [`crate::image`] from a validated reference.
//!
//! Every text node and every attribute value is escaped; `href` is additionally
//! scheme-checked (http, https, mailto, tel, or relative) and the link is dropped, keeping
//! its text, when the scheme is anything else.
//!
//! Differences from the TypeScript renderer, all deliberate hardening:
//! its `link` override re-implemented escaping but dropped `to-html`'s own scheme check, so
//! `javascript:` survived; its "is this link external" test was a `startsWith` that treated
//! `https://bryanfawcett.com.evil.example` as internal; underline was an inline `style`.

use serde_json::Value;

use crate::image::resolve_image;

const MAX_LIST_DEPTH: usize = 12;

/// Marks one span may carry. `render_spans` recurses once per mark, so a span with thousands of
/// marks would recurse thousands deep: past this, the rest are ignored, and repeats are dropped.
const MAX_MARKS_PER_SPAN: usize = 16;

/// Escape text for an element body: `& < > " '`, and runs of spaces as `&nbsp;` + space
/// (what `to-html`'s `escapeHTML` does, so whitespace in a verse survives).
pub fn escape_text(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 8);
    let mut spaces = 0usize;
    let flush = |out: &mut String, n: &mut usize| {
        if *n >= 2 {
            for _ in 0..(*n - 1) {
                out.push_str("&nbsp;");
            }
        }
        if *n >= 1 {
            out.push(' ');
        }
        *n = 0;
    };
    for c in s.chars() {
        if c == ' ' {
            spaces += 1;
            continue;
        }
        flush(&mut out, &mut spaces);
        push_escaped(&mut out, c);
    }
    flush(&mut out, &mut spaces);
    out
}

/// Escape a value for a double- or single-quoted attribute.
pub fn escape_attr(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 8);
    for c in s.chars() {
        push_escaped(&mut out, c);
    }
    out
}

fn push_escaped(out: &mut String, c: char) {
    match c {
        '&' => out.push_str("&amp;"),
        '<' => out.push_str("&lt;"),
        '>' => out.push_str("&gt;"),
        '"' => out.push_str("&quot;"),
        '\'' => out.push_str("&#x27;"),
        // A NUL is never text; some parsers treat it as a delimiter.
        '\0' => {}
        c => out.push(c),
    }
}

/// `uriLooksSafe`, tightened: control characters anywhere refuse the link.
pub fn uri_is_safe(uri: &str) -> bool {
    let url = uri.trim();
    // A backslash is a slash to a browser: `/\evil.example` is `//evil.example`, which looks like an
    // on-site path to a prefix test. No real link carries one.
    if url.is_empty() || url.chars().any(|c| c.is_control() || c == '\\') {
        return false;
    }
    if url.starts_with('#') || url.starts_with('/') {
        return true;
    }
    let Some(colon) = url.find(':') else { return true };
    let scheme = url[..colon].to_ascii_lowercase();
    if matches!(scheme.as_str(), "http" | "https" | "mailto" | "tel") {
        return true;
    }
    // `a/b:c`, `?next=x:y`, `#x:y`: the colon is not a scheme delimiter.
    url[..colon].contains(['/', '?', '#'])
}

/// Does this absolute URL leave bryanfawcett.com? Host compared exactly (no prefix test).
fn is_external(href: &str) -> bool {
    let lower = href.trim().to_ascii_lowercase();
    let Some(rest) = lower.strip_prefix("https://").or_else(|| lower.strip_prefix("http://")) else {
        // `//host/…` is protocol-relative and leaves the site; mailto/tel/relative do not open a tab.
        return lower.starts_with("//");
    };
    let authority = rest.split(['/', '?', '#']).next().unwrap_or("");
    if authority.contains('@') {
        return true;
    }
    let host = authority.split(':').next().unwrap_or("");
    !(host == "bryanfawcett.com" || host == "www.bryanfawcett.com")
}

struct Span<'a> {
    text: &'a str,
    /// Marks sorted outermost first (see `sort_marks`).
    marks: Vec<&'a str>,
}

/// Port of the toolkit's `sortMarksByOccurences`: the mark that covers the most
/// consecutive spans from here goes outermost; ties keep the author's order.
fn sort_marks<'a>(spans: &[(&'a str, Vec<&'a str>)]) -> Vec<Span<'a>> {
    spans
        .iter()
        .enumerate()
        .map(|(i, (text, marks))| {
            let run = |m: &str| {
                1 + spans[i + 1..].iter().take_while(|(_, sibling)| sibling.contains(&m)).count()
            };
            // Distinct marks only, and a bounded number of them: untrusted input sets this depth.
            let mut distinct: Vec<&str> = Vec::new();
            for m in marks {
                if distinct.len() == MAX_MARKS_PER_SPAN {
                    break;
                }
                if !distinct.contains(m) {
                    distinct.push(*m);
                }
            }
            let mut keyed: Vec<(usize, usize, &str)> =
                distinct.iter().enumerate().map(|(pos, m)| (run(m), pos, *m)).collect();
            keyed.sort_by(|a, b| b.0.cmp(&a.0).then(a.1.cmp(&b.1)));
            Span { text, marks: keyed.into_iter().map(|(_, _, m)| m).collect() }
        })
        .collect()
}

fn render_text(text: &str, out: &mut String) {
    let mut first = true;
    for line in text.split('\n') {
        if !first {
            out.push_str("<br/>");
        }
        first = false;
        out.push_str(&escape_text(line));
    }
}

fn wrap_mark(mark: &str, defs: &[Value], inner: String) -> String {
    match mark {
        "strong" => format!("<strong>{inner}</strong>"),
        "em" => format!("<em>{inner}</em>"),
        "code" => format!("<code>{inner}</code>"),
        "underline" => format!("<u>{inner}</u>"),
        "strike-through" => format!("<del>{inner}</del>"),
        key => {
            let def = defs.iter().find(|d| d.get("_key").and_then(Value::as_str) == Some(key));
            match def.and_then(|d| d.get("_type")?.as_str().map(|t| (t, d))) {
                Some(("link", d)) => match d.get("href").and_then(Value::as_str) {
                    Some(href) if uri_is_safe(href) => {
                        let attrs = if is_external(href) { " target=\"_blank\" rel=\"noopener noreferrer\"" } else { "" };
                        format!("<a href=\"{}\"{attrs}>{inner}</a>", escape_attr(href.trim()))
                    }
                    _ => inner,
                },
                // Unknown mark or annotation: keep the words, drop the wrapper.
                _ => inner,
            }
        }
    }
}

fn render_spans(spans: &[Span<'_>], depth: usize, defs: &[Value], out: &mut String) {
    let mut i = 0;
    while i < spans.len() {
        match spans[i].marks.get(depth) {
            None => {
                render_text(spans[i].text, out);
                i += 1;
            }
            Some(&mark) => {
                let mut j = i + 1;
                while j < spans.len() && spans[j].marks.get(depth) == Some(&mark) {
                    j += 1;
                }
                let mut inner = String::new();
                render_spans(&spans[i..j], depth + 1, defs, &mut inner);
                out.push_str(&wrap_mark(mark, defs, inner));
                i = j;
            }
        }
    }
}

/// The inline content of a text block.
fn inline(block: &Value) -> String {
    let defs: &[Value] = block.get("markDefs").and_then(Value::as_array).map_or(&[], Vec::as_slice);
    let raw: Vec<(&str, Vec<&str>)> = block
        .get("children")
        .and_then(Value::as_array)
        .map_or(&[][..], Vec::as_slice)
        .iter()
        // Only spans: an inline object of an unknown type renders as nothing.
        .filter(|c| c.get("_type").and_then(Value::as_str) == Some("span"))
        .map(|c| {
            let marks = c
                .get("marks")
                .and_then(Value::as_array)
                .map(|m| m.iter().filter_map(Value::as_str).collect())
                .unwrap_or_default();
            (c.get("text").and_then(Value::as_str).unwrap_or(""), marks)
        })
        .collect();
    let spans = sort_marks(&raw);
    let mut out = String::new();
    render_spans(&spans, 0, defs, &mut out);
    out
}

fn style(block: &Value) -> &str {
    block.get("style").and_then(Value::as_str).unwrap_or("normal")
}

fn block_html(block: &Value) -> String {
    let inner = inline(block);
    match style(block) {
        "h2" => format!("<h2>{inner}</h2>"),
        "h3" => format!("<h3>{inner}</h3>"),
        "blockquote" => format!("<blockquote>{inner}</blockquote>"),
        _ => format!("<p>{inner}</p>"),
    }
}

fn image_html(value: &Value) -> String {
    let Some(img) = resolve_image(Some(value), 720, None) else { return String::new() };
    let caption = value.get("caption").and_then(Value::as_str).unwrap_or("");
    let mut out = String::from("<figure class=\"adventure__figure\"><span class=\"panel__rule\" aria-hidden=\"true\"></span>");
    out.push_str(&format!(
        "<img src=\"{}\" srcset=\"{}\" width=\"{}\" height=\"{}\" alt=\"{}\" loading=\"lazy\" decoding=\"async\">",
        escape_attr(&img.src),
        escape_attr(&img.srcset),
        img.width,
        img.height,
        escape_attr(&img.alt)
    ));
    if !caption.is_empty() {
        out.push_str(&format!("<figcaption>{}</figcaption>", escape_text(caption)));
    }
    out.push_str("</figure>");
    out
}

fn is_block(v: &Value) -> bool {
    v.get("_type").and_then(Value::as_str) == Some("block")
}

/// `Some(kind)` for a list item. Only the two list types the Studio offers are lists.
fn list_kind(v: &Value) -> Option<&'static str> {
    if !is_block(v) {
        return None;
    }
    match v.get("listItem").and_then(Value::as_str)? {
        "number" => Some("ol"),
        _ => Some("ul"),
    }
}

fn level(v: &Value) -> u64 {
    v.get("level").and_then(Value::as_u64).unwrap_or(1).max(1)
}

/// Render one list starting at `blocks[start]`; returns the index after it.
fn render_list(blocks: &[Value], start: usize, depth: usize, out: &mut String) -> usize {
    let kind = list_kind(&blocks[start]).unwrap_or("ul");
    let lvl = level(&blocks[start]);
    out.push_str(&format!("<{kind}>"));
    let mut i = start;
    while i < blocks.len() {
        let Some(k) = list_kind(&blocks[i]) else { break };
        let l = level(&blocks[i]);
        if l < lvl || (l == lvl && k != kind) {
            break;
        }
        // An item deeper than this list with nothing to nest under only happens at the
        // start of a run; treat it as an item of this list rather than losing it.
        out.push_str("<li>");
        out.push_str(&match style(&blocks[i]) {
            "normal" => inline(&blocks[i]),
            _ => block_html(&blocks[i]),
        });
        i += 1;
        while i < blocks.len() && list_kind(&blocks[i]).is_some() && level(&blocks[i]) > lvl {
            if depth >= MAX_LIST_DEPTH {
                // Absurd nesting: flatten into this item instead of recursing without bound.
                out.push_str(&inline(&blocks[i]));
                i += 1;
            } else {
                i = render_list(blocks, i, depth + 1, out);
            }
        }
        out.push_str("</li>");
    }
    out.push_str(&format!("</{kind}>"));
    i
}

/// Render an adventure body. Empty for an empty or missing body.
pub fn render_body(body: &[Value]) -> String {
    let mut out = String::new();
    let mut i = 0;
    while i < body.len() {
        let node = &body[i];
        if list_kind(node).is_some() {
            i = render_list(body, i, 0, &mut out);
            continue;
        }
        match node.get("_type").and_then(Value::as_str) {
            Some("block") => out.push_str(&block_html(node)),
            Some("image") => out.push_str(&image_html(node)),
            // A block type the schema does not know must not take the page down, or appear.
            _ => {}
        }
        i += 1;
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn p(text: &str) -> Value {
        json!({ "_type": "block", "style": "normal", "children": [{ "_type": "span", "text": text, "marks": [] }], "markDefs": [] })
    }

    fn render(v: Value) -> String {
        render_body(v.as_array().unwrap())
    }

    #[test]
    fn plain_blocks_and_headings_start_at_h2() {
        let out = render(json!([
            { "_type": "block", "style": "h2", "children": [{ "_type": "span", "text": "Road", "marks": [] }] },
            { "_type": "block", "style": "h3", "children": [{ "_type": "span", "text": "Sub", "marks": [] }] },
            { "_type": "block", "style": "blockquote", "children": [{ "_type": "span", "text": "Said", "marks": [] }] },
            p("Body"),
        ]));
        assert_eq!(out, "<h2>Road</h2><h3>Sub</h3><blockquote>Said</blockquote><p>Body</p>");
    }

    #[test]
    fn h1_and_unknown_styles_cannot_become_headings() {
        let out = render(json!([
            { "_type": "block", "style": "h1", "children": [{ "_type": "span", "text": "Big", "marks": [] }] },
            { "_type": "block", "style": "h4", "children": [{ "_type": "span", "text": "Small", "marks": [] }] },
            { "_type": "block", "style": "script", "children": [{ "_type": "span", "text": "x", "marks": [] }] },
        ]));
        assert_eq!(out, "<p>Big</p><p>Small</p><p>x</p>");
    }

    #[test]
    fn marks_nest_longest_run_outermost() {
        let out = render(json!([{
            "_type": "block", "style": "normal", "markDefs": [],
            "children": [
                { "_type": "span", "text": "a ", "marks": ["strong"] },
                { "_type": "span", "text": "b", "marks": ["strong", "em"] },
                { "_type": "span", "text": " c", "marks": ["strong"] },
            ]
        }]));
        assert_eq!(out, "<p><strong>a <em>b</em> c</strong></p>");
    }

    #[test]
    fn hostile_text_is_escaped_everywhere() {
        let out = render(json!([
            p("<script>alert(1)</script>"),
            p("x\" onerror=\"alert(1)"),
            p("<img src=x onerror=alert(1)>"),
            { "_type": "block", "style": "normal", "markDefs": [],
              "children": [{ "_type": "span", "text": "a</strong><script>", "marks": ["strong", "<b>"] }] },
        ]));
        assert!(!out.contains("<script"), "{out}");
        assert!(!out.contains("<img src=x"), "{out}");
        assert!(!out.contains("onerror=\"alert"), "{out}");
        assert!(out.contains("&lt;script&gt;alert(1)&lt;/script&gt;"));
        assert!(out.contains("<strong>a&lt;/strong&gt;&lt;script&gt;</strong>"), "{out}");
    }

    #[test]
    fn a_style_name_is_never_written_into_a_tag() {
        let out = render(json!([
            { "_type": "block", "style": "p onmouseover=alert(1) x", "children": [{ "_type": "span", "text": "t", "marks": [] }] }
        ]));
        assert_eq!(out, "<p>t</p>");
    }

    #[test]
    fn a_span_with_thousands_of_marks_is_bounded_not_a_deep_recursion() {
        let marks: Vec<String> = (0..5000).map(|i| if i % 2 == 0 { "strong".into() } else { format!("k{i}") }).collect();
        let out = render(json!([{
            "_type": "block", "style": "normal", "markDefs": [],
            "children": [{ "_type": "span", "text": "x", "marks": marks }]
        }]));
        assert!(out.contains('x'));
        assert!(out.matches("<strong>").count() <= 1, "repeats are dropped");
        assert!(out.len() < 1000, "the output is bounded too");
    }

    #[test]
    fn backslash_links_are_refused() {
        for bad in ["/\\evil.example/x", "\\\\evil.example", "https://bryanfawcett.com\\@evil.example/"] {
            let out = link(bad, "words");
            assert!(!out.contains("<a"), "{bad:?} must lose its anchor: {out}");
            assert!(out.contains("words"));
        }
    }

    fn link(href: &str, text: &str) -> String {
        render(json!([{
            "_type": "block", "style": "normal",
            "markDefs": [{ "_key": "k1", "_type": "link", "href": href }],
            "children": [{ "_type": "span", "text": text, "marks": ["k1"] }]
        }]))
    }

    #[test]
    fn javascript_links_lose_the_anchor_and_keep_the_words() {
        for bad in [
            "javascript:alert(1)",
            "JaVaScRiPt:alert(1)",
            "  javascript:alert(1)",
            "java\tscript:alert(1)",
            "java\nscript:alert(1)",
            "data:text/html,<script>alert(1)</script>",
            "vbscript:x",
            "\u{1}javascript:alert(1)",
        ] {
            assert_eq!(link(bad, "go"), "<p>go</p>", "{bad:?}");
        }
    }

    #[test]
    fn safe_links_render_and_attributes_cannot_be_broken_out_of() {
        assert_eq!(link("/adventures/x", "in"), "<p><a href=\"/adventures/x\">in</a></p>");
        assert_eq!(link("#top", "t"), "<p><a href=\"#top\">t</a></p>");
        assert_eq!(link("mailto:bryan@nyuchi.com", "m"), "<p><a href=\"mailto:bryan@nyuchi.com\">m</a></p>");
        assert_eq!(
            link("https://example.org/a?b=1&c=2", "x"),
            "<p><a href=\"https://example.org/a?b=1&amp;c=2\" target=\"_blank\" rel=\"noopener noreferrer\">x</a></p>"
        );
        let out = link("https://e.org/\" onclick=\"alert(1)", "x");
        assert!(!out.contains("onclick=\"alert"), "{out}");
        assert!(out.contains("&quot; onclick=&quot;alert(1)"), "{out}");
        let out = link("/a' onclick='alert(1)", "x");
        assert!(!out.contains("' onclick='"), "{out}");
    }

    #[test]
    fn external_means_a_different_host_not_a_different_prefix() {
        assert!(!link("https://bryanfawcett.com/zh", "x").contains("target"));
        assert!(!link("https://www.bryanfawcett.com", "x").contains("target"));
        assert!(link("https://bryanfawcett.com.evil.example/x", "x").contains("target=\"_blank\""));
        assert!(link("https://bryanfawcett.com@evil.example/x", "x").contains("target=\"_blank\""));
        assert!(link("//evil.example/x", "x").contains("target=\"_blank\""));
    }

    #[test]
    fn unknown_marks_and_annotations_keep_text_only() {
        let out = render(json!([{
            "_type": "block", "style": "normal",
            "markDefs": [{ "_key": "k", "_type": "script", "href": "x" }],
            "children": [{ "_type": "span", "text": "t", "marks": ["k", "blink", "\"><x"] }]
        }]));
        assert_eq!(out, "<p>t</p>");
    }

    #[test]
    fn lists_nest_and_switch_kind() {
        let item = |t: &str, kind: &str, level: u64| json!({
            "_type": "block", "style": "normal", "listItem": kind, "level": level,
            "children": [{ "_type": "span", "text": t, "marks": [] }]
        });
        let out = render(json!([item("a", "bullet", 1), item("a1", "bullet", 2), item("b", "bullet", 1), item("n", "number", 1), p("after")]));
        assert_eq!(out, "<ul><li>a<ul><li>a1</li></ul></li><li>b</li></ul><ol><li>n</li></ol><p>after</p>");
    }

    #[test]
    fn absurd_list_levels_terminate() {
        let items: Vec<Value> = (1..200u64)
            .map(|l| json!({ "_type": "block", "listItem": "bullet", "level": l,
                             "children": [{ "_type": "span", "text": "x", "marks": [] }] }))
            .collect();
        let out = render_body(&items);
        assert!(out.starts_with("<ul>") && out.ends_with("</ul>"));
        let huge = json!([{ "_type": "block", "listItem": "bullet", "level": u64::MAX, "children": [] }]);
        assert_eq!(render(huge), "<ul><li></li></ul>");
    }

    #[test]
    fn images_use_the_builder_and_escape_alt_and_caption() {
        let out = render(json!([{
            "_type": "image",
            "asset": { "_ref": "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1333-jpg" },
            "alt": "a\"><script>x</script>", "caption": "<b>cap</b>"
        }]));
        assert!(out.starts_with("<figure class=\"adventure__figure\">"));
        assert!(out.contains("width=\"720\" height=\"480\""), "{out}");
        assert!(out.contains("alt=\"a&quot;&gt;&lt;script&gt;x&lt;/script&gt;\""), "{out}");
        assert!(out.contains("<figcaption>&lt;b&gt;cap&lt;/b&gt;</figcaption>"));
        assert!(!out.contains("<script"));
        // A malformed reference renders nothing at all, not a broken image.
        assert_eq!(render(json!([{ "_type": "image", "asset": { "_ref": "image-../../x-1x1-png" } }])), "");
    }

    #[test]
    fn unknown_block_types_vanish_and_newlines_break() {
        let out = render(json!([
            { "_type": "iframe", "url": "javascript:alert(1)" },
            { "_type": "html", "html": "<script>x</script>" },
            p("one\ntwo  three"),
        ]));
        assert_eq!(out, "<p>one<br/>two&nbsp; three</p>");
    }

    #[test]
    fn malformed_shapes_do_not_panic() {
        for v in [json!(null), json!(5), json!("s"), json!([]), json!({}), json!({ "_type": "block", "children": "x" }),
                  json!({ "_type": "block", "children": [null, 1, { "_type": "span" }], "markDefs": "no" })] {
            let _ = render_body(&[v]);
        }
    }
}
