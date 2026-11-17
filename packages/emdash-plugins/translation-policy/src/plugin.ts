/**
 * Sandboxed plugin: refuses to publish a translation that is not paired with its source-language
 * entry, and a slug that another entry in the same language already uses.
 *
 * Needs `content:read` (translation group and same-language slugs) on top of the policy capability.
 * The default language is "en"; change DEFAULT_LOCALE and rebuild for a site whose source language
 * differs.
 */
import type { PluginContext, SandboxedPlugin } from 'emdash/plugin';

import { checkTranslations, formatReason } from '../../core/src/index.ts';
import type { EntryRef } from '../../core/src/index.ts';

const DEFAULT_LOCALE = 'en';
/** Slug search is bounded: 20 pages of 100 per publish, then the check says what it could not confirm. */
const PAGE = 100;
const MAX_PAGES = 20;

interface Item {
  id: string;
  slug: string | null;
  status: string;
  locale: string | null;
}

function ref(i: Item): EntryRef {
  return { id: i.id, locale: i.locale, slug: i.slug, status: i.status };
}

async function decide(
  content: Record<string, unknown>,
  collection: string,
  ctx: PluginContext,
): Promise<{ cancel: true; reason: string } | undefined> {
  const content_ = ctx.content;
  if (!content_?.getTranslations) {
    return { cancel: true, reason: 'The translation policy could not read translations (content:read is not granted). Publishing is blocked until it is.' };
  }
  const entry = ref(content as unknown as Item);
  const locale = entry.locale ?? DEFAULT_LOCALE;

  const group = await content_.getTranslations(collection, entry.id);
  const siblings = group.translations.filter((t) => t.id !== entry.id).map((t) => ({ id: t.id, locale: t.locale, slug: t.slug, status: t.status }));

  const sameLocale: EntryRef[] = [];
  if (entry.slug) {
    let cursor: string | undefined;
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await content_.list(collection, { limit: PAGE, ...(cursor ? { cursor } : {}), where: { locale } });
      for (const item of res.items as unknown as Item[]) if (item.id !== entry.id) sameLocale.push(ref(item));
      if (!res.hasMore || !res.cursor) break;
      cursor = res.cursor;
    }
  }

  const reason = formatReason(checkTranslations({ entry, siblings, sameLocale, defaultLocale: DEFAULT_LOCALE }));
  return reason ? { cancel: true, reason } : undefined;
}

const plugin: SandboxedPlugin = {
  hooks: {
    'content:beforePublish': async (event, ctx) => decide(event.content, event.collection, ctx),
    'content:beforeSchedule': async (event, ctx) => decide(event.content, event.collection, ctx),
  },
};

export default plugin;
