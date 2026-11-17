/**
 * Builds each policy plugin into one self-contained ES module, with emdash-policy-core compiled in.
 *
 * A sandboxed plugin cannot import repository code, so the shared rules are bundled into it at build
 * time: one source, no copy to drift. `dist/` is committed (Cloudflare's build does not run this), and
 * `--check` rebuilds in memory and fails when a committed bundle is stale.
 *
 *   node packages/emdash-plugins/build.mjs [--check]
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { build } from 'esbuild';

const ALL = ['a11y-policy', 'link-policy', 'translation-policy'];
const named = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const PLUGINS = named.length ? named : ALL;
const check = process.argv.includes('--check');
let stale = 0;

for (const name of PLUGINS) {
  const dir = new URL(`./${name}/`, import.meta.url);
  const result = await build({
    entryPoints: [new URL('src/plugin.ts', dir).pathname],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    minify: false,
    legalComments: 'none',
    logLevel: 'warning',
    outfile: 'plugin.mjs',
  });
  const text = result.outputFiles[0].text;
  const file = new URL('dist/plugin.mjs', dir);
  if (check) {
    const have = existsSync(file) ? readFileSync(file, 'utf8') : '';
    if (have !== text) {
      stale++;
      console.error(`stale: packages/emdash-plugins/${name}/dist/plugin.mjs (run: pnpm plugins:build)`);
    }
  } else {
    mkdirSync(new URL('dist/', dir), { recursive: true });
    writeFileSync(file, text);
    console.log(`built ${name}: ${text.length} bytes`);
  }
}
if (stale) process.exit(1);
if (check) console.log(`plugins: ${PLUGINS.length} bundles are current`);
