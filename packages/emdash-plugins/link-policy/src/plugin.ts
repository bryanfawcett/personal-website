/**
 * Sandboxed plugin: refuses to publish (or schedule) an entry whose body links to anything other
 * than web, mail, phone, an on-site path or a fragment. Same rule the site applies again at render
 * time, from the same source (emdash-policy-core).
 */
import type { SandboxedPlugin } from 'emdash/plugin';

import { checkLinks, formatReason } from '../../core/src/index.ts';

function decide(content: Record<string, unknown>): { cancel: true; reason: string } | undefined {
  const data = (content['data'] && typeof content['data'] === 'object' ? content['data'] : {}) as Record<string, unknown>;
  const reason = formatReason(checkLinks(data['body']));
  return reason ? { cancel: true, reason } : undefined;
}

const plugin: SandboxedPlugin = {
  hooks: {
    'content:beforePublish': async (event) => decide(event.content),
    'content:beforeSchedule': async (event) => decide(event.content),
  },
};

export default plugin;
