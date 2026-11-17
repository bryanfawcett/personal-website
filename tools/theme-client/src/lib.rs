//! The header's theme toggle, as WebAssembly.
//!
//! Behaviour is the one the inline script in `MziziHeader.astro` used to carry:
//! a click on `[data-theme-toggle]` flips the effective theme, writes it to
//! `<html data-theme>` and `localStorage('theme')`, and the toggle's
//! `aria-label` names the opposite theme. The effective theme is the explicit
//! choice if there is one, otherwise `prefers-color-scheme`.
//!
//! The pre-paint snippet in `BaseLayout` stays inline JS: wasm loads async and
//! would flash the wrong theme. Everything here is delegated from `document`,
//! so it binds once and survives the router's document swaps.
use wasm_bindgen::prelude::*;
use web_sys::{Document, Element, Event, MediaQueryList};

const DARK_QUERY: &str = "(prefers-color-scheme: dark)";

fn document() -> Option<Document> {
    web_sys::window()?.document()
}

fn media() -> Option<MediaQueryList> {
    web_sys::window()?.match_media(DARK_QUERY).ok().flatten()
}

fn effective(root: &Element) -> &'static str {
    match root.get_attribute("data-theme").as_deref() {
        Some("light") => "light",
        Some("dark") => "dark",
        _ => {
            if media().is_some_and(|m| m.matches()) {
                "dark"
            } else {
                "light"
            }
        }
    }
}

fn opposite(root: &Element) -> &'static str {
    if effective(root) == "dark" { "light" } else { "dark" }
}

/// Point every toggle's `aria-label` at the theme a click would switch to.
fn label() {
    let Some(doc) = document() else { return };
    let Some(root) = doc.document_element() else { return };
    let attr = if opposite(&root) == "light" { "data-label-light" } else { "data-label-dark" };
    let Ok(buttons) = doc.query_selector_all("[data-theme-toggle]") else { return };
    for i in 0..buttons.length() {
        if let Some(button) = buttons.item(i).and_then(|n| n.dyn_into::<Element>().ok()) {
            if let Some(text) = button.get_attribute(attr).filter(|t| !t.is_empty()) {
                let _ = button.set_attribute("aria-label", &text);
            }
        }
    }
}

fn on_click(event: &Event) {
    let Some(target) = event.target().and_then(|t| t.dyn_into::<Element>().ok()) else { return };
    if !matches!(target.closest("[data-theme-toggle]"), Ok(Some(_))) {
        return;
    }
    let Some(root) = document().and_then(|d| d.document_element()) else { return };
    let next = opposite(&root);
    let _ = root.set_attribute("data-theme", next);
    // Private mode: the choice holds for this page only.
    if let Some(storage) = web_sys::window().and_then(|w| w.local_storage().ok().flatten()) {
        let _ = storage.set_item("theme", next);
    }
    label();
}

fn listen(target: &web_sys::EventTarget, name: &str, f: impl FnMut(Event) + 'static) {
    let closure = Closure::<dyn FnMut(Event)>::new(f);
    let _ = target.add_event_listener_with_callback(name, closure.as_ref().unchecked_ref());
    closure.forget();
}

#[wasm_bindgen]
pub fn bind() {
    let Some(doc) = document() else { return };
    listen(&doc, "click", |e| on_click(&e));
    listen(&doc, "astro:page-load", |_| label());
    if let Some(m) = media() {
        listen(&m, "change", |_| label());
    }
    // The page-load that fired while this module was fetching is already gone.
    label();
}
