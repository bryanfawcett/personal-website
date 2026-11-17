import { fileURLToPath } from 'node:url';

import type { PluginDescriptor } from 'emdash';

/**
 * The descriptor `astro.config.mjs` registers. Config-time only: it is never bundled into the plugin.
 * `entrypoint` points at the built bundle, which has emdash-policy-core compiled into it.
 */
export function a11yPolicy(): PluginDescriptor {
  return {
    id: 'a11y-policy',
    displayName: 'Accessibility policy',
    description: 'Blocks publishing when an image has no alt text, headings are wrong, or link text says nothing.',
    version: '0.1.0',
    format: 'standard',
    entrypoint: fileURLToPath(new URL('../dist/plugin.mjs', import.meta.url)),
    capabilities: ['hooks.content-policy:register'],
  };
}
