# SAH-v2 Backend Implementation Guide

> **Last updated:** August 13, 2026  
> **Status:** Locked decisions + phase-by-phase integration plan  
> **Binding scope:** [`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md) — SalesIQ / Analytics / Desk / Sign / PageSense / ZMA / WorkDrive / Connect and Zoho sales automation are **out of this phase**. Sanity, Supabase, Moyasar/Tamara, Mux **are** in this phase.  
> **Companions:** [`UI_ARCHITECTURE_GUIDE.md`](../UI_ARCHITECTURE_GUIDE.md) (IA + ownership) · [`IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md) (file-level UI vs backend)

This document is the **step-by-step integration playbook**. The hybrid Next.js UI is largely complete; work here is wiring backends behind existing adapters, facades, and `FEATURE_*` flags — page by page, flag by flag — to minimize risk.

---

## Locked decisions

| Item | Choice |
|---|---|
| CMS | **Sanity Cloud** (Content Lake). Studio only is self-hosted on our domain. |
| Studio URL | Embedded at **`https://sah.com.sa/studio`** (same path on staging) |
| Sanity i18n | **Document-per-locale** for marketing pages; **field-level `{en,ar}`** for coaches / courses / catalogs |
| Hosting | **Vercel** (existing production) + dedicated **staging** |
| Auth / DB | **Supabase Cloud** |
| Course video | **Mux** (signed / private playback after enrollment) |
| Zoho | Zoho One account exists; **greenfield setup** (Forms, CRM, Campaigns, Bookings, Flow, ZeptoMail, SalesIQ) |
| Payments | **Moyasar + Tamara** — **deferred** until client provides merchant accounts |
| Coaches data | Treat current catalog as **placeholders** until real bios exist; still migrate into Sanity |
| Marketing | **Must** migrate into Sanity; do it after the CMS pipeline is proven, section by section |
| Staging | **Required** for the whole program (`staging` / `production` Sanity datasets + Vercel staging env) |

---

## Ownership model (do not mix)

| System | Owns | Does **not** own |
|---|---|---|
| **Sanity** | All website editorial: marketing, coaches, courses, programs, images, SEO fields, Mux asset IDs | Leads, auth, payments, calendars |
| **Supabase** | Auth, `profiles`, enrollments, progress, reviews | Page copy, CRM pipeline |
| **Zoho One** | Leads, CRM, Campaigns, Bookings calendar, ZeptoMail, Flow (essential visitor emails only). SalesIQ / Analytics / extra apps **out of this phase** | Public bilingual catalog |
| **Moyasar + Tamara** | Money (KSA) — *later* | Scheduling UI |
| **Mux** | Private course video — *playback gated after enrollments* | Curriculum copy (stays in Sanity) |

**Guiding principle:** *If a human at SAH writes it → Sanity. If software generates it from user behavior → Supabase. If it is a lead, schedule, newsletter, or ops email → Zoho One. If money moves in KSA → Moyasar and/or Tamara.*

**Binding key:** stable public `slug` (e.g. `ahmed-al-rashidi`) across Sanity ↔ Supabase ↔ routes. Never change after go-live; change display name only.

**App integration rule:** UI components depend only on app contracts (`SiteContent`, `Coach`, `Course`, `PageSeo`). Fetch Sanity → map in `src/content/mappers/` → expose via `getContent` / `getCoaches` / `getCourses` / `getPageSeo`. Do **not** import Sanity SDK types into React components. Flip **one** `FEATURE_*` at a time. Secrets only in Route Handlers / server env.

---

## Why this order

1. Prove Sanity end-to-end on a **small** surface (Studio + coaches) before the large `home.json` migration.
2. Stand up Zoho from zero and wire **one** form (discovery) early for ops value — independent of CMS.
3. Migrate **marketing** into Sanity once mappers, revalidation, and Studio UX are trusted.
4. Finish remaining Zoho surfaces, then **Supabase auth**.
5. Courses pages + Mux IDs in Sanity **without charging**.
6. Bookings **without payment** until merchants exist.
7. Payments → enrollments → signed Mux when the client is ready.

