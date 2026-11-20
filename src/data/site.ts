/**
 * Where the site lives. One place, so the origin is not typed out in the head, the vCard, the
 * link classifier, the blog feed and the two configs. No imports: `astro.config.mjs` and
 * `cloudflare.config.ts` read it too.
 */
export const SITE_URL = 'https://bryanfawcett.com';
export const SITE_HOST = new URL(SITE_URL).host;
/** The hosts that count as this site. Exact match: a prefix test lets `bryanfawcett.com.evil.example` in. */
export const OWN_HOSTS = [SITE_HOST, `www.${SITE_HOST}`] as const;
/** The default social card, rendered by `pnpm og`: a stable, unhashed URL scrapers can cache. */
export const OG_IMAGE = { path: '/og-bryan-fawcett.jpg', width: 1200, height: 630 } as const;
/** A subdomain of this site (the origins deck lives on one). */
export const subdomainUrl = (name: string): string => `https://${name}.${SITE_HOST}`;
