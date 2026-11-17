// packages/emdash-plugins/core/src/translation.ts
function checkTranslations(input) {
  const out = [];
  const { entry, siblings, sameLocale, defaultLocale } = input;
  const locale = entry.locale ?? defaultLocale;
  if (locale !== defaultLocale) {
    const source = siblings.filter((s) => (s.locale ?? defaultLocale) === defaultLocale);
    if (source.length === 0) {
      out.push({
        rule: "translation.orphan",
        severity: "error",
        path: "locale",
        message: `This is a "${locale}" entry but it is not linked to a "${defaultLocale}" entry, so readers could never reach it from its original. Create it from the "${defaultLocale}" entry's Translations panel (Add translation), or move its content into one made that way, then publish.`
      });
    } else if (!source.some((s) => s.status === "published")) {
      out.push({
        rule: "translation.source-unpublished",
        severity: "error",
        path: "locale",
        message: `The "${defaultLocale}" entry this translates is not published yet, so this "${locale}" entry would not appear in any list. Publish the "${defaultLocale}" entry first, then publish this one.`
      });
    }
  }
  if (entry.slug) {
    const clash = sameLocale.find((e) => e.slug === entry.slug);
    if (clash) {
      out.push({
        rule: "translation.slug-duplicate",
        severity: "error",
        path: "slug",
        message: `Another "${locale}" entry already uses the address "${entry.slug}". Change this entry's slug to something unique before publishing.`
      });
    }
  }
  return out;
}

// packages/emdash-plugins/core/src/reason.ts
var MAX_REASON_LENGTH = 500;
function formatReason(findings) {
  const errors = findings.filter((f) => f.severity === "error");
  if (errors.length === 0) return "";
  const head = `Not published: ${errors.length} ${errors.length === 1 ? "problem needs" : "problems need"} fixing.`;
  const lines = [];
  let used = [...head].length;
  for (let i = 0; i < errors.length; i++) {
    const rest = errors.length - i;
    const line = `${i + 1}. ${errors[i].message}`;
    const cost = 1 + [...line].length;
    const reserve = rest > 1 ? 1 + [...`...and ${rest - 1} more.`].length : 0;
    if (used + cost + reserve > MAX_REASON_LENGTH) {
      if (lines.length === 0) {
        const room = MAX_REASON_LENGTH - used - 2 - (rest > 1 ? 1 + [...`...and ${rest - 1} more.`].length : 0);
        lines.push(`${[...line].slice(0, Math.max(room, 0)).join("").trimEnd()}\u2026`);
        if (rest > 1) lines.push(`...and ${rest - 1} more.`);
      } else {
        lines.push(`...and ${rest} more.`);
      }
      return [head, ...lines].join("\n");
    }
    lines.push(line);
    used += cost;
  }
  return [head, ...lines].join("\n");
}

// packages/emdash-plugins/translation-policy/src/plugin.ts
var DEFAULT_LOCALE = "en";
var PAGE = 100;
var MAX_PAGES = 20;
function ref(i) {
  return { id: i.id, locale: i.locale, slug: i.slug, status: i.status };
}
async function decide(content, collection, ctx) {
  const content_ = ctx.content;
  if (!content_?.getTranslations) {
    return { cancel: true, reason: "The translation policy could not read translations (content:read is not granted). Publishing is blocked until it is." };
  }
  const entry = ref(content);
  const locale = entry.locale ?? DEFAULT_LOCALE;
  const group = await content_.getTranslations(collection, entry.id);
  const siblings = group.translations.filter((t) => t.id !== entry.id).map((t) => ({ id: t.id, locale: t.locale, slug: t.slug, status: t.status }));
  const sameLocale = [];
  if (entry.slug) {
    let cursor;
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await content_.list(collection, { limit: PAGE, ...cursor ? { cursor } : {}, where: { locale } });
      for (const item of res.items) if (item.id !== entry.id) sameLocale.push(ref(item));
      if (!res.hasMore || !res.cursor) break;
      cursor = res.cursor;
    }
  }
  const reason = formatReason(checkTranslations({ entry, siblings, sameLocale, defaultLocale: DEFAULT_LOCALE }));
  return reason ? { cancel: true, reason } : void 0;
}
var plugin = {
  hooks: {
    "content:beforePublish": async (event, ctx) => decide(event.content, event.collection, ctx),
    "content:beforeSchedule": async (event, ctx) => decide(event.content, event.collection, ctx)
  }
};
var plugin_default = plugin;
export {
  plugin_default as default
};
