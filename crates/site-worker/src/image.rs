//! Sanity image URLs, built by hand: a port of `src/sanity/image.ts`.
//!
//! A reference is `image-<assetId>-<width>x<height>-<extension>`; the file it names is
//! served from `https://cdn.sanity.io/images/<project>/<dataset>/<assetId>-<w>x<h>.<ext>`.
//! The vectors in `scripts/verify-image-urls.mjs` are reproduced as unit tests here.
//!
//! Hardening over the TypeScript: the asset id and extension are matched against the same
//! narrow character classes the TS regex used, so nothing a dataset editor writes can add a
//! path segment, a query parameter or a quote to the URL.

use crate::queries::{SANITY_DATASET, SANITY_PROJECT_ID};
use serde_json::Value;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedImageRef {
    pub asset_id: String,
    pub width: u32,
    pub height: u32,
    pub extension: String,
}

/// `/^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-(\w+)$/`, without a regex engine.
pub fn parse_image_ref(reference: &str) -> Option<ParsedImageRef> {
    let rest = reference.strip_prefix("image-")?;
    let mut parts = rest.splitn(3, '-');
    let asset_id = parts.next()?;
    let dims = parts.next()?;
    let extension = parts.next()?;
    if asset_id.is_empty() || !asset_id.bytes().all(|b| b.is_ascii_alphanumeric()) {
        return None;
    }
    if extension.is_empty() || !extension.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'_') {
        return None;
    }
    let (w, h) = dims.split_once('x')?;
    let digits = |s: &str| !s.is_empty() && s.bytes().all(|b| b.is_ascii_digit());
    if !digits(w) || !digits(h) {
        return None;
    }
    Some(ParsedImageRef {
        asset_id: asset_id.to_string(),
        width: w.parse().ok()?,
        height: h.parse().ok()?,
        extension: extension.to_string(),
    })
}

/// What `<img>` needs.
#[derive(Debug, Clone, PartialEq)]
pub struct ResolvedImage {
    pub src: String,
    pub srcset: String,
    pub width: u32,
    pub height: u32,
    pub alt: String,
}

/// `Math.round` for the non-negative values here (halves round up, as in JavaScript).
fn js_round(x: f64) -> u32 {
    (x + 0.5).floor() as u32
}

/// `resolveImage(image, { width, aspect })`. `image` is the raw Sanity field (a JSON object
/// with `asset._ref` and `alt`); `None` for anything missing or malformed.
pub fn resolve_image(image: Option<&Value>, width: u32, aspect: Option<f64>) -> Option<ResolvedImage> {
    let image = image?;
    let reference = image.get("asset")?.get("_ref")?.as_str()?;
    let parsed = parse_image_ref(reference)?;
    if parsed.width == 0 {
        return None;
    }
    let base = format!(
        "https://cdn.sanity.io/images/{SANITY_PROJECT_ID}/{SANITY_DATASET}/{}-{}x{}.{}",
        parsed.asset_id, parsed.width, parsed.height, parsed.extension
    );
    let height = match aspect {
        Some(a) if a > 0.0 => js_round(f64::from(width) / a),
        _ => js_round(f64::from(width) * f64::from(parsed.height) / f64::from(parsed.width)),
    };
    let params = |w: u32| -> String {
        let mut q = format!("w={w}&fm=webp&q=72&fit={}", if aspect.is_some() { "crop" } else { "max" });
        if let Some(a) = aspect.filter(|a| *a > 0.0) {
            q.push_str(&format!("&h={}", js_round(f64::from(w) / a)));
            // Respect the hotspot the editor set rather than centre-cropping a face out.
            q.push_str("&crop=focalpoint");
        }
        format!("{base}?{q}")
    };
    Some(ResolvedImage {
        src: params(width * 2),
        srcset: format!("{} 1x, {} 2x", params(width), params(width * 2)),
        width,
        height,
        alt: image.get("alt").and_then(Value::as_str).unwrap_or("").to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    const REF: &str = "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1333-jpg";

    fn img() -> Value {
        json!({ "asset": { "_ref": REF }, "alt": "A flooded track" })
    }

    // The vectors below are scripts/verify-image-urls.mjs, line for line.
    #[test]
    fn keeps_source_aspect() {
        let r = resolve_image(Some(&img()), 600, None).unwrap();
        assert_eq!((r.width, r.height), (600, 400));
        assert_eq!(
            r.src,
            "https://cdn.sanity.io/images/zsx9erk1/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x1333.jpg?w=1200&fm=webp&q=72&fit=max"
        );
        assert_eq!(r.srcset.split(", ").count(), 2);
        assert_eq!(r.alt, "A flooded track");
    }

    #[test]
    fn crops_to_the_asked_aspect() {
        let r = resolve_image(Some(&img()), 600, Some(3.0 / 2.0)).unwrap();
        assert_eq!((r.width, r.height), (600, 400));
        assert!(r.src.contains("crop=focalpoint"));
        assert!(r.src.contains("h=800"));
        assert!(r.src.contains("fit=crop"));
    }

    #[test]
    fn degrades_to_none() {
        assert_eq!(resolve_image(None, 400, None), None);
        assert_eq!(resolve_image(Some(&json!({ "alt": "x" })), 400, None), None);
        assert_eq!(resolve_image(Some(&json!({ "asset": { "_ref": "file-abc-pdf" } })), 400, None), None);
        assert_eq!(parse_image_ref("image-abc-2000-jpg"), None);
    }

    #[test]
    fn missing_alt_is_an_empty_string() {
        let r = resolve_image(Some(&json!({ "asset": { "_ref": REF } })), 10, None).unwrap();
        assert_eq!(r.alt, "");
    }

    #[test]
    fn a_reference_cannot_smuggle_path_or_query_syntax() {
        for bad in [
            "image-abc/../x-10x10-jpg",
            "image-abc-10x10-jpg?x=1",
            "image-abc-10x10-jp g",
            "image-abc-10x10-jpg\"onload=1",
            "image--10x10-jpg",
            "image-abc-10x-jpg",
        ] {
            assert_eq!(parse_image_ref(bad), None, "{bad}");
        }
    }

    #[test]
    fn zero_width_source_is_refused_not_divided_by() {
        assert_eq!(parse_image_ref("image-abc-0x0-jpg").map(|p| p.width), Some(0));
        assert_eq!(resolve_image(Some(&json!({ "asset": { "_ref": "image-abc-0x0-jpg" } })), 10, None), None);
    }
}
