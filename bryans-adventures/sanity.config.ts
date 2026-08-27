import { defineConfig, type Template } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { documentInternationalization } from '@sanity/document-internationalization';

import { schemaTypes } from './schema';

/**
 * Bryan's Adventures — the blog behind bryanfawcett.com/adventures.
 *
 * The dataset is public-read, which is deliberate: the site reads it from a
 * Cloudflare Worker with no token, so there is no API secret anywhere in the
 * deploy. Everything in here is meant to be published; do not put anything in
 * this dataset that is not.
 */

/** The two languages the site renders. `id` is what lands in `language`. */
const LANGUAGES = [
  { id: 'en', title: 'English' },
  { id: 'zh', title: '中文' },
];

/** Every type the translations UI applies to. One, for now. */
const TRANSLATED_TYPES = ['adventure'];

/** English is what a translation is made *from*. */
const BASE_LANGUAGE = 'en';

export default defineConfig({
  name: 'default',
  title: "Bryan's Adventures",

  projectId: 'zsx9erk1',
  dataset: 'production',

  plugins: [
    /*
     * Document-level translations.
     *
     * A Chinese adventure is its own document, and the pairing lives in a
     * `translation.metadata` document the plugin maintains — not in a field on
     * either side. That is what gives the Studio a Translations menu, and what
     * lets an adventure exist in English alone, which is the normal case here.
     */
    documentInternationalization({
      supportedLanguages: LANGUAGES,
      schemaTypes: TRANSLATED_TYPES,
    }),

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

  schema: {
    types: schemaTypes,

    /*
     * A base-language template per translated type.
     *
     * A template that declares `parameters` is left out of the auto-generated
     * "New document" list, so it only appears because `newDocumentOptions`
     * below adds it back with the parameter supplied.
     */
    templates: (prev): Template[] => [
      ...prev,
      ...TRANSLATED_TYPES.map((schemaType) => ({
        id: `${schemaType}-${BASE_LANGUAGE}`,
        title: `${schemaType} (${BASE_LANGUAGE})`,
        schemaType,
        parameters: [{ name: 'language', type: 'string' }],
        value: ({ language }: { language: string }) => ({ language }),
      })),
    ],
  },

  document: {
    /*
     * Without this, "New document" creates an adventure with no `language`.
     *
     * The site's lists are built by filtering on `language`, so a document
     * missing it would appear in neither language and read as lost. Dropping
     * the auto-generated entries in favour of the base-language templates
     * above means every new adventure starts as English, and Chinese versions
     * are made from the Translations menu rather than from scratch.
     */
    newDocumentOptions: (prev) => [
      ...prev.filter((item) => !TRANSLATED_TYPES.includes(item.templateId)),
      ...TRANSLATED_TYPES.map((schemaType) => ({
        templateId: `${schemaType}-${BASE_LANGUAGE}`,
        parameters: { language: BASE_LANGUAGE },
      })),
    ],
  },
});
