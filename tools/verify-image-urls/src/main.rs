//! Guards the hand-rolled Sanity image URL builder: the Rust port of
//! `scripts/verify-image-urls.mjs`, pinning `image.rs`.
//!
//! The JS version imports `src/sanity/image.ts`, so it pins the TypeScript
//! builder. This pins the Rust one, and also checks the project id and dataset
//! against `src/sanity/client.ts`, so the two cannot drift apart unnoticed.
//! Keep the JS script until the TypeScript builder is retired.
//!
//!     cargo run -q --manifest-path tools/Cargo.toml -p verify-image-urls

mod image;

use image::{ImageOptions, SANITY_DATASET, SANITY_PROJECT_ID, parse_image_ref, resolve_image};
use regex::Regex;
use std::{fmt::Debug, fs, path::PathBuf, process::exit};

struct Check {
    failures: u32,
}

impl Check {
    fn eq<T: PartialEq + Debug>(&mut self, label: &str, got: T, want: T) {
        let ok = got == want;
        if !ok {
            self.failures += 1;
        }
        println!("{} {label}\n    got  {got:?}\n    want {want:?}", if ok { "✓" } else { "✗" });
    }
}

fn main() {
    let mut c = Check { failures: 0 };

    // The constants must match the TypeScript client, or a URL built here points
    // somewhere the site does not read from.
    let client = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../src/sanity/client.ts");
    let client = fs::read_to_string(&client).unwrap_or_else(|e| {
        eprintln!("cannot read {}: {e}", client.display());
        exit(2)
    });
    let constant = |name: &str| {
        Regex::new(&format!(r"export const {name} = '([^']+)'"))
            .unwrap()
            .captures(&client)
            .map(|m| m[1].to_string())
    };
    c.eq("project id matches client.ts", constant("SANITY_PROJECT_ID").as_deref(), Some(SANITY_PROJECT_ID));
    c.eq("dataset matches client.ts", constant("SANITY_DATASET").as_deref(), Some(SANITY_DATASET));

    // A real-shaped reference: image-<assetId>-<w>x<h>-<ext>
    let reference = "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1333-jpg";
    println!("parsed: {:?}", parse_image_ref(Some(reference)));

    let alt = Some("A flooded track");
    let free = resolve_image(Some(reference), alt, &ImageOptions { width: 600, aspect: None }).unwrap();
    c.eq("keeps source aspect (2000x1333 → 600x400)", format!("{}x{}", free.width, free.height), "600x400".into());
    c.eq(
        "src asks for 2x and webp",
        free.src.as_str(),
        "https://cdn.sanity.io/images/zsx9erk1/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1333.jpg?w=1200&fm=webp&q=72&fit=max",
    );
    c.eq("srcset carries both densities", free.srcset.split(", ").count(), 2);
    c.eq("alt passes through", free.alt.as_str(), "A flooded track");

    let cropped = resolve_image(Some(reference), alt, &ImageOptions { width: 600, aspect: Some(3.0 / 2.0) }).unwrap();
    c.eq("crops to the asked aspect (3:2 → 600x400)", format!("{}x{}", cropped.width, cropped.height), "600x400".into());
    c.eq("crop uses the editor hotspot", cropped.src.contains("crop=focalpoint"), true);
    c.eq("crop passes an explicit height", cropped.src.contains("h=800"), true);

    // Degradation
    let opts = ImageOptions { width: 400, aspect: None };
    c.eq("missing field → None", resolve_image(None, None, &opts).is_none(), true);
    c.eq("missing asset → None", resolve_image(None, Some("x"), &opts).is_none(), true);
    c.eq("malformed ref → None", resolve_image(Some("file-abc-pdf"), None, &opts).is_none(), true);
    c.eq("truncated ref → None", parse_image_ref(Some("image-abc-2000-jpg")).is_none(), true);
    c.eq("alt absent → empty string", resolve_image(Some(reference), None, &ImageOptions { width: 10, aspect: None }).unwrap().alt.as_str(), "");

    if c.failures == 0 {
        println!("\nimage URLs: all checks pass");
    } else {
        println!("\n{} FAILING", c.failures);
        exit(1);
    }
}
