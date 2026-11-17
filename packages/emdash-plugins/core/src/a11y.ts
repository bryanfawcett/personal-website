import { blocks } from './pt.ts';
import type { Finding, PtBlock } from './types.ts';

export interface A11yInput {
  /** Portable Text array (EmDash `portableText` field). Anything else is treated as empty. */
  readonly body?: unknown;
  /** An EmDash image field value, or absent. */
  readonly cover?: unknown;
}

/** Link text that says nothing out of context (WCAG 2.4.4). Compared lower case, trimmed, without end punctuation. */
export const VAGUE_LINK_TEXT: readonly string[] = [
  // English
  'click here', 'click', 'here', 'this link', 'link', 'this', 'read more', 'more', 'learn more',
  'see more', 'more info', 'tap here', 'find out more',
  // Chinese (Simplified)
  '点击这里', '点击此处', '点这里', '这里', '此处', '阅读更多', '了解更多', '更多', '查看更多', '详情', '链接', '点击查看',
];

const BARE_URL = /^(https?:\/\/|www\.)\S+$/i;

function plain(block: PtBlock): string {
  return (block.children ?? []).map((c) => (typeof c.text === 'string' ? c.text : '')).join('');
}

function snippet(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > 40 ? `${t.slice(0, 37)}...` : t;
}

function normaliseLinkText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\s.,;:!?…。，；：！？、›»>→\-]+$/u, '')
    .toLowerCase();
}

/** The words a link covers: every span in the block that carries the link's mark key. */
function linkText(block: PtBlock, key: string | undefined): string {
  if (!key) return '';
  return (block.children ?? [])
    .filter((c) => Array.isArray(c.marks) && c.marks.includes(key))
    .map((c) => (typeof c.text === 'string' ? c.text : ''))
    .join('');
}

function hasImage(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Boolean(v['id'] ?? v['src'] ?? v['asset']);
}

/** Alt text, headings and link text. Findings are in document order, cover first. */
export function checkAccessibility(input: A11yInput): Finding[] {
  const out: Finding[] = [];

  if (hasImage(input.cover)) {
    const alt = (input.cover as Record<string, unknown>)['alt'];
    if (typeof alt !== 'string' || alt.trim() === '') {
      out.push({
        rule: 'a11y.cover-alt',
        severity: 'error',
        path: 'cover',
        message: 'The cover image has no alt text. Open the cover image and describe what it shows in a short sentence, for people who cannot see it.',
      });
    }
  }

  // Only h2 and h3 are allowed in a body, so "no skipped level" reduces to: the first heading is h2, and
  // h4 and deeper (the only way to jump past h3) are refused outright.
  let previous = 0; // level of the last accepted heading; 0 = none yet
  blocks(input.body).forEach((block, i) => {
    const where = `Block ${i + 1}`;
    const path = `body[${i}]`;

    if (block._type === 'image') {
      if (typeof block.alt !== 'string' || block.alt.trim() === '') {
        out.push({
          rule: 'a11y.image-alt',
          severity: 'error',
          path,
          message: `${where}: this image has no alt text. Select the image and describe what it shows in a short sentence.`,
        });
      }
      return;
    }

    const heading = /^h([1-6])$/.exec(block.style ?? '');
    if (heading) {
      const level = Number(heading[1]);
      const label = `${where} (heading "${snippet(plain(block))}")`;
      if (level === 1) {
        out.push({
          rule: 'a11y.heading-h1',
          severity: 'error',
          path,
          message: `${label}: the page title is already the only top-level heading. Change this to Heading (h2).`,
        });
      } else if (level >= 4) {
        out.push({
          rule: 'a11y.heading-deep',
          severity: 'error',
          path,
          message: `${label}: this site uses only Heading (h2) and Subheading (h3) inside a post. Change it to one of those.`,
        });
      } else if (previous === 0 && level !== 2) {
        out.push({
          rule: 'a11y.heading-start',
          severity: 'error',
          path,
          message: `${label}: the first heading in a post must be Heading (h2), not h${level}. Change it to h2.`,
        });
      }
      if (level === 2 || level === 3) previous = level;
    }

    (block.markDefs ?? []).forEach((def, j) => {
      if (def._type !== 'link') return;
      const href = typeof def.href === 'string' ? def.href : '';
      const text = linkText(block, def._key);
      const label = `${where}, link "${snippet(text || href)}"`;
      const defPath = `${path}.markDefs[${j}]`;
      const trimmed = text.trim();
      if (trimmed === '') {
        out.push({
          rule: 'a11y.link-text-empty',
          severity: 'error',
          path: defPath,
          message: `${where}: a link has no visible words. Select the words that describe where it goes and link those.`,
        });
      } else if (BARE_URL.test(trimmed)) {
        out.push({
          rule: 'a11y.link-text-url',
          severity: 'error',
          path: defPath,
          message: `${label}: a web address is read out letter by letter by screen readers. Replace the link text with words that say where it goes.`,
        });
      } else if (VAGUE_LINK_TEXT.includes(normaliseLinkText(text))) {
        out.push({
          rule: 'a11y.link-text-vague',
          severity: 'error',
          path: defPath,
          message: `${label}: "${snippet(trimmed)}" does not say where the link goes. Rewrite the link text to name its destination.`,
        });
      }
    });
  });
  return out;
}
