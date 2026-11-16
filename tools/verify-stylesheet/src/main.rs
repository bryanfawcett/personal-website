//! Two static checks on the stylesheet: the Rust port of `scripts/verify-stylesheet.mjs`.
//!
//! 1. Every `var(--x)` resolves to a declaration somewhere.
//! 2. No base rule pairs a class with a bare element outside `:where()`.
//!
//! This parses the CSS (lightningcss) instead of matching lines. Three things the
//! JS version could not do follow from that: it sees rules inside `@media`,
//! `@supports` and `@layer`, it reads selector lists as selectors rather than
//! splitting on commas, and it counts `@property` registrations as declarations.
//! Error recovery is off on purpose: a rule the parser cannot read must fail the
//! check, not be dropped from it.
//!
//! The emitted token properties come from `src/styles/tokens.css`, generated from
//! `src/brand/tokens.ts` by `pnpm tokens`, so no build is needed first.
//!
//!     cargo run -q --manifest-path tools/Cargo.toml -p verify-stylesheet

use lightningcss::{
    printer::PrinterOptions,
    properties::{Property, custom::CustomPropertyName},
    rules::CssRule,
    selector::{Combinator, Component, Selector},
    stylesheet::{ParserOptions, StyleSheet},
    traits::ToCss,
    visit_types,
    visitor::{Visit, VisitTypes, Visitor},
};
use std::{collections::BTreeSet, convert::Infallible, fs, path::PathBuf, process::exit};

/// Properties set by markup rather than by the stylesheet (`Panel`'s `mineral`
/// prop and `keyedTo()`). Add to this only for a property a component sets
/// inline, never to silence a typo.
const SET_INLINE: [&str; 3] = ["--mineral", "--mineral-container", "--mineral-on"];

struct Offender {
    line: usize,
    selector: String,
    base: bool,
}

struct Collector {
    /// Lines before this (0-based) are the base section.
    boundary: usize,
    used: BTreeSet<String>,
    declared: BTreeSet<String>,
    offenders: Vec<Offender>,
}

impl Collector {
    fn new(boundary: usize) -> Self {
        Self { boundary, used: BTreeSet::new(), declared: BTreeSet::new(), offenders: Vec::new() }
    }
}

/// A selector whose leftmost compound is led by a class, and which then steps
/// through a combinator onto a bare element: `.panel a`, `.panel > p`,
/// `.card + h3`. `:where(...)` is a separate nested selector, so whatever sits
/// inside it is never seen here, which is the point of it.
fn pairs_class_with_element(selector: &Selector) -> bool {
    // Raw match order walks the rightmost compound first, then each
    // combinator and the compound to its left. Split into compounds.
    let mut compounds: Vec<Vec<&Component>> = vec![Vec::new()];
    for c in selector.iter_raw_match_order() {
        match c {
            Component::Combinator(Combinator::PseudoElement | Combinator::Part | Combinator::SlotAssignment) => {}
            Component::Combinator(_) => compounds.push(Vec::new()),
            other => compounds.last_mut().unwrap().push(other),
        }
    }
    let is_element = |c: &&Component| matches!(c, Component::LocalName(_) | Component::ExplicitUniversalType);
    let Some(leftmost) = compounds.last() else { return false };
    let leads_with_class = leftmost.iter().any(|c| matches!(c, Component::Class(_))) && !leftmost.iter().any(is_element);
    if !leads_with_class || compounds.len() < 2 {
        return false;
    }
    // Any other compound that names an element is a step onto a bare element.
    compounds[..compounds.len() - 1]
        .iter()
        .any(|compound| compound.iter().any(|c| matches!(c, Component::LocalName(_))))
}

impl<'i> Visitor<'i> for Collector {
    type Error = Infallible;

    fn visit_types(&self) -> VisitTypes {
        visit_types!(RULES | PROPERTIES | VARIABLES)
    }

    fn visit_rule(&mut self, rule: &mut CssRule<'i>) -> Result<(), Self::Error> {
        match rule {
            CssRule::Style(style) => {
                for selector in style.selectors.0.iter() {
                    if pairs_class_with_element(selector) {
                        self.offenders.push(Offender {
                            line: style.loc.line as usize + 1,
                            selector: selector.to_css_string(PrinterOptions::default()).unwrap_or_default(),
                            base: (style.loc.line as usize) < self.boundary,
                        });
                    }
                }
            }
            CssRule::Property(p) => {
                self.declared.insert(p.name.0.to_string());
            }
            _ => {}
        }
        rule.visit_children(self)
    }

