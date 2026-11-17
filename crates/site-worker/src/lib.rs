//! bryanfawcett.com's four on-demand blog routes, as a Rust Worker. PROTOTYPE: nothing here
//! is wired into the deployed site; see `docs/rust-blog-worker.md`.
//!
//! `/adventures`, `/adventures/<slug>` and their `/zh` pair read Sanity per request. The
//! sans-IO core is the library: [`handler::respond`] takes a route and the three things a
//! request needs (a [`sanity::Transport`], a [`sanity::Clock`] and the isolate's
//! [`sanity::Guard`]) and returns a status, headers and a body. `worker_glue` (wasm only)
//! is the thin part that is not testable on a laptop: it adapts `worker::Request`/`Response`,
//! `Fetch` with an `AbortController`, and `Date.now()`.
//!
//! The Mzizi crates do real work here, not decoration: `mzizi-resilience` decides when
//! Sanity may be called, how long it may take and what serves when it cannot
//! ([`sanity`]); `mzizi-discovery` writes the head and the JSON-LD ([`head`]). The chrome is
//! `tools/components`, the same Rust that renders the header and footer for Astro.

pub mod dates;
pub mod handler;
pub mod head;
pub mod image;
pub mod model;
pub mod page;
pub mod portable;
pub mod queries;
pub mod sanity;
pub mod shell;

#[cfg(target_arch = "wasm32")]
mod worker_glue;

use components::site::Site;
use std::sync::OnceLock;

/// The exported site data, compiled in: a Worker has no filesystem. `pnpm site-data`
/// rewrites these two files; a stale build is the one way the chrome here can drift, and
/// `docs/rust-blog-worker.md` says how a real deployment would gate that.
static SITE_JSON: &str = include_str!("../../../src/data/generated/site.json");
static UI_JSON: &str = include_str!("../../../src/data/generated/ui.json");

pub fn site() -> &'static Site {
    static SITE: OnceLock<Site> = OnceLock::new();
    SITE.get_or_init(|| Site::from_json(SITE_JSON, UI_JSON))
}
