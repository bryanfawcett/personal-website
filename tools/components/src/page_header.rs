//! `PageHeader.astro`, in Rust: the eyebrow, the title, an optional lede and margin note.

use maud::{Markup, PreEscaped, html};

pub fn page_header(eyebrow: &str, title: &str, lede: Option<&str>, note: Option<&str>, children: Markup) -> Markup {
    html! {
        header class="page-header" {
            div class="page-header__top" {
                p class="eyebrow is-open" { (eyebrow) }
                @if let Some(n) = note.filter(|n| !n.is_empty()) { span class="margin-note" { (n) } }
            }
            h1 class="page-header__title" { (title) }
            @if let Some(l) = lede.filter(|l| !l.is_empty()) { p class="lede" { (l) } }
            (PreEscaped(children.into_string()))
        }
    }
}
