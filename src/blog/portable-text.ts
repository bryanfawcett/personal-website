/**
 * Portable Text → HTML, in the sheet's own vocabulary.
 *
 * `@portabletext/to-html` is a generic Portable Text renderer (EmDash stores rich text as Portable
 * Text too), not a Sanity client. Portable Text is a nested, mark-annotated document format — overlapping marks, list
 * nesting, custom block types — and hand-rolling a renderer for it is the kind
 * of job that looks finished long before it is correct.
 *
 * Everything below maps a block onto a class the stylesheet already has, so
 * body copy from the CMS is drawn with the same rules as body copy in a
 * template. Nothing here invents a new visual treatment.
 */
import { toHTML, type PortableTextHtmlComponents } from '@portabletext/to-html';

import { classifyLink as classify } from '../../packages/emdash-plugins/core/src/index.ts';


/** Escape text that gets interpolated into the HTML string. */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The hosts that count as this site. Exact match: a prefix test lets bryanfawcett.com.evil.example in. */
const OWN_HOSTS = ['bryanfawcett.com', 'www.bryanfawcett.com'] as const;

/**
 * What a link is allowed to be: web, mail, phone, or a path/fragment on this site. Anything else
 * (javascript:, data:, vbscript:, a tab or newline smuggled into the scheme) returns null.
 *
 * The rule itself lives in `packages/emdash-plugins/core`, which is the same code the link-policy
 * plugin runs when an editor publishes. One rule, checked at publish and again at render; this
 * wrapper only supplies this site's own hostnames.
 */
export function classifyLink(href: string): { external: boolean } | null {
  return classify(href, { ownHosts: OWN_HOSTS });
}

const components: Partial<PortableTextHtmlComponents> = {
  block: {
    normal: ({ children }) => `<p>${children}</p>`,
    // The adventure's title is the page's only h1, so the body's headings
    // start one level below it — h2, then h3. Skipping to h3 here is what
    // axe flags as heading-order: a level may not be jumped, only descended.
    h2: ({ children }) => `<h2>${children}</h2>`,
    h3: ({ children }) => `<h3>${children}</h3>`,
    // EmDash's editor also offers h1 and h4-h6. The sheet allows only h2 and h3 in a body, so the
    // extra levels are folded in rather than rendered: h1 would be a second h1 on the page.
    h1: ({ children }) => `<h2>${children}</h2>`,
    h4: ({ children }) => `<h3>${children}</h3>`,
    h5: ({ children }) => `<h3>${children}</h3>`,
    h6: ({ children }) => `<h3>${children}</h3>`,
    // No class: `.pull` is scoped to the origins sheet, so borrowing the
    // name here rendered a pull quote as plain body copy. The adventure
    // stylesheet styles the element directly instead.
    blockquote: ({ children }) => `<blockquote>${children}</blockquote>`,
  },

  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.['href'] === 'string' ? value['href'].trim() : '';
      const link = classifyLink(href);
      // A scheme outside the allow-list (javascript:, data:, vbscript:) is dropped: the words
      // stay, the link does not. CMS text is untrusted input however trusted its editor is.
      if (!link) return children;
      const attrs = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escape(href)}"${attrs}>${children}</a>`;
    },
  },

  types: {
    image: ({ value }) => {
      // EmDash's image block: `asset._ref` is a media id and `asset.url` its public URL, hydrated
      // by the loader. Without a URL there is nothing to draw, so the block is dropped.
      const block = value as {
        asset?: { url?: unknown; _ref?: unknown };
        alt?: unknown;
        caption?: unknown;
        width?: unknown;
        height?: unknown;
      };
      const ref = typeof block.asset?._ref === 'string' && /^[A-Za-z0-9]+$/.test(block.asset._ref) ? block.asset._ref : '';
      const src =
        typeof block.asset?.url === 'string' && block.asset.url
          ? block.asset.url
          : ref
            ? `/_emdash/api/media/file/${ref}`
            : '';
      if (!src || !/^(\/(?!\/)|https:\/\/)/.test(src) || /[\\\u0000-\u0020]/.test(src)) return '';

      const alt = typeof block.alt === 'string' ? block.alt : '';
      const caption = typeof block.caption === 'string' ? block.caption : '';
      const w = typeof block.width === 'number' ? ` width="${Math.round(block.width)}"` : '';
      const h = typeof block.height === 'number' ? ` height="${Math.round(block.height)}"` : '';

      return [
        '<figure class="adventure__figure">',
        '<span class="panel__rule" aria-hidden="true"></span>',
        `<img src="${escape(src)}"${w}${h} alt="${escape(alt)}" loading="lazy" decoding="async">`,
        caption ? `<figcaption>${escape(caption)}</figcaption>` : '',
        '</figure>',
      ].join('');
    },
  },

  // A block type the schema does not know about should not take the page down.
  unknownType: () => '',
  unknownBlockStyle: ({ children }) => `<p>${children}</p>`,
};

/** Render an adventure body. Returns an empty string for an empty body. */
export function renderBody(body: readonly unknown[] | undefined): string {
  if (!body || body.length === 0) return '';
  return toHTML(body as Parameters<typeof toHTML>[0], { components });
}
