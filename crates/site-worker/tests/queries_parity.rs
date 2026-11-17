//! The Rust GROQ queries must be the TypeScript's, byte for byte. This runs the site's own
//! `src/sanity/queries.ts` under Node (the same loader `pnpm verify:images` uses) and compares.
//! If Node or the TypeScript is not there it says so and passes: a Rust-only checkout must
//! still be able to `cargo test`. CI that wants the guarantee runs it where `pnpm install` has.

use std::{path::PathBuf, process::Command};

use site_worker::handler::BLOG_CACHE_CONTROL;
use site_worker::queries::{ADVENTURE_EN, ADVENTURE_LIST, ADVENTURE_ZH};

#[test]
fn queries_match_src_sanity_queries_ts() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    if !root.join("src/sanity/queries.ts").exists() {
        eprintln!("skipped: src/sanity/queries.ts not found");
        return;
    }
    let out = Command::new("node")
        .current_dir(&root)
        .args(["--experimental-strip-types", "--import", "./scripts/ts-specifier-hook.mjs", "crates/site-worker/scripts/dump-queries.mjs"])
        .output();
    let out = match out {
        Ok(o) if o.status.success() => o,
        other => {
            eprintln!("skipped: could not run node ({other:?})");
            return;
        }
    };
    let ts: serde_json::Value = serde_json::from_slice(&out.stdout).expect("dump-queries prints JSON");
    for (name, rust) in [("ADVENTURE_LIST", ADVENTURE_LIST), ("ADVENTURE_EN", ADVENTURE_EN), ("ADVENTURE_ZH", ADVENTURE_ZH)] {
        assert_eq!(ts[name].as_str(), Some(rust), "{name} drifted from src/sanity/queries.ts");
    }

    assert_eq!(ts["BLOG_CACHE_CONTROL"].as_str(), Some(BLOG_CACHE_CONTROL), "cache policy drifted from src/sanity/client.ts");
}
