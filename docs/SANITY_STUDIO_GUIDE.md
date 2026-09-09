# Sanity Studio editor guide

## Document types

| Document | Purpose | Locales |
|----------|---------|---------|
| **Site settings** | Nav, footer, mega menu, entities, contact labels, UI chrome | EN + AR (Translations tab) |
| **Marketing site** (`homePage`) | Homepage sections, discovery wizard, community, catalog page copy | EN + AR |
| **Page SEO** | Per-route `<title>` / meta | EN + AR per `pageKey` |
| **Company pages** | SAH Human, SEERA, Nexus, etc. | EN + AR per entity |
| **Programs** | Program catalog entries | EN + AR per program |
| **Coach** / **Course** | Bilingual fields on one doc (no Translations tab) | `en` / `ar` sub-fields |

## Where to edit what

- **Header, footer, mega menu** → Site settings
- **Homepage hero, sections, FAQ** → Marketing site → Homepage sections
- **`/discovery`** → Marketing site → Discovery
- **`/community/apply`** → Marketing site → Community → apply page fields
- **`/coaches`, `/coaches/group`, `/courses`, coach profile labels** → Marketing site → Catalog pages
- **Coaches & courses data** → Coaches / Courses documents

## Publishing

1. Edit **both** EN and AR siblings (Translations tab on localized documents).
2. Publish both locales — validation warns if only one side is published.
3. Set **Published** off to fall back to static JSON for that document slice.

## After re-seeding

```bash
npm run seed:marketing -- --force
```

Then in Studio: publish EN + AR for Site settings and Marketing site. If fields look empty, check for a stale **draft** (discard draft rather than publishing empty content over good published data).

## Webhooks

Revalidation tags: `site-settings`, `home`, `seo`, `companies`, `programs`, `coaches`, `courses`. Add `siteSettings` to the Sanity webhook filter when configuring ISR.
