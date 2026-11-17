/**
 * A Node resolve hook: the site's TypeScript imports its own files as `./x.js` (the `strictest`
 * config's NodeNext spelling) while the file on disk is `./x.ts`. Node's type stripping does not
 * map one to the other, so this does, letting a script import `src/` without a bundler.
 */
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (specifier.startsWith('.') && specifier.endsWith('.js')) {
      return next(specifier.replace(/\.js$/, '.ts'), context);
    }
    throw error;
  }
}
