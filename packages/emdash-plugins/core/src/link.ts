import type { Finding } from './types.ts';

export interface LinkOptions {
  /**
   * Hostnames that count as "this site", exact match, lower case. A prefix or suffix test lets
   * `https://example.com.evil.example` in, so there is none. Empty means every http(s) link is external.
   */
  readonly ownHosts?: readonly string[];
}

export type LinkProblem = 'empty' | 'whitespace' | 'protocol-relative' | 'scheme' | 'malformed';

// No backslash, space or control character anywhere. Browsers read `\` as `/` and drop tabs and
// newlines inside a URL, so `/\evil.example` and `/<tab>/evil.example` both mean `//evil.example`
// while looking like an on-site path to a regex.
// eslint-disable-next-line no-control-regex
// Unicode spaces and zero-width characters are refused too.
const FORBIDDEN = /[\\\x00-\x20\x7f-\x9f\s\u200b-\u200f\u2028\u2029\u2060\ufeff]/;

/** Why a link is refused, or null when it is allowed. The single rule; `classifyLink` is built on it. */
export function linkProblem(href: string): LinkProblem | null {
  if (!href) return 'empty';
  if (FORBIDDEN.test(href)) return 'whitespace';
  if (href.startsWith('//')) return 'protocol-relative';
  if (/^(\/|#|\?)/.test(href)) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return 'malformed';
  }
  if (url.protocol === 'mailto:' || url.protocol === 'tel:') return null;
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'scheme';
  return null;
}

/**
 * What a link is allowed to be: http, https, mailto, tel, a path on this site, or a fragment.
 * Returns null for anything else, otherwise whether it leaves the site.
 */
export function classifyLink(href: string, options: LinkOptions = {}): { external: boolean } | null {
  if (linkProblem(href)) return null;
  if (/^(\/|#|\?)/.test(href)) return { external: false };
  const url = new URL(href);
  if (url.protocol === 'mailto:' || url.protocol === 'tel:') return { external: false };
  const own = new Set((options.ownHosts ?? []).map((h) => h.toLowerCase()));
  return { external: !own.has(url.hostname) };
}

function show(href: string): string {
  // Visible, bounded, and with control characters made printable so the editor can see them.
  // eslint-disable-next-line no-control-regex
  const printable = href.replace(/[\u0000-\u001f\u007f-\u009f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return printable.length > 80 ? `${printable.slice(0, 77)}...` : printable;
}

/** The finding for a refused link, in editor language. `where` names the place ("Block 4"). */
export function linkFinding(href: string, path: string, where: string): Finding | null {
  const problem = linkProblem(href);
  if (!problem) return null;
  const fix = 'Use an https:// or http:// address, mailto: or tel:, a path starting with a single "/", or a "#section" anchor.';
  const message: Record<LinkProblem, string> = {
    empty: `${where}: a link has no address. Add the address or remove the link.`,
    whitespace: `${where}: the link address "${show(href)}" contains a space, backslash or hidden character. Remove it and paste the address again.`,
    'protocol-relative': `${where}: the link address "${show(href)}" starts with "//", which can point to another site. Write the full https:// address instead.`,
    scheme: `${where}: the link address "${show(href)}" is not allowed (only web, mail and phone links are). ${fix}`,
    malformed: `${where}: the link address "${show(href)}" is not a valid address. ${fix}`,
  };
  return { rule: `link.${problem}`, severity: 'error', path, message: message[problem] };
}
