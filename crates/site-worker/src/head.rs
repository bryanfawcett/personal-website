//! The page's own head: title, description, canonical, hreflang, Open Graph, Twitter and
//! JSON-LD, produced by `mzizi-discovery` (Mzizi N11, "if the machine can't see it, it
//! doesn't exist").
//!
//! The crate was written for Mukoko, and this site is not Mukoko. `generate_metadata` hard
//! codes the site name and base URL, appends ` — Mukoko` to every title, and builds
//! `hreflang` URLs as `{base}/{locale}{path}`, which cannot express a translation with its
//! own slug. Its `Metadata` struct is all `pub` fields, so this module resolves with the
//! crate and then states the facts that are this site's: title, canonical, alternates and
//! image alt. The one thing the struct cannot override is `og:site_name`, which
//! `to_head_html` writes from a constant; it is rewritten after rendering (and a test fails
//! if the crate ever stops emitting the line this expects). All of this is listed in
//! docs/rust-blog-worker.md as upstream issues.

use components::site::{Lang, Site};
use mzizi_discovery::mzizi_seo::{
    Alternate, Json, OgType, SITE_NAME, SchemaOrg, SeoConfig, generate_metadata, generate_schema_ld,
};

use crate::portable::escape_attr;

pub const ORIGIN: &str = "https://bryanfawcett.com";
const OG_IMAGE: &str = "https://bryanfawcett.com/og-bryan-fawcett.jpg";
const OG_IMAGE_ALT: &str = "Bryan Fawcett — Digital Craftsman";

pub fn bcp47(lang: Lang) -> &'static str {
    match lang {
        Lang::En => "en",
        Lang::Zh => "zh-Hans",
    }
}

pub fn og_locale(lang: Lang) -> &'static str {
    match lang {
        Lang::En => "en_US",
        Lang::Zh => "zh_CN",
    }
}

/// What a page says about itself.
pub struct Page<'a> {
    pub lang: Lang,
    /// Before the ` | Bryan Fawcett` suffix.
    pub title: &'a str,
    pub description: &'a str,
    /// This page's own path (already localised), the canonical.
    pub path: &'a str,
    /// Every language this page genuinely exists in, with its path.
    pub alternates: &'a [(Lang, String)],
    pub article: Option<Article<'a>>,
    /// Whether the page is the list (a `Blog`) rather than a post or a notice.
    pub is_list: bool,
}

pub struct Article<'a> {
    pub published_at: &'a str,
    pub image: Option<&'a str>,
}

fn abs(path: &str) -> String {
    format!("{ORIGIN}{path}")
}

fn person(site: &Site, lang: Lang) -> SchemaOrg {
    SchemaOrg::new("Person")
        .with("@id", Json::s(format!("{ORIGIN}/#person")))
        .with("name", Json::s(site.name.clone()))
        .with("jobTitle", Json::Arr(site.roles(lang).iter().map(|r| Json::s(r.title.clone())).collect()))
        .with("url", Json::s(ORIGIN))
        .with(
            "sameAs",
            Json::Arr(site.socials(lang).iter().filter(|s| s.href.starts_with("http")).map(|s| Json::s(s.href.clone())).collect()),
        )
}

/// The JSON-LD graph: the site's Person and WebSite, and the page itself.
pub fn json_ld(site: &Site, page: &Page<'_>) -> String {
    let url = abs(page.path);
    let website = SchemaOrg::new("WebSite")
        .with("@id", Json::s(format!("{ORIGIN}/#website")))
        .with("url", Json::s(ORIGIN))
        .with("name", Json::s(format!("{} — {}", site.name, site.title(page.lang))))
        .with("publisher", Json::obj([("@id", Json::s(format!("{ORIGIN}/#person")))]))
        .with("inLanguage", Json::s(bcp47(page.lang)));

    let node = match &page.article {
        Some(a) => Some(
            SchemaOrg::new("BlogPosting")
                .with("headline", Json::s(page.title))
                .with("description", Json::s(page.description))
                .with("url", Json::s(url.clone()))
                .with("mainEntityOfPage", Json::s(url))
                .with("inLanguage", Json::s(bcp47(page.lang)))
                .with("datePublished", Json::s(a.published_at))
                .with("author", Json::obj([("@id", Json::s(format!("{ORIGIN}/#person")))]))
                .with_opt("image", a.image.map(Json::s)),
        ),
        None if page.is_list => Some(
            SchemaOrg::new("Blog")
                .with("name", Json::s(page.title))
                .with("description", Json::s(page.description))
                .with("url", Json::s(url))
                .with("inLanguage", Json::s(bcp47(page.lang)))
                .with("author", Json::obj([("@id", Json::s(format!("{ORIGIN}/#person")))])),
        ),
        None => None,
    };

    let mut graph = vec![person(site, page.lang), website];
    graph.extend(node);
    generate_schema_ld(&graph)
}

