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

import { OWN_HOSTS } from '../data/site.js';
import { pixels } from './normalize.js';
import { classifyLink as classify } from '../../packages/emdash-plugins/core/src/index.ts';


/** Escape text that gets interpolated into the HTML string. */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


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
    // to-html's own underline is an inline `style` attribute, which `style-src 'self'` would drop.
    underline: ({ children }) => `<u>${children}</u>`,
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
  // The default wraps text in a span whose class is the attacker-chosen mark name. Keep the words.
  unknownMark: ({ children }) => children,
  unknownList: ({ children }) => `<ul>${children}</ul>`,
  unknownListItem: ({ children }) => `<li>${children}</li>`,
};

/*
 * The body is untrusted (Mzizi N4). `toHTML` escapes text and attributes, which is why nothing a
 * writer types can become markup, but it recurses once per mark and once per list level, buffers the
 * whole body, and trusts every field to have the type the schema promised. So a span with 5000 marks
 * or a list item at level 5000 overflowed the stack (a 500 for the whole document, masthead and
 * all), and a 20 MB span was rendered as written. `sanitizeBody` rebuilds the body from an
 * allow-list, with bounds, before `toHTML` sees it. The limits are the Rust prototype's
 * (crates/site-worker, PR #54) where it had one, and generous for any post a person writes.
 */

/** Distinct marks one span may carry; the rest are ignored. `toHTML` recurses once per mark. */
export const MAX_MARKS_PER_SPAN = 16;
/** List nesting levels; deeper items are flattened to this level. */
export const MAX_LIST_LEVEL = 6;
/** Top-level blocks and spans per block; the rest of the body is cut. */
export const MAX_BLOCKS = 2000;
export const MAX_SPANS_PER_BLOCK = 500;
/** Characters in one span and in the whole body. */
export const MAX_SPAN_CHARS = 20_000;
export const MAX_BODY_CHARS = 400_000;

const STYLES = new Set(['normal', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);
const LIST_KINDS = new Set(['bullet', 'number']);
const DECORATORS = new Set(['strong', 'em', 'underline', 'code', 'strike-through']);
const KEY = /^[A-Za-z0-9_-]{1,64}$/;

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '');

function cleanBlock(raw: Plain, budget: { chars: number }): Plain {
  const markDefs: Plain[] = [];
  if (Array.isArray(raw['markDefs'])) {
    for (const def of raw['markDefs'].slice(0, 64)) {
      // Only links carry data. Any other annotation type is unknown, and its text stays plain.
      if (isPlain(def) && def['_type'] === 'link' && typeof def['_key'] === 'string' && KEY.test(def['_key'])) {
        markDefs.push({ _type: 'link', _key: def['_key'], href: text(def['href'], 2048) });
      }
    }
  }
  const defKeys = new Set(markDefs.map((d) => d['_key']));

  const children: Plain[] = [];
  const spans = Array.isArray(raw['children']) ? raw['children'].slice(0, MAX_SPANS_PER_BLOCK) : [];
  for (const span of spans) {
    if (!isPlain(span) || span['_type'] !== 'span' || typeof span['text'] !== 'string') continue;
    if (budget.chars <= 0) break;
    const value = span['text'].slice(0, Math.min(MAX_SPAN_CHARS, budget.chars));
    budget.chars -= value.length;
    const marks: string[] = [];
    if (Array.isArray(span['marks'])) {
      for (const mark of span['marks']) {
        if (marks.length >= MAX_MARKS_PER_SPAN) break;
        if (typeof mark !== 'string' || marks.includes(mark)) continue;
        if (DECORATORS.has(mark) || defKeys.has(mark)) marks.push(mark);
      }
    }
    children.push({ _type: 'span', _key: 's', text: value, marks });
  }

  const style = typeof raw['style'] === 'string' && STYLES.has(raw['style']) ? raw['style'] : 'normal';
  const out: Plain = { _type: 'block', _key: 'b', style, markDefs, children };
  if (typeof raw['listItem'] === 'string' && LIST_KINDS.has(raw['listItem'])) {
    const level = typeof raw['level'] === 'number' && Number.isFinite(raw['level']) ? Math.trunc(raw['level']) : 1;
    out['listItem'] = raw['listItem'];
    out['level'] = Math.min(MAX_LIST_LEVEL, Math.max(1, level));
  }
  return out;
}

function cleanImage(raw: Plain): Plain {
  const asset = isPlain(raw['asset']) ? raw['asset'] : {};
  const w = pixels(raw['width']);
  const h = pixels(raw['height']);
  return {
    _type: 'image',
    _key: 'i',
    asset: { url: text(asset['url'], 2048), _ref: text(asset['_ref'], 128) },
    alt: text(raw['alt'], 1000),
    caption: text(raw['caption'], 1000),
    ...(w ? { width: w } : {}),
    ...(h ? { height: h } : {}),
  };
}

/** The body as a bounded, allow-listed Portable Text array. Never throws, whatever it is given. */
export function sanitizeBody(body: unknown): Plain[] {
  if (!Array.isArray(body)) return [];
  const budget = { chars: MAX_BODY_CHARS };
  const out: Plain[] = [];
  for (const raw of body.slice(0, MAX_BLOCKS)) {
    if (!isPlain(raw)) continue;
    // Any other block type (script, embed, an unknown plugin's) is dropped, not rendered.
    if (raw['_type'] === 'block') out.push(cleanBlock(raw, budget));
    else if (raw['_type'] === 'image') out.push(cleanImage(raw));
  }
  return out;
}

/** Render an adventure body. Returns an empty string for an empty or unrenderable body. */
export function renderBody(body: readonly unknown[] | undefined): string {
  const clean = sanitizeBody(body);
  if (clean.length === 0) return '';
  try {
    // `onMissingComponent: false` keeps hostile input from writing to the Worker's log per block.
    return toHTML(clean as unknown as Parameters<typeof toHTML>[0], { components, onMissingComponent: false });
  } catch {
    // Fail closed: an unrenderable body is an empty one, not a 500 for the page around it.
    return '';
  }
}
