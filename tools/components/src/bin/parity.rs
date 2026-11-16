//! Prove a Rust component against the Astro one.
//!
//!     cargo run -q -p components --bin parity [-- <built-assets-dir>]
//!
//! For each page it finds the component as Astro shipped it, reads the inputs the
//! render depended on (language, sheet, year) back out of that same markup, renders
//! the Rust component from those inputs, and compares the two as canonical HTML.

use std::{env, fs, path::PathBuf, process::exit};

use components::{
    canon::{diff, normalize},
    footer::footer,
    lang_switcher::language_switcher,
    page_header::page_header,
    contact_card::ContactCard,
    header::header,
    hero::Hero,
    portrait::Portrait,
    schematics::schematics,
    workshop_strip::workshop_strip,
    panel::{Panel, Tag},
    site::{Lang, Site},
};
use maud::PreEscaped;
use scraper::{Html, Selector};

fn select_outer(doc: &Html, css: &str) -> Option<String> {
    let sel = Selector::parse(css).ok()?;
    doc.select(&sel).next().map(|e| e.html())
}

fn text_of(doc: &Html, css: &str) -> Option<String> {
    let sel = Selector::parse(css).ok()?;
    doc.select(&sel).next().map(|e| e.text().collect::<String>())
}

fn main() {
    // Where `astro build` puts the pages: under `cf`'s output when `cloudflare.config.ts`
    // is in effect, otherwise the adapter's own `dist/client`.
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let candidates = [".cloudflare/output/v0/workers/default/assets", "dist/client"];
    let Some(dir) = env::args().nth(1).map(PathBuf::from).or_else(|| {
        candidates.iter().map(|c| root.join(c)).find(|p| p.join("index.html").exists())
    }) else {
        eprintln!("no built site found; run `pnpm build` first, or pass the directory");
        exit(2)
    };
    let site = Site::load();
    let mut failures = 0;
    let mut checked = 0;

    // Every page in both languages: build.format is `file`, so /zh/x is zh/x.html.
    let mut pages: Vec<PathBuf> = Vec::new();
    for sub in ["", "zh"] {
        let d = if sub.is_empty() { dir.clone() } else { dir.join(sub) };
        if let Ok(rd) = fs::read_dir(&d) {
            for e in rd.flatten() {
                let p = e.path();
                if p.extension().is_some_and(|x| x == "html") && p.file_name().is_some_and(|n| n != "404.html") {
                    pages.push(p);
                }
            }
        }
    }
    pages.push(dir.join("zh.html"));
    pages.sort();
    pages.dedup();

    for page in &pages {
        let Ok(html) = fs::read_to_string(page) else { continue };
        let doc = Html::parse_document(&html);
        let Some(astro) = select_outer(&doc, "footer[data-slot=\"mzizi-footer\"]") else { continue };

        let lang = if doc.root_element().value().attr("lang").is_some_and(|l| l.starts_with("zh")) { Lang::Zh } else { Lang::En };

        // Read the inputs back out of the shipped footer.
        let title_block = text_of(&doc, ".mzizi-footer__sheet").unwrap_or_default();
        let year: i32 = title_block.split_whitespace().last().and_then(|y| y.parse().ok()).unwrap_or(0);
        let sheet = title_block
            .split(" · ")
            .nth(1)
            .and_then(|s| s.split_once(' ').map(|(_, rest)| rest.trim().to_string()))
            .unwrap_or_default();

        // The route the page passed: read back from whichever link the footer marked current.
        let path = Selector::parse("a[aria-current=\"page\"]")
            .ok()
            .and_then(|sel| Html::parse_fragment(&astro).select(&sel).next().and_then(|e| e.value().attr("href").map(str::to_string)))
            .unwrap_or_default();

        let rust = footer(&site, lang, &sheet, year, &path).into_string();
        let (a, b) = (normalize(&astro), normalize(&rust));
        checked += 1;
        let name = page.strip_prefix(&dir).unwrap_or(page).display();
        if a == b {
            println!("✓ footer {name} ({}, sheet {sheet}, {year}, current {})", lang.code(), if path.is_empty() { "none" } else { &path });
        } else {
            failures += 1;
            println!("✗ footer {name} ({}, sheet {sheet}, {year})", lang.code());
            for d in diff(&a, &b, 4) {
                println!("{d}");
            }
        }
    }

    if checked == 0 {
        eprintln!("no pages with a footer found under {}", dir.display());
        exit(2);
    }

    // The language switcher and the page header, on every page that carries them.
    let mut extra = 0;
    for page in &pages {
        let Ok(html) = fs::read_to_string(page) else { continue };
        let doc = Html::parse_document(&html);
        let lang = if doc.root_element().value().attr("lang").is_some_and(|l| l.starts_with("zh")) { Lang::Zh } else { Lang::En };
        let name = page.strip_prefix(&dir).unwrap_or(page).display();

        let sel = Selector::parse("a.lang").unwrap();
        for el in doc.select(&sel) {
            let href = el.value().attr("href").unwrap_or("");
            // The shipped link points at the other language; its neutral route is the page's.
            let rust = language_switcher(&site, lang, &components::site::strip_lang(href), None).into_string();
            let (a, b) = (normalize(&el.html()), normalize(&rust));
            extra += 1;
            if a == b { println!("✓ language switcher {name} ({})", lang.code()); } else {
                failures += 1; println!("✗ language switcher {name}"); for d in diff(&a, &b, 4) { println!("{d}"); }
            }
        }

        let sel = Selector::parse("header.page-header").unwrap();
        for el in doc.select(&sel) {
            let text = |css: &str| Selector::parse(css).ok().and_then(|s| el.select(&s).next().map(|e| e.text().collect::<String>()));
            let rust = page_header(
                &text(".eyebrow").unwrap_or_default(),
                &text(".page-header__title").unwrap_or_default(),
                text(".lede").as_deref(),
                text(".margin-note").as_deref(),
                PreEscaped(
                    el.children().filter_map(scraper::ElementRef::wrap)
                        .filter(|c| !matches!(c.value().attr("class"), Some("page-header__top" | "page-header__title" | "lede")))
                        .map(|c| c.html()).collect::<String>(),
                ),
            ).into_string();
            let (a, b) = (normalize(&el.html()), normalize(&rust));
            extra += 1;
            if a == b { println!("✓ page header {name}"); } else {
                failures += 1; println!("✗ page header {name}"); for d in diff(&a, &b, 4) { println!("{d}"); }
            }
        }

        // Panels: rebuilt from their tag, classes, tone, frame, figure tag and the rest.
        let sel = Selector::parse(".panel").unwrap();
        for el in doc.select(&sel) {
            let v = el.value();
            let tag = match v.name() {
                "section" => Tag::Section, "article" => Tag::Article, "div" => Tag::Div, "li" => Tag::Li, "a" => Tag::A,
                _ => continue,
            };
            let classes: Vec<&str> = v.classes().filter(|c| *c != "panel").collect();
            let class = classes.join(" ");
            let attrs: Vec<(&str, &str)> = v.attrs().filter(|(k, _)| !matches!(*k, "class" | "data-mineral")).collect();
            let kids: Vec<_> = el.children().collect();
            let mut skip = 0;
            let frame = kids.get(skip).and_then(|n| scraper::ElementRef::wrap(*n)).is_some_and(|e| e.value().has_class("panel__rule", scraper::CaseSensitivity::CaseSensitive));
            if frame { skip += 1; }
            let fig_el = kids.get(skip).and_then(|n| scraper::ElementRef::wrap(*n)).filter(|e| e.value().has_class("fig", scraper::CaseSensitivity::CaseSensitive));
            let fig = fig_el.map(|e| e.text().collect::<String>());
            if fig.is_some() { skip += 1; }
            let inner: String = kids.iter().skip(skip).map(|n| match scraper::ElementRef::wrap(*n) {
                Some(e) => e.html(),
                None => n.value().as_text().map(|t| maud::html! { (t.to_string()) }.into_string()).unwrap_or_default(),
            }).collect();
            let rust = Panel { tag, fig: fig.as_deref(), mineral: v.attr("data-mineral"), frame, class: Some(&class), attrs }
                .render(PreEscaped(inner)).into_string();
            let (a, b) = (normalize(&el.html()), normalize(&rust));
            extra += 1;
            if a == b { println!("✓ panel {name}"); } else {
                failures += 1; println!("✗ panel {name}"); for d in diff(&a, &b, 4) { println!("{d}"); }
            }
        }

        // The six remaining components, each rebuilt from what its shipped markup carries.
        let attr = |e: &scraper::ElementRef, a: &str| e.value().attr(a).map(str::to_string);
        let sub = |e: &scraper::ElementRef, css: &str| Selector::parse(css).ok().and_then(|s| e.select(&s).next().map(|x| x.html()));
        let one = |css: &str| Selector::parse(css).unwrap();
        let report = |what: &str, a: String, b: String, extra: &mut i32, failures: &mut i32| {
            let (a, b) = (normalize(&a), normalize(&b));
            *extra += 1;
            if a == b { println!("✓ {what} {name}"); } else {
                *failures += 1; println!("✗ {what} {name}"); for d in diff(&a, &b, 4) { println!("{d}"); }
            }
        };

        for el in doc.select(&one("div.schematics")) { report("schematics", el.html(), schematics().into_string(), &mut extra, &mut failures); }
        for el in doc.select(&one("section.strip")) { report("workshop strip", el.html(), workshop_strip(&site, lang).into_string(), &mut extra, &mut failures); }

        let portrait_of = |fig: &scraper::ElementRef| -> Option<(String, String, u32, u32, Option<String>, bool, String)> {
            let img = fig.select(&one("img")).next()?;
            let cap = fig.select(&one("figcaption")).next().map(|c| c.text().collect::<String>());
            let class = fig.value().classes().filter(|c| *c != "portrait").collect::<Vec<_>>().join(" ");
            Some((
                attr(&img, "src")?, attr(&img, "srcset")?,
                attr(&img, "width")?.parse().ok()?, attr(&img, "height")?.parse().ok()?,
                cap, attr(&img, "loading").as_deref() == Some("eager"), class,
            ))
        };
        let build_portrait = |t: &(String, String, u32, u32, Option<String>, bool, String)| Portrait {
            src: &t.0, srcset: &t.1, width: t.2, height: t.3, caption: t.4.as_deref(), eager: t.5,
            class: Some(&t.6), lang,
        }.render(&site).into_string();

        for fig in doc.select(&one("figure.portrait")) {
            if let Some(t) = portrait_of(&fig) { report("portrait", fig.html(), build_portrait(&t), &mut extra, &mut failures); }
        }
        for card in doc.select(&one("div.card")) {
            let Some(fig) = card.select(&one("figure.portrait")).next() else { continue };
            let Some(t) = portrait_of(&fig) else { continue };
            let class = card.value().classes().filter(|c| *c != "card").collect::<Vec<_>>().join(" ");
            let qr = |css: &str| card.select(&one(css)).next().map(|e| e.inner_html()).unwrap_or_default();
            let (dark, light) = (qr(".card__qr--dark"), qr(".card__qr--light"));
            let rust = ContactCard {
                portrait: Portrait { src: &t.0, srcset: &t.1, width: t.2, height: t.3, caption: t.4.as_deref(), eager: t.5, class: Some(&t.6), lang },
                class: Some(&class), qr_dark: &dark, qr_light: &light, lang,
            }.render(&site).into_string();
            report("contact card", card.html(), rust, &mut extra, &mut failures);
        }

        for el in doc.select(&one("header.hero")) {
            let text = |css: &str| el.select(&one(css)).next().map(|e| e.text().collect::<String>());
            let spans: Vec<String> = el.select(&one("h1.stack span")).map(|e| e.text().collect()).collect();
            let note = el.select(&one(".hero__note")).next().map(|n| {
                n.inner_html().replace("<span class=\"hero__arrow\">↴</span>", "").replace("<br>", "\n")
            });
            let actions = sub(&el, ".hero__actions").map(|_| {
                maud::PreEscaped(el.select(&one(".hero__actions")).next().map(|a| a.inner_html()).unwrap_or_default())
            });
            let rust = Hero {
                solid: spans.first().map(String::as_str).unwrap_or(""), drafted: spans.get(1).map(String::as_str).unwrap_or(""),
                eyebrow: &text(".hero__eyebrow").unwrap_or_default(),
                sub: text(".hero__sub").as_deref(), note: note.as_deref(),
                dimension: &text(".dimension__label").unwrap_or_default(),
                show_byline: el.select(&one(".hero__byline")).next().is_some(), lang,
            }.render(&site, actions).into_string();
            report("hero", el.html(), rust, &mut extra, &mut failures);
        }

        for el in doc.select(&one("header[data-slot=\"mzizi-header\"]")) {
            let href = el.select(&one("a.lang")).next().and_then(|a| attr(&a, "href")).unwrap_or_default();
            let path = components::site::strip_lang(&href);
            // The route the page passed: whichever link the header marked current.
            let here = el.select(&one("a[aria-current=\"page\"]")).next().and_then(|a| attr(&a, "href")).unwrap_or(path);
            let rust = header(&site, lang, &here, Some(&href)).into_string();
            report("header", el.html(), rust, &mut extra, &mut failures);
        }
    }
    println!("{extra} further components compared");
    println!("\n{} of {checked} footers match", checked - failures);
    exit(if failures == 0 { 0 } else { 1 });
}
