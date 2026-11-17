/**
 * The inputs of `rust:seo-head`, worked out from what a page tells the layout.
 *
 * The tags and the JSON-LD are rendered in Rust, by the `mzizi-discovery` crate. The routing
 * tables stay here, in TypeScript, because `src/i18n/routing.ts` is their one source: this
 * file decides *which* URLs, the crate decides how they are written. It is a plain function
 * (no Astro imports) so `scripts/verify-seo-head.mjs` can drive it without a build.
 */
import type { Props as SeoHeadProps } from 'rust:seo-head';
import { PROFILE, profileInLang } from '../data/profile.js';
import { allPaths, localizePath } from '../i18n/routing.js';
import { bcp47, defaultLang, ogLocale, type Lang } from '../i18n/ui.js';

export interface SeoHeadInput {
  title: string;
  description: string;
  /** Language-neutral path, e.g. "/experience". */
  path: string;
  lang: Lang;
  /** The same page's URL in each language, when it cannot be derived from `path`. */
  alternates?: Partial<Record<Lang, string>> | undefined;
  ogType: 'website' | 'profile' | 'article';
  site: URL;
  /** A page's own share image (an adventure's cover). `url` may be a path; it is made absolute. */
  image?: { url: string; width?: number | undefined; height?: number | undefined; alt?: string | undefined } | undefined;
  /** A post: its dates and the headline, for `article:*` tags and the Article JSON-LD. */
  article?:
    | {
        headline: string;
        /** ISO 8601. The adventure's own date, the one the page shows. */
        publishedTime: string;
        modifiedTime?: string | undefined;
        section?: string | undefined;
        tags?: readonly string[] | undefined;
      }
    | undefined;
}

const IMAGE = 'https://bryanfawcett.com/og-bryan-fawcett.jpg';

/** An absolute http(s) URL for a share image, or null (a `javascript:` or `data:` URL is never one). */
export function absoluteImage(url: string, site: URL): string | null {
  try {
    const abs = new URL(url, site);
    return abs.protocol === 'https:' || abs.protocol === 'http:' ? abs.href : null;
  } catch {
    return null;
  }
}

export function seoHeadProps(input: SeoHeadInput): SeoHeadProps {
  const { title, description, path, lang, alternates, ogType, site, image, article } = input;
  const cover = image ? absoluteImage(image.url, site) : null;

  /*
   * Which languages this page genuinely exists in. For a hand-authored route that is both,
   * derived from the path. For an adventure it is whatever `alternates` says: an untranslated
   * one lists only English, because pointing `hreflang="zh-Hans"` at a page that is not a
   * Chinese version of this one is a lie told to a search engine.
   */
  const localized = alternates
    ? (Object.entries(alternates) as [Lang, string][]).map(([entryLang, entryPath]) => ({
        lang: entryLang,
        path: entryPath,
      }))
    : allPaths(path);

  const here = localized.find((entry) => entry.lang === lang)?.path ?? localizePath(path, lang);
  const abs = (p: string) => new URL(p, site).href;
  const profile = profileInLang(lang);

  return {
    title: here === '/' || here === '/zh' ? title : `${title} | ${PROFILE.name}`,
    description,
    canonical: abs(here),
    // Both languages of this page, plus x-default pointing at English.
    alternates: [
      ...localized.map((entry) => ({ hreflang: bcp47[entry.lang], href: abs(entry.path) })),
      {
        hreflang: 'x-default',
        href: abs(localized.find((e) => e.lang === defaultLang)?.path ?? here),
      },
    ],
    ogType,
    siteName: PROFILE.name,
    ogLocale: ogLocale[lang],
    ogLocaleAlternates: localized.filter((e) => e.lang !== lang).map((e) => ogLocale[e.lang]),
    // A page's own image keeps its own size (or none, when unknown); the default card is 1200x630.
    image: cover ?? IMAGE,
    imageAlt: cover ? (image?.alt || title) : 'Bryan Fawcett — Digital Craftsman',
    ...(cover
      ? image?.width && image.height
        ? { imageWidth: image.width, imageHeight: image.height }
        : {}
      : { imageWidth: 1200, imageHeight: 630 }),
    ...(article
      ? {
          article: {
            headline: article.headline,
            publishedTime: article.publishedTime,
            ...(article.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
            author: PROFILE.name,
            authorUrl: 'https://bryanfawcett.com',
            ...(article.section ? { section: article.section } : {}),
            tags: [...(article.tags ?? [])],
            inLanguage: bcp47[lang],
          },
        }
      : {}),
    twitterCreator: '@bryanfawcett',
    person: {
      id: 'https://bryanfawcett.com/#person',
      name: PROFILE.name,
      givenName: 'Bryan',
      familyName: 'Fawcett',
      jobTitle: profile.roles.map((r) => r.title),
      description: profile.summary,
      url: 'https://bryanfawcett.com',
      email: `mailto:${PROFILE.email}`,
      image: IMAGE,
      sameAs: PROFILE.socials.map((s) => s.href),
      worksFor: profile.roles.map((r) => ({ name: r.org })),
      founder: [
        { name: 'Nyuchi Africa', url: 'https://nyuchi.com' },
        { name: 'The Bundu Foundation', url: 'https://www.bundu.org' },
      ],
      knowsAbout: [...PROFILE.knowsAbout],
    },
    webSite: {
      id: 'https://bryanfawcett.com/#website',
      url: 'https://bryanfawcett.com',
      name: `${PROFILE.name} — ${profile.title}`,
      inLanguage: bcp47[lang],
    },
  };
}
