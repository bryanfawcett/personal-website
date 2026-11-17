import { fileURLToPath } from 'node:url';

import type { PluginDescriptor } from 'emdash';

/**
 * The descriptor `astro.config.mjs` registers. Config-time only: it is never bundled into the plugin.
 * `entrypoint` points at the built bundle, which has emdash-policy-core compiled into it.
 */
export function translationPolicy(): PluginDescriptor {
  return {
    id: 'translation-policy',
    displayName: 'Translation policy',
    description: 'Blocks publishing a translation without a published source entry, or a slug already used in that language.',
    version: '0.1.0',
    format: 'standard',
    entrypoint: fileURLToPath(new URL('../dist/plugin.mjs', import.meta.url)),
    capabilities: ['hooks.content-policy:register', 'content:read'],
  };
}
