//! `MziziFooter.astro`, in Rust.
//!
//! The canonical navigation: Site, Ecosystem and Connect, the copyright line, the
//! title block and the mineral dots. The ecosystem links are written here, as they
//! are in the Astro component; everything else comes from the exported data.

use maud::{Markup, html};

use crate::site::{Lang, Site, localize_path, strip_lang};

struct Link {
    label: String,
    href: String,
    external: bool,
    /// The page the reader is on, marked `aria-current="page"`.
    current: bool,
}

struct Section {
    title: String,
    links: Vec<Link>,
}

/// `/` matches only itself; every other route also matches its children (as the header does).
fn is_current(href: &str, here: &str) -> bool {
    if here.is_empty() {
        return false;
    }
    if href == "/" {
        here == "/"
    } else {
        here == href || here.starts_with(&format!("{href}/"))
    }
}

fn sections(site: &Site, lang: Lang, here: &str) -> Vec<Section> {
    let t = |key: &str| site.t(lang, key).to_string();

    let ecosystem = [
        ("The Bundu Foundation", "https://bundu.org"),
        ("Nyuchi Africa", "https://www.nyuchi.com"),
        ("Mukoko", "https://mukoko.com"),
        ("Mzizi", "https://mzizi.dev"),
    ];

    let mut connect: Vec<Link> = site
        .socials(lang)
        .iter()
        .map(|s| Link { label: s.name.clone(), href: s.href.clone(), external: s.href.starts_with("http"), current: false })
        .collect();
    connect.push(Link { label: t("footer.vcf"), href: "/bryan-fawcett.vcf".into(), external: false, current: false });

    vec![
        Section {
            title: t("footer.site"),
            links: site
                .nav
                .iter()
                .map(|n| Link { label: t(&n.label_key), href: localize_path(&n.href, lang), external: false, current: is_current(&n.href, here) })
                .collect(),
        },
        Section {
            title: t("footer.ecosystem"),
            links: ecosystem
                .iter()
                .map(|(label, href)| Link { label: (*label).into(), href: (*href).into(), external: true, current: false })
                .collect(),
        },
        Section { title: t("footer.connect"), links: connect },
    ]
}

/// `sheet`, `year` and `path` are inputs, as in the original: the page passes the sheet
/// number and its route (so the navigation marks where the reader is), and the year is
/// the build's. `path` may be empty: no link is then marked.
pub fn footer(site: &Site, lang: Lang, sheet: &str, year: &str, path: &str) -> Markup {
    let t = |key: &str| site.t(lang, key);
    let here = if path.is_empty() { String::new() } else { strip_lang(path) };

    html! {
        footer.mzizi-footer data-slot="mzizi-footer" data-portal="https://mzizi.dev/components/mzizi-footer"
            role="contentinfo" aria-label=(t("footer.label")) {
            div."mzizi-footer__strip" aria-hidden="true" {
                @for m in &site.minerals { span data-mineral=(m) {} }
            }

            div."mzizi-footer__inner" {
                div."mzizi-footer__grid" {
                    div."mzizi-footer__brand" {
                        p."mzizi-footer__wordmark" { (site.name) }
                        p."mzizi-footer__tagline" { (t("footer.tagline")) }
                    }

                    @for section in sections(site, lang, &here) {
                        div."mzizi-footer__section" {
                            h2."mzizi-footer__title" { (section.title) }
                            nav aria-label=(section.title) {
                                ul {
                                    @for link in &section.links {
                                        li {
                                            a."mzizi-footer__link" href=(link.href)
                                                aria-current=[link.current.then_some("page")]
                                                target=[link.external.then_some("_blank")]
                                                rel=[link.external.then_some("noopener noreferrer")]
                                                download=[link.href.ends_with(".vcf").then_some("")] {
                                                (link.label)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                div."mzizi-footer__bar" {
                    p."mzizi-footer__copy" { "© " (year) " " (site.name) ". " (t("footer.rights")) }
                    p."mzizi-footer__sheet" {
                        (t("tb.drawn_by")) " B.D.F. · " (t("tb.sheet")) " " (sheet) " · " (t("tb.rev")) " A — " (year)
                    }
                    div."mzizi-footer__dots" aria-hidden="true" {
                        @for m in &site.minerals { span data-mineral=(m) {} }
                    }
                }
            }
        }
    }
}
