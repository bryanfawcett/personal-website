import { linkFinding } from './link.ts';
import { blocks } from './pt.ts';
import type { Finding } from './types.ts';

/** Unsafe link addresses in a body. Separate from the accessibility rules so each plugin owns one concern. */
export function checkLinks(body: unknown): Finding[] {
  const out: Finding[] = [];
  blocks(body).forEach((block, i) => {
    (block.markDefs ?? []).forEach((def, j) => {
      if (def._type !== 'link') return;
      const href = typeof def.href === 'string' ? def.href : '';
      const f = linkFinding(href, `body[${i}].markDefs[${j}]`, `Block ${i + 1}`);
      if (f) out.push(f);
    });
  });
  return out;
}
