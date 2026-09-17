# CLAUDE.md

Guidance for Claude Code (and any other AI agent) working in this repository.

## Project Purpose

SAH Group marketing/platform website — a bilingual (Arabic/English) hybrid multi-page site
presenting SAH Group's sub-brands/entities (coaching, courses, programs, community) with lead
capture, planned authenticated dashboard, and planned bookings/payments. The site is mid-migration
from a static-content prototype toward a fully CMS- and backend-integrated platform. Most backend
integrations are scaffolded behind feature flags but not yet live in production — treat this as a
**static-content marketing site today**, not a fully wired platform, unless a specific flag/env var
says otherwise.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS 3, CSS custom properties as the source of truth for design tokens
- **i18n**: `next-intl` v4 (Arabic default, English secondary)
- **CMS**: Sanity v6 (`next-sanity`, embedded Studio at `/studio`)
- **Backend/Auth**: Supabase (Postgres + Auth, `@supabase/ssr`)
- **CRM/Lead capture/Newsletter/Bookings/Chat**: Zoho One (CRM, Campaigns, Bookings, SalesIQ)
- **Payments (planned)**: Moyasar (cards/mada/Apple Pay) + Tamara (BNPL) — **not Stripe**
- **Video (planned)**: Mux, via `sanity-plugin-mux-input`
- **Validation**: Zod
- **Animation**: `motion`
- **Tooling**: ESLint (flat config, `eslint-config-next` + Prettier), Prettier, `tsx` for scripts

## Architecture Overview

- App Router with a single localized tree: all public pages live under `src/app/[locale]/**`.
- There is **no `middleware.ts`** — Next.js 16 uses `src/proxy.ts` instead. This is where locale
  routing side effects, dashboard "not ready" redirects, and Supabase auth guarding happen.
- Content resolution is centralized in `src/content/index.ts`. Pages call functions like
  `getContent`, `getPageSeo`, `getCoaches`, `getCourses`, `getProgramById` — these functions
  internally branch on the `FEATURE_CMS` flag to either read static JSON/TS records
  (`src/content/{ar,en}/**`, `src/content/catalog/**`) or fetch from Sanity
  (`src/lib/sanity.ts` GROQ queries + `src/content/mappers/**`). **Do not fetch Sanity or static
  content directly from a page/component — always go through `src/content/index.ts`.**
- Adapters (`src/adapters/**`) wrap all external services (Supabase, Zoho, payments, video,
  analytics) behind a shared `AdapterResult` discriminated union
  (`{ ok: true, ... } | { ok: false, code, message }`), and each adapter checks its own feature
  flag before doing real work.
- `src/domain/**` holds plain TypeScript types only — no business logic/classes.

## Directory Conventions

| Path | Contents |
|---|---|
| `src/app/[locale]/**` | Localized public routes (home, coaches, courses, company, dashboard, auth, community, discovery, program) |
| `src/app/api/**` | Route handlers (Zoho lead routes, newsletter, auth onboard/profile, Sanity revalidate webhook) |
| `src/app/auth/**`, `src/app/studio/**` | Non-localized routes: Supabase auth callback, embedded Sanity Studio |
| `src/content/**` | Static bilingual content, catalog records, Sanity→domain mappers, SEO content — the single content-resolution layer |
| `src/sanity/**` | Sanity schemas, Studio config, i18n plugin wiring |
| `src/adapters/**` | External service wrappers (`supabase/`, `zoho/`, `payments/`, `video/`, `analytics/`) |
| `src/domain/**` | Types-only domain models (lead, money, coach, course) |
| `src/lib/**` | Cross-cutting utilities: `features.ts`, `seo.ts`, `sanity.ts`, `supabase*.ts`, `zoho.ts`, `onboard-user.ts`, `dashboard-availability.ts`, `email.ts` |
| `src/components/**` | UI, grouped by domain (`ui/`, `sections/`, `layout/`, `entities/`, `interactions/`, `journey/`, `method/`, `programs/`, `forms/`, `auth/`, `coaches/`, `courses/`, `dashboard/`, `discovery/`, `community/`, `company/`, `seo/`) |
| `src/i18n/**` | `next-intl` routing config and request config |
| `src/styles/**` | Design tokens and prototype-parity CSS, loaded in a fixed order (see Styling Conventions) |
| `messages/{ar,en}.json` | `next-intl` UI copy — **separate from** `src/content/{ar,en}/**`, which holds page/marketing content and SEO. Keep both in sync manually when adding user-facing strings; there is no automated check for drift. |
| `supabase/migrations/**` | Postgres schema (currently only `profiles`) |
| `scripts/**` | One-off Sanity seed/migration/sync scripts (`tsx`-run) |
| `docs/**`, root `*.md` | Planning/architecture docs — **see caveat below, not all still authoritative** |

