//! `LanguageSwitcher.astro`, in Rust.
//!
//! The other language, one click away, pointing at the same page. `switch_href` is the
//! override for a page whose translation has its own slug.

use maud::{Markup, html};

use crate::site::{Lang, Site, localize_path};

/// `languages` in `src/i18n/ui.ts`: each language's name, written in itself.
const fn name(lang: Lang) -> &'static str {
    match lang {
        Lang::En => "English",
        Lang::Zh => "中文",
    }
}

/// `bcp47` in `src/i18n/ui.ts`.
const fn bcp47(lang: Lang) -> &'static str {
    match lang {
        Lang::En => "en",
        Lang::Zh => "zh-Hans",
    }
}

pub fn language_switcher(site: &Site, lang: Lang, path: &str, switch_href: Option<&str>) -> Markup {
    let other = match lang {
        Lang::En => Lang::Zh,
        Lang::Zh => Lang::En,
    };
    let href = switch_href.map(str::to_string).unwrap_or_else(|| localize_path(path, other));
    html! {
        a class="lang" href=(href) hreflang=(bcp47(other)) lang=(bcp47(other)) aria-label=(site.t(lang, "nav.switch_lang_label")) {
            (name(other))
        }
    }
}
