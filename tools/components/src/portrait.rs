//! `Portrait.astro`, in Rust: the draughtsman as a plate on the sheet.
//!
//! The image URLs are an input: `astro:assets` content-hashes them at build time, so the
//! Rust render takes `src`/`srcset` from whatever the build produced.

use maud::{Markup, html};

use crate::site::{Lang, Site};

pub struct Portrait<'a> {
    pub src: &'a str,
    pub srcset: &'a str,
    pub width: u32,
    pub height: u32,
    pub caption: Option<&'a str>,
    pub eager: bool,
    pub class: Option<&'a str>,
    pub lang: Lang,
}

impl Portrait<'_> {
    pub fn render(&self, site: &Site) -> Markup {
        let class = match self.class.filter(|c| !c.is_empty()) {
            Some(c) => format!("portrait {c}"),
            None => "portrait".to_string(),
        };
        let (loading, priority) = if self.eager { ("eager", "high") } else { ("lazy", "auto") };
        html! {
            figure class=(class) {
                span class="portrait__plate" {
                    span class="panel__rule" aria-hidden="true" {}
                    img src=(self.src) srcset=(self.srcset) alt=(site.t(self.lang, "nav.portrait_alt")) loading=(loading) fetchpriority=(priority) decoding="async" width=(self.width) height=(self.height);
                }
                @if let Some(c) = self.caption.filter(|c| !c.is_empty()) { figcaption { (c) } }
            }
        }
    }
}
