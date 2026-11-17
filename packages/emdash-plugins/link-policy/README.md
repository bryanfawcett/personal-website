# emdash-plugin-link-policy

Refuses to **publish or schedule** an entry whose body links to anything but http(s), `mailto:`, `tel:`, an
on-site path or a `#fragment`. It gives an editor an error instead of a link that is silently dropped at
render. The render path still enforces the same rule (defence in depth), from the same `core`.

## Install

Not published (`"private": true`). In this repo:

```js
import { linkPolicy } from './packages/emdash-plugins/link-policy/src/index.ts';
emdash({ plugins: [linkPolicy()] });
```

## Capabilities

| Capability | Why |
|---|---|
| `hooks.content-policy:register` | Registers `content:beforePublish` and `content:beforeSchedule`. Nothing else. |

### Why this is sandboxed, not native

The EmDash spike said a link policy had to be native to import the site's `classifyLink`. A sandboxed
plugin cannot import repository code, but it does not have to: `core` is bundled into `dist/plugin.mjs` at
build time, so the plugin carries the rule itself. A native plugin would run with the site's full authority
and could not go to the registry; this needs one capability.

## Rules, and what the editor sees

`Not published: N problems need fixing.` then a numbered list, for example:

- `Block 6: the link address "javascript:alert(1)" is not allowed (only web, mail and phone links are). Use an https:// or http:// address, mailto: or tel:, a path starting with a single "/", or a "#section" anchor.`
- `Block 1: the link address "//evil.example" starts with "//", which can point to another site. Write the full https:// address instead.`
- `Block 1: the link address "/\evil.example" contains a space, backslash or hidden character. Remove it and paste the address again.`
- `Block 1: a link has no address. Add the address or remove the link.`

Own-host classification (internal vs external, for `target` and `rel`) is a render concern and not part of
this check, so the plugin needs no configuration.

## Build, test, publish later

```bash
pnpm plugins:build && pnpm test:plugins
```

Before publishing to a registry, fill the `license` and `publisher` TODOs in `emdash-plugin.jsonc`.
