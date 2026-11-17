/**
 * Links in a Sanity post body: only web, mail, phone and on-site paths survive, and "this site"
 * means this exact host. Sanity text is untrusted input however trusted its editor is, and the
 * previous rule (a prefix test on the URL) let `javascript:` through and counted
 * `https://bryanfawcett.com.evil.example` as internal.
 */
import { classifyLink, renderBody } from '../src/sanity/portable-text.ts';

const cases = [
  // [href, expected]: null = dropped, otherwise { external }
  ['https://example.org/x', { external: true }],
  ['http://example.org', { external: true }],
  ['https://bryanfawcett.com/adventures', { external: false }],
  ['https://www.bryanfawcett.com/', { external: false }],
  ['https://bryanfawcett.com.evil.example/', { external: true }],
  ['https://evilbryanfawcett.com/', { external: true }],
  ['/adventures/x', { external: false }],
  ['#section', { external: false }],
  ['mailto:bryan@nyuchi.com', { external: false }],
  ['tel:+6512345678', { external: false }],
  ['//evil.example/x', null],
  ['javascript:alert(1)', null],
  ['JaVaScRiPt:alert(1)', null],
  ['java\tscript:alert(1)', null],
  [' javascript:alert(1)', null],
  ['data:text/html,<script>alert(1)</script>', null],
  ['vbscript:msgbox(1)', null],
  ['', null],
];

let bad = 0;
for (const [href, want] of cases) {
  const got = classifyLink(href);
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { bad++; console.error(`✗ ${JSON.stringify(href)} -> ${JSON.stringify(got)} (want ${JSON.stringify(want)})`); }
}

// End to end: a hostile link keeps its words and loses its anchor, and an attribute breakout is escaped.
const html = renderBody([
  { _type: 'block', _key: 'a', style: 'normal', markDefs: [{ _key: 'm', _type: 'link', href: 'javascript:alert(1)' }],
    children: [{ _type: 'span', _key: 's', text: 'click me', marks: ['m'] }] },
  { _type: 'block', _key: 'b', style: 'normal', markDefs: [{ _key: 'n', _type: 'link', href: 'https://x.example/"onmouseover="alert(1)' }],
    children: [{ _type: 'span', _key: 't', text: 'hover', marks: ['n'] }] },
]);
if (/javascript:/i.test(html) || !html.includes('click me')) { bad++; console.error('✗ hostile link rendered:', html); }
if (/"onmouseover=/.test(html)) { bad++; console.error('✗ attribute breakout:', html); }

if (bad) { console.error(`\n${bad} link-safety failure(s)`); process.exit(1); }
console.log(`link safety: ${cases.length} cases and the end-to-end render pass`);
