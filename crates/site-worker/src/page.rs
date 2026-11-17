//! The two blog views as markup: `AdventuresView.astro` and `AdventureView.astro`, ported.
//!
//! The chrome is not here. The header, footer, schematics, page header and panel are the
//! `components` crate's, the same functions `pnpm fragments` and the WebAssembly module run
//! (and `verify:components:rs` proves against Astro). This file only arranges them around
//! the blog's own content. Everything from Sanity goes through maud's escaping, or through
//! [`crate::portable`], which is a closed renderer; nothing is concatenated.

use components::{
    footer::footer,
    header::header,
    page_header::page_header,
    panel::{Panel, Tag},
    schematics::schematics,
    site::{Lang, Site, localize_path},
};
use maud::{Markup, PreEscaped, html};

use crate::{
    dates::format_date,
    head::{self, Article, bcp47},
    image::resolve_image,
    model::{Adventure, Card},
    portable::render_body,
    shell::Shell,
};

/// The sheet number every blog page carries in the title block.
const SHEET: &str = "03 / 06";
/// Unset or unknown minerals draw cobalt (`DEFAULT_MINERAL`).
const DEFAULT_MINERAL: &str = "cobalt";

/// A path segment, percent-encoded (RFC 3986 unreserved stay).
pub fn encode_segment(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        if b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.' | b'~') {
            out.push(b as char);
        } else {
            out.push_str(&format!("%{b:02X}"));
        }
    }
    out
}

fn mineral<'a>(site: &Site, wanted: Option<&'a str>) -> &'a str {
    match wanted {
        Some(m) if site.minerals.iter().any(|known| known == m) => m,
        _ => DEFAULT_MINERAL,
    }
}

/// What one list card shows once the language is taken into account (`present()` in the view).
struct Shown<'a> {
    title: &'a str,
    excerpt: Option<&'a str>,
    place: Option<&'a str>,
    href: String,
    untranslated: bool,
}

fn present(card: &Card, lang: Lang) -> Shown<'_> {
    let translated = if lang == Lang::Zh { card.zh.as_ref() } else { None };
    Shown {
        title: translated.map_or(card.title.as_str(), |t| t.title.as_str()),
        excerpt: translated.and_then(|t| t.excerpt.as_deref()).or(card.excerpt.as_deref()),
        // The place is written out in the translation too, so it comes from there when it can.
        place: translated.and_then(|t| t.place.as_deref()).or(card.place.as_deref()),
        // Chinese falls back to the *English URL* too: there is no Chinese page to send anybody to.
        href: match translated {
            Some(t) => format!("/zh/adventures/{}", encode_segment(&t.slug)),
            None => format!("/adventures/{}", encode_segment(&card.slug)),
        },
        untranslated: lang == Lang::Zh && translated.is_none(),
    }
}

/// What the list shows besides the cards.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ListState {
    /// Sanity answered with cards.
    Cards,
    /// Sanity answered and there are none yet.
    Empty,
    /// Sanity could not be read.
    Unavailable,
}

pub fn list_main(site: &Site, lang: Lang, cards: &[Card], state: ListState) -> Markup {
    let t = |k: &str| site.t(lang, k).to_string();
    html! {
        (page_header(&t("adv.eyebrow"), &t("adv.title"), Some(&t("adv.lede")), Some(&t("adv.note")), PreEscaped(String::new())))
        section class="section reveal" aria-labelledby="adventures-heading" {
            h2 class="visually-hidden" id="adventures-heading" { (t("adv.heading")) }
            @if state == ListState::Unavailable {
                (Panel { class: Some("adventures__notice"), ..Panel::default() }.render(html! {
                    h3 { (t("adv.unavailable_title")) }
                    p { (t("adv.unavailable_body")) }
                }))
            }
            @if state == ListState::Empty {
                (Panel { class: Some("adventures__notice"), ..Panel::default() }.render(html! {
                    h3 { (t("adv.empty_title")) }
                    p { (t("adv.empty_body")) }
                    p class="adventures__notice-action" { a class="btn" href=(localize_path("/book", lang)) { (t("nav.book")) } }
                }))
            }
            ol class="adventures" {
                @for card in cards { li { (card_markup(site, lang, card)) } }
            }
        }
    }
}

