//! Routing and the three states, with no Worker types in sight: a path in, a [`Reply`] out.
//! The `worker` glue turns a `Request` into a path and a `Reply` into a `Response`.

use components::site::{Lang, Site};

use crate::{
    model::{parse_adventure, parse_list},
    page::{ListState, View, document},
    queries::{ADVENTURE_EN, ADVENTURE_LIST, ADVENTURE_ZH},
    sanity::{Clock, Outcome, Sanity, Transport},
    shell::Shell,
};

/// `BLOG_CACHE_CONTROL` in `src/sanity/client.ts`, unchanged: `max-age=0` so a browser always
/// revalidates, `s-maxage=60` so the edge may absorb traffic, and ten minutes of
/// `stale-while-revalidate`.
pub const BLOG_CACHE_CONTROL: &str = "public, max-age=0, s-maxage=60, stale-while-revalidate=600";
/// An unreachable Sanity or a missing adventure must never be held by a cache.
pub const NO_CACHE: &str = "no-store";
/// Seconds, as the TypeScript's `Retry-After`.
pub const RETRY_AFTER: &str = "120";
/// Longest slug the Worker will ask Sanity about; anything longer is a 404 without a query.
const MAX_SLUG_BYTES: usize = 200;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Route {
    List(Lang),
    Post(Lang, String),
    /// Not a blog route: the host answers it (from the asset tree, or a 404).
    Other,
}

fn percent_decode(s: &str) -> Option<String> {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' {
            let hex = s.get(i + 1..i + 3)?;
            out.push(u8::from_str_radix(hex, 16).ok()?);
            i += 3;
        } else {
            out.push(b[i]);
            i += 1;
        }
    }
    String::from_utf8(out).ok()
}

