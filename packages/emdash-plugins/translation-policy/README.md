# emdash-plugin-translation-policy

Refuses to **publish or schedule** a translation that is not properly paired, and a slug another entry in
the same language already uses. Works on any collection with EmDash's translation support.

## Install

Not published (`"private": true`). In this repo:

```js
import { translationPolicy } from './packages/emdash-plugins/translation-policy/src/index.ts';
emdash({ plugins: [translationPolicy()] });
```

The source language is `en` (`DEFAULT_LOCALE` in `src/plugin.ts`); change it and rebuild for a site whose
source language differs.

## Capabilities

| Capability | Why |
|---|---|
| `hooks.content-policy:register` | Registers `content:beforePublish` and `content:beforeSchedule`. |
| `content:read` | `content.getTranslations()` (the entry's translation group) and `content.list()` (same-language slugs). Read only. |

Without `content:read` the plugin **fails closed**: it blocks the publish with a message saying so, rather
than letting everything through.

## Rules, and what the editor sees

- A non-source-language entry with no source-language sibling: `This is a "zh" entry but it is not linked to a "en" entry, so readers could never reach it from its original. Create it from the "en" entry's Translations panel (Add translation), or move its content into one made that way, then publish.`
- The source entry is still a draft: `The "en" entry this translates is not published yet, so this "zh" entry would not appear in any list. Publish the "en" entry first, then publish this one.`
- Slug already used in that language: `Another "en" entry already uses the address "a". Change this entry's slug to something unique before publishing.`

Notes from testing against EmDash 1.5.0: EmDash already refuses a duplicate slug at **create** time
(`SLUG_CONFLICT`, HTTP 409), so the slug rule is a second line for renames and imports. The slug search
reads at most 20 pages of 100 entries per publish.

"No hreflang for an untranslated entry" is a render rule, not a publish rule. `core` exports
`hreflangAlternates()` (vector-tested: it returns nothing unless a published translation exists) for the
site to use; this plugin does not touch rendering.

## Build, test, publish later

```bash
pnpm plugins:build && pnpm test:plugins
```

Before publishing to a registry, fill the `license` and `publisher` TODOs in `emdash-plugin.jsonc`.
