import type { Finding } from './types.ts';

/** EmDash refuses a policy reason longer than this many code points. */
export const MAX_REASON_LENGTH = 500;

/**
 * One message for the editor out of many findings: a count, then a numbered list, cut to fit the
 * host's limit with an honest "and N more". Only errors are listed; warnings never block.
 */
export function formatReason(findings: readonly Finding[]): string {
  const errors = findings.filter((f) => f.severity === 'error');
  if (errors.length === 0) return '';
  const head = `Not published: ${errors.length} ${errors.length === 1 ? 'problem needs' : 'problems need'} fixing.`;
  const lines: string[] = [];
  let used = [...head].length;
  for (let i = 0; i < errors.length; i++) {
    const rest = errors.length - i;
    const line = `${i + 1}. ${(errors[i] as Finding).message}`;
    const cost = 1 + [...line].length;
    const reserve = rest > 1 ? 1 + [...`...and ${rest - 1} more.`].length : 0;
    if (used + cost + reserve > MAX_REASON_LENGTH) {
      if (lines.length === 0) {
        // A single message longer than the limit: cut it, never drop it.
        const room = MAX_REASON_LENGTH - used - 2 - (rest > 1 ? 1 + [...`...and ${rest - 1} more.`].length : 0);
        lines.push(`${[...line].slice(0, Math.max(room, 0)).join('').trimEnd()}…`);
        if (rest > 1) lines.push(`...and ${rest - 1} more.`);
      } else {
        lines.push(`...and ${rest} more.`);
      }
      return [head, ...lines].join('\n');
    }
    lines.push(line);
    used += cost;
  }
  return [head, ...lines].join('\n');
}
