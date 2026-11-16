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

use std::{collections::BTreeMap, env, fs, path::PathBuf, process::exit};

use components::{
    footer::footer,
    header::header,
    schematics::schematics,
    site::{Lang, Site},
    workshop_strip::workshop_strip,
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
    for lang in [Lang::En, Lang::Zh] {
        out.insert(format!("workshop.{}.html", lang.code()), workshop_strip(&site, lang).into_string());
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
