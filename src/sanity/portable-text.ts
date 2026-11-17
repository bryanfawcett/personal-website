/**
 * Portable Text → HTML, in the sheet's own vocabulary.
 *
 * `@portabletext/to-html` is the one Sanity dependency the site takes. Portable
 * Text is a nested, mark-annotated document format — overlapping marks, list
 * nesting, custom block types — and hand-rolling a renderer for it is the kind
 * of job that looks finished long before it is correct.
 *
 * Everything below maps a block onto a class the stylesheet already has, so
 * body copy from the CMS is drawn with the same rules as body copy in a
 * template. Nothing here invents a new visual treatment.
 */
import { toHTML, type PortableTextHtmlComponents } from '@portabletext/to-html';

import { resolveImage } from './image.js';
import type { SanityImage } from './types.js';

/** Escape text that gets interpolated into the HTML string. */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The hosts that count as this site. Exact match: a prefix test lets bryanfawcett.com.evil.example in. */
const OWN_HOSTS = new Set(['bryanfawcett.com', 'www.bryanfawcett.com']);

/**
 * What a link is allowed to be: web, mail, phone, or a path/fragment on this site. Anything else
 * (javascript:, data:, vbscript:, a tab or newline smuggled into the scheme) returns null.
 */
export function classifyLink(href: string): { external: boolean } | null {
  if (!href) return null;
  // No backslash, space or control character anywhere. Browsers read `\` as `/` and drop tabs and
  // newlines inside a URL, so `/\evil.example` and `/<tab>/evil.example` both mean `//evil.example`
  // while looking like an on-site path to a regex. A real link has none of them.
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u0020\u007f-\u009f]/.test(href)) return null;
  // A relative path or fragment: stays on the site. `//host` is protocol-relative, so it is not one.
  if (/^(\/(?!\/)|#|\?)/.test(href)) return { external: false };
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol === 'mailto:' || url.protocol === 'tel:') return { external: false };
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  return { external: !OWN_HOSTS.has(url.hostname) };
}

const components: Partial<PortableTextHtmlComponents> = {
  block: {
    normal: ({ children }) => `<p>${children}</p>`,
    // The adventure's title is the page's only h1, so the body's headings
    // start one level below it — h2, then h3. Skipping to h3 here is what
    // axe flags as heading-order: a level may not be jumped, only descended.
    h2: ({ children }) => `<h2>${children}</h2>`,
    h3: ({ children }) => `<h3>${children}</h3>`,
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
      // stay, the link does not. Sanity text is untrusted input however trusted its editor is.
      if (!link) return children;
      const attrs = link.external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escape(href)}"${attrs}>${children}</a>`;
    },
  },

  types: {
    image: ({ value }) => {
      const image = value as SanityImage;
      // The body column is --measure wide; 720 covers it at 2x on a laptop.
      const resolved = resolveImage(image, { width: 720 });
      if (!resolved) return '';

      const caption = typeof image.caption === 'string' ? image.caption : '';

      return [
        '<figure class="adventure__figure">',
        '<span class="panel__rule" aria-hidden="true"></span>',
        `<img src="${escape(resolved.src)}" srcset="${escape(resolved.srcset)}"`,
        ` width="${resolved.width}" height="${resolved.height}"`,
        ` alt="${escape(resolved.alt)}" loading="lazy" decoding="async">`,
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
