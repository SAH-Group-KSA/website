# Brand theming (developer guide)

How SAH Group and company color themes work in this codebase, and how to change or add one without breaking chrome, FOUC, or multi-brand accents.

## Mental model

| Layer | Role |
| --- | --- |
| **Group (`:root`)** | Default palette on parent/marketing pages with no `data-theme`. |
| **Company (`html[data-theme]`)** | Full-page skin for that company’s routes. |
| **Entity accents** | Spot colors when several brands appear on one page (orbit, cards, program bars). |

Route → theme is resolved in TypeScript (`BrandTheme` + FOUC script). Colors for the skin are CSS variables. Accents for multi-brand UI come from a small TS registry.

```
URL path
  → resolveBrandTheme / FOUC script
  → document.documentElement[data-theme="human"|…]
  → src/styles/brand-themes.css overrides --brand-* and --deep/--gold/…
  → shared UI (header, buttons, sections) picks up vars automatically
```

Group home: **no** `data-theme` attribute.

## Files to know

| File | Purpose |
| --- | --- |
| [`COLOR_PALETTE.md`](../COLOR_PALETTE.md) | Official brand sheets (hex names / roles). Do not invent colors outside these sheets. |
| [`src/lib/brand-themes.ts`](../src/lib/brand-themes.ts) | TS registry: `ENTITY_UI_COLORS`, FOUC slug map helper, `GROUP_THEME_COLOR`. |
| [`src/lib/companies.ts`](../src/lib/companies.ts) | `COMPANY_ROUTES` (slug ↔ entity id). Source for the FOUC map. |
| [`src/styles/design-tokens.css`](../src/styles/design-tokens.css) | Group `:root` tokens + shared semantic/type/space. |
| [`src/styles/brand-themes.css`](../src/styles/brand-themes.css) | Per-company `html[data-theme="…"]` skins + dark-band helpers. |
| [`src/components/layout/BrandTheme.tsx`](../src/components/layout/BrandTheme.tsx) | Client sync of `data-theme` on navigation. |
| [`src/app/[locale]/layout.tsx`](../src/app/[locale]/layout.tsx) | Inline FOUC script (uses `getCompanyThemeSlugMap()`). |

`getContent()` applies `ENTITY_UI_COLORS` onto `entityColors` / `entities[].color`, so locale JSON hex cannot drift from the registry.

## Theme ids

| Brand | Theme id | Example routes |
| --- | --- | --- |
| SAH Group | *(none — `:root`)* | `/`, shared parent pages |
| SAH Human | `human` | `/sah-human`, `/coaches`, `/courses` |
| SEERA | `seera` | `/seera` |
| SAH Nexus | `nexus` | `/sah-nexus` |
| SAH Sponsor | `connect` | `/sah-sponsor` |
| LEGO by SAH | `lego` | `/lego-by-sah` |
| SAH Impact | `impact` | `/sah-impact` |

Program detail pages (`/program/[id]`) inherit the program’s `entity` field as the theme id.

## Change an existing company’s colors

1. **Update the sheet** in `COLOR_PALETTE.md` (keep names/roles honest).
2. **Edit the skin** in `src/styles/brand-themes.css` under `html[data-theme="<id>"]`:
   - Change `--brand-*` sheet tokens first.
   - Semantic UI (`--deep`, `--gold`, `--cream`, …) should stay as `var(--brand-…)` wherever possible so one edit flows through.
   - If the theme uses dark-band contrast (`--on-dark-*`), update those to other sheet tokens — not random hex.
3. **Sync the accent registry** in `src/lib/brand-themes.ts` → `ENTITY_UI_COLORS.<id>` (usually the UI primary; Sponsor uses Dark Slate `#2B2F36`).
4. **Sync `:root` entity accents** in `design-tokens.css` (`--human`, `--seera`, …) so Tailwind `entity-*` and orbit/card CSS match.
5. Spot-check:
   - Company homepage (header, hero, CTAs, footer)
   - Group homepage accents for that brand
   - A `/program/…` owned by that entity
   - Hard refresh (FOUC script) and client navigation

You do **not** need to edit the FOUC map by hand when only colors change.

Optional: hex values inside `home.json` `entityColors` / `entities[].color` are overwritten at runtime by `applyCanonicalEntityColors`. Prefer updating `ENTITY_UI_COLORS` only; keep JSON roughly aligned for CMS readability.

## Add a new company theme

1. Add the route to `COMPANY_ROUTES` in `src/lib/companies.ts` (`entityId`, `slug`, `seoKey`).
2. Extend types (`EntityId` / `CompanyEntityId`) and content (`entityPages`, SEO keys, nav) as for any new company page.
3. Add `ENTITY_UI_COLORS.<id>` and `:root { --<id>: … }` in `design-tokens.css`.
4. Add `html[data-theme="<id>"] { … }` in `brand-themes.css` (copy a similar brand; set `--hero-media-image` if using the shared hero-media gradient).
5. If dark surfaces need softer CTAs, set `--on-dark-*` on that theme (Seera / Nexus / Impact pattern). LEGO-style gold-led chrome usually needs bespoke overrides — keep them in the LEGO section or a clearly marked block.
6. Document the sheet in `COLOR_PALETTE.md`.
7. FOUC + `BrandTheme` pick up the new slug automatically from `COMPANY_ROUTES`.

## CSS variable conventions

| Prefix / name | Meaning |
| --- | --- |
| `--brand-*` | Sheet colors for the active theme. |
| `--deep`, `--gold`, `--cream`, … | Semantic UI used by components. Prefer mapping from `--brand-*`. |
| `--on-dark-*` | Contrast tokens for hero / footer / dark sections (optional per theme). |
| `--hero-media-image` | Background image URL for shared company hero media gradient. |
| `--human`, `--seera`, … | Fixed entity accents on `:root` for multi-brand UI (not swapped by `data-theme`). |

**Hard rule:** every color is a sheet hex or `color-mix` / opacity of a token. No off-palette reds or invented greens.

Do **not** rename public semantic tokens (`--deep`, `--gold`, …) without a full CSS audit — live UI and Tailwind both depend on them.

## What not to do

- Do not hardcode a second slug→theme map in `layout.tsx` (use `getCompanyThemeSlugMap()`).
- Do not put company skin hex only in JSON and skip `brand-themes.css` — full-page chrome will not change.
- Do not invent hex outside `COLOR_PALETTE.md`.
- Do not rely on React context for brand color; `data-theme` + CSS variables is the supported model (SSR + FOUC friendly).

## Related docs

- [`COLOR_PALETTE.md`](../COLOR_PALETTE.md) — brand sheets
- [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) — tokens, type, components (Group defaults)
