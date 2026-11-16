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
    site::{Lang, Site},
};
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
    println!("\n{} of {checked} footers match", checked - failures);
    exit(if failures == 0 { 0 } else { 1 });
}
