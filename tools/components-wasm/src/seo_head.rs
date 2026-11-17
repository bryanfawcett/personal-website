//! `<SeoHead>`: the page's search and social head, built with `mzizi-discovery`.
//!
//! The crate (`mzizi_seo`) is Mukoko's: `generate_metadata` hard-codes `https://mukoko.com`,
//! the site name `Mukoko`, a ` — Mukoko` title suffix and a default image. None of those can
//! be configured, so this component calls `generate_metadata` for its defaults and then
//! overwrites every resolved field the crate got wrong for this site (all of `Metadata`'s
//! fields are public, which is what makes that possible), and renders with the crate's own
//! `to_head_html` and `generate_schema_ld`. What the crate cannot express is added here:
//! `og:site_name`, `og:locale:alternate`, `twitter:creator`, and the Person / WebSite nodes'
//! content (the crate gives the node builder, not these types). See the PR for the list.
//!
//! URLs are computed by the Astro layout, which owns the routing tables
//! (`src/i18n/routing.ts`); this takes finished absolute URLs.

use maud::{Markup, PreEscaped, html};
use mzizi_discovery::mzizi_seo::{
    Alternate, Json, OgType, SchemaOrg, SeoConfig, generate_metadata, generate_schema_ld,
};
use serde::Deserialize;
use ts_rs::TS;

use crate::Call;

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export_to = "seo_og_type.ts")]
pub enum OgTypeProp {
    Website,
    Profile,
    Article,
}

#[derive(Debug, Deserialize, TS)]
pub struct AlternateProp {
    /// A BCP 47 tag, or `x-default`.
    pub hreflang: String,
    /// Absolute URL.
    pub href: String,
}

#[derive(Debug, Deserialize, TS)]
pub struct OrgProp {
    pub name: String,
    #[serde(default)]
    #[ts(optional)]
    pub url: Option<String>,
}

/// The Person node's content. The Astro layout owns the data (`src/data/profile.ts`).
#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct PersonProp {
    pub id: String,
    pub name: String,
    pub given_name: String,
    pub family_name: String,
    pub job_title: Vec<String>,
    pub description: String,
    pub url: String,
    pub email: String,
    pub image: String,
    pub same_as: Vec<String>,
    pub works_for: Vec<OrgProp>,
    pub founder: Vec<OrgProp>,
    pub knows_about: Vec<String>,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct WebSiteProp {
    pub id: String,
    pub url: String,
    pub name: String,
    pub in_language: String,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct SeoHeadProps {
    /// The full `<title>`, suffix included.
    pub title: String,
    pub description: String,
    /// Absolute canonical URL.
    pub canonical: String,
    /// Every `hreflang` alternate, `x-default` last.
    pub alternates: Vec<AlternateProp>,
    pub og_type: OgTypeProp,
    pub site_name: String,
    /// `og:locale` of this page, e.g. `en_US`.
    pub og_locale: String,
    /// `og:locale:alternate`, one per other language the page exists in.
    pub og_locale_alternates: Vec<String>,
    /// Absolute image URL.
    pub image: String,
    pub image_alt: String,
    /// e.g. `@bryanfawcett`.
    pub twitter_creator: String,
    pub person: PersonProp,
    pub web_site: WebSiteProp,
}

pub fn props_type() -> String {
    <SeoHeadProps as TS>::inline()
}

fn strs(items: &[String]) -> Json {
    Json::Arr(items.iter().map(|s| Json::s(s.as_str())).collect())
}

fn orgs(items: &[OrgProp]) -> Json {
    Json::Arr(
        items
            .iter()
            .map(|o| {
                let mut pairs = vec![("@type", Json::s("Organization")), ("name", Json::s(&o.name))];
                if let Some(u) = &o.url {
                    pairs.push(("url", Json::s(u)));
                }
                Json::obj(pairs)
            })
            .collect(),
    )
}

pub fn render(call: Call) -> Result<String, String> {
    let p: SeoHeadProps = call.props()?;

    // Defaults from the crate, then every site-specific field overwritten.
    let mut meta = generate_metadata(&SeoConfig {
        title: p.title.clone(),
        description: Some(p.description.clone()),
        og_type: match p.og_type {
            OgTypeProp::Website => OgType::Website,
            OgTypeProp::Profile => OgType::Profile,
            OgTypeProp::Article => OgType::Article,
        },
        ..SeoConfig::default()
    });
    meta.title = p.title.clone(); // the crate appends " — Mukoko"
    meta.canonical = Some(p.canonical.clone()); // the crate prefixes https://mukoko.com
    meta.alternates = p
        .alternates
        .iter()
        .map(|a| Alternate { locale: a.hreflang.clone(), url: a.href.clone() })
        .collect(); // the crate builds BASE_URL/{locale}{path}; x-default rides as a locale
    meta.locale = p.og_locale.clone();
    meta.image = p.image.clone();
    meta.image_alt = p.image_alt.clone(); // the crate uses the title

    let head = meta.to_head_html();
    // The crate hard-codes og:site_name to "Mukoko"; drop that line, the site's follows.
    let head: String = head
        .lines()
        .filter(|l| !l.starts_with("<meta property=\"og:site_name\""))
        .map(|l| format!("{l}\n"))
        .collect();

    let person = SchemaOrg::new("Person")
        .with("@id", Json::s(&p.person.id))
        .with("name", Json::s(&p.person.name))
        .with("givenName", Json::s(&p.person.given_name))
        .with("familyName", Json::s(&p.person.family_name))
        .with("jobTitle", strs(&p.person.job_title))
        .with("description", Json::s(&p.person.description))
        .with("url", Json::s(&p.person.url))
        .with("email", Json::s(&p.person.email))
        .with("image", Json::s(&p.person.image))
        .with("sameAs", strs(&p.person.same_as))
        .with("worksFor", orgs(&p.person.works_for))
        .with("founder", orgs(&p.person.founder))
        .with("knowsAbout", strs(&p.person.knows_about));
    let site = SchemaOrg::new("WebSite")
        .with("@id", Json::s(&p.web_site.id))
        .with("url", Json::s(&p.web_site.url))
        .with("name", Json::s(&p.web_site.name))
        .with("publisher", Json::obj([("@id", Json::s(&p.person.id))]))
        .with("inLanguage", Json::s(&p.web_site.in_language));
    let ld = generate_schema_ld(&[person, site]);

    let out: Markup = html! {
        (PreEscaped(head))
        meta property="og:site_name" content=(p.site_name);
        @for l in &p.og_locale_alternates {
            meta property="og:locale:alternate" content=(l);
        }
        meta name="twitter:creator" content=(p.twitter_creator);
        // generate_schema_ld escapes < > & as \u escapes, so it is inert inside a script.
        script type="application/ld+json" { (PreEscaped(ld)) }
    };
    Ok(out.into_string())
}
