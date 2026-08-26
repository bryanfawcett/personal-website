/**
 * Let plain `node --experimental-strip-types` load the site's TypeScript.
 *
 * Source files import each other with a `.js` specifier (`./minerals.js`),
 * which is what TypeScript's ESM resolution asks for and what Astro's bundler
 * understands. Node's type stripping does no such rewriting, so it goes
 * looking for a `.js` file that was never emitted. This hook retries a failed
 * relative `.js` resolution as `.ts`.
 *
 *   node --import ./scripts/ts-specifier-hook.mjs scripts/build-og-card.mjs
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register(
  new URL(
    'data:text/javascript,' +
      encodeURIComponent(`
        export async function resolve(specifier, context, next) {
          try {
            return await next(specifier, context);
          } catch (error) {
            if (specifier.startsWith('.') && specifier.endsWith('.js')) {
              return next(specifier.slice(0, -3) + '.ts', context);
            }
            throw error;
          }
        }
      `),
  ),
  pathToFileURL('./'),
);
