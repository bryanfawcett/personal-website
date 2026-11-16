//! Sanity image URLs, built by hand: the Rust counterpart of `src/sanity/image.ts`.
//!
//! A reference is `image-<assetId>-<width>x<height>-<extension>` and the file it
//! names is served from
//! `https://cdn.sanity.io/images/<projectId>/<dataset>/<assetId>-<w>x<h>.<ext>`.

use regex::Regex;
use std::sync::OnceLock;

pub const SANITY_PROJECT_ID: &str = "zsx9erk1";
pub const SANITY_DATASET: &str = "production";

#[derive(Debug, PartialEq, Eq)]
pub struct ParsedImageRef {
    pub asset_id: String,
    pub width: u32,
    pub height: u32,
    pub extension: String,
}

fn ref_pattern() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| Regex::new(r"^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-(\w+)$").unwrap())
}

/// Pull the parts out of an asset reference. `None` if it is not one.
pub fn parse_image_ref(reference: Option<&str>) -> Option<ParsedImageRef> {
    let caps = ref_pattern().captures(reference.filter(|r| !r.is_empty())?)?;
    Some(ParsedImageRef {
        asset_id: caps[1].to_string(),
        width: caps[2].parse().ok()?,
        height: caps[3].parse().ok()?,
        extension: caps[4].to_string(),
    })
}

pub struct ImageOptions {
    /// Rendered width in CSS pixels. The URL asks for twice this.
    pub width: u32,
    /// Crop to this aspect ratio instead of keeping the source's.
    pub aspect: Option<f64>,
}

#[derive(Debug)]
pub struct ResolvedImage {
    pub src: String,
    pub srcset: String,
    pub width: u32,
    pub height: u32,
    pub alt: String,
}

/// Turn an image reference and alt text into everything an `<img>` needs.
/// `None` rather than a broken URL when the reference is missing or malformed.
pub fn resolve_image(
    reference: Option<&str>,
    alt: Option<&str>,
    options: &ImageOptions,
) -> Option<ResolvedImage> {
    let parsed = parse_image_ref(reference)?;
    let base = format!(
        "https://cdn.sanity.io/images/{SANITY_PROJECT_ID}/{SANITY_DATASET}/{}-{}x{}.{}",
        parsed.asset_id, parsed.width, parsed.height, parsed.extension
    );
    let w = f64::from(options.width);
    let height = match options.aspect {
        Some(a) => (w / a).round(),
        None => (w * f64::from(parsed.height) / f64::from(parsed.width)).round(),
    } as u32;

    let params = |w: u32| -> String {
        // `fm=webp` rather than `auto=format`: the Worker sets no Accept-based
        // Vary, and every browser that reaches this site takes webp.
        let mut query = format!("w={w}&fm=webp&q=72&fit={}", if options.aspect.is_some() { "crop" } else { "max" });
        if let Some(a) = options.aspect {
            // Respect the hotspot the editor set rather than centre-cropping.
            query.push_str(&format!("&h={}&crop=focalpoint", (f64::from(w) / a).round() as u32));
        }
        format!("{base}?{query}")
    };

    Some(ResolvedImage {
        src: params(options.width * 2),
        srcset: format!("{} 1x, {} 2x", params(options.width), params(options.width * 2)),
        width: options.width,
        height,
        alt: alt.unwrap_or("").to_string(),
    })
}
