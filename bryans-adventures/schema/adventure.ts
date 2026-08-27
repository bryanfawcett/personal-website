import { defineField, defineType } from 'sanity';

/**
 * The seven Mzizi minerals, in rail order.
 *
 * Mirrored from `src/brand/minerals.ts` in the site rather than imported: the
 * Studio is deliberately not part of the site's build and shares none of its
 * TypeScript config. Seven values that change roughly never is a cheaper
 * duplication than wiring the two builds together — but if a mineral is ever
 * added or renamed, both lists move.
 */
const MINERALS = [
  { title: 'Cobalt — digital future, trust', value: 'cobalt' },
  { title: 'Tanzanite — premium, creativity', value: 'tanzanite' },
  { title: 'Malachite — growth, nature', value: 'malachite' },
  { title: 'Gold — honey, rewards, warmth', value: 'gold' },
  { title: 'Terracotta — earth, community', value: 'terracotta' },
  { title: 'Sodalite — intelligence, depth', value: 'sodalite' },
  { title: 'Copper — connection, foundation', value: 'copper' },
];

export const adventure = defineType({
  name: 'adventure',
  title: 'Adventure',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The last part of the URL. Keep it short and stable — changing it breaks links.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: '中文', value: 'zh' },
        ],
        layout: 'radio',
      },
      initialValue: 'en',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'translationOf',
      title: 'Translation of',
      type: 'reference',
      to: [{ type: 'adventure' }],
      description:
        'The English adventure this is a translation of. Required on a Chinese adventure — it is what pairs the two, and without it the English one still shows to Chinese readers marked ENGLISH ONLY.',
      options: { filter: 'language == "en"' },
      hidden: ({ document }) => document?.['language'] !== 'zh',
      validation: (rule) =>
        rule.custom((value, context) => {
          const language = context.document?.['language'];
          if (language === 'zh' && !value) return 'A Chinese adventure needs the English one it translates.';
          if (language === 'en' && value) return 'Only a Chinese adventure sets this.';
          return true;
        }),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description: 'Sorts the list. Backdate freely — it is the date of the adventure, not of the writing.',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'place',
      title: 'Place',
      type: 'string',
      description: 'Where it happened — "Mana Pools, Zimbabwe". Shown as the dimension label under the title.',
      validation: (rule) => rule.max(80),
    }),

    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences for the list and for search results. If you leave it empty the page still works, but the card is just a title.',
      validation: (rule) => rule.max(300),
    }),

    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'What the picture shows, for a reader who cannot see it. Not a caption.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    defineField({
      name: 'mineral',
      title: 'Mineral',
      type: 'string',
      description:
        'The one hit of colour this adventure gets — the bar under its title. Unset uses cobalt.',
      options: { list: MINERALS },
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (rule) =>
                      rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
                  }),
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
    }),
  ],

  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],

  preview: {
    select: { title: 'title', language: 'language', date: 'publishedAt', media: 'cover' },
    prepare({ title, language, date, media }) {
      const when = typeof date === 'string' ? date.slice(0, 10) : 'no date';
      return {
        title: typeof title === 'string' ? title : 'Untitled',
        subtitle: `${language === 'zh' ? '中文' : 'English'} · ${when}`,
        media,
      };
    },
  },
});