    fn visit_property(&mut self, property: &mut Property<'i>) -> Result<(), Self::Error> {
        if let Property::Custom(c) = property {
            if let CustomPropertyName::Custom(name) = &c.name {
                self.declared.insert(name.0.to_string());
            }
        }
        property.visit_children(self)
    }

    fn visit_variable(&mut self, var: &mut lightningcss::properties::custom::Variable<'i>) -> Result<(), Self::Error> {
        self.used.insert(var.name.ident.0.to_string());
        var.visit_children(self)
    }
}

fn root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..").canonicalize().expect("repo root")
}

fn read(path: &PathBuf) -> String {
    fs::read_to_string(path).unwrap_or_else(|e| {
        eprintln!("  cannot read {}: {e}", path.display());
        exit(2)
    })
}

fn analyse(name: &str, source: &str, boundary: usize) -> Collector {
    let options = ParserOptions { filename: name.into(), error_recovery: false, ..ParserOptions::default() };
    let mut sheet = StyleSheet::parse(source, options).unwrap_or_else(|e| {
        eprintln!("  {name} does not parse cleanly: {e}");
        exit(2)
    });
    let mut collector = Collector::new(boundary);
    sheet.visit(&mut collector).unwrap();
    collector
}

fn main() {
    let root = root();
    let css = read(&root.join("src/styles/global.css"));
    let tokens = read(&root.join("src/styles/tokens.css"));
    let bundu = read(&root.join("node_modules/@bundu/ui/styles/tokens.css"));

    // Below this line a rule may be as specific as it likes: those are the
    // rules that need to win. Above it, a rule is a base default.
    let Some(boundary) = css.split('\n').position(|l| l.contains("components and views")) else {
        eprintln!("  cannot find the components section header in global.css");
        exit(2)
    };

    let site = analyse("global.css", &css, boundary);
    let mut emitted = analyse("tokens.css", &tokens, 0).declared;
    emitted.extend(analyse("@bundu/ui tokens.css", &bundu, 0).declared);

    let mut fail: Vec<String> = Vec::new();

    // ---------- 1. every custom property resolves ----------
    let unresolved: Vec<&String> = site
        .used
        .iter()
        .filter(|p| !site.declared.contains(*p) && !emitted.contains(*p) && !SET_INLINE.contains(&p.as_str()))
        .collect();
    if !unresolved.is_empty() {
        let n = unresolved.len();
        fail.push(format!(
            "{n} custom {} referenced but never defined:\n{}\n  Define it in src/brand/tokens.ts, or fix the name. A var() that does not\n  resolve falls back to `unset` and inherits — it fails silently.",
            if n == 1 { "property is" } else { "properties are" },
            unresolved.iter().map(|p| format!("    var({p})")).collect::<Vec<_>>().join("\n"),
        ));
    }
    println!("  {} custom properties referenced, all resolve", site.used.len());

    // ---------- 2. no base rule pairs a class with a bare element ----------
    let base: Vec<&Offender> = site.offenders.iter().filter(|o| o.base).collect();
    if !base.is_empty() {
        let n = base.len();
        fail.push(format!(
            "{n} base {} a class with an element outside :where():\n{}\n  These are specificity 0-1-1 and beat any single class on that element.\n  Wrap the element in :where() so the rule is a default, not a decree.",
            if n == 1 { "rule pairs" } else { "rules pair" },
            base.iter().map(|o| format!("    {:>5}  {}", o.line, o.selector)).collect::<Vec<_>>().join("\n"),
        ));
    }
    println!(
        "  {} component rules pair a class with an element (allowed), 0 base rules do",
        site.offenders.len() - base.len()
    );

    if !fail.is_empty() {
        eprintln!(
            "\nglobal.css:\n\n{}\n",
            fail.iter().map(|f| format!("  {f}")).collect::<Vec<_>>().join("\n\n")
        );
        exit(1);
    }
    println!("\nstylesheet: every property resolves, and no base rule outranks a class.");
}
