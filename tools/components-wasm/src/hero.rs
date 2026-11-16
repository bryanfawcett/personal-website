//! `<Hero>`: the props the Astro page passes, and the call into `components::hero`.

use components::hero::Hero;
use serde::Deserialize;
use ts_rs::TS;

use crate::{Call, LangProp, site};

/// Mirrors the props of the old `Hero.astro` exactly, so a page changes only its import.
#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct HeroProps {
    /// Two words: the first solid, the second in outline.
    pub solid: String,
    pub drafted: String,
    pub eyebrow: String,
    #[serde(default)]
    #[ts(optional)]
    pub sub: Option<String>,
    /// Pencil note pinned in the right margin. Trusted markup; `\n` becomes `<br>`.
    #[serde(default)]
    #[ts(optional)]
    pub note: Option<String>,
    /// Label on the dimension line beneath. Defaults to "Drawn to scale".
    #[serde(default)]
    #[ts(optional)]
    pub dimension: Option<String>,
    /// Show the name and role strip under the title.
    #[serde(default)]
    #[ts(optional)]
    pub show_byline: Option<bool>,
    #[serde(default)]
    #[ts(optional)]
    pub lang: Option<LangProp>,
}

pub fn props_type() -> String {
    <HeroProps as TS>::inline()
}

pub fn render(call: Call) -> Result<String, String> {
    let p: HeroProps = call.props()?;
    Ok(Hero {
        solid: &p.solid,
        drafted: &p.drafted,
        eyebrow: &p.eyebrow,
        sub: p.sub.as_deref(),
        note: p.note.as_deref(),
        dimension: p.dimension.as_deref().unwrap_or("Drawn to scale"),
        show_byline: p.show_byline.unwrap_or(false),
        lang: p.lang.unwrap_or_default().into(),
    }
    .render(site(), call.slot())
    .into_string())
}