## Routing Conventions

- Arabic is the default, unprefixed locale: `/` serves Arabic content via an internal rewrite to
  `/ar` (`next.config.ts` `rewrites()`); the literal `/ar` path itself permanently redirects back
  to `/` (`redirects()`) so `/ar` never appears as a canonical URL.
- English is prefixed: `/en/...`.
- Locale detection is intentionally **disabled** (`localeDetection: false` in
  `src/i18n/routing.ts`) — do not re-enable without discussing, since it was a deliberate choice.
- There is no `next-intl` middleware; locale handling is done by the `[locale]` App Router segment
  plus the rewrites/redirects above. Any new top-level route must go under `src/app/[locale]/**`
  to stay in this scheme — a route added directly under `src/app/` (outside `[locale]`) will not
  get locale handling and may collide with the locale-matching logic.
- `/studio`, `/dashboard/**`, `/auth/**` are excluded from the sitemap and disallowed in
  `robots.ts`.

## English / Arabic Localization

- Two parallel content systems — know which one to touch:
  1. `messages/{ar,en}.json` — UI chrome strings (nav, buttons, generic labels), consumed via
     `next-intl`'s `useTranslations`/`getMessages`.
  2. `src/content/{ar,en}/*.json` + `src/content/catalog/**` — structured page/marketing content
     and SEO metadata, resolved through `src/content/index.ts`.
- When adding a new user-facing string, add it to **both** the correct locale files, in both
  languages, in the same request/PR. There is no automated parity check between `ar.json` and
  `en.json`, or between the two content systems.
- Coach/course Sanity documents use inline bilingual fields (e.g. `name.en`/`name.ar`) rather than
  paired localized documents — unlike `homePage`, `siteSettings`, `pageSeo`, `companyPage`, and
  `program`, which use the `documentInternationalization` plugin. This is intentional; don't
  "fix" it to match the other types without confirming with the team first.

## RTL Requirements

- `dir` is set on `<html>` in `src/app/[locale]/layout.tsx` from a `localeDirections` map
  (`ar: "rtl"`, `en: "ltr"`) — this is the only mechanism driving RTL; there is no middleware or
  build-time RTL logic.
- Prefer CSS logical properties (`margin-inline-start`, `text-align: start`, etc.) over
  physical ones (`margin-left`, `text-align: left`) in new styles so they flip correctly under
  `dir="rtl"`. Before shipping new UI, verify it visually in both `/` (Arabic/RTL) and `/en`
  (English/LTR).
- A small inline script in `src/app/[locale]/layout.tsx` sets `data-theme` (sub-brand theme) on
  `<html>` pre-hydration based on the pathname, to avoid a flash of the wrong brand color — this
  is unrelated to RTL but lives in the same file; don't conflate the two when editing.

## Sanity Architecture

- Client + all GROQ queries live in `src/lib/sanity.ts` (`useCdn: false` deliberately — comment
  notes the CDN can serve stale cleared fields). `apiVersion` is pinned; bump deliberately.
- Schemas: `src/sanity/schemas/**` — `coach`, `course`, `homePage`, `companyPage`, `siteSettings`,
  `pageSeo`, `documentLocalePair`, plus shared field objects under `objects/`
  (`localeString`/`localeText`/`localeStringArray`/`localePortableText`,
  `marketingPrimitives.ts`, `marketingSections.ts`).
- Studio config: `src/sanity/sanity.config.ts` — `structureTool`, `muxInput` (video), and
  `documentInternationalization` scoped to `["homePage","siteSettings","pageSeo","companyPage","program"]`
  only (see localization note above for why `coach`/`course` are excluded).