```text
0  Environments (Vercel staging, Sanity datasets, Supabase, Mux account)
1  Sanity Studio (/studio) + schemas (no public cutover)
2  Coaches CMS cutover (placeholders OK) — prove pipeline + SEO
3  Zoho greenfield + Discovery form live
4  Marketing → Sanity (document-per-locale), section by section
5  Remaining Zoho (group, community, contact, newsletter, SalesIQ)
6  Supabase Auth + dashboard guard
7  Courses in Sanity + build /courses/[slug] (Buy disabled)
8  Zoho Bookings on coach profiles (no Moyasar yet)
9  [BLOCKED] Moyasar + Tamara → course_enrollments
10 [BLOCKED on 9] Mux signed playback + course_progress
11 Polish (reviews, analytics, etc.)
```

Phases 1 and 3 can overlap after Phase 0. Do **not** start Phase 9 until Phase 6 works. Do **not** start Phase 10 until Phase 9 works.

---

## Phase 0 — Environments

**Goal:** Safe staging forever; production stays boring until flags flip.

### Steps

1. **Vercel**
   - Production: existing `sah.com.sa` project.
   - Staging: stable hostname preferred (e.g. `staging.sah.com.sa`) or a dedicated Vercel project / branch env. Editors will open Studio there.
2. **Sanity**
   - Create project + datasets: `staging`, `production`.
   - API tokens: read (CDN) + write (migrations/scripts only). Never commit tokens.
3. **Supabase Cloud**
   - Prefer **two** projects (staging / production) if budget allows; one project is acceptable early with careful RLS.
   - Save URL, anon key, service role (server only).
4. **Mux**
   - Create account + environment keys; no public videos required yet.
5. **Env**
   - Staging: all `FEATURE_*=0` (see `.env.example`).
   - Plan vars: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `NEXT_PUBLIC_SUPABASE_*`, Zoho, Mux, later Moyasar/Tamara.
6. **Zoho**
   - Confirm data center / org URL (`.com` / `.eu` / `.sa` / etc.) before building integrations.

### Exit criteria

- Staging deploys the current UI.
- Empty Sanity datasets exist.
- Supabase + Mux accounts exist (unused until later phases).

---

## Phase 1 — Sanity Studio + schemas (no site cutover)

**Goal:** Editors can open Studio; the public site still serves JSON / static catalogs.

### 1.1 Studio at `/studio`

- Embed Sanity Studio in the Next app (e.g. `src/app/studio/[[...tool]]/page.tsx`).
- Production: `https://sah.com.sa/studio`.
- Staging: same path on the staging host.
- Allowlist hosts in the Sanity project: production, staging, localhost.
- Access: Sanity login; roles Editor vs Viewer as needed.
- Disallow `/studio` in `robots.ts` so the editor UI is not indexed.

### 1.2 Schemas

#### Field-level bilingual (catalogs)

```text
coach
  slug (shared, immutable after publish)  ← binding key
  photo, priceSar, published, zohoBookingsServiceId (shared)
  name / specialty / bio / fullBio / topics / … as { en, ar }

course
  slug (shared)
  thumbnail, priceSar, published, level…
  title / description as { en, ar }
  modules[]: title {en,ar}, duration, isPreview, muxAssetId
```

Use a consistent bilingual object / internationalized-array pattern so mappers resolve `locale` → `Coach` / `Course`.

#### Document-per-locale (marketing)

Use `@sanity/document-internationalization`:

```text
homePage        (ar) ↔ (en)
companyPage     (ar) ↔ (en)   // sah-human, seera, …
pageSeo         (ar) ↔ (en)
program / FAQ fragments as modeled during integration
```

Map marketing docs into existing `SiteContent` / `PageSeo` so homepage and company components stay unchanged.

### 1.3 App plumbing (flag off)

1. Add `src/lib/sanity.ts` (client; dataset from env).
2. Implement mappers in `src/content/mappers/{coach,course,home}.ts`.
3. In `getCoaches` / `getCourses` / `getContent` / `getPageSeo`: if `FEATURE_CMS` → Sanity path; else static (current behavior).
4. Allowlist `cdn.sanity.io` in `next.config` image config.
5. On-demand revalidation: Sanity webhook → `/api/revalidate` (tag by type/slug). Do not rely only on long ISR intervals for SEO freshness on Vercel.

### 1.4 Validation

- Field-level: require both `en` and `ar` before publish.
- Document-per-locale: link translations; both locales should exist before promoting a public URL.

### Exit criteria

