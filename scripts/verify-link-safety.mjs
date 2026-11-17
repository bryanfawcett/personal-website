/**
 * Links in an adventure body: only web, mail, phone and on-site paths survive, and "this site"
 * means this exact host. CMS text is untrusted input however trusted its editor is, and the
 * previous rule (a prefix test on the URL) let `javascript:` through and counted
 * `https://bryanfawcett.com.evil.example` as internal.
 */
import { classifyLink, renderBody } from '../src/blog/portable-text.ts';

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
  ['/\\evil.example/x', null],
  ['/\t/evil.example', null],
  ['/\n/evil.example', null],
  ['\\\\evil.example', null],
  ['https://bryanfawcett.com\\@evil.example/', null],
  ['/path with space', null],
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

// The shared, language-neutral vectors (also run by packages/emdash-plugins). The site's wrapper must
// agree with core wherever the vector uses this site's own hosts, which is how the render path and the
// publish-time plugin are kept to one rule.
import { readFileSync } from 'node:fs';
import { classifyLink as classifyCore, linkProblem } from '../packages/emdash-plugins/core/src/index.ts';
const vectors = JSON.parse(readFileSync(new URL('../packages/emdash-plugins/core/vectors/link.json', import.meta.url), 'utf8'));
const SITE_HOSTS = ['bryanfawcett.com', 'www.bryanfawcett.com'];
for (const c of vectors.cases) {
  const hosts = c.input.ownHosts ?? [];
  const got = classifyCore(c.input.href, { ownHosts: hosts });
  if (JSON.stringify(got) !== JSON.stringify(c.expected.classify) || linkProblem(c.input.href) !== c.expected.problem) {
    bad++; console.error(`✗ vector "${c.name}": ${JSON.stringify(got)}`);
  }
  if (hosts.join() === SITE_HOSTS.join() && JSON.stringify(classifyLink(c.input.href)) !== JSON.stringify(c.expected.classify)) {
    bad++; console.error(`✗ site wrapper disagrees with vector "${c.name}"`);
  }
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
console.log(`link safety: ${cases.length} cases, ${vectors.cases.length} shared vectors and the end-to-end render pass`);
