//! Render the shared chrome to fragments Astro inserts.
//!
//!     cargo run -q -p components --bin render            # write src/data/generated/fragments/
//!     cargo run -q -p components --bin render -- --check # fail if the committed ones are stale
//!
//! The header and footer depend on the route (which link is current) and the language, so
//! one fragment is written per language and top-level route. What varies per request is a
//! placeholder Astro fills: `%SWITCH%` (the language switch target, which a blog post
//! overrides), `%SHEET%` (the page's sheet number) and `%YEAR%` (the build year, so a
//! committed fragment does not go stale in January). Cloudflare's build image has no Rust, so
//! the fragments are committed, as the deck's `prebuilt/` is.

use maud::PreEscaped;
use std::{collections::BTreeMap, env, fs, path::PathBuf, process::exit};

use components::{
    footer::footer,
    contact_card::ContactCard,
    header::header,
    hero::Hero,
    page_header::page_header,
    portrait::Portrait,
    schematics::schematics,
    site::{Lang, Site},
};

/// The route a fragment is keyed by, and the path it is rendered for.
const ROUTES: [(&str, &str); 7] = [
    ("home", "/"),
    ("experience", "/experience"),
    ("adventures", "/adventures"),
    ("origins-with-perspective", "/origins-with-perspective"),
    ("minerals", "/minerals"),
    ("book", "/book"),
    // Any page that is none of the above (the 404): nothing is current.
    ("none", "/__none__"),
];

fn main() {
    let check = env::args().any(|a| a == "--check");
    let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../src/data/generated/fragments");
    let site = Site::load();

    let mut out: BTreeMap<String, String> = BTreeMap::new();
    out.insert("schematics.html".into(), schematics().into_string());

    // PageHeader: one fragment per combination of lede and note. `%SLOT%` marks where the
    // page's own children go; Astro splits the fragment there and renders its slot between.
    for (lede, note) in [(false, false), (true, false), (false, true), (true, true)] {
        let name = format!("page-header.{}{}.html", if lede { "l" } else { "" }, if note { "n" } else { "" });
        let html = page_header("%EYEBROW%", "%TITLE%", lede.then_some("%LEDE%"), note.then_some("%NOTE%"), PreEscaped("%SLOT%".into()));
        out.insert(name, html.into_string());
    }
    // Hero: one per language and combination of byline, sub, note and actions slot.
    for lang in [Lang::En, Lang::Zh] {
        for flags in 0..16u8 {
            let (byline, sub, note, slot) = (flags & 1 != 0, flags & 2 != 0, flags & 4 != 0, flags & 8 != 0);
            let hero = Hero {
                solid: "%SOLID%", drafted: "%DRAFTED%", eyebrow: "%EYEBROW%",
                sub: sub.then_some("%SUB%"), note: note.then_some("%NOTE%"),
                dimension: "%DIMENSION%", show_byline: byline, lang,
            };
            let html = hero.render(&site, slot.then(|| PreEscaped("%SLOT%".to_string()))).into_string();
            let key = format!("{}{}{}{}", if byline { "b" } else { "" }, if sub { "s" } else { "" }, if note { "n" } else { "" }, if slot { "a" } else { "" });
            out.insert(format!("hero.{}.{key}.html", lang.code()), html);
        }
    }
    for lang in [Lang::En, Lang::Zh] {
        // Portrait and contact card: the image URLs are content-hashed by astro:assets and the
        // QR SVGs come from `src/brand/qr.ts`, so they stay placeholders (`%SRC%`, `%SRCSET%`,
        // `%QR_DARK%`, `%QR_LIGHT%`) that the .astro wrapper fills. Width and height are fixed
        // per variant; the wrapper checks the requested width matches.
        let code = lang.code();
        let fig = site.t(lang, "card.fig").to_string();
        let portrait = |width, height, eager, class| Portrait {
            src: "%SRC%", srcset: "%SRCSET%", width, height, caption: Some(&fig), eager, class, lang,
        };
        out.insert(format!("portrait.{code}.quote.html"), portrait(176, 222, true, Some("quote__portrait")).render(&site).into_string());
        out.insert(
            format!("contact-card.{code}.connect.html"),
            ContactCard { portrait: portrait(152, 192, false, None), class: Some("connect__card"), qr_dark: "%QR_DARK%", qr_light: "%QR_LIGHT%", lang }
                .render(&site)
                .into_string(),
        );
        for (key, path) in ROUTES {
            let code = lang.code();
            out.insert(format!("header.{code}.{key}.html"), header(&site, lang, path, Some("%SWITCH%")).into_string());
            // The footer marks nothing current on the 404, as the Astro one does for an empty path.
            let fpath = if key == "none" { "" } else { path };
            out.insert(format!("footer.{code}.{key}.html"), footer(&site, lang, "%SHEET%", "%YEAR%", fpath).into_string());
        }
    }

    if check {
        let mut stale = 0;
        for (name, body) in &out {
            if fs::read_to_string(dir.join(name)).ok().as_deref() != Some(body.as_str()) {
                eprintln!("stale: {name}");
                stale += 1;
            }
        }
        if stale > 0 {
            eprintln!("{stale} fragment(s) are stale; run `pnpm fragments`");
            exit(1);
        }
        println!("fragments are up to date ({} files)", out.len());
        return;
    }

    fs::create_dir_all(&dir).expect("create fragments dir");
    for (name, body) in &out {
        fs::write(dir.join(name), body).expect("write fragment");
    }
    println!("wrote {} fragments to src/data/generated/fragments/", out.len());
}