- `/studio` loads on staging.
- Can create one coach + empty marketing docs.
- Production site unchanged (`FEATURE_CMS=0`).

---

## Phase 2 — Coaches CMS cutover (placeholders OK)

**Goal:** Prove fetch → map → page → sitemap → ISR. Real bios can replace later in Studio with no code change.

### Steps

1. Seed all current placeholder coaches into Sanity `staging` (AR + EN).
2. Staging only: enable CMS for coaches (`FEATURE_CMS=1`, or a narrower `FEATURE_CMS_COACHES` if added).
3. QA:
   - `/coaches`, `/coaches/[slug]`, `/en/coaches/...`
   - Person JsonLd, metadata, breadcrumbs
   - Sitemap coach URLs + hreflang
4. Fix mapper edge cases (missing photo, empty topics).
5. Promote content to `production` dataset; enable flag in production when staging is green.
6. Keep static catalog in repo as emergency rollback (`FEATURE_CMS=0`).

### Exit criteria

- Public coaches served from Sanity.
- Rollback path tested once.
- Zoho Bookings **not** enabled yet (Phase 8).

---

## Phase 3 — Zoho greenfield + first live form

**Goal:** Ops can receive leads. Zoho modules are empty — setup is part of this phase.

### 3.1 Zoho admin (before code)

1. **CRM**
   - Lead fields: name, email, phone, locale, source page, pathway audience/challenge, UTM if needed.
   - Optional Contact layout for registered users (used in Phase 6).
2. **Forms**
   - Create **Discovery** form matching UI fields.
   - Form → CRM Lead integration.
3. **Flow + ZeptoMail**
   - On Lead create: visitor confirmation (“within 24h”) + internal SAH notify.
4. **API / OAuth**
   - Server-side credentials for Forms and/or CRM API.
5. Confirm DC base URLs for all Zoho APIs.

### 3.2 App

1. `POST /api/zoho/discovery` (validate → Zoho → structured result). Secrets never in the browser.
2. Wire `submitDiscoveryLead` in `src/adapters/zoho/forms.ts` when `FEATURE_ZOHO_FORMS=1`.
3. Staging E2E: AR + EN submit → CRM row + emails.
4. Production enable after CRM owners confirm.

### Exit criteria

- Real discovery leads in Zoho from the site.
- No fake success when Zoho/API fails.

---

## Phase 4 — Marketing → Sanity (document-per-locale)

**Goal:** Editors own marketing without a big-bang rewrite. Largest content phase — run **after** Phase 1–2 so the pipeline is trusted.

### Order inside this phase (lowest risk → largest)

| Step | Migrate | Why this order |
|---|---|---|
| 4.1 | `pageSeo` docs | Small, SEO-critical |
| 4.2 | FAQ (+ JsonLd) | Contained section |
| 4.3 | Company / entity pages (`/[company]`) | Real routes, smaller than home |
| 4.4 | Programs (cards + `/program/[id]`) | Medium |
| 4.5 | Homepage sections **one at a time** (hero → promise → …) | Largest blast radius last |
| 4.6 | Nav / mega-nav copy if still in JSON | After sections stabilize |

### Per-slice workflow (repeat)

1. Model Sanity fields to match the **existing** TypeScript slice of `SiteContent` (do not redesign UI).
2. Seed AR + EN from current `src/content/{en,ar}/home.json` (script or manual).
3. Mapper returns that slice from Sanity; rest may still come from JSON (partial merge in `getContent` is fine).
4. Staging QA: `/` and `/en`, RTL, section anchors, JsonLd.
5. Webhook revalidate for that tag.
6. Production promote + monitor.
7. Only then stop reading that JSON slice.

### Exit criteria

- Marketing editable in Studio at `/studio`.
- JSON gone or leftover fallback only.
- Both locales published for live URLs.

---

## Phase 5 — Finish Zoho Track A

One surface per deploy:

| Order | Surface | Zoho setup + wire |
|---|---|---|
| 1 | **SalesIQ** | Widget → locale layout + `FEATURE_SALESIQ` |
| 2 | Group interest | Form → CRM (`GroupInterestFormClient`) |
| 3 | Community apply | Form → CRM Application → Flow → ZeptoMail |
| 4 | Contact | Form → CRM (if homepage contact kept as lead source) |
| 5 | Newsletter | **Campaigns** list + API subscribe + `FEATURE_NEWSLETTER` |