fn card_markup(site: &Site, lang: Lang, card: &Card) -> Markup {
    let shown = present(card, lang);
    let cover = resolve_image(card.cover.as_ref(), 420, Some(3.0 / 2.0));
    let date = format_date(&card.published_at, lang);
    let lang_en = shown.untranslated.then_some("en");
    let href = shown.href.clone();
    let m = mineral(site, card.mineral.as_deref());
    Panel { tag: Tag::A, mineral: Some(m), class: Some("adventure-card"), attrs: vec![("href", href.as_str())], ..Panel::default() }.render(html! {
        @if let Some(c) = &cover {
            img class="adventure-card__cover" src=(c.src) srcset=(c.srcset) width=(c.width) height=(c.height) alt=(c.alt) loading="lazy" decoding="async";
        }
        div class="adventure-card__body" {
            p class="adventure-card__meta" {
                @if let Some(d) = &date { time datetime=(card.published_at) { (d) } }
                @if let Some(p) = shown.place {
                    @if date.is_some() { span aria-hidden="true" { " · " } }
                    span { (p) }
                }
            }
            h3 class="adventure-card__title" lang=[lang_en] { (shown.title) }
            @if let Some(e) = shown.excerpt { p class="adventure-card__excerpt" lang=[lang_en] { (e) } }
            p class="adventure-card__foot" {
                span class="adventure-card__read" { (site.t(lang, "adv.read")) }
                @if shown.untranslated {
                    span class="adventure-card__badge" title=(site.t(lang, "adv.english_only_title")) { (site.t(lang, "adv.english_only")) }
                }
            }
        }
    })
}

/// A missing or unreachable adventure: the same page header and a way back.
pub fn notice_main(site: &Site, lang: Lang, reachable: bool) -> Markup {
    let t = |k: &str| site.t(lang, k).to_string();
    let (title, body) = if reachable { ("adv.missing_title", "adv.missing_body") } else { ("adv.unavailable_title", "adv.unavailable_body") };
    html! {
        (page_header(&t("adv.eyebrow"), &t(title), Some(&t(body)), Some(&t("adv.note")), PreEscaped(String::new())))
        (Panel { class: Some("adventure__notice"), ..Panel::default() }.render(html! {
            p { a class="btn" href=(localize_path("/adventures", lang)) { (t("adv.back")) } }
        }))
    }
}

pub fn post_main(site: &Site, lang: Lang, a: &Adventure) -> Markup {
    let t = |k: &str| site.t(lang, k).to_string();
    let card = &a.card;
    let cover = resolve_image(card.cover.as_ref(), 900, Some(16.0 / 9.0));
    let body = render_body(&a.body);
    let eyebrow = format_date(&card.published_at, lang).unwrap_or_default();
    html! {
        (page_header(&eyebrow, &card.title, card.excerpt.as_deref(), card.place.as_deref(), PreEscaped(String::new())))
        article class="section reveal adventure" data-mineral=(mineral(site, card.mineral.as_deref())) {
            span class="adventure__bar" aria-hidden="true" {}
            @if let Some(c) = &cover {
                figure class="adventure__cover" {
                    span class="panel__rule" aria-hidden="true" {}
                    img src=(c.src) srcset=(c.srcset) width=(c.width) height=(c.height) alt=(c.alt) loading="eager" fetchpriority="high" decoding="async";
                }
            }
            div class="adventure__body prose" { (PreEscaped(body)) }
        }
        p class="adventure__back" { a class="btn is-ghost" href=(localize_path("/adventures", lang)) { (t("adv.back")) } }
    }
}

