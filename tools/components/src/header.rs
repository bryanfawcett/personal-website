//! `MziziHeader.astro`, in Rust: sticky bar (brand, links, language switcher, theme toggle,
//! the booking pill) and the phone row. The toggle's script is hoisted by Astro and is not
//! part of this markup.

use maud::{Markup, PreEscaped, html};

use crate::{
    lang_switcher::language_switcher,
    site::{Lang, Site, localize_path, strip_lang},
};

fn is_current(href: &str, here: &str) -> bool {
    if href == "/" { here == "/" } else { here == href || here.starts_with(&format!("{href}/")) }
}

const SUN: &str = r#"<svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>"#;
const MOON: &str = r#"<svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>"#;

pub fn header(site: &Site, lang: Lang, path: &str, switch_href: Option<&str>) -> Markup {
    let t = |k: &str| site.t(lang, k).to_string();
    let here = strip_lang(path);
    let links: Vec<_> = site.nav.iter().filter(|n| n.href != "/book").collect();
    let book = site.nav.iter().find(|n| n.href == "/book");
    let cur = |href: &str| is_current(href, &here);
    let link_class = |base: &str, href: &str| if cur(href) { format!("{base} is-current") } else { base.to_string() };

    html! {
        header class="mzizi-header" data-slot="mzizi-header" data-portal="https://mzizi.dev/components/mzizi-header" {
            div class="mzizi-header__inner" {
                a class="mzizi-header__brand" href=(localize_path("/", lang)) aria-label=(t("nav.home")) {
                    img class="mzizi-header__portrait" src="/nav-portrait.webp" alt="" width="36" height="36" loading="eager" fetchpriority="high" decoding="async";
                    span class="mzizi-header__id" {
                        span class="mzizi-header__name" { (site.name) }
                        span class="mzizi-header__role" { (site.title(lang)) }
                    }
                }
                nav class="mzizi-header__nav" aria-label=(t("nav.label")) {
                    ul { @for item in &links {
                        li { a class=(link_class("mzizi-header__link", &item.href)) href=(localize_path(&item.href, lang)) aria-current=[cur(&item.href).then_some("page")] { (t(&item.label_key)) } }
                    } }
                }
                div class="mzizi-header__actions" {
                    div class="mzizi-header__lang" { (language_switcher(site, lang, path, switch_href)) }
                    button class="mzizi-header__icon theme-toggle" type="button" data-theme-toggle aria-label=(t("theme.toggle")) data-label-light=(t("theme.to_light")) data-label-dark=(t("theme.to_dark")) {
                        (PreEscaped(SUN)) (PreEscaped(MOON))
                    }
                    @if let Some(b) = book {
                        a class=(link_class("btn mzizi-header__cta", &b.href)) href=(localize_path(&b.href, lang)) aria-current=[cur(&b.href).then_some("page")] { (t(&b.label_key)) }
                    }
                }
            }
            nav class="mzizi-header__row" aria-label=(t("nav.label")) {
                ul {
                    @for item in &links {
                        li { a class=(link_class("mzizi-header__chip", &item.href)) href=(localize_path(&item.href, lang)) aria-current=[cur(&item.href).then_some("page")] { (t(&item.label_key)) } }
                    }
                    li class="mzizi-header__row-lang" { (language_switcher(site, lang, path, switch_href)) }
                }
            }
        }
    }
}