/// The elements for `<head>`, from `<title>` through the JSON-LD script.
pub fn head_html(site: &Site, page: &Page<'_>) -> String {
    let full_title = format!("{} | {}", page.title, site.name);
    let config = SeoConfig {
        title: full_title.clone(),
        description: Some(page.description.to_string()),
        canonical_url: Some(page.path.to_string()),
        og_image: Some(OG_IMAGE.to_string()),
        og_type: if page.article.is_some() { OgType::Article } else { OgType::Website },
        locale: Some(og_locale(page.lang).to_string()),
        ..SeoConfig::default()
    };
    let mut meta = generate_metadata(&config);
    meta.title = full_title;
    meta.canonical = Some(abs(page.path));
    meta.image_alt = OG_IMAGE_ALT.to_string();
    meta.alternates = page
        .alternates
        .iter()
        .map(|(l, p)| Alternate { locale: bcp47(*l).to_string(), url: abs(p) })
        .collect();

    let mut html = meta.to_head_html().replace(
        &format!("<meta property=\"og:site_name\" content=\"{SITE_NAME}\">"),
        &format!("<meta property=\"og:site_name\" content=\"{}\">", escape_attr(&site.name)),
    );

    // `x-default` points at English where the page has an English version, else at itself.
    let default = page.alternates.iter().find(|(l, _)| *l == Lang::En).map_or(page.path, |(_, p)| p.as_str());
    html.push_str(&format!("<link rel=\"alternate\" hreflang=\"x-default\" href=\"{}\">\n", escape_attr(&abs(default))));
    for (l, _) in page.alternates.iter().filter(|(l, _)| *l != page.lang) {
        html.push_str(&format!("<meta property=\"og:locale:alternate\" content=\"{}\">\n", og_locale(*l)));
    }
    html.push_str(&format!("<script type=\"application/ld+json\">{}</script>\n", json_ld(site, page)));
    html
}

#[cfg(test)]
mod tests {
    use super::*;

    fn site() -> &'static Site {
        crate::site()
    }

    fn page<'a>(alts: &'a [(Lang, String)]) -> Page<'a> {
        Page { lang: Lang::En, title: "Mana Pools", description: "d", path: "/adventures/mana-pools", alternates: alts, article: None, is_list: false }
    }

    #[test]
    fn nothing_of_mukoko_survives() {
        let alts = [(Lang::En, "/adventures/mana-pools".to_string())];
        let html = head_html(site(), &page(&alts));
        assert!(!html.contains("Mukoko") && !html.contains("mukoko.com"), "{html}");
        assert!(html.contains("<title>Mana Pools | Bryan Fawcett</title>"));
        assert!(html.contains("<meta property=\"og:site_name\" content=\"Bryan Fawcett\">"));
        assert!(html.contains("<link rel=\"canonical\" href=\"https://bryanfawcett.com/adventures/mana-pools\">"));
        assert!(html.contains("og:image\" content=\"https://bryanfawcett.com/og-bryan-fawcett.jpg\""));
    }

    #[test]
    fn a_translation_with_its_own_slug_is_a_real_hreflang() {
        let alts = [(Lang::En, "/adventures/mana-pools".to_string()), (Lang::Zh, "/zh/adventures/mana-pools-zh".to_string())];
        let html = head_html(site(), &page(&alts));
        assert!(html.contains("hreflang=\"en\" href=\"https://bryanfawcett.com/adventures/mana-pools\""));
        assert!(html.contains("hreflang=\"zh-Hans\" href=\"https://bryanfawcett.com/zh/adventures/mana-pools-zh\""));
        assert!(html.contains("hreflang=\"x-default\" href=\"https://bryanfawcett.com/adventures/mana-pools\""));
        assert!(html.contains("og:locale:alternate\" content=\"zh_CN\""));
    }

    #[test]
    fn an_untranslated_post_lists_english_only() {
        let alts = [(Lang::En, "/adventures/x".to_string())];
        let html = head_html(site(), &page(&alts));
        assert!(!html.contains("zh-Hans") && !html.contains("zh_CN"));
    }

    #[test]
    fn hostile_titles_cannot_leave_their_attribute_or_close_the_script() {
        let alts = [(Lang::En, "/adventures/x".to_string())];
        let mut p = page(&alts);
        p.title = "\"><script>alert(1)</script></script><b onmouseover=x>";
        p.description = "</script><img src=x onerror=alert(1)>";
        p.article = Some(Article { published_at: "2026-01-01\"</script>", image: Some("https://x/\"</script>") });
        let html = head_html(site(), &p);
        assert!(!html.contains("<script>alert"), "{html}");
        assert!(!html.contains("<img src=x"), "{html}");
        assert!(!html.contains("<b onmouseover"), "{html}");
        // The only `</script>` is the one that closes the JSON-LD block we opened.
        assert_eq!(html.matches("</script>").count(), 1, "{html}");
        assert_eq!(html.matches("<script").count(), 1, "{html}");
    }

    #[test]
    fn json_ld_parses_and_describes_the_post() {
        let alts = [(Lang::En, "/adventures/x".to_string())];
        let mut p = page(&alts);
        p.article = Some(Article { published_at: "2026-05-01T00:00:00Z", image: None });
        let ld: serde_json::Value = serde_json::from_str(&json_ld(site(), &p)).unwrap();
        assert_eq!(ld["@context"], "https://schema.org");
        let types: Vec<_> = ld["@graph"].as_array().unwrap().iter().map(|n| n["@type"].as_str().unwrap().to_string()).collect();
        assert_eq!(types, ["Person", "WebSite", "BlogPosting"]);
        assert_eq!(ld["@graph"][2]["datePublished"], "2026-05-01T00:00:00Z");
    }

    #[test]
    fn the_list_is_a_blog_and_a_notice_is_nothing() {
        let alts = [(Lang::En, "/adventures".to_string())];
        let mut p = page(&alts);
        p.is_list = true;
        assert!(json_ld(site(), &p).contains("\"Blog\""));
        p.is_list = false;
        assert!(!json_ld(site(), &p).contains("\"Blog\""));
    }
}
