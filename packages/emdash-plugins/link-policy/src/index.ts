import { fileURLToPath } from 'node:url';

import type { PluginDescriptor } from 'emdash';

/**
 * The descriptor `astro.config.mjs` registers. Config-time only: it is never bundled into the plugin.
 * `entrypoint` points at the built bundle, which has emdash-policy-core compiled into it.
 */
export function linkPolicy(): PluginDescriptor {
  return {
    id: 'link-policy',
    displayName: 'Link policy',
    description: 'Blocks publishing when a link is not http(s), mailto, tel, an on-site path or a fragment.',
    version: '0.1.0',
    format: 'standard',
    entrypoint: fileURLToPath(new URL('../dist/plugin.mjs', import.meta.url)),
    capabilities: ['hooks.content-policy:register'],
  };
}
