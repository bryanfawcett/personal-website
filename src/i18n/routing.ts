/**
 * Path helpers for the two-language route table.
 *
 * English is unprefixed and Chinese lives under `/zh`, which is Astro's
 * `prefixDefaultLocale: false`. Every route exists in both languages, so the
 * switcher can always point at the current page's counterpart rather than
 * dumping the reader back on the home page.
 */
import { defaultLang, languages, type Lang } from './ui.js';

/** Strip a leading locale segment, leaving the language-neutral route. */
export function stripLang(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  if (first !== undefined && first in languages && first !== defaultLang) {
    return `/${rest.join('/')}`.replace(/\/$/, '') || '/';
  }
  return pathname.replace(/\/$/, '') || '/';
}

/** Turn a language-neutral route into the one for `lang`. */
export function localizePath(path: string, lang: Lang): string {
  const base = stripLang(path);
  if (lang === defaultLang) return base;
  return base === '/' ? `/${lang}` : `/${lang}${base}`;
}

/** The same page in the other language. */
export function alternatePath(path: string, lang: Lang): string {
  return localizePath(path, lang === 'en' ? 'zh' : 'en');
}

/** Every language's URL for one route — for `hreflang` alternates. */
export function allPaths(path: string): { lang: Lang; path: string }[] {
  return (Object.keys(languages) as Lang[]).map((lang) => ({
    lang,
    path: localizePath(path, lang),
  }));
}