- Content resolution: `FEATURE_CMS=0` (default) serves static JSON/TS content;
  `FEATURE_CMS=1` serves Sanity, mapped into the same shapes via `src/content/mappers/**` so
  downstream components are CMS-agnostic. Even in CMS mode, `catalogPages` and some chrome
  fallback labels are still merged from static defaults (`mergeFilled` in `src/content/index.ts`)
  — this is a deliberate partial hybrid, not a bug.
- Revalidation: Sanity publish webhook → `POST /api/revalidate?secret=...` → `revalidateTag` per
  a `_type`→tag map. Unknown `_type`s return 200 to avoid webhook retry storms. Don't remove the
  secret check.
- Seed/migration scripts (`scripts/*.mts`) are one-time or occasionally-rerun tools, not part of
  the build. `sync-sanity-datasets.mts` is **destructive** (deletes and recreates the target
  dataset) — never run it against `production` without explicit confirmation from me, and it must
  never be wired into CI or any automated pipeline.

## Supabase Usage

- Three client factories, each scoped to its context — use the matching one, don't mix them:
  - `src/lib/supabase.ts` — browser client (anon key)
  - `src/lib/supabase-server.ts` (`"server-only"`) — server client for Server Components/route
    handlers (user-scoped, cookie-based), plus `createSupabaseAdminClient()` (service-role key,
    no session) for privileged writes only
  - `src/lib/supabase-middleware.ts` — client for `src/proxy.ts`
- Schema: only one table exists today, `profiles` (`supabase/migrations/001_profiles.sql`), RLS
  enabled with self-read/self-update policies only. There are **no `bookings`/`courses`/`orders`
  tables** — those domains are currently Zoho-backed, not modeled in Postgres. Do not assume a
  table exists; check `supabase/migrations/**` first.
- All Supabase reads/writes are gated by `FEATURE_AUTH`; when the flag is off, auth adapter calls
  short-circuit to `not_configured`.

## Authentication Flow

1. **Sign up / log in** (`src/components/auth/**`) call `signUp`/`signIn` in
   `src/adapters/supabase/auth.ts`. Sign-up sets `emailRedirectTo` to
   `/auth/callback?next=...` and stores `full_name`/`locale` in user metadata.
2. **Server callback** (`src/app/auth/callback/route.ts`) exchanges a PKCE `code` or OTP
   `token_hash`. If neither is present (hash-fragment tokens, unreadable server-side), it redirects
   to `/auth/callback/complete` for client-side completion.
3. **Client callback** (`src/app/auth/callback/complete/page.tsx`) finishes the exchange from URL
   hash params and also triggers onboarding.
4. **Onboarding** (`src/lib/onboard-user.ts`) upserts the `profiles` row via the admin client and
   creates a Zoho CRM contact if Zoho is configured — idempotent, safe to call more than once.
5. **Profile updates** (`POST /api/auth/profile`) validate with Zod, explicitly block email
   changes (email is owned by `auth.users`), update Supabase user metadata + `profiles`, then sync
   to Zoho CRM.
6. **Route guarding** happens in `src/proxy.ts`: unauthenticated users are redirected away from
   `/dashboard/**` (only when `FEATURE_AUTH=1`); logged-in users are redirected away from
   guest-only auth pages.
7. **Dashboard availability**: regardless of auth state, `src/lib/dashboard-availability.ts`
   hard-redirects `/dashboard`, `/dashboard/courses`, and `/dashboard/bookings` back to the
   homepage — only `/dashboard/profile` is considered "ready." Don't remove this gating without
   confirming the underlying features are actually ready to ship.

## External Integrations

