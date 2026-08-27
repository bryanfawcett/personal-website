/**
 * Reading Bryan's Adventures out of Sanity.
 *
 * The dataset is public-read, so this needs no token — which is the whole
 * reason the blog can be server-rendered from the Worker without a single
 * secret in the deploy. The project id and dataset are public identifiers
 * (they appear in every image URL the site serves), so they are constants here
 * rather than environment variables: nothing to configure in Cloudflare, and
 * nothing that can be misconfigured between preview and production.
 *
 * `apicdn` rather than `api`: the CDN host serves from Sanity's edge cache and
 * is the documented choice for published, unauthenticated reads. `api` is for
 * drafts and authenticated queries, and is rate-limited far more tightly.
 */

export const SANITY_PROJECT_ID = 'zsx9erk1';
export const SANITY_DATASET = 'production';

/**
 * Pinned, not floating.
 *
 * GROQ's behaviour is versioned by date; letting this drift means a query that
 * works today can change shape on a day nobody deployed anything.
 */
const API_VERSION = '2025-02-19';

const ENDPOINT = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${SANITY_DATASET}`;

/** Sanity answers every query with the result wrapped like this. */
interface QueryResponse<T> {
  readonly result: T;
  readonly ms?: number;
}

/**
 * How long a rendered blog page may be reused.
 *
 * `max-age=0` so a browser always revalidates and a reader never sees a stale
 * page from their own cache. `s-maxage=60` lets Cloudflare absorb the traffic —
 * publishing in Sanity is live within a minute, which is the trade for not
 * needing a rebuild at all. `stale-while-revalidate` is the resilience half: if
 * Sanity is unreachable the edge keeps serving the last good render for ten
 * minutes instead of showing anybody an error.
 */
export const BLOG_CACHE_CONTROL = 'public, max-age=0, s-maxage=60, stale-while-revalidate=600';

/** Sanity was reachable and answered. */
export interface Ok<T> {
  readonly ok: true;
  readonly data: T;
}

/**
 * Sanity was not reachable, or answered with something unusable.
 *
 * Deliberately distinct from "there are no adventures yet": an empty blog and
 * a broken blog look identical if you collapse them, and the pages tell the
 * reader different things about each.
 */
export interface Failed {
  readonly ok: false;
  readonly reason: string;
}

export type Result<T> = Ok<T> | Failed;

/**
 * Run a GROQ query.
 *
 * Never throws. A blog outage should degrade the one route that needs Sanity,
 * not take down a page render — and on an SSR route an uncaught throw is a 500
 * for the whole document, masthead and all.
 */
export async function groq<T>(
  query: string,
  params: Readonly<Record<string, string>> = {},
): Promise<Result<T>> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('query', query);
  url.searchParams.set('perspective', 'published');
  for (const [key, value] of Object.entries(params)) {
    // GROQ params are JSON-encoded on the wire, so a string param has to
    // arrive quoted or Sanity reads it as an identifier and matches nothing.
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { ok: false, reason: `Sanity responded ${response.status}` };
    }

    const body = (await response.json()) as QueryResponse<T>;
    return { ok: true, data: body.result };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'unknown error' };
  }
}