/// The languages a post genuinely exists in: itself, plus its translation if there is one.
pub fn post_alternates(a: &Adventure, lang: Lang) -> Vec<(Lang, String)> {
    let path = |l: &str, slug: &str| format!("{l}/adventures/{}", encode_segment(slug));
    match lang {
        Lang::En => {
            let mut v = vec![(Lang::En, path("", &a.card.slug))];
            v.extend(a.translation.as_ref().map(|s| (Lang::Zh, path("/zh", s))));
            v
        }
        Lang::Zh => {
            let mut v = vec![(Lang::Zh, path("/zh", &a.card.slug))];
            v.extend(a.original.as_ref().map(|s| (Lang::En, path("", s))));
            v
        }
    }
}

/// Which page this is, for the head.
pub enum View<'a> {
    List { state: ListState, cards: &'a [Card] },
    Post(&'a Adventure),
    /// 404 (`reachable`) or 503.
    Notice { reachable: bool },
}

pub fn document(site: &Site, shell: &Shell, lang: Lang, year: i64, view: &View<'_>) -> String {
    let t = |k: &str| site.t(lang, k).to_string();
    let list_path = localize_path("/adventures", lang);
    let default_alts = vec![(Lang::En, "/adventures".to_string()), (Lang::Zh, "/zh/adventures".to_string())];

    let (title, description, path, alternates, article, is_list, main, switch): (String, String, String, Vec<(Lang, String)>, Option<(String, Option<String>)>, bool, Markup, Option<String>) = match view {
        View::List { state, cards } => (
            t("adv.title"),
            t("adv.description"),
            list_path.clone(),
            default_alts,
            None,
            true,
            list_main(site, lang, cards, *state),
            None,
        ),
        View::Post(a) => {
            let alts = post_alternates(a, lang);
            let here = alts.iter().find(|(l, _)| *l == lang).map(|(_, p)| p.clone()).unwrap_or_else(|| list_path.clone());
            let other = if lang == Lang::En { Lang::Zh } else { Lang::En };
            let switch = alts.iter().find(|(l, _)| *l == other).map(|(_, p)| p.clone());
            let cover = resolve_image(a.card.cover.as_ref(), 900, Some(16.0 / 9.0)).map(|c| c.src);
            (
                a.card.title.clone(),
                a.card.excerpt.clone().unwrap_or_else(|| t("adv.description")),
                here,
                alts,
                Some((a.card.published_at.clone(), cover)),
                false,
                post_main(site, lang, a),
                switch,
            )
        }
        View::Notice { reachable } => (
            t(if *reachable { "adv.missing_title" } else { "adv.unavailable_title" }),
            t("adv.description"),
            list_path.clone(),
            default_alts,
            None,
            false,
            notice_main(site, lang, *reachable),
            None,
        ),
    };

    let page = head::Page {
        lang,
        title: &title,
        description: &description,
        path: &path,
        alternates: &alternates,
        article: article.as_ref().map(|(published_at, image)| Article { published_at, image: image.as_deref() }),
        is_list,
    };
    let head_meta = head::head_html(site, &page);

    // The chrome keys "which link is current" off `/adventures`, as the Astro layout is passed.
    let header_html = header(site, lang, "/adventures", switch.as_deref()).into_string();
    let footer_html = footer(site, lang, SHEET, &year.to_string(), "/adventures").into_string();

    html! {
        (maud::DOCTYPE)
        html lang=(bcp47(lang)) dir="ltr" class="no-js" {
            head {
                meta charset="utf-8";
                meta name="viewport" content="width=device-width, initial-scale=1";
                (PreEscaped(head_meta))
                (PreEscaped(shell.head.as_str()))
            }
            body {
                div class="sheet-ground" aria-hidden="true" {}
                div class="blueprint" aria-hidden="true" {}
                (schematics())
                (PreEscaped(shell.mineral_strip.as_str()))
                a class="skip-link" href="#main" { (site.t(lang, "nav.skip")) }
                div class="page" {
                    (PreEscaped(header_html))
                    (PreEscaped(shell.header_tail.as_str()))
                    (PreEscaped(format!("<main id=\"main\" class=\"shell\"{}>", shell.main_attrs)))
                    (main)
                    (PreEscaped("</main>"))
                }
                (PreEscaped(footer_html))
                (PreEscaped(shell.body_tail.as_str()))
            }
        }
    }
    .into_string()
}