| Integration | Status | Notes |
|---|---|---|
| Sanity CMS | Scaffolded, flag-gated (`FEATURE_CMS`) | See Sanity Architecture above |
| Supabase Auth | Most complete integration, flag-gated (`FEATURE_AUTH`) | PKCE + OTP + hash fallback |
| Zoho CRM | Working, flag-gated (`FEATURE_ZOHO_FORMS`) | Powers all lead-capture routes (`contact`, `group`, `discovery`, `program`, `community`) via `src/app/api/zoho/_helpers.ts`. Despite the flag name, no actual "Zoho Forms" product is used — it posts straight to CRM. |
| Zoho Campaigns | Working, flag-gated (`FEATURE_NEWSLETTER`) | Newsletter signup (`POST /api/newsletter`) |
| Zoho Bookings | **Stubbed — not implemented** | `src/adapters/zoho/bookings.ts` returns `not_configured` unconditionally regardless of `FEATURE_BOOKINGS` |
| Zoho SalesIQ | Scaffolded, flag-gated (`FEATURE_SALESIQ`) | Chat widget |
| Moyasar / Tamara payments | **Stubbed — not implemented** | `src/adapters/payments/**` returns `not_configured` unconditionally regardless of `FEATURE_CHECKOUT`. Comment explicitly forbids introducing Stripe. |
| Mux video | Scaffolded, flag-gated (`FEATURE_VIDEO`) | Via `sanity-plugin-mux-input`; course GROQ query resolves `video.asset->{playbackId, assetId, status}` |

Before telling me an integration "works," check whether the code path after the feature-flag
check actually calls the external API, or just returns `not_configured` — payments and bookings
currently do the latter.

## Environment Variables

Defined (without values) in `.env.example`. Do not print, log, or commit real values from
`.env.local`. Categories:

- **Core**: `NEXT_PUBLIC_SITE_URL`
- **Feature flags**: `FEATURE_CMS`, `FEATURE_AUTH`, `FEATURE_ZOHO_FORMS`, `FEATURE_NEWSLETTER`,
  `FEATURE_BOOKINGS`, `FEATURE_CHECKOUT`, `FEATURE_VIDEO`, `FEATURE_SALESIQ`, `FEATURE_ANALYTICS`,
  `FEATURE_SEARCH`, `FEATURE_BLOG`, `FEATURE_STORE`
- **Sanity**: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
  `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_REVALIDATE_SECRET`
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`
- **Zoho One**: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_API_BASE`,
  `ZOHO_CAMPAIGNS_API_BASE`, `ZOHO_CAMPAIGNS_LIST_KEY`, `ZOHO_BOOKINGS_ORG_ID`,
  `NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET`
- **Payments**: `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY`, `MOYASAR_SECRET_KEY`,
  `MOYASAR_WEBHOOK_SECRET`, `TAMARA_API_TOKEN`, `TAMARA_NOTIFICATION_TOKEN`
- **Video**: `VIDEO_PLATFORM`, `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_SIGNING_KEY_ID`,
  `MUX_SIGNING_PRIVATE_KEY`
- **Analytics**: `NEXT_PUBLIC_GTM_ID`

Adding a new integration requires adding its env vars to `.env.example` (uncommented, placeholder
values only) in the same change.

## Feature Flags

- Defined in `src/lib/features.ts`, read from `process.env.FEATURE_*`, all default to off (`"0"`).
- Also mirrored in `next.config.ts`'s `env` block — this is required so Next.js inlines the flags
  at build time for client-side checks. **If you add a new `FEATURE_*` flag, add it in both
  places.**
- Every adapter/API route function checks its flag first and returns a `not_configured`
  `AdapterResult` (or an HTTP 503) when the flag is off — this is genuine runtime gating for
  working integrations (auth, Zoho CRM/Campaigns), but currently moot for payments/bookings since
  there's no real implementation behind the flag yet (see External Integrations table).

## Component Conventions

- Components are organized by domain under `src/components/**` (see Directory Conventions table),
  not by atomic-design layers — keep new components in the folder matching their domain, and use
  `src/components/ui/**` only for generic, content-agnostic primitives (Button, Text, Container,
  Grid, Section, Badge, Accordion, FormField, Skeleton, etc.).
- Prefer composing existing `ui/` primitives and prototype CSS classes over introducing new ad hoc
  markup patterns.
- Client components that need interactivity are explicit `"use client"` files, often paired with a
  server component wrapper (e.g. `SiteHeader` / `SiteHeaderServer`, `SiteShell` /
  `SiteShellClient`) — follow this split when a section needs both server-fetched data and client
  interactivity.

## Styling Conventions

- Tailwind config (`tailwind.config.ts`) mirrors CSS custom properties defined in
  `src/styles/design-tokens.css` — colors/fonts/sizes map to CSS variables, not literals. **Do not
  invent new token values in Tailwind config or component code; add/change tokens in
  `design-tokens.css` (and `COLOR_PALETTE.md`) first.**
