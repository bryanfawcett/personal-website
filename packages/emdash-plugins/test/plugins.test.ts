/**
 * The BUILT plugins (dist/plugin.mjs, core compiled in) must agree with core on every shared vector.
 * This is what proves "one source, no drift": the artifact EmDash loads is the one under test.
 *
 *   node --experimental-strip-types --test packages/emdash-plugins/test/plugins.test.ts
 */
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formatReason } from '../core/src/index.ts';
import type { Finding } from '../core/src/index.ts';
import { a11yPolicy } from '../a11y-policy/src/index.ts';
import { linkPolicy } from '../link-policy/src/index.ts';
import { translationPolicy } from '../translation-policy/src/index.ts';

type Decision = { cancel: true; reason: string } | undefined;
type Hook = (event: unknown, ctx: unknown) => Promise<Decision>;
interface Plugin {
  hooks: Record<string, Hook>;
}

const here = (p: string) => new URL(p, import.meta.url);
const vectors = <T>(name: string): { cases: { name: string; input: T; expected: Record<string, unknown> }[] } =>
  JSON.parse(readFileSync(here(`../core/vectors/${name}.json`), 'utf8'));
const load = async (dir: string): Promise<Plugin> => (await import(here(`../${dir}/dist/plugin.mjs`).href)).default as Plugin;

const HOOKS = ['content:beforePublish', 'content:beforeSchedule'];

function expectedReason(findings: Finding[]): Decision {
  const reason = formatReason(findings);
  return reason ? { cancel: true, reason } : undefined;
}

test('a11y-policy: built bundle matches every accessibility vector, on publish and on schedule', async () => {
  const plugin = await load('a11y-policy');
  for (const hook of HOOKS)
    for (const c of vectors<{ body?: unknown; cover?: unknown }>('accessibility').cases) {
      const got = await plugin.hooks[hook]!({ content: { id: '1', data: c.input }, collection: 'adventures' }, {});
      assert.deepEqual(got, expectedReason(c.expected['findings'] as Finding[]), `${hook}: ${c.name}`);
    }
});

test('link-policy: built bundle matches every body-link vector', async () => {
  const plugin = await load('link-policy');
  for (const hook of HOOKS)
    for (const c of vectors<{ body?: unknown }>('body-links').cases) {
      const got = await plugin.hooks[hook]!({ content: { id: '1', data: c.input }, collection: 'adventures' }, {});
      assert.deepEqual(got, expectedReason(c.expected['findings'] as Finding[]), `${hook}: ${c.name}`);
    }
});

test('translation-policy: built bundle matches every translation vector (list paginated two at a time)', async () => {
  const plugin = await load('translation-policy');
  type Entry = { id: string; locale: string | null; slug: string | null; status: string };
  for (const hook of HOOKS)
    for (const c of vectors<{ entry: Entry; siblings: Entry[]; sameLocale: Entry[] }>('translation').cases) {
      const { entry, siblings, sameLocale } = c.input;
      const ctx = {
        content: {
          getTranslations: async () => ({ translationGroup: 'g', translations: [entry, ...siblings] }),
          list: async (_collection: string, opts: { cursor?: string; where?: { locale?: string } }) => {
            const start = Number(opts.cursor ?? 0);
            const items = sameLocale.slice(start, start + 2);
            const hasMore = start + 2 < sameLocale.length;
            return { items, hasMore, ...(hasMore ? { cursor: String(start + 2) } : {}) };
          },
        },
      };
      const event = { content: { ...entry, data: {} }, collection: 'adventures' };
      const got = await plugin.hooks[hook]!(event, ctx);
      assert.deepEqual(got, expectedReason(c.expected['findings'] as Finding[]), `${hook}: ${c.name}`);
    }
});

test('translation-policy fails closed when content:read is missing', async () => {
  const plugin = await load('translation-policy');
  const got = await plugin.hooks['content:beforePublish']!({ content: { id: '1', locale: 'zh', slug: 'a', status: 'draft', data: {} }, collection: 'adventures' }, {});
  assert.equal(got?.cancel, true);
  assert.match(got?.reason ?? '', /content:read/);
});

test('bundles are self-contained: no imports, no Node built-ins, no network', async () => {
  for (const dir of ['a11y-policy', 'link-policy', 'translation-policy']) {
    const text = readFileSync(here(`../${dir}/dist/plugin.mjs`), 'utf8');
    assert.ok(!/^\s*import\s/m.test(text), `${dir}: bundle has an import`);
    assert.ok(!/\brequire\(|node:|\bfetch\(|process\./.test(text), `${dir}: bundle reaches outside the sandbox`);
    assert.ok(/export\s*\{[^}]*as default|export default/.test(text), `${dir}: no default export`);
  }
});

test('descriptors declare exactly the capabilities in emdash-plugin.jsonc, and the hooks need them', async () => {
  const jsonc = (dir: string): { capabilities: string[]; slug: string; version: string } =>
    JSON.parse(readFileSync(here(`../${dir}/emdash-plugin.jsonc`), 'utf8').replace(/^\s*\/\/.*$/gm, ''));
  const pairs: [string, { id: string; version: string; capabilities?: string[]; format?: string }][] = [
    ['a11y-policy', a11yPolicy()],
    ['link-policy', linkPolicy()],
    ['translation-policy', translationPolicy()],
  ];
  for (const [dir, d] of pairs) {
    const m = jsonc(dir);
    assert.equal(d.id, m.slug, dir);
    assert.equal(d.version, m.version, dir);
    assert.deepEqual([...(d.capabilities ?? [])].sort(), [...m.capabilities].sort(), dir);
    assert.equal(d.format, 'standard', dir);
    // EmDash skips a policy hook that lacks this capability (and only logs a warning), so it is not optional.
    assert.ok(d.capabilities?.includes('hooks.content-policy:register'), dir);
  }
});
