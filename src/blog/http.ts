/**
 * Three outcomes, three responses. One function so a view cannot get one wrong, and a test can pin all three.
 *
 * Only a found page is cacheable. A missing adventure is a real 404 that nothing may hold: anyone can
 * ask for a thousand slugs that do not exist, and an edge that kept each one would serve a stale
 * "not found" for a post published a minute later (the Rust prototype's cache had the same trap, and
 * its fix was to never remember a not-found answer). An unreachable data layer is a 503 with
 * `Retry-After`, also uncacheable, so a crawler is told "come back", not "gone".
 */

/**
 * How long a rendered blog page may be reused.
 *
 * `max-age=0` so a browser always revalidates; `s-maxage=60` lets Cloudflare absorb the traffic, so
 * publishing is live within a minute; `stale-while-revalidate` keeps the last good render for ten
 * minutes if the data layer is unreachable.
 */
export const BLOG_CACHE_CONTROL = 'public, max-age=0, s-maxage=60, stale-while-revalidate=600';

export type Outcome = 'found' | 'missing' | 'unavailable';

export interface BlogResponseInit {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
}

export function responseFor(outcome: Outcome): BlogResponseInit {
  switch (outcome) {
    case 'found':
      return { status: 200, headers: { 'Cache-Control': BLOG_CACHE_CONTROL } };
    case 'missing':
      return { status: 404, headers: { 'Cache-Control': 'no-store' } };
    case 'unavailable':
      return { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '120' } };
  }
}

/** Apply an outcome to an Astro response. */
export function applyOutcome(response: { status?: number | undefined; headers: Headers }, outcome: Outcome): void {
  const init = responseFor(outcome);
  if (init.status !== 200) response.status = init.status;
  for (const [name, value] of Object.entries(init.headers)) response.headers.set(name, value);
}