- Stylesheet load order is fixed and meaningful (see `src/app/[locale]/layout.tsx` and
  `DESIGN_SYSTEM.md`): `globals.css` → `fonts.css` → `design-tokens.css` → `brand-themes.css` →
  `design-system.css` → `prototype-parity.css` → `motion.css` → `typography.css` → `spacing.css`.
  Don't reorder these imports.
- The "prototype" CSS classes (`.button`, `.section`, `.eyebrow`, `.entity-card`, etc.) remain the
  canonical classes for shipping UI per `DESIGN_SYSTEM.md`. New surfaces should use `ds-*` classes
  and/or Tailwind utilities that reference the same design tokens — don't introduce a new CSS
  framework or icon library without an explicit decision from me.
- Six sub-brand themes are switched via a `data-theme` attribute on `<html>`
  (`human`/`seera`/`nexus`/`connect`/`lego`/`impact`), each mapped to specific route prefixes per
  `COLOR_PALETTE.md`. This is set by an inline pre-hydration script in the locale layout to avoid
  a flash of the wrong theme — don't move this logic into a `useEffect` or it will reintroduce the
  flash.

## SEO Conventions

- All SEO logic funnels through `src/lib/seo.ts` — `buildPageMetadata()` /
  `buildMetadataFromPageSeo()` build the full Next.js `Metadata` object (canonical, hreflang,
  OpenGraph, Twitter, robots, search-engine verification), and JSON-LD builders exist for
  Organization, WebSite, FAQPage, Person, Course, Service, ItemList, BreadcrumbList.
