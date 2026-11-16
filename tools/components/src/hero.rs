//! `Hero.astro`, in Rust: the sheet's headline, the second word drafted in outline.

use maud::{Markup, PreEscaped, html};

use crate::site::{Lang, Site};

pub struct Hero<'a> {
    pub solid: &'a str,
    pub drafted: &'a str,
    pub eyebrow: &'a str,
    pub sub: Option<&'a str>,
    /// Pencil note; `\n` becomes `<br>`. Trusted markup, as in the Astro original.
    pub note: Option<&'a str>,
    pub dimension: &'a str,
    pub show_byline: bool,
    pub lang: Lang,
}

impl Hero<'_> {
    /// `actions` is the default slot: `None` when the page passes none.
    pub fn render(&self, site: &Site, actions: Option<Markup>) -> Markup {
        // Chinese sets its own comma, full-width.
        let comma = if self.lang == Lang::Zh { "，" } else { ", " };
        html! {
            header class="hero" {
                p class="eyebrow hero__eyebrow" { (self.eyebrow) }
                h1 class="stack" { span class="stack__solid" { (self.solid) } " " span class="drafted" { (self.drafted) } }
                @if self.show_byline {
                    p class="hero__byline" {
                        @for (i, role) in site.roles(self.lang).iter().enumerate() {
                            @if i > 0 { span class="hero__sep" { " · " } }
                            span { (role.title) (comma) (role.org) }
                        }
                    }
                }
                @if let Some(sub) = self.sub.filter(|s| !s.is_empty()) { p class="hero__sub" { (sub) } }
                @if let Some(a) = actions { div class="hero__actions" { (PreEscaped(a.into_string())) } }
                div class="dimension hero__dimension" {
                    span class="dimension__line" {} span class="dimension__label" { (self.dimension) } span class="dimension__line" {}
                }
                @if let Some(note) = self.note.filter(|n| !n.is_empty()) {
                    p class="margin-note hero__note" { (PreEscaped(note.replace('\n', "<br>"))) span class="hero__arrow" { "↴" } }
                }
            }
        }
    }
}