### Exit criteria

- Every public lead/newsletter path is live or explicitly off — no silent fake success in production.
- Leads only in Zoho (not Supabase).

---

## Phase 6 — Supabase Auth + dashboard

**Goal:** Real accounts; still no payments / video unlock.

### Steps

1. Create `profiles` table + RLS (see architecture guide §10). Leave enrollment tables for Phase 9.
2. Install SSR-friendly Supabase clients; add `src/lib/supabase.ts`.
3. Wire login / register / forgot / sign-out adapters (`src/adapters/supabase/auth.ts`).
4. Protect `/dashboard/**` in `src/proxy.ts` (redirect to `/auth/login`).
5. On register: create Zoho CRM Contact → store `profiles.zoho_crm_contact_id`.
6. Auth-aware header (Dashboard / Sign out).
7. Keep `noindex` + robots disallow for `/auth` and `/dashboard`.

### Exit criteria

- Register → login → empty dashboard → sign out works on staging and production.
- Unauthenticated `/dashboard` redirects.

---

## Phase 7 — Courses editorial + `/courses/[slug]` (no charge)

**Goal:** SEO’d course pages; Mux IDs stored in Sanity; Buy still disabled.

### Steps

1. Seed courses in Sanity (field-level AR/EN + modules with optional `muxAssetId`).
2. Build `/courses/[slug]` (currently missing): hero, curriculum, sticky CTA **disabled** or “Coming soon”.
3. Course JsonLd, sitemap detail URLs, hreflang.
4. Listing reads Sanity when CMS flag is on.
5. Optionally upload Mux assets and store IDs — **do not** ship signed playback until Phase 10.

### Exit criteria

- Course URLs crawlable in AR + EN.
- No payment, no private playback.

---

## Phase 8 — Zoho Bookings (calendar only)

**Goal:** Real 1:1 slots without Moyasar.

### Steps

1. In Zoho Bookings: services, staff, hours; map service IDs onto Sanity `coach.zohoBookingsServiceId`.
2. Embed / API on `/coaches/[slug]` (replace disabled slot grid). Do not build a custom calendar engine.
3. **Payment policy until merchants exist:** prefer **unpaid / request booking** or SAH confirmation — **not** a fake paid flow. Do not collect cards ad hoc.
4. Dashboard `/dashboard/bookings` via Bookings API when auth exists (Phase 6).
5. `FEATURE_BOOKINGS=1` when embed is stable.

### Exit criteria

- Visitors can request/book a slot; SAH sees it in Zoho.
- Paid coaching waits for Phase 9.

---

## Phase 9 — [BLOCKED] Moyasar + Tamara

**Unblock when:** client provides merchant accounts + webhook secrets.

### Then

1. Route Handlers under `src/app/api/payments/{moyasar,tamara}/` + webhook signature verification.
2. Tables: `course_enrollments` (`course_slug`, `payment_provider`, `payment_id`, `amount_sar`) + RLS; idempotent webhook upsert.
3. Checkout on course detail only if logged in (or account mid-flow).
4. Optional: pay-after-slot for coaching → confirm Zoho Bookings appointment on success.
5. `FEATURE_CHECKOUT=1`.

**Do not** introduce Stripe for customer-facing checkout.

### Exit criteria

- Test payment → enrollment row → course appears in `/dashboard/courses`.
- Duplicate webhooks do not double-enroll.

---

## Phase 10 — [BLOCKED on Phase 9] Mux signed playback

### Then

1. API (e.g. `GET /api/video/token`): session + enrollment check → Mux signed playback.
2. Player on dashboard; public detail only unlocks `isPreview` modules.
3. `course_progress` + RLS.
4. `FEATURE_VIDEO=1` after AR/EN + mobile QA.

### Exit criteria

- Non-enrolled users cannot play non-preview modules (including direct URL / token abuse tests).
- Progress persists across sessions.

---

## Phase 11 — Polish

- `coach_reviews` in Supabase + two-query pattern on coach pages (CMS + reviews).
- Zoho Analytics unified reporting.
- SalesIQ refinement.
- Replace placeholder coaches with real content in Studio (no code change).
- Optional: blog (`FEATURE_BLOG`), store (`FEATURE_STORE`), dedicated `/programs` routes — only if product asks.

