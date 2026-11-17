//! Holds the site's palette to the published Mzizi palette.
//!
//! The site's 21 families (src/brand/minerals.ts, palette.ts) are exported to
//! src/data/generated/site.json by `pnpm site-data`. This reads them and compares
//! every family's dark and light hex with the `mzizi-tokens` crate's constants.
//! Any difference, or a family present on one side only, prints in a table and
//! fails. A difference is a finding: do not edit a colour to quiet the gate
//! without deciding which side is right.

use serde::Deserialize;
use std::collections::BTreeMap;

#[derive(Deserialize)]
struct Site {
    palette: Vec<Family>,
}
#[derive(Deserialize)]
struct Family {
    family: String,
    dark: String,
    light: String,
}

/// The crate's 21 families as (name, dark, light).
const CRATE: [(&str, &str, &str); 21] = {
    use mzizi_tokens::*;
    [
        ("cobalt", COBALT_DARK, COBALT_LIGHT),
        ("tanzanite", TANZANITE_DARK, TANZANITE_LIGHT),
        ("malachite", MALACHITE_DARK, MALACHITE_LIGHT),
        ("gold", GOLD_DARK, GOLD_LIGHT),
        ("terracotta", TERRACOTTA_DARK, TERRACOTTA_LIGHT),
        ("sodalite", SODALITE_DARK, SODALITE_LIGHT),
        ("copper", COPPER_DARK, COPPER_LIGHT),
        ("indigo", INDIGO_DARK, INDIGO_LIGHT),
        ("savanna", SAVANNA_DARK, SAVANNA_LIGHT),
        ("baobab", BAOBAB_DARK, BAOBAB_LIGHT),
        ("sunset", SUNSET_DARK, SUNSET_LIGHT),
        ("river", RIVER_DARK, RIVER_LIGHT),
        ("hematite", HEMATITE_DARK, HEMATITE_LIGHT),
        ("kalahari", KALAHARI_DARK, KALAHARI_LIGHT),
        ("ember", EMBER_DARK, EMBER_LIGHT),
        ("acacia", ACACIA_DARK, ACACIA_LIGHT),
        ("fern", FERN_DARK, FERN_LIGHT),
        ("lagoon", LAGOON_DARK, LAGOON_LIGHT),
        ("storm", STORM_DARK, STORM_LIGHT),
        ("dusk", DUSK_DARK, DUSK_LIGHT),
        ("protea", PROTEA_DARK, PROTEA_LIGHT),
    ]
};

/// Known, owner-visible deviations: (family, theme, the site's value). They print on every run and do
/// not fail the gate, but only while the site still holds exactly that value (a change either way
/// fails, so the entry cannot go stale). Adding one is a decision, not a fix.
///
/// gold/light: the registry and crate say #5D4037 (a brown, "textLight"); the site draws #9A6F00, a
/// gold that reads as gold on paper. Open question for the Mzizi owner: which is right?
const ACKNOWLEDGED: [(&str, &str, &str); 1] = [("gold", "light", "#9A6F00")];

fn main() {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../src/data/generated/site.json");
    let text = std::fs::read_to_string(path).unwrap_or_else(|e| {
        eprintln!("cannot read {path}: {e}");
        std::process::exit(2);
    });
    let site: Site = serde_json::from_str(&text).unwrap_or_else(|e| {
        eprintln!("site.json has no usable `palette` (run `pnpm site-data`): {e}");
        std::process::exit(2);
    });

    let theirs: BTreeMap<&str, (&str, &str)> = CRATE.iter().map(|(n, d, l)| (*n, (*d, *l))).collect();
    let ours: BTreeMap<&str, (&str, &str)> = site
        .palette
        .iter()
        .map(|f| (f.family.as_str(), (f.dark.as_str(), f.light.as_str())))
        .collect();

    let mut rows: Vec<[String; 5]> = Vec::new();
    let mut names: Vec<&str> = theirs.keys().chain(ours.keys()).copied().collect();
    names.sort();
    names.dedup();
    for n in names {
        match (ours.get(n), theirs.get(n)) {
            (Some(o), Some(t)) => {
                // Hex is compared case-insensitively: the value is the same colour.
                if !o.0.eq_ignore_ascii_case(t.0) {
                    rows.push([n.into(), "dark".into(), o.0.into(), t.0.into(), "differs".into()]);
                }
                if !o.1.eq_ignore_ascii_case(t.1) {
                    rows.push([n.into(), "light".into(), o.1.into(), t.1.into(), "differs".into()]);
                }
            }
            (Some(o), None) => rows.push([n.into(), "both".into(), format!("{}/{}", o.0, o.1), "-".into(), "site only".into()]),
            (None, Some(t)) => rows.push([n.into(), "both".into(), "-".into(), format!("{}/{}", t.0, t.1), "crate only".into()]),
            (None, None) => unreachable!(),
        }
    }

    let mut seen_ack = vec![false; ACKNOWLEDGED.len()];
    let mut failing: Vec<[String; 5]> = Vec::new();
    for r in rows {
        let hit = ACKNOWLEDGED
            .iter()
            .position(|(f, t, v)| r[0] == *f && r[1] == *t && r[2].eq_ignore_ascii_case(v));
        match hit {
            Some(i) => {
                seen_ack[i] = true;
                eprintln!("ACKNOWLEDGED deviation: {} {} site {} vs crate {}", r[0], r[1], r[2], r[3]);
            }
            None => failing.push(r),
        }
    }
    for (i, (f, t, v)) in ACKNOWLEDGED.iter().enumerate() {
        if !seen_ack[i] {
            failing.push([f.to_string(), t.to_string(), v.to_string(), "-".into(), "acknowledged deviation no longer holds; remove it".into()]);
        }
    }
    let rows = failing;

    if rows.is_empty() {
        println!("palette: every family, dark and light, matches mzizi-tokens 0.7.0 (bar the acknowledged deviation above)");
        return;
    }
    eprintln!("palette: {} difference(s) from mzizi-tokens 0.7.0\n", rows.len());
    eprintln!("{:<12} {:<6} {:<17} {:<17} {}", "family", "theme", "site", "crate", "status");
    for r in &rows {
        eprintln!("{:<12} {:<6} {:<17} {:<17} {}", r[0], r[1], r[2], r[3], r[4]);
    }
    std::process::exit(1);
}
