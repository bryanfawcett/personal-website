/**
 * The shared chrome, rendered by Rust.
 *
 * `tools/components` (`pnpm fragments`) renders the header, footer and schematics to
 * `src/data/generated/fragments/`, one file per language and top-level route, with a few
 * placeholders for what is only known per request. Astro inserts them; it does not own
 * their markup. The fragments are committed (Cloudflare's build image has no Rust) and CI
 * fails if they drift from the Rust source.
 */
import { NAV } from '../data/profile.js';
import { stripLang } from '../i18n/routing.js';

const files = import.meta.glob('../data/generated/fragments/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function fragment(name: string): string {
  const html = files[`../data/generated/fragments/${name}.html`];
  if (html === undefined) throw new Error(`no Rust fragment "${name}"; run \`pnpm fragments\``);
  return html;
}

/** The top-level route a fragment is keyed by: `home`, `experience`, … or `none`. */
export function routeKey(path: string): string {
  if (!path) return 'none';
  const here = stripLang(path);
  if (here === '/') return 'home';
  for (const { href } of NAV) {
    if (href !== '/' && (here === href || here.startsWith(`${href}/`))) return href.slice(1);
  }
  return 'none';
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** Fill the placeholders a fragment carries. Values are escaped: they come from a URL or a page. */
export function fill(html: string, values: Record<string, string>): string {
  let out = html;
  for (const [key, value] of Object.entries(values)) {
    out = out.replaceAll(`%${key}%`, value.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c));
  }
  return out;
}

/** Like `fill`, for values that are already markup (the QR SVGs). Not for anything from a URL. */
export function fillRaw(html: string, values: Record<string, string>): string {
  let out = html;
  for (const [key, value] of Object.entries(values)) out = out.replaceAll(`%${key}%`, () => value);
  return out;
}
