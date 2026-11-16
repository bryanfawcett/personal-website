//! `Panel.astro`, in Rust: a hairline card at `--radius-lg`, optionally keyed to a mineral,
//! with a figure tag and optional corner brackets.
//!
//! Shaped like a Mzizi primitive: a closed `Tag` enum (`match`, not strings, so an element
//! the Astro component does not allow will not compile) and the same `data-mineral` contract.
//! Mzizi's own Rust primitives are Dioxus components carrying Tailwind class strings, which
//! this site does not run; the contract is shared, the class strings are not.

use maud::{Markup, PreEscaped};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Tag {
    Section,
    #[default]
    Article,
    Div,
    Li,
    A,
}

impl Tag {
    pub const fn name(self) -> &'static str {
        match self {
            Tag::Section => "section",
            Tag::Article => "article",
            Tag::Div => "div",
            Tag::Li => "li",
            Tag::A => "a",
        }
    }
}

#[derive(Default)]
pub struct Panel<'a> {
    pub tag: Tag,
    pub fig: Option<&'a str>,
    /// A tone name (mineral, heritage or experimental). Rendered as `data-mineral`.
    pub mineral: Option<&'a str>,
    pub frame: bool,
    pub class: Option<&'a str>,
    /// Any other attributes, in order, passed through (`href`, `target`, …).
    pub attrs: Vec<(&'a str, &'a str)>,
}

fn esc(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

impl Panel<'_> {
    pub fn render(&self, children: Markup) -> Markup {
        let tag = self.tag.name();
        let mut class = String::from("panel");
        if let Some(c) = self.class.filter(|c| !c.is_empty()) {
            class.push(' ');
            class.push_str(c);
        }
        let mut open = format!("<{tag} class=\"{}\"", esc(&class));
        if let Some(m) = self.mineral {
            open.push_str(&format!(" data-mineral=\"{}\"", esc(m)));
        }
        for (k, v) in &self.attrs {
            open.push_str(&format!(" {k}=\"{}\"", esc(v)));
        }
        open.push('>');
        if self.frame {
            open.push_str("<span class=\"panel__rule\" aria-hidden=\"true\"></span>");
        }
        if let Some(f) = self.fig.filter(|f| !f.is_empty()) {
            open.push_str(&format!("<span class=\"fig\">{}</span>", esc(f)));
        }
        open.push_str(&children.into_string());
        open.push_str(&format!("</{tag}>"));
        PreEscaped(open)
    }
}
