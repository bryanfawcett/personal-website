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
    Alternate, Json, OgType, SchemaOrg, SeoConfig, article, generate_metadata, generate_schema_ld,
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

/// One credited author, as a Person node in the Article's `author`. Built from an EmDash byline by
/// `src/layouts/seo-head.ts`, which has already restricted every URL to absolute https.
#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct AuthorProp {
    /// Stable `@id`, e.g. `https://bryanfawcett.com/#author-<byline slug>`.
    pub id: String,
    pub name: String,
    #[serde(default)]
    #[ts(optional)]
    pub url: Option<String>,
    #[serde(default)]
    #[ts(optional)]
    pub job_title: Option<String>,
    #[serde(default)]
    #[ts(optional)]
    pub description: Option<String>,
    #[serde(default)]
    #[ts(optional)]
    pub image: Option<String>,
    #[serde(default)]
    pub same_as: Vec<String>,
}

/// What only a post has: Open Graph `article:*` tags and an `Article` node in the JSON-LD.
/// Built from the CMS entry by `src/layouts/seo-head.ts`; every value is escaped on the way out.
#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
pub struct ArticleProp {
    /// The headline, without the site suffix the `<title>` carries.
    pub headline: String,
    /// ISO 8601. `article:published_time` and `datePublished`.
    pub published_time: String,
    #[serde(default)]
    #[ts(optional)]
    pub modified_time: Option<String>,
    /// The author's name, and the profile URL `article:author` takes.
    pub author: String,
    pub author_url: String,
    #[serde(default)]
    #[ts(optional)]
    pub section: Option<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    /// A BCP 47 tag, `inLanguage`.
    pub in_language: String,
    /// The post's bylines. Non-empty: one `article:author` per author with a URL, and the Article's
    /// `author` is one Person per entry. Empty: `author` / `author_url` above, the site's owner.
    #[serde(default)]
    pub authors: Vec<AuthorProp>,
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
    /// Pixel size of `image`. Absent means unknown, and the `og:image:width`/`height` tags are
    /// left out: the crate's fixed 1200x630 would be a false claim about a photograph.
    #[serde(default)]
    #[ts(optional)]
    pub image_width: Option<u32>,
    #[serde(default)]
    #[ts(optional)]
    pub image_height: Option<u32>,
    /// Present only for a post.
    #[serde(default)]
    #[ts(optional)]
    pub article: Option<ArticleProp>,
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

fn author_json(a: &AuthorProp) -> Json {
    let mut pairs = vec![
        ("@type", Json::s("Person")),
        ("@id", Json::s(&a.id)),
        ("name", Json::s(&a.name)),
    ];
    if let Some(u) = &a.url {
        pairs.push(("url", Json::s(u)));
    }
    if let Some(j) = &a.job_title {
        pairs.push(("jobTitle", Json::s(j)));
    }
    if let Some(d) = &a.description {
        pairs.push(("description", Json::s(d)));
    }
    if let Some(i) = &a.image {
        pairs.push(("image", Json::s(i)));
    }
    if !a.same_as.is_empty() {
        pairs.push(("sameAs", strs(&a.same_as)));
    }
    Json::obj(pairs)
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

    // A known size is the image's own; an unknown one is left out below rather than guessed.
    if let (Some(w), Some(h)) = (p.image_width, p.image_height) {
        meta.image_width = w;
        meta.image_height = h;
    }
    let sized = p.image_width.is_some() && p.image_height.is_some();

    let head = meta.to_head_html();
    // The crate hard-codes og:site_name to "Mukoko"; drop that line, the site's follows.
    let head: String = head
        .lines()
        .filter(|l| !l.starts_with("<meta property=\"og:site_name\""))
        .filter(|l| {
            sized
                || !(l.starts_with("<meta property=\"og:image:width\"")
                    || l.starts_with("<meta property=\"og:image:height\""))
        })
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
    let mut nodes = vec![person, site];
    if let Some(a) = &p.article {
        // `article()` covers headline, author, datePublished and image. The rest is added with
        // `with`, so nothing the crate offers is dropped: dateModified, inLanguage, the page it
        // is the main entity of, and the person as publisher (the WebSite node does the same).
        // With bylines the crate's `article()` is not used: it writes `author` itself and `with`
        // appends, which would repeat the key. Same properties, same order otherwise.
        let base = if a.authors.is_empty() {
            article(&a.headline, &a.author, &a.published_time, Some(&p.image))
        } else {
            SchemaOrg::new("Article")
                .with("headline", Json::s(&a.headline))
                .with("author", Json::Arr(a.authors.iter().map(author_json).collect()))
                .with("datePublished", Json::s(&a.published_time))
                .with("image", Json::s(&p.image))
        };
        let mut node = base
            .with("inLanguage", Json::s(&a.in_language))
            .with("mainEntityOfPage", Json::s(&p.canonical))
            .with("publisher", Json::obj([("@id", Json::s(&p.person.id))]));
        if let Some(m) = &a.modified_time {
            node = node.with("dateModified", Json::s(m));
        }
        nodes.push(node);
    }
    let ld = generate_schema_ld(&nodes);

    let out: Markup = html! {
        (PreEscaped(head))
        meta property="og:site_name" content=(p.site_name);
        @for l in &p.og_locale_alternates {
            meta property="og:locale:alternate" content=(l);
        }
        @if let Some(a) = &p.article {
            meta property="article:published_time" content=(a.published_time);
            @if let Some(m) = &a.modified_time {
                meta property="article:modified_time" content=(m);
            }
            @if a.authors.is_empty() {
                meta property="article:author" content=(a.author_url);
            } @else {
                @for au in &a.authors {
                    @if let Some(u) = &au.url {
                        meta property="article:author" content=(u);
                    }
                }
            }
            @if let Some(sec) = &a.section {
                meta property="article:section" content=(sec);
            }
            @for t in &a.tags {
                meta property="article:tag" content=(t);
            }
        }
        @if !p.twitter_creator.is_empty() {
            meta name="twitter:creator" content=(p.twitter_creator);
        }
        // generate_schema_ld escapes < > & as \u escapes, so it is inert inside a script.
        script type="application/ld+json" { (PreEscaped(ld)) }
    };
    Ok(out.into_string())
}
