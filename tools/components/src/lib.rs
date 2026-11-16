//! The site's components, in Rust.
//!
//! Each one renders the same HTML as its Astro original, from the same data: the
//! content and strings come from `src/data/generated/{site,ui}.json`, written by
//! `pnpm site-data`, so nothing here is a copy of the TypeScript. `canon` and the
//! `parity` binary are how a port is proven rather than eyeballed: the Rust render
//! is compared, as normalised HTML, with the component as Astro shipped it in a
//! built page.

pub mod canon;
pub mod footer;
pub mod site;
pub mod lang_switcher;
pub mod page_header;
pub mod panel;