---

## Staging vs production habit

| Change type | Staging | Production |
|---|---|---|
| Schema / Studio | Always first | Deploy Studio route after staging OK |
| Content | Author in `staging` dataset | Promote or re-publish to `production` |
| Feature flags | On early | On only after staging E2E |
| Zoho | Test forms / tagged test leads when possible | Real lists / inboxes |
| Webhooks | Staging URLs first | Swap to production URLs |

Vercel: separate env vars per environment (`NEXT_PUBLIC_SANITY_DATASET=staging` vs `production`).

---

## SEO checklist (every content phase)

- [ ] Unique title / description per locale  
- [ ] `alternates.languages` AR ↔ EN (AR unprefixed, EN `/en`)  
- [ ] Canonical matches locale URL rules  
- [ ] JsonLd matches visible content  
- [ ] Sitemap includes new public slugs + hreflang  
- [ ] `/auth`, `/dashboard`, `/studio` not indexed  
- [ ] Images: correct-language alt; Sanity CDN allowlisted  
- [ ] Publish validation: required AR + EN for field-level docs  
- [ ] Revalidate on Sanity publish  

Existing plumbing: `src/lib/seo.ts`, `src/content/{en,ar}/pages-seo.json`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/seo/JsonLd.tsx`.

---

## What goes where (quick reference)

| User action / content | System |
|---|---|
| Edit coach bio / course module title / homepage copy | Sanity |
| Submit discovery / apply / newsletter / contact | Zoho |
| Create account / watch progress / reviews | Supabase |
| Pay for course or coaching | Moyasar / Tamara *(Phase 9)* |
| Play lesson video | Mux *(Phase 10, gated by Supabase)* |
| Pick 1:1 slot | Zoho Bookings |
| Chat widget | Zoho SalesIQ |

---

## Can start now vs wait on client

| Can start immediately | Needs client / later |
|---|---|
| Phases 0–8 (through Bookings without pay) | Moyasar + Tamara merchant credentials |
| Mux account + store asset IDs in Sanity | Signed playback after enrollments (Phase 10) |
| Full Zoho module setup from zero | Merchant KYC / payment go-live |
| Marketing migration in Studio | Final real coach bios (edit anytime in Studio) |

---

## Suggested start sequence

1. Phase 0 — Vercel staging + Sanity datasets + Supabase + Mux.  
2. Phase 1 — `/studio` + coach + marketing schemas.  
3. Phase 2 — Placeholder coaches live on staging.  
4. Phase 3 — Zoho CRM + Discovery form + site wire.  
5. Phase 4 — Marketing migration (budget the most calendar time here).  

---

## File targets (to add during integration)

```text
src/app/studio/[[...tool]]/     # Embedded Sanity Studio
src/lib/sanity.ts               # Sanity client + queries
src/content/mappers/            # Sanity → SiteContent / Coach / Course / PageSeo
src/lib/supabase.ts             # browser + server clients
src/lib/zoho.ts                 # Forms / CRM / Campaigns / Bookings helpers
src/lib/payments.ts             # Moyasar + Tamara (Phase 9)
src/app/api/revalidate/         # Sanity webhook → ISR tags
src/app/api/zoho/...            # Server proxies for forms
src/app/api/payments/moyasar/   # Phase 9
src/app/api/payments/tamara/    # Phase 9
src/app/api/video/token/        # Phase 10 Mux signed URL
src/proxy.ts                    # Extend: Supabase session → protect dashboard
```

Existing seams (do not bypass):

- `src/adapters/zoho/*`, `src/adapters/supabase/*`, `src/adapters/video/*`, `src/adapters/payments/*`
- `src/lib/features.ts` + `.env.example` `FEATURE_*` flags
- `src/content/index.ts` + catalogs + mappers README

---

## Related docs

| Doc | Role |
|---|---|
| [`UI_ARCHITECTURE_GUIDE.md`](../UI_ARCHITECTURE_GUIDE.md) | IA, workflows, data architecture §10, design |
| [`IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md) | What UI is done vs pending integrations |
| [`src/content/mappers/README.md`](../src/content/mappers/README.md) | Mapper rules |
| [`.env.example`](../.env.example) | Env + feature-flag template |

---

*This guide is the integration north star. Stack ownership is fixed; execute one phase (and one surface within a phase) at a time.*
