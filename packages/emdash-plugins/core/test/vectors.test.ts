/**
 * Runs every language-neutral vector in ../vectors against the TypeScript rules. Another
 * implementation (a Rust crate, say) passes the same JSON files to be called equivalent.
 *
 *   node --experimental-strip-types --test test/
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  checkAccessibility,
  checkLinks,
  checkTranslations,
  classifyLink,
  formatReason,
  hreflangAlternates,
  linkProblem,
} from '../src/index.ts';

interface VectorFile<I, E> {
  readonly cases: readonly { readonly name: string; readonly input: I; readonly expected: E }[];
}

function load<I, E>(name: string): VectorFile<I, E> {
  return JSON.parse(readFileSync(new URL(`../vectors/${name}.json`, import.meta.url), 'utf8')) as VectorFile<I, E>;
}

test('link: classifyLink and linkProblem', () => {
  const v = load<{ href: string; ownHosts?: string[] }, { classify: { external: boolean } | null; problem: string | null }>('link');
  assert.ok(v.cases.length >= 40);
  for (const c of v.cases) {
    assert.deepEqual(classifyLink(c.input.href, { ownHosts: c.input.ownHosts ?? [] }), c.expected.classify, c.name);
    assert.equal(linkProblem(c.input.href), c.expected.problem, c.name);
  }
});

test('accessibility: checkAccessibility', () => {
  const v = load<{ body?: unknown; cover?: unknown }, { findings: unknown[] }>('accessibility');
  for (const c of v.cases) assert.deepEqual(checkAccessibility(c.input), c.expected.findings, c.name);
});

test('body links: checkLinks', () => {
  const v = load<{ body?: unknown }, { findings: unknown[] }>('body-links');
  for (const c of v.cases) assert.deepEqual(checkLinks(c.input.body), c.expected.findings, c.name);
});

test('translation: checkTranslations', () => {
  const v = load<Parameters<typeof checkTranslations>[0], { findings: unknown[] }>('translation');
  for (const c of v.cases) assert.deepEqual(checkTranslations(c.input), c.expected.findings, c.name);
});

test('hreflang: hreflangAlternates', () => {
  const v = load<{ entry: never; siblings: never[]; defaultLocale: string }, { alternates: unknown[] }>('hreflang');
  for (const c of v.cases) assert.deepEqual(hreflangAlternates(c.input.entry, c.input.siblings, c.input.defaultLocale), c.expected.alternates, c.name);
});

test('reason: formatReason', () => {
  const v = load<{ findings: Parameters<typeof formatReason>[0] }, { reason: string }>('reason');
  for (const c of v.cases) {
    assert.equal(formatReason(c.input.findings), c.expected.reason, c.name);
    assert.ok([...c.expected.reason].length <= 500, c.name);
  }
});

test('messages are for editors: every finding names a fix and none leaks markup', () => {
  for (const file of ['accessibility', 'body-links', 'translation']) {
    const v = load<unknown, { findings: { message: string }[] }>(file);
    for (const c of v.cases)
      for (const f of c.expected.findings) {
        assert.ok(f.message.length > 30, `${file}/${c.name}: message too thin`);
        assert.ok(/[.!]$/.test(f.message), `${file}/${c.name}: message should end as a sentence`);
        assert.ok(!/[<>]/.test(f.message.replace(/&lt;|&gt;/g, '')) || file === 'body-links', `${file}/${c.name}: message carries markup`);
      }
  }
});
