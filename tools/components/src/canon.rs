//! Canonical HTML, so two renders can be compared for what they mean.
//!
//! Attribute order, class order and runs of whitespace carry no meaning, and two
//! renderers legitimately differ on them. Everything else (element, attribute
//! name and value, text, nesting) must match exactly.

use scraper::{Html, Node, node::Element};

fn collapse(text: &str) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn open_tag(e: &Element) -> String {
    let mut attrs: Vec<(String, String)> = e
        .attrs()
        .map(|(k, v)| {
            if k == "class" {
                let mut tokens: Vec<&str> = v.split_whitespace().collect();
                tokens.sort_unstable();
                (k.to_string(), tokens.join(" "))
            } else {
                (k.to_string(), v.to_string())
            }
        })
        .collect();
    attrs.sort();
    let rendered: String = attrs.iter().map(|(k, v)| format!(" {k}=\"{v}\"")).collect();
    format!("<{}{rendered}>", e.name())
}

fn walk(node: ego_tree::NodeRef<'_, Node>, out: &mut String, depth: usize) {
    match node.value() {
        Node::Element(e) => {
            out.push_str(&"  ".repeat(depth));
            out.push_str(&open_tag(e));
            out.push('\n');
            for child in node.children() {
                walk(child, out, depth + 1);
            }
        }
        Node::Text(t) => {
            let text = collapse(t);
            if !text.is_empty() {
                out.push_str(&"  ".repeat(depth));
                out.push_str(&text);
                out.push('\n');
            }
        }
        _ => {
            for child in node.children() {
                walk(child, out, depth);
            }
        }
    }
}

/// The canonical form of a fragment, one node per line, indented by depth.
pub fn normalize(html: &str) -> String {
    let fragment = Html::parse_fragment(html);
    let mut out = String::new();
    for child in fragment.tree.root().children() {
        walk(child, &mut out, 0);
    }
    out
}

/// A line-oriented diff of two canonical renders: the first few differing lines.
pub fn diff(a: &str, b: &str, limit: usize) -> Vec<String> {
    let (al, bl): (Vec<&str>, Vec<&str>) = (a.lines().collect(), b.lines().collect());
    let mut out = Vec::new();
    for i in 0..al.len().max(bl.len()) {
        let (x, y) = (al.get(i).copied().unwrap_or("<missing>"), bl.get(i).copied().unwrap_or("<missing>"));
        if x != y {
            out.push(format!("  line {:>4}\n    astro: {x}\n    rust:  {y}", i + 1));
            if out.len() >= limit {
                break;
            }
        }
    }
    out
}
