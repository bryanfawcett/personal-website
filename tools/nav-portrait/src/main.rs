//! Render the masthead portrait once, into public/nav-portrait.webp (`pnpm nav-portrait`).
//!
//! The Rust port of the old Node script: same input (src/assets/bryan-fawcett.png),
//! same output path, same 92x92 (46px at 2x), same square crop pulled up onto the face
//! (22% of the spare height above the crop, as `object-position: 50% 22%` did), WebP quality 82.
//! Not a build step: Cloudflare's build image has no Rust, so the output is committed.

use std::{env, path::PathBuf};

use image::{GenericImageView, imageops::FilterType};

const SIZE: u32 = 92;

fn main() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let src = image::open(root.join("src/assets/bryan-fawcett.png")).expect("open portrait");
    let (w, h) = src.dimensions();
    let side = w.min(h);
    let top = ((h - side) as f64 * 0.22).round() as u32;
    let left = ((w - side) as f64 / 2.0).round() as u32;
    let face = src.crop_imm(left, top, side, side).resize_exact(SIZE, SIZE, FilterType::Lanczos3).to_rgb8();
    let webp = webp::Encoder::from_rgb(face.as_raw(), SIZE, SIZE).encode(82.0);
    std::fs::write(root.join("public/nav-portrait.webp"), &*webp).expect("write webp");
    println!("nav portrait {SIZE}x{SIZE} -> public/nav-portrait.webp ({} bytes)", webp.len());
}
