/**
 * Sandboxed plugin: refuses to publish (or schedule) an entry whose body or cover breaks the
 * accessibility rules. The rules live in emdash-policy-core; this file only adapts EmDash's event
 * and decision shapes to them.
 */
import type { SandboxedPlugin } from 'emdash/plugin';

import { checkAccessibility, formatReason } from '../../core/src/index.ts';

function decide(content: Record<string, unknown>): { cancel: true; reason: string } | undefined {
  const data = (content['data'] && typeof content['data'] === 'object' ? content['data'] : {}) as Record<string, unknown>;
  const findings = checkAccessibility({ body: data['body'], cover: data['cover'] });
  const reason = formatReason(findings);
  return reason ? { cancel: true, reason } : undefined;
}

const plugin: SandboxedPlugin = {
  hooks: {
    'content:beforePublish': async (event) => decide(event.content),
    'content:beforeSchedule': async (event) => decide(event.content),
  },
};

export default plugin;
