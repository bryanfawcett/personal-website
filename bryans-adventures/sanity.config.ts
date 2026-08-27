import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { schemaTypes } from './schema';

/**
 * Bryan's Adventures — the blog behind bryanfawcett.com/adventures.
 *
 * The dataset is public-read, which is deliberate: the site reads it from a
 * Cloudflare Worker with no token, so there is no API secret anywhere in the
 * deploy. Everything in here is meant to be published; do not put anything in
 * this dataset that is not.
 */
export default defineConfig({
  name: 'default',
  title: "Bryan's Adventures",

  projectId: 'zsx9erk1',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Adventures')
          .items([
            S.listItem()
              .title('English')
              .child(
                S.documentList()
                  .title('English')
                  .filter('_type == "adventure" && language == "en"')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
              ),
            S.listItem()
              .title('中文')
              .child(
                S.documentList()
                  .title('中文')
                  .filter('_type == "adventure" && language == "zh"')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: { types: schemaTypes },
});
