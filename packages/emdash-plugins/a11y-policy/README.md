# emdash-plugin-a11y-policy

Refuses to **publish or schedule** an entry whose body or cover image breaks accessibility rules. Nothing
else in a pipeline can see CMS content, so without this a missing alt text renders as `alt=""` and passes
every automated check.

## Install

Not published (`"private": true`). In this repo it is registered in `astro.config.mjs`:

```js
import { a11yPolicy } from './packages/emdash-plugins/a11y-policy/src/index.ts';
emdash({ plugins: [a11yPolicy()] });
```

It reads `data.body` (Portable Text) and `data.cover` (an image field) of whatever collection is being
published; an entry with neither is allowed.

## Capabilities

| Capability | Why |
|---|---|
| `hooks.content-policy:register` | The only way to register `content:beforePublish` / `content:beforeSchedule`. EmDash silently skips a policy hook without it (a console warning only), so it is not optional. |

No content, media, network or storage access. The hook receives the draft in the event and returns a
decision.

## Rules, and what the editor sees

An editor sees one message: `Not published: N problems need fixing.` followed by a numbered list.
(HTTP 422, code `PUBLISH_REJECTED`.)

- No alt text on the cover or a body image: `Block 2: this image has no alt text. Select the image and describe what it shows in a short sentence.`
- An `h1` in the body: `Block 1 (heading "Big"): the page title is already the only top-level heading. Change this to Heading (h2).`
- Headings other than h2/h3, or the first heading not h2: see `core/README.md` for the exact text.
- Vague link text ("click here", "read more", "here", ...; Chinese equivalents too), a bare URL as the
  link text, or a link covering no words.

## Build, test, publish later

```bash
pnpm plugins:build      # bundles src/plugin.ts + core into dist/plugin.mjs
pnpm test:plugins
```

Publishing to the EmDash registry: fill the `license` and `publisher` TODOs in `emdash-plugin.jsonc`,
then `emdash-plugin build` / `publish` from `@emdash-cms/plugin-cli` (the committed `dist/plugin.mjs` is
the artifact; the CLI's own bundling would need `core` resolvable as a dependency instead of a relative
import).