/// `/adventures`, `/adventures/<slug>`, and the `/zh` pair. A trailing slash is ignored
/// (Astro's `trailingSlash: 'ignore'`); a nested path is not a blog route.
pub fn route(path: &str) -> Route {
    let trimmed = path.strip_suffix('/').filter(|p| !p.is_empty()).unwrap_or(path);
    let (lang, rest) = match trimmed.strip_prefix("/zh") {
        Some(r) if r.is_empty() || r.starts_with('/') => (Lang::Zh, r),
        _ => (Lang::En, trimmed),
    };
    match rest.strip_prefix("/adventures") {
        Some("") => Route::List(lang),
        Some(slug) if slug.starts_with('/') && !slug[1..].is_empty() && !slug[1..].contains('/') => {
            match percent_decode(&slug[1..]) {
                Some(s) if !s.contains('/') => Route::Post(lang, s),
                _ => Route::Other,
            }
        }
        _ => Route::Other,
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Reply {
    pub status: u16,
    pub headers: Vec<(&'static str, String)>,
    pub body: String,
}

impl Reply {
    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers.iter().find(|(k, _)| k.eq_ignore_ascii_case(name)).map(|(_, v)| v.as_str())
    }
}

fn reply(status: u16, cache: &str, source: &str, retry: bool, body: String) -> Reply {
    let mut headers = vec![
        ("Content-Type", "text/html; charset=utf-8".to_string()),
        ("Cache-Control", cache.to_string()),
        ("X-Blog-Source", source.to_string()),
        ("X-Content-Type-Options", "nosniff".to_string()),
    ];
    if retry {
        headers.push(("Retry-After", RETRY_AFTER.to_string()));
    }
    Reply { status, headers, body }
}

pub struct Deps<'a, T: Transport, C: Clock> {
    pub sanity: Sanity<'a, T, C>,
    pub site: &'a Site,
    pub shell: &'a Shell,
    pub year: i64,
}

/// Serve a blog route. Total: every failure is one of the three states.
pub async fn respond<T: Transport, C: Clock>(route: &Route, deps: &Deps<'_, T, C>) -> Option<Reply> {
    let (site, shell, year) = (deps.site, deps.shell, deps.year);
    match route {
        Route::Other => None,
        Route::List(lang) => {
            let out = deps.sanity.groq(ADVENTURE_LIST, &[]).await;
            let source = out.source();
            Some(match &out {
                Outcome::Fresh(v) | Outcome::Stale(v) => {
                    let cards = parse_list(v);
                    let state = if cards.is_empty() { ListState::Empty } else { ListState::Cards };
                    let html = document(site, shell, *lang, year, &View::List { state, cards: &cards });
                    reply(200, BLOG_CACHE_CONTROL, source, false, html)
                }
                // Unreachable is not empty, and is not cacheable: say 503 and when to retry.
                Outcome::Unavailable => {
                    let html = document(site, shell, *lang, year, &View::List { state: ListState::Unavailable, cards: &[] });
                    reply(503, NO_CACHE, source, true, html)
                }
            })
        }
        Route::Post(lang, slug) => {
            if slug.is_empty() || slug.len() > MAX_SLUG_BYTES || slug.chars().any(char::is_control) {
                let html = document(site, shell, *lang, year, &View::Notice { reachable: true });
                return Some(reply(404, NO_CACHE, "none", false, html));
            }
            let query = if *lang == Lang::Zh { ADVENTURE_ZH } else { ADVENTURE_EN };
            let out = deps.sanity.groq(query, &[("slug", slug)]).await;
            let source = out.source();
            Some(match &out {
                Outcome::Fresh(v) | Outcome::Stale(v) => match parse_adventure(v) {
                    Some(a) => {
                        let html = document(site, shell, *lang, year, &View::Post(&a));
                        reply(200, BLOG_CACHE_CONTROL, source, false, html)
                    }
                    // A real 404: the content service answered, and there is no such adventure.
                    None => {
                        let html = document(site, shell, *lang, year, &View::Notice { reachable: true });
                        reply(404, NO_CACHE, source, false, html)
                    }
                },
                Outcome::Unavailable => {
                    let html = document(site, shell, *lang, year, &View::Notice { reachable: false });
                    reply(503, NO_CACHE, source, true, html)
                }
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sanity::{FetchError, Guard, testing::*};
    use serde_json::json;
    use std::cell::RefCell;

    #[test]
    fn routes() {
        assert_eq!(route("/adventures"), Route::List(Lang::En));
        assert_eq!(route("/adventures/"), Route::List(Lang::En));
        assert_eq!(route("/zh/adventures"), Route::List(Lang::Zh));
        assert_eq!(route("/zh/adventures/"), Route::List(Lang::Zh));
        assert_eq!(route("/adventures/mana-pools"), Route::Post(Lang::En, "mana-pools".into()));
        assert_eq!(route("/zh/adventures/mana-pools-zh/"), Route::Post(Lang::Zh, "mana-pools-zh".into()));
        assert_eq!(route("/adventures/%E9%A9%AC"), Route::Post(Lang::En, "马".into()));
    }

    #[test]
    fn everything_else_is_not_ours() {
        for p in ["/", "/zh", "/experience", "/adventures/a/b", "/adventuresx", "/zh/adventuresx", "/zhadventures", "/adventures//", "/adventures/%2F", "/adventures/%ZZ", "/adventures/%FF", "/zh/adventures/a/b", "//adventures"] {
            assert_eq!(route(p), Route::Other, "{p}");
        }
    }

    fn deps_with<'a>(t: &'a Script, c: &'a FakeClock, g: &'a RefCell<Guard>, site: &'a Site, shell: &'a Shell) -> Deps<'a, Script, FakeClock> {
        Deps { sanity: Sanity { transport: t, clock: c, guard: g, origin: "https://sanity.test" }, site, shell, year: 2026 }
    }

    fn serve(answers: Vec<Result<String, FetchError>>, path: &str) -> (Reply, u32) {
        let (t, c, g) = (Script::new(answers), FakeClock::at(1_000), RefCell::new(Guard::new()));
        let site = crate::site();
        let shell = Shell::bare();
        let r = block_on(respond(&route(path), &deps_with(&t, &c, &g, site, &shell))).unwrap();
        (r, t.calls.get())
    }

    fn post_json(extra: serde_json::Value) -> String {
        let mut v = json!({ "title": "Mana Pools", "slug": "mana-pools", "publishedAt": "2026-05-01T00:00:00Z", "excerpt": "ex", "place": "Zimbabwe",
            "language": "en", "body": [{ "_type": "block", "style": "normal", "children": [{ "_type": "span", "text": "Hello <b>world</b>", "marks": [] }] }] });
        v.as_object_mut().unwrap().extend(extra.as_object().unwrap().clone());
        v.to_string()
    }

    // ---- the three states, and their headers -----------------------------------------

    #[test]
    fn found_is_200_and_cacheable_with_the_exact_policy() {
        let (r, _) = serve(vec![Script::ok(&post_json(json!({})))], "/adventures/mana-pools");
        assert_eq!(r.status, 200);
        assert_eq!(r.header("Cache-Control"), Some("public, max-age=0, s-maxage=60, stale-while-revalidate=600"));
        assert_eq!(r.header("X-Blog-Source"), Some("fresh"));
        assert_eq!(r.header("Retry-After"), None);
        assert!(r.body.contains("<h1 class=\"page-header__title\">Mana Pools</h1>"));
        assert!(r.body.contains("Hello &lt;b&gt;world&lt;/b&gt;"), "body is escaped");
    }

    #[test]
    fn missing_is_a_real_404_and_uncacheable() {
        let (r, calls) = serve(vec![Script::ok("null")], "/adventures/no-such-thing");
        assert_eq!(r.status, 404);
        assert_eq!(r.header("Cache-Control"), Some("no-store"));
        assert_eq!(r.header("Retry-After"), None);
        assert!(r.body.contains("No such adventure"));
        assert_eq!(calls, 1);
    }

    #[test]
    fn unreachable_is_503_with_retry_after_and_uncacheable() {
        for path in ["/adventures/x", "/zh/adventures/x", "/adventures", "/zh/adventures"] {
            let (r, _) = serve(vec![Err(FetchError::Timeout)], path);
            assert_eq!(r.status, 503, "{path}");
            assert_eq!(r.header("Cache-Control"), Some("no-store"), "{path}");
            assert_eq!(r.header("Retry-After"), Some("120"), "{path}");
            assert!(r.body.contains("not loading") || r.body.contains("加载不出来"), "{path}");
            assert!(!r.body.contains("Nothing written up yet"), "unreachable must not read as empty");
        }
    }

    #[test]
    fn an_empty_blog_is_200_and_says_so_not_unavailable() {
        let (r, _) = serve(vec![Script::ok("[]")], "/adventures");
        assert_eq!(r.status, 200);
        assert_eq!(r.header("Cache-Control"), Some(BLOG_CACHE_CONTROL));
        assert!(r.body.contains("Nothing written up yet"));
        assert!(!r.body.contains("not loading"));
        assert!(r.body.contains("<ol class=\"adventures\"></ol>"));
        let (z, _) = serve(vec![Script::ok("[]")], "/zh/adventures");
        assert!(z.body.contains("还没有写下的游记"));
        assert!(z.body.contains("href=\"/zh/book\""));
    }

    #[test]
    fn a_hostile_slug_is_rejected_without_a_query() {
        for bad in ["/adventures/a%00b", "/adventures/a%0Ab"] {
            let (r, calls) = serve(vec![Script::ok("null")], bad);
            assert_eq!(r.status, 404, "{bad}");
            assert_eq!(calls, 0, "{bad}");
        }
        let long = format!("/adventures/{}", "a".repeat(201));
        assert_eq!(serve(vec![Script::ok("null")], &long).1, 0);
    }

    #[test]
    fn the_slug_reaches_sanity_as_a_json_string_param_only() {
        let (t, c, g) = (Script::new(vec![Script::ok("null")]), FakeClock::at(0), RefCell::new(Guard::new()));
        let (site, shell) = (crate::site(), Shell::bare());
        let slug = "x\" || true || \"";
        let path = format!("/adventures/{}", crate::page::encode_segment(slug));
        block_on(respond(&route(&path), &deps_with(&t, &c, &g, site, &shell)));
        let url = t.urls.borrow()[0].clone();
        assert!(url.contains("&$slug=%22x%5C%22%20%7C%7C%20true%20%7C%7C%20%5C%22%22"), "{url}");
        // and the query text itself never contains the slug
        assert!(!url.contains("true%20%7C%7C%20%22%5D"), "{url}");
    }

    // ---- the Chinese list is built from the English records ---------------------------

    fn list_json() -> String {
        json!([
            { "title": "Mana Pools", "slug": "mana-pools", "publishedAt": "2026-05-01T00:00:00Z", "place": "Mana Pools, Zimbabwe", "mineral": "malachite",
              "excerpt": "English excerpt", "zh": { "title": "马纳波尔斯", "slug": "mana-pools-zh", "excerpt": "中文摘要", "place": "津巴布韦 马纳波尔斯" } },
            { "title": "Gonarezhou", "slug": "gonarezhou", "publishedAt": "2026-03-10", "mineral": "not-a-mineral", "excerpt": "Only in English", "zh": null },
        ]).to_string()
    }

    #[test]
    fn zh_list_prefers_the_translation_and_marks_the_untranslated() {
        let (r, _) = serve(vec![Script::ok(&list_json())], "/zh/adventures");
        assert_eq!(r.status, 200);
        let b = &r.body;
        assert!(b.contains("href=\"/zh/adventures/mana-pools-zh\""), "{b}");
        assert!(b.contains("马纳波尔斯") && b.contains("中文摘要") && b.contains("津巴布韦 马纳波尔斯"));
        assert!(b.contains("2026年5月1日"));
        // The untranslated one links to the English URL, is flagged, and its text is lang=en.
        assert!(b.contains("href=\"/adventures/gonarezhou\""));
        assert!(b.contains("adventure-card__badge") && b.contains("仅有英文"));
        assert!(b.contains("<h3 class=\"adventure-card__title\" lang=\"en\">Gonarezhou</h3>"));
        // The translated card carries no badge: exactly one badge in the list.
        assert_eq!(b.matches("adventure-card__badge").count(), 1);
        // An unknown mineral draws cobalt.
        assert!(b.contains("data-mineral=\"cobalt\"") && b.contains("data-mineral=\"malachite\""));
        assert!(!b.contains("not-a-mineral"));
    }

    #[test]
    fn en_list_shows_english_with_no_badge() {
        let (r, _) = serve(vec![Script::ok(&list_json())], "/adventures");
        assert!(r.body.contains("1 May 2026") && r.body.contains("10 March 2026"));
        assert!(r.body.contains("href=\"/adventures/mana-pools\""));
        assert!(!r.body.contains("adventure-card__badge\""));
    }

    // ---- hreflang and the switcher ----------------------------------------------------

    #[test]
    fn a_translated_post_points_at_its_own_slug() {
        let (r, _) = serve(vec![Script::ok(&post_json(json!({ "translation": { "slug": "mana-pools-zh" } })))], "/adventures/mana-pools");
        assert!(r.body.contains("hreflang=\"zh-Hans\" href=\"https://bryanfawcett.com/zh/adventures/mana-pools-zh\""));
        // the language switcher goes to the translation, not the list
        assert!(r.body.contains("href=\"/zh/adventures/mana-pools-zh\" hreflang=\"zh-Hans\""), "{}", r.body);
    }

    #[test]
    fn an_untranslated_post_has_no_zh_alternate_and_switches_to_the_zh_list() {
        let (r, _) = serve(vec![Script::ok(&post_json(json!({ "translation": null })))], "/adventures/mana-pools");
        assert!(!r.body.contains("hreflang=\"zh-Hans\" href=\"https://"));
        assert!(r.body.contains("href=\"/zh/adventures\" hreflang=\"zh-Hans\""));
    }

    #[test]
    fn a_zh_post_with_an_original_lists_english() {
        let body = post_json(json!({ "language": "zh", "slug": "mana-pools-zh", "original": { "slug": "mana-pools" } }));
        let (r, _) = serve(vec![Script::ok(&body)], "/zh/adventures/mana-pools-zh");
        assert!(r.body.contains("hreflang=\"en\" href=\"https://bryanfawcett.com/adventures/mana-pools\""));
        assert!(r.body.contains("<html lang=\"zh-Hans\""));
        assert!(r.body.contains("href=\"/adventures/mana-pools\" hreflang=\"en\""));
    }

    // ---- resilience through the handler -----------------------------------------------

    #[test]
    fn a_degraded_answer_is_labelled_stale_and_still_renders() {
        let (t, c, g) = (Script::new(vec![Script::ok(&list_json()), Err(FetchError::Network)]), FakeClock::at(0), RefCell::new(Guard::new()));
        let (site, shell) = (crate::site(), Shell::bare());
        let d = deps_with(&t, &c, &g, site, &shell);
        let first = block_on(respond(&Route::List(Lang::En), &d)).unwrap();
        assert_eq!(first.header("X-Blog-Source"), Some("fresh"));
        c.advance(60_000);
        let second = block_on(respond(&Route::List(Lang::En), &d)).unwrap();
        assert_eq!(second.status, 200);
        assert_eq!(second.header("X-Blog-Source"), Some("stale"));
        assert!(second.body.contains("Mana Pools"));
    }

    #[test]
    fn a_dead_sanity_stops_being_called_but_the_pages_keep_answering() {
        let (t, c, g) = (Script::new(vec![Err(FetchError::Status(503))]), FakeClock::at(0), RefCell::new(Guard::new()));
        let (site, shell) = (crate::site(), Shell::bare());
        let d = deps_with(&t, &c, &g, site, &shell);
        for _ in 0..30 {
            let r = block_on(respond(&Route::List(Lang::En), &d)).unwrap();
            assert_eq!(r.status, 503);
            c.advance(10);
        }
        assert_eq!(t.calls.get(), 5);
    }

    // ---- hostile content, end to end --------------------------------------------------

    #[test]
    fn hostile_sanity_data_cannot_inject_markup_into_either_page() {
        let evil = "<script>alert(1)</script>";
        let post = post_json(json!({
            "title": evil, "excerpt": format!("\"><img src=x onerror=alert(1)>{evil}"), "place": evil,
            "mineral": "\" onmouseover=\"alert(1)", "publishedAt": "\"><script>x</script>",
            "cover": { "asset": { "_ref": "image-abc-1x1-png\"><script>" }, "alt": evil },
            "translation": { "slug": "\"><script>x</script>" },
            "body": [{ "_type": "block", "style": "normal", "markDefs": [{ "_key": "k", "_type": "link", "href": "javascript:alert(1)" }],
                       "children": [{ "_type": "span", "text": evil, "marks": ["k"] }] }]
        }));
        let (r, _) = serve(vec![Script::ok(&post)], "/adventures/x");
        let list = json!([{ "title": evil, "slug": "\"><script>x</script>", "publishedAt": evil, "place": evil, "excerpt": evil,
                            "mineral": "\"><script>", "cover": { "asset": { "_ref": "x" }, "alt": evil },
                            "zh": { "title": evil, "slug": "s\"><script>", "excerpt": evil, "place": evil } }]).to_string();
        let (l_en, _) = serve(vec![Script::ok(&list)], "/adventures");
        let (l_zh, _) = serve(vec![Script::ok(&list)], "/zh/adventures");
        for (name, out) in [("post", r), ("list en", l_en), ("list zh", l_zh)] {
            let b = &out.body;
            assert_eq!(out.status, 200, "{name}");
            assert!(!b.contains("<script>alert"), "{name}: {b}");
            assert!(!b.contains("<script>x"), "{name}: {b}");
            assert!(!b.contains("<img src=x"), "{name}: {b}");
            assert!(!b.contains("javascript:"), "{name}");
            assert!(!b.contains("onmouseover=\"alert"), "{name}");
        }
    }
}
