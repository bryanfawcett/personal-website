//! `ContactCard.astro`, in Rust: portrait, particulars and a QR that books a call.
//!
//! The two QR SVGs are inputs, rendered by the `contact-card` crate or taken from the
//! built page. Their payload is what is verified elsewhere (`rqrr` decodes each).

use maud::{Markup, PreEscaped, html};

use crate::{
    portrait::Portrait,
    site::{Lang, Site},
};

pub struct ContactCard<'a> {
    pub portrait: Portrait<'a>,
    pub class: Option<&'a str>,
    pub qr_dark: &'a str,
    pub qr_light: &'a str,
    pub lang: Lang,
}

impl ContactCard<'_> {
    pub fn render(&self, site: &Site) -> Markup {
        let t = |k: &str| site.t(self.lang, k).to_string();
        let class = match self.class.filter(|c| !c.is_empty()) {
            Some(c) => format!("card {c}"),
            None => "card".to_string(),
        };
        html! {
            div class=(class) {
                (self.portrait.render(site))
                div class="card__body" {
                    p class="card__name" { (site.name) }
                    p class="card__title" { (site.title(self.lang)) }
                    ul class="card__roles" {
                        @for role in site.roles(self.lang) {
                            li { span class="card__role" { (role.title) } span class="card__org" { (role.org) } }
                        }
                    }
                    a class="card__email" href=(format!("mailto:{}", site.email)) { (site.email) }
                }
                div class="card__scan" {
                    div class="card__qr card__qr--dark" aria-hidden="true" { (PreEscaped(self.qr_dark)) }
                    div class="card__qr card__qr--light" aria-hidden="true" { (PreEscaped(self.qr_light)) }
                    p class="card__hint" { (t("card.scan")) }
                    a class="card__download" href="/bryan-fawcett.vcf" download { (t("card.download")) }
                }
            }
        }
    }
}
