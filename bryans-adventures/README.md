# Bryan's Adventures — Sanity Studio

The editing surface for the blog at [bryanfawcett.com/adventures](https://bryanfawcett.com/adventures).

The folder is the Studio itself — `sanity.config.ts` is right here, not one
level down. It is named for the Sanity project it edits rather than `studio/`,
without the apostrophe and space: a path containing either is a reliable way to
break a shell script, a CI runner or a Windows checkout.

This directory is **not part of the site build**. It is a Sanity Studio, which
means React, which the site itself does not have and should not get. It keeps
its own `package.json` and its own lockfile, the root `tsconfig.json` excludes
it, and there is no pnpm workspace file — so `pnpm install` and `pnpm build` at
the repo root never see it. Cloudflare's build never installs it either.

It lives here rather than in its own repo so the schema and the code that reads
it move together: change a field here and the query in `src/sanity/queries.ts`
is one directory away, in the same commit and the same review.

## Working on it

```bash
cd bryans-adventures
npm install
npm run dev            # Studio at localhost:3333
npm run deploy         # publishes to bryans-adventures.sanity.studio
npm run deploy-schema  # pushes the schema so agent tooling can read it
```

`npm run deploy` is what gives you the hosted Studio you write in. You only need
to re-run it when the schema changes, not when you write a post.

## The content model

One document type, `adventure`. Everything else is a field on it.

Translations are **document-level**, run by
[`@sanity/document-internationalization`](https://github.com/sanity-io/plugins/tree/main/plugins/%40sanity/document-internationalization).
A Chinese adventure is its own document; the pairing lives in a
`translation.metadata` document the plugin maintains, not in a field on either
side.

In practice: write the adventure in English, **publish it**, then use the
**Translations** menu on the document to create the Chinese version. Publish
that too — the site reads the published perspective, so an unpublished
translation simply does not appear.

That model is what lets a post exist in English only, which is the normal case:
the site lists an untranslated post to Chinese readers with an `仅有英文` label
rather than hiding it. Don't translate in place by editing the English
document, and don't hand-edit the `language` field — the plugin owns it, and
changing it by hand orphans the document from its translation group.

`mineral` picks one of the seven Mzizi minerals from the rail down the edge of
every page. It is the one hit of colour an adventure gets — the bar under its
title in the list and on the page. Leave it unset and the entry uses cobalt.
