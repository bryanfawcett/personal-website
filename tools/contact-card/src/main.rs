//! The contact card: the Rust port of `src/brand/vcard.ts` and `src/brand/qr.ts`.
//!
//!     contact-card vcard        # the vCard 3.0 on stdout
//!     contact-card qr dark      # the booking-link QR as SVG on stdout
//!     contact-card qr light
//!
//! Reads `src/data/generated/site.json` (written by `pnpm site-data`), so the
//! content stays in TypeScript and this never parses it. Output is meant to match
//! the TypeScript byte for byte; `pnpm verify:contact:rs` checks that.

use qrcode::{Color, EcLevel, QrCode};
use serde::Deserialize;
use std::{env, fs, path::PathBuf, process::exit};

#[derive(Deserialize)]
struct Site {
    profile: Profile,
    booking_url: String,
    qr: Qr,
}

#[derive(Deserialize)]
struct Profile {
    name: String,
    title: String,
    email: String,
    location: String,
    tagline: String,
    roles: Vec<Role>,
    socials: Vec<Social>,
}

#[derive(Deserialize)]
struct Role {
    title: String,
    org: String,
}

#[derive(Deserialize)]
struct Social {
    name: String,
    href: String,
}

#[derive(Deserialize)]
struct Qr {
    dark: Scheme,
    light: Scheme,
}

#[derive(Deserialize)]
struct Scheme {
    dark: String,
    light: String,
}

/// RFC 6350 §3.4: escape the delimiters.
fn escape(value: &str) -> String {
    value.replace('\\', "\\\\").replace(';', "\\;").replace(',', "\\,").replace('\n', "\\n")
}

/// Fold to 75 octets, continuation lines starting with one space (so 74 of
/// content). Counts UTF-8 octets as the RFC says and never splits a character.
/// The TypeScript counts UTF-16 code units, which is identical for ASCII.
fn fold(line: &str) -> String {
    if line.len() <= 75 {
        return line.to_string();
    }
    let mut out = String::new();
    let mut used = 0;
    let mut limit = 75;
    for ch in line.chars() {
        if used + ch.len_utf8() > limit {
            out.push_str("\r\n ");
            used = 0;
            limit = 74;
        }
        out.push(ch);
        used += ch.len_utf8();
    }
    out
}

fn vcard(p: &Profile) -> String {
    let mut words: Vec<&str> = p.name.split(' ').collect();
    words.reverse();
    let surname = words.first().copied().unwrap_or("");
    let mut rest: Vec<&str> = words.iter().skip(1).copied().collect();
    rest.reverse();
    let given = rest.join(" ");
    let primary = p.roles.first();

    let mut lines = vec![
        "BEGIN:VCARD".to_string(),
        "VERSION:3.0".to_string(),
        format!("N:{};{};;;", escape(surname), escape(&given)),
        format!("FN:{}", escape(&p.name)),
        format!("ORG:{}", escape(primary.map_or("", |r| &r.org))),
        format!("TITLE:{}", escape(primary.map_or(p.title.as_str(), |r| &r.title))),
        format!("ROLE:{}", escape(&p.title)),
        format!("EMAIL;TYPE=INTERNET,PREF:{}", p.email),
        "URL:https://bryanfawcett.com".to_string(),
    ];
    lines.extend(
        p.socials
            .iter()
            .filter(|s| s.href.starts_with("http"))
            .map(|s| format!("URL;TYPE={}:{}", s.name.to_uppercase(), s.href)),
    );
    lines.push(format!("ADR;TYPE=WORK:;;;{};;;", escape(&p.location)));
    lines.push(format!("NOTE:{}", escape(&p.tagline)));
    lines.push("END:VCARD".to_string());

    format!("{}\r\n", lines.iter().map(|l| fold(l)).collect::<Vec<_>>().join("\r\n"))
}

/// The same path the npm `qrcode` SVG renderer writes: one run of modules per
/// `h`, `M` at the start of each row and relative `m` between runs.
fn qr_path(data: &[bool], size: usize, margin: usize) -> String {
    let mut path = String::new();
    let (mut move_by, mut new_row, mut line_length) = (0usize, false, 0usize);
    for i in 0..data.len() {
        let (col, row) = (i % size, i / size);
        if col == 0 && !new_row {
            new_row = true;
        }
        if data[i] {
            line_length += 1;
            if !(i > 0 && col > 0 && data[i - 1]) {
                if new_row {
                    path.push_str(&format!("M{} {}", col + margin, 0.5 + (row + margin) as f64));
                } else {
                    path.push_str(&format!("m{move_by}"));
                    path.push_str(" 0");
                }
                move_by = 0;
                new_row = false;
            }
            if !(col + 1 < size && data[i + 1]) {
                path.push_str(&format!("h{line_length}"));
                line_length = 0;
            }
        } else {
            move_by += 1;
        }
    }
    path
}

