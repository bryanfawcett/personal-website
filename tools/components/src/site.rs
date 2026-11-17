//! The exported data the components read, and the two helpers they share.

use serde::Deserialize;
use std::collections::HashMap;
#[cfg(not(target_arch = "wasm32"))]
use std::{fs, path::PathBuf};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Lang {
    En,
    Zh,
}

impl Lang {
    pub fn code(self) -> &'static str {
        match self {
            Lang::En => "en",
            Lang::Zh => "zh",
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct NavItem {
    #[serde(rename = "labelKey")]
    pub label_key: String,
    pub href: String,
    /// In the slim header menu; every item is in the footer.
    pub header: bool,
}

#[derive(Debug, Deserialize)]
pub struct Social {
    pub name: String,
    pub href: String,
}

#[derive(Debug, Deserialize)]
pub struct Socials {
    pub en: Vec<Social>,
    pub zh: Vec<Social>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Role {
    pub title: String,
    pub org: String,
}

#[derive(Debug, Deserialize)]
pub struct ProfileName {
    pub name: String,
    pub title: String,
    pub email: String,
    pub roles: Vec<Role>,
}

#[derive(Debug, Deserialize)]
pub struct ProfileZh {
    pub title: String,
    pub roles: Vec<Role>,
}

#[derive(Debug, Deserialize)]
struct SiteFile {
    profile: ProfileName,
    profile_zh: ProfileZh,
    nav: Vec<NavItem>,
    socials: Socials,
    minerals: Vec<String>,
}

type Dict = HashMap<String, String>;

/// Everything a component needs from the site, loaded once.
pub struct Site {
    pub name: String,
    pub email: String,
    title_en: String,
    title_zh: String,
    roles_en: Vec<Role>,
    roles_zh: Vec<Role>,
    pub nav: Vec<NavItem>,
    pub socials: Socials,
    pub minerals: Vec<String>,
    en: Dict,
    zh: Dict,
}

#[cfg(not(target_arch = "wasm32"))]
fn generated(file: &str) -> String {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../src/data/generated").join(file);
    fs::read_to_string(&path).unwrap_or_else(|e| {
        eprintln!("cannot read {}: {e}\nrun `pnpm site-data` first", path.display());
        std::process::exit(2)
    })
}

impl Site {
    /// Read the exported data from `src/data/generated/` (native binaries only).
    #[cfg(not(target_arch = "wasm32"))]
    pub fn load() -> Site {
        Site::from_json(&generated("site.json"), &generated("ui.json"))
    }

    /// Build from the two exported documents' text. The WebAssembly build has no
    /// filesystem, so it embeds them at compile time and comes through here.
    pub fn from_json(site_json: &str, ui_json: &str) -> Site {
        let site: SiteFile = serde_json::from_str(site_json).expect("site.json shape");
        let ui: HashMap<String, Dict> = serde_json::from_str(ui_json).expect("ui.json shape");
        Site {
            name: site.profile.name,
            email: site.profile.email,
            title_en: site.profile.title,
            title_zh: site.profile_zh.title,
            roles_en: site.profile.roles,
            roles_zh: site.profile_zh.roles,
            nav: site.nav,
            socials: site.socials,
            minerals: site.minerals,
            en: ui.get("en").cloned().unwrap_or_default(),
            zh: ui.get("zh").cloned().unwrap_or_default(),
        }
    }

    /// `useTranslations(lang)`: the key in `lang`, else the English one. A key in
    /// neither is a bug (the TypeScript types every key), so it fails loudly.
    pub fn t(&self, lang: Lang, key: &str) -> &str {
        let dict = match lang {
            Lang::En => &self.en,
            Lang::Zh => &self.zh,
        };
        dict.get(key)
            .or_else(|| self.en.get(key))
            .unwrap_or_else(|| panic!("no UI string for key `{key}`"))
    }

    /// `profileInLang(lang).title`.
    pub fn title(&self, lang: Lang) -> &str {
        match lang {
            Lang::En => &self.title_en,
            Lang::Zh => &self.title_zh,
        }
    }

    /// `profileInLang(lang).roles`.
    pub fn roles(&self, lang: Lang) -> &[Role] {
        match lang {
            Lang::En => &self.roles_en,
            Lang::Zh => &self.roles_zh,
        }
    }

    pub fn socials(&self, lang: Lang) -> &[Social] {
        match lang {
            Lang::En => &self.socials.en,
            Lang::Zh => &self.socials.zh,
        }
    }
}

/// Strip a leading `/zh` segment, leaving the language-neutral route.
pub fn strip_lang(pathname: &str) -> String {
    let mut parts = pathname.splitn(3, '/');
    let _ = parts.next();
    if let Some(first) = parts.next() {
        if first == "zh" {
            let rest = parts.next().unwrap_or("");
            let joined = format!("/{rest}");
            let trimmed = joined.trim_end_matches('/');
            return if trimmed.is_empty() { "/".into() } else { trimmed.into() };
        }
    }
    let trimmed = pathname.trim_end_matches('/');
    if trimmed.is_empty() { "/".into() } else { trimmed.into() }
}

/// Turn a language-neutral route into the one for `lang`.
pub fn localize_path(path: &str, lang: Lang) -> String {
    let base = strip_lang(path);
    match lang {
        Lang::En => base,
        Lang::Zh if base == "/" => "/zh".into(),
        Lang::Zh => format!("/zh{base}"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn english_routes_are_unprefixed() {
        assert_eq!(localize_path("/", Lang::En), "/");
        assert_eq!(localize_path("/experience", Lang::En), "/experience");
    }

    #[test]
    fn chinese_routes_live_under_zh() {
        assert_eq!(localize_path("/", Lang::Zh), "/zh");
        assert_eq!(localize_path("/minerals", Lang::Zh), "/zh/minerals");
    }

    #[test]
    fn an_already_localised_path_is_not_doubled() {
        assert_eq!(localize_path("/zh/minerals", Lang::Zh), "/zh/minerals");
        assert_eq!(localize_path("/zh", Lang::En), "/");
        assert_eq!(localize_path("/zh/", Lang::Zh), "/zh");
    }
}
