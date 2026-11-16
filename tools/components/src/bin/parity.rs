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
    }
    println!("{extra} further components compared");
    println!("\n{} of {checked} footers match", checked - failures);
    exit(if failures == 0 { 0 } else { 1 });
}