/// `errorCorrectionLevel: 'M'`, `margin: 2`, as in qr.ts.
fn qr_svg(url: &str, scheme: &Scheme) -> String {
    let code = QrCode::with_error_correction_level(url.as_bytes(), EcLevel::M).unwrap_or_else(|e| {
        eprintln!("cannot encode {url}: {e}");
        exit(1)
    });
    let size = code.width();
    let data: Vec<bool> = code.to_colors().into_iter().map(|c| c == Color::Dark).collect();
    let margin = 2;
    let full = size + margin * 2;
    format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 {full} {full}\" shape-rendering=\"crispEdges\"><path fill=\"{}\" d=\"M0 0h{full}v{full}H0z\"/><path stroke=\"{}\" d=\"{}\"/></svg>\n",
        scheme.light,
        scheme.dark,
        qr_path(&data, size, margin),
    )
}


/// Read the module matrix back out of an SVG written by the npm renderer or by
/// `qr_svg` above, and decode it as a QR code. Returns the payload.
///
/// This decodes the *logical* matrix (a stroked module is a dark module), so it
/// proves the symbol is valid and carries the right text. It does not prove an
/// inverted code scans off a screen; that still needs a real capture.
fn decode_svg(svg: &str) -> Result<String, String> {
    let vb = svg.split("viewBox=\"0 0 ").nth(1).and_then(|s| s.split(' ').next()).ok_or("no viewBox")?;
    let full: usize = vb.parse().map_err(|_| "bad viewBox")?;
    let d = svg.split("stroke=\"").nth(1).and_then(|s| s.split("d=\"").nth(1)).and_then(|s| s.split('"').next()).ok_or("no stroke path")?;
    let margin = 2usize;

    // Parse M x y / m dx 0 / h n into modules.
    let mut grid = vec![vec![false; full]; full];
    let (mut x, mut y) = (0f64, 0f64);
    let mut chars = d.chars().peekable();
    let num = |chars: &mut std::iter::Peekable<std::str::Chars>| -> f64 {
        while chars.peek() == Some(&' ') { chars.next(); }
        let mut t = String::new();
        while let Some(&c) = chars.peek() {
            if c.is_ascii_digit() || c == '.' || c == '-' { t.push(c); chars.next(); } else { break; }
        }
        t.parse().unwrap_or(0.0)
    };
    while let Some(c) = chars.next() {
        match c {
            'M' => { x = num(&mut chars); y = num(&mut chars); }
            'm' => { x += num(&mut chars); y += num(&mut chars); }
            'h' => {
                let n = num(&mut chars) as usize;
                let row = (y - 0.5) as usize;
                for i in 0..n { grid[row][x as usize + i] = true; }
                x += n as f64;
            }
            _ => {}
        }
    }
    let _ = margin;

    // Rasterise: dark module = black, with a wider quiet zone for the decoder.
    let (scale, pad) = (8usize, 4usize);
    let side = (full + pad * 2) * scale;
    let mut img = rqrr::PreparedImage::prepare_from_greyscale(side, side, |px, py| {
        let (mx, my) = (px / scale, py / scale);
        if mx >= pad && my >= pad && mx - pad < full && my - pad < full && grid[my - pad][mx - pad] { 0 } else { 255 }
    });
    let grids = img.detect_grids();
    let g = grids.first().ok_or("no QR found")?;
    let (_meta, content) = g.decode().map_err(|e| format!("decode failed: {e}"))?;
    Ok(content)
}

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../src/data/generated/site.json");
    let site: Site = serde_json::from_str(&fs::read_to_string(&path).unwrap_or_else(|e| {
        eprintln!("cannot read {}: {e}\nrun `pnpm site-data` first", path.display());
        exit(2)
    }))
    .unwrap_or_else(|e| {
        eprintln!("{} is not the shape this expects: {e}", path.display());
        exit(2)
    });

    match args.iter().map(String::as_str).collect::<Vec<_>>().as_slice() {
        ["vcard"] => print!("{}", vcard(&site.profile)),
        ["qr", "dark"] => print!("{}", qr_svg(&site.booking_url, &site.qr.dark)),
        ["qr", "light"] => print!("{}", qr_svg(&site.booking_url, &site.qr.light)),
        ["decode", file] => match fs::read_to_string(file).map_err(|e| e.to_string()).and_then(|s| decode_svg(&s)) {
            Ok(content) => println!("{content}"),
            Err(e) => { eprintln!("{e}"); exit(1) }
        },
        _ => {
            eprintln!("usage: contact-card vcard | qr dark | qr light | decode <qr.svg>");
            exit(2)
        }
    }
}