- **Do not fetch SEO data from Sanity/CMS directly inside a page.** Per the header comment in
  `src/lib/seo.ts`, SEO content must be mapped into the static `PageSeo` type first
  (`src/content/seo-types.ts`, `src/content/mappers/pageSeo.ts`) — this constraint is intentional,
  not an oversight, even though a Sanity `pageSeo` schema and seed script exist for a future
  migration.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts` are the SEO surface files.
  `robots.ts` disallows `/auth/`, `/dashboard/`, and `/studio`. Note `manifest.ts` is currently
  hardcoded to `lang: "ar"` / `dir: "rtl"` regardless of locale — a known gap, don't assume it's
  locale-aware when reasoning about it.
- JSON-LD is rendered via `src/components/seo/JsonLd.tsx`, server-side only.

## API Conventions

- Route handlers live under `src/app/api/**`. The Zoho lead-capture routes
  (`contact`, `group`, `discovery`, `program`, `community`) all share
  `src/app/api/zoho/_helpers.ts` for: feature-flag + configuration guarding
  (`guardZohoConfigured`), request body parsing, Zod validation, and result-to-HTTP-response
  mapping (`handleCrmResult`). **New Zoho-backed routes should follow this exact pattern** rather
  than reinventing validation/response handling.
- `src/app/api/newsletter/route.ts` intentionally reuses the same `_helpers.ts` from the `zoho`
  folder even though it lives in its own `api/newsletter` directory — this is deliberate reuse,
  not a misplaced file.
- All route handlers validate input with Zod and return a consistent shape:
  `{ ok: true, ... }` or `{ ok: false, code, message }`, mirroring the adapter-layer
  `AdapterResult` type.
- `POST /api/revalidate` is a Sanity webhook target, authenticated via a `?secret=` query param
  compared against `SANITY_REVALIDATE_SECRET`. Never remove or weaken this check.

## Deployment Conventions

- No `vercel.json` — deployment relies on Vercel's Next.js defaults.
- No CI (`.github/workflows` is absent). `npm run lint`, `npm run typecheck`, and
  `npm run format:check` exist but are **not** automatically enforced — run them yourself before
  considering a change complete.
- Deploys go through `main` on GitHub (confirmed: current production state matches `main`).
  Don't push directly to `main`; work on `dev` (or a feature branch) and let the user merge/push,
  unless explicitly told otherwise for a given change.

## Important Business Rules

- Arabic is the primary/default locale — when in doubt about a UX or copy decision, Arabic is the
  canonical experience and English is the secondary one.
- Payment provider is **Moyasar + Tamara only** — never introduce Stripe or another payment
  provider without explicit approval.
- Bookings and payments are currently non-functional by design (stubbed) — don't "fix" them by
  wiring in a real implementation without discussing scope, since the coaches/courses approach
  itself may be redesigned (see below).
- `profiles.id` is the only writable link between Supabase Auth and app data; email changes must
  go through Supabase Auth, never be written directly to `profiles`.

## Things That Must NOT Be Changed Without Asking Me First

- The coaches/courses data model, Sanity schema shape, and any booking-adjacent code — this whole
  area is under active reconsideration and may be redesigned after client discussions. Don't
  refactor, "fix," or extend it based on current assumptions without checking in first.
- Anything documented in `UI_ARCHITECTURE_GUIDE.md` or `IMPLEMENTATION_STATUS.md` — these are no
  longer fully authoritative; some documented approaches are known to need revision. Treat them as
  historical context, not a spec, and confirm with me before implementing something "because the
  guide says so."
- `localeDetection: false` and the hand-rolled locale rewrite/redirect scheme in
  `next.config.ts` / `src/i18n/routing.ts` — these were deliberate choices, not oversights.
- The `documentInternationalization` schema scope in `src/sanity/sanity.config.ts` (excluding
  `coach`/`course`) — intentional, tied to the coaches/courses redesign question above.
- `sync-sanity-datasets.mts` — never run against `production`, and never wire it into any
  automated pipeline, without explicit sign-off.
- Payment provider choice (Moyasar/Tamara, not Stripe) and the `FEATURE_*` flag defaults (all off).
- Stylesheet import order in the locale layout, and the inline pre-hydration theme/RTL script.

## Testing and Verification Expectations

- There is no automated test suite in this repo today (no test runner configured). Verification
  currently means: `npm run typecheck`, `npm run lint`, `npm run format:check`, and manual
  browser verification.
- For any UI change, verify in **both** locales/directions: `/` (Arabic, RTL) and `/en` (English,
  LTR), and check the relevant sub-brand theme if the change touches a themed route.
- For any change touching an adapter or API route, verify behavior with the relevant
  `FEATURE_*` flag both on and off (should degrade to a clean `not_configured` response when off,
  never throw).
- Since there's no CI, always run `npm run lint` and `npm run typecheck` locally before calling a
  change complete, and mention explicitly if you were not able to manually verify a UI change in
  the browser.

## Common Commands

```bash
npm run dev                          # start dev server
npm run build                        # production build
npm run start                        # start production server
npm run lint / lint:fix              # ESLint
npm run format / format:check        # Prettier
npm run typecheck                    # tsc --noEmit

# Sanity seed/migration scripts (one-off, run deliberately)
npm run seed:coaches
npm run seed:courses
npm run seed:page-seo
npm run seed:marketing
npm run migrate:translation-metadata
npm run validate:marketing

# Dataset sync — destructive, production target requires explicit sign-off
npm run sync:sanity:staging-to-production
npm run sync:sanity:production-to-staging
```

---

# SAH Group Website — Quick-Reference Rules

## Project

SAH Group corporate website for Saudi Arabia.

The website supports:
- Arabic
- English
- RTL Arabic layouts
- Sanity CMS
- Supabase
- Vercel

## Core Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Sanity
- Supabase
- Vercel

## Development Rules

- Use Next.js App Router.
- Use TypeScript.
- Use Tailwind CSS for styling.
- Reuse existing components before creating new ones.
- Do not introduce a new UI library without approval.
- Do not rewrite working architecture unnecessarily.
- Do not modify production configuration without asking.
- Do not expose secrets.
- Do not hardcode CMS content when the content belongs in Sanity.
- Preserve Arabic RTL behavior.
- Preserve English/Arabic parity where applicable.
- Follow existing project patterns before introducing new patterns.

## Before Making Changes

- Inspect relevant existing code first.
- Identify dependencies between components/routes.
- Explain the proposed approach for significant changes.
- Avoid unrelated refactoring.

## After Making Changes

- Run relevant lint/type checks.
- Run tests if available.
- Check the affected routes.
- Report exactly what changed.
- Report any issues that could not be verified.

## Git

Do not create commits unless explicitly requested.
Do not push to remote unless explicitly requested.
