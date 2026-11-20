/**
 * What a crawler or a language model reads about the adventures: `llms.txt`'s adventures section and
 * the child sitemap. Both are built from the same list the blog pages read, so neither can name a post
 * the site does not show, and neither needs a hand edit when one is published.
 *
 * Pure functions (no EmDash import) so `scripts/tests/blog-untrusted.test.mjs` can run them. Titles,
 * excerpts and slugs come from the CMS, so they are untrusted: markdown and XML are escaped, and
 * line breaks are flattened (an excerpt with a newline must not start a new list item).
 */
import { SITE_URL } from '../data/site.js';
import { bcp47 } from '../i18n/ui.js';
import type { AdventureCard } from './types.js';

const SITE = SITE_URL;

/** One line of text: control characters and runs of whitespace become single spaces. */
function oneLine(value: string, max = 300): string {
  // Cc: control characters. Zl and Zp: the Unicode line and paragraph separators.
  return value.replace(/[\p{Cc}\p{Zl}\p{Zp}]+/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Text safe inside a markdown link label. */
function mdLabel(value: string): string {
  return oneLine(value, 160).replace(/[\\[\]]/g, (c) => `\\${c}`);
}

/** A slug as a URL path segment: encoded, so a `)` or space in it cannot end the markdown link. */
function seg(slug: string): string {
  return encodeURIComponent(slug).replace(/[()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function adventureUrl(slug: string, lang: 'en' | 'zh', site = SITE): string {
  return `${site}${lang === 'zh' ? '/zh' : ''}/adventures/${seg(slug)}`;
}

/**
 * The "Bryan's Adventures" section for llms.txt. Newest first (the list is already in that order).
 * Chinese versions are listed beside their English post, not as separate items.
 */
export function adventuresLlms(cards: readonly AdventureCard[], site = SITE): string {
  const lines = ["## Bryan's Adventures", '', `- [All adventures](${site}/adventures): the blog, newest first; Chinese list at ${site}/zh/adventures`];
  for (const c of cards) {
    const excerpt = c.excerpt ? `: ${oneLine(c.excerpt)}` : '';
    const zh = c.zh ? ` ([中文](${adventureUrl(c.zh.slug, 'zh', site)}))` : '';
    lines.push(`- [${mdLabel(c.title)}](${adventureUrl(c.slug, 'en', site)})${excerpt}${zh}`);
  }
  return `${lines.join('\n')}\n`;
}

const xml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/**
 * The adventures child sitemap, with hreflang in the site's own form: `zh-Hans`, as every page head
 * and the main sitemap use (EmDash's own route writes a bare `zh`). An untranslated post lists
 * English and `x-default` only: pointing `zh-Hans` at a page that is not its translation is a lie
 * told to a search engine. Like the Chinese list, this is built from the English records.
 */
export function adventuresSitemap(cards: readonly AdventureCard[], site = SITE): string {
  const link = (hreflang: string, href: string) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${xml(href)}" />`;
  const urls: string[] = [];
  for (const c of cards) {
    const en = adventureUrl(c.slug, 'en', site);
    const zh = c.zh ? adventureUrl(c.zh.slug, 'zh', site) : null;
    const alternates = [link(bcp47.en, en), ...(zh ? [link(bcp47.zh, zh)] : []), link('x-default', en)].join('\n');
    const entry = (loc: string, lastmod: string | undefined) =>
      [`  <url>`, `    <loc>${xml(loc)}</loc>`, ...(lastmod ? [`    <lastmod>${xml(lastmod)}</lastmod>`] : []), alternates, `  </url>`].join('\n');
    urls.push(entry(en, c.updatedAt));
    if (zh) urls.push(entry(zh, c.zh?.updatedAt ?? c.updatedAt));
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
