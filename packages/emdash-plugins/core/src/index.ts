export type { Finding, EntryRef, PtBlock, PtSpan, PtMarkDef } from './types.ts';
export { classifyLink, linkProblem, linkFinding } from './link.ts';
export type { LinkOptions, LinkProblem } from './link.ts';
export { checkAccessibility, VAGUE_LINK_TEXT } from './a11y.ts';
export type { A11yInput } from './a11y.ts';
export { checkLinks } from './body-links.ts';
export { checkTranslations, hreflangAlternates } from './translation.ts';
export type { TranslationInput, Alternate } from './translation.ts';
export { formatReason, MAX_REASON_LENGTH } from './reason.ts';
