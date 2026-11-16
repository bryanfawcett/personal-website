//! `WorkshopStrip.astro`, in Rust: three drafted views of the workshop, each a `Panel`.

use maud::{Markup, PreEscaped, html};

use crate::{
    panel::Panel,
    site::{Lang, Site},
};

const PLATES: [(&str, &str, &str, &str); 3] = [
    (
        "home.strip_a",
        "Fig. A",
        r#"<rect x="30" y="30" width="90" height="70"></rect><path d="M30 30l45-18 45 18"></path><rect x="55" y="60" width="18" height="40"></rect><rect x="92" y="55" width="16" height="16" stroke-dasharray="2 3"></rect><path d="M140 100h90" stroke-dasharray="4 4"></path><path d="M160 100v-46h50v46"></path><circle cx="185" cy="76" r="9" stroke-dasharray="2 3"></circle>"#,
        "",
    ),
    (
        "home.strip_b",
        "Fig. B",
        r#"<path d="M40 100h180"></path><path d="M70 100V44h20v56M110 100V30h22v70M152 100V52h18v48M190 100V38h20v62"></path><path d="M60 24h150" stroke-dasharray="2 4"></path><circle cx="50" cy="24" r="6"></circle>"#,
        "",
    ),
    (
        "home.strip_c",
        "Fig. C",
        r#"<rect x="35" y="40" width="190" height="14"></rect><path d="M50 54v46M210 54v46"></path><path d="M80 40V26h30v14M150 40l14-16 14 16"></path><path d="M100 70h60" stroke-dasharray="3 3"></path><path d="M100 66v8M160 66v8"></path>"#,
        "",
    ),
];

pub fn workshop_strip(site: &Site, lang: Lang) -> Markup {
    html! {
        section class="strip" aria-label=(site.t(lang, "home.strip_label")) {
            @for (key, fig, svg, _) in PLATES {
                (Panel { class: Some("strip__plate"), ..Default::default() }.render(html! {
                    svg viewBox="0 0 260 120" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" { (PreEscaped(svg)) }
                    p class="caption" { span { (site.t(lang, key)) } span { (fig) } }
                }))
            }
        }
    }
}
