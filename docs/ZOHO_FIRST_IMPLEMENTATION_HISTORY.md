# Zoho-First Implementation History

> Tracks what has been implemented from [`ZOHO_FIRST_IMPLEMENTATION_PLAN.md`](./ZOHO_FIRST_IMPLEMENTATION_PLAN.md).
> Update this file when a phase’s **code** and **exit criteria** are complete (or note remaining manual steps).

---

## Phase 0 — Environments

**Status:** Partially complete (accounts + local env; Vercel staging URL still open in the plan)

| Item | Status | Notes |
|---|---|---|
| Sanity project `93kt9fuy` + `staging` / `production` datasets | Done | Documented in plan §2.2 |
| Sanity / Supabase / Mux env accessors | Done | `src/lib/env.ts`, `.env.example`, `.env.local` |
| Zoho SA data center | Done | `zohoapis.sa` / `accounts.zoho.sa` |
| Vercel staging URL | Open | Plan §2.1 still unchecked |
| Zoho One module confirmation | Open | Plan §2.5 still unchecked |

---

## Phase 1 — Sanity CMS Pipeline

**Status:** **Complete** (exit criteria met 24 August 2026)  
**Flag:** `FEATURE_CMS=0` (public site still serves static catalogs / JSON)

### What was implemented

#### 3.1 Studio at `/studio`
- Packages: `next-sanity`, `sanity`, `sanity-plugin-mux-input`, `@sanity/document-internationalization`, `@sanity/image-url`
- Config: `src/sanity/sanity.config.ts` (structure tool, `muxInput` Phase 9 defaults, document i18n for `homePage` + `pageSeo`)
- Route: `src/app/studio/[[...tool]]/` (`page.tsx`, `layout.tsx`, `StudioClient.tsx`)
- `/studio` excluded from next-intl (`src/proxy.ts` matcher + skip); `/en/studio` → `/studio` redirect
- `/studio` disallowed in `src/app/robots.ts`
- `cdn.sanity.io` added to `next.config.ts` `images.remotePatterns`
- Sanity CORS allowlisted (production, staging, `localhost:3000`)
- Verified locally: `GET /studio` → 200 with Studio shell (`id="sanity"` / NextStudio)

#### 3.2 Schemas
- Field-level bilingual: `coach`, `course` (+ `localeString` / `localeText` / `localePortableText` / `localeStringArray`)
- Document-per-locale stubs: `homePage` (minimal — Phase 4 owns full `SiteContent`), `pageSeo`
- Files under `src/sanity/schemas/`

#### 3.3 Client + GROQ
- `src/lib/sanity.ts` — CDN client, `urlForImage`, coach/course/home/pageSeo queries

#### 3.4 Mappers
- `src/content/mappers/coach.ts` — Sanity → `Coach` (reviews stay out; rating defaults `0`)
- `src/content/mappers/course.ts` — Sanity → `Course` (`modules` count + duration sum)
- `src/content/mappers/home.ts` — returns `null` until Phase 4

#### 3.5 Feature-flagged facades
- `getCoaches` / `getCoachBySlug` / `getCoachSlugs` async; Sanity path when `FEATURE_CMS=1`
- `getCourses` / `getCourseBySlug` / `getCourseSlugs` same pattern
- `getContent` stays on static JSON (`mapHomeDocument` reserved for Phase 4)
- Call sites updated (`coaches` pages, `courses` page, `sitemap.ts`)

#### 3.6 Revalidation webhook
- `src/app/api/revalidate/route.ts` — secret check + `revalidateTag(tag, { expire: 0 })` (Next 16)
- Verified locally: wrong/missing secret → `401`
- Sanity publish/unpublish webhook configured (staging + production URLs; filter `_type in ["coach","course","homePage","pageSeo"]`)

### Exit criteria

| Criterion | Status |
|---|---|
| `/studio` loads without errors | **Met** (local; staging host still depends on Phase 0 Vercel staging) |
| Can create one coach (AR + EN) in staging dataset | **Met** — coach created in Sanity Studio |
| Coach pages still serve static data (`FEATURE_CMS=0`) | **Met** |
| Production site unchanged | **Met** (flag off; no public CMS cutover) |

### Optional setup (complete)

- [x] Set `SANITY_REVALIDATE_SECRET` in `.env.local` + Vercel staging/production
- [x] Sanity publish/unpublish webhook — `POST {SITE_URL}/api/revalidate?secret={SANITY_REVALIDATE_SECRET}`; projection `{_type}`; Create/Update/Delete; filter `_type in ["coach","course","homePage","pageSeo"]` ([`src/app/api/revalidate/route.ts`](../src/app/api/revalidate/route.ts))

### Decisions locked during Phase 1

- `homePage` schema is a **minimal stub**; full marketing fields = Phase 4.
- Catalog facades are **async now**; static path while `FEATURE_CMS=0`.

---

## Phase 2 — Zoho CRM + First Live Lead Forms

**Status:** **Complete** (28 August 2026)  
**Flags:** `FEATURE_ZOHO_FORMS=1` / `FEATURE_CMS=1` when live on staging or production (local dev may use staging dataset)

### What was implemented

Website CRM scope for Phase 2 is **create records only** (Leads + Applications). Lead Status Kanban, Deal stages, and convert-to-Deal are SAH Zoho ops — not website deliverables. Handlers do not set `Lead_Status` or create Deals.

#### 4.2 Server library
- `src/lib/zoho.ts` — OAuth token cache (SA DC `accounts.zoho.sa`), `createCrmLead`, `createCrmApplication`, `splitName`, `isZohoConfigured`
- `src/lib/env.ts` — OAuth accessors: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_API_BASE` (default `https://www.zohoapis.sa`)
- `.env.example` updated; legacy `ZOHO_FORMS_*_URL` vars removed

#### 4.3 Route handlers
- `src/app/api/zoho/discovery/route.ts` → Leads (`Lead_Source: Discovery`)
- `src/app/api/zoho/contact/route.ts` → Leads (`Contact Form`)
- `src/app/api/zoho/group/route.ts` → Leads (`Group Coaching`)
- `src/app/api/zoho/program/route.ts` → Leads (`Program Interest`)
- `src/app/api/zoho/community/route.ts` → Applications custom module (`Status: Pending Review`)
- Shared helpers: `src/app/api/zoho/_helpers.ts`
- Zod validation on all handlers

#### 4.4 Adapters wired
- `src/adapters/zoho/forms.ts` — five submit functions POST to `/api/zoho/*` when `FEATURE_ZOHO_FORMS=1`
- `subscribeNewsletter` left as stub (Phase 3)

#### Community field fix
- `src/domain/lead.ts` — `CommunityApplication` now has `profession`, `motivation`, `experience` as separate fields
- `src/components/community/CommunityApplyFormClient.tsx` — passes fields separately to CRM

#### §4.5 Coaches CMS cutover
- `scripts/seed-coaches-to-sanity.mts` — upserts **all** coaches from `COACH_RECORDS` (6 catalog coaches) into Sanity
- Ran against `93kt9fuy/staging`: created/updated all 6 (published, AR+EN fields; **no photos** — upload in Studio)
- Local `.env.local`: `FEATURE_CMS=1` + `NEXT_PUBLIC_SANITY_DATASET=staging` for local QA
- `/api/revalidate` already maps `coach` → tag `coaches`
- UI already falls back to photo placeholders when Sanity photo is missing

### Exit criteria

| Criterion | Status |
|---|---|
| Discovery form creates real CRM Lead on staging | **Met** |
| Visitor receives ZeptoMail confirmation within 60s | **Met** |
| SAH team receives internal notification | **Met** |
| Community apply creates Applications record | **Met** |
| No `not_configured` when `FEATURE_ZOHO_FORMS=1` | **Met** |
| AR + EN submissions work for all five forms | **Met** |
| Coaches served from Sanity on production | **Met** |

---

## Phase 3 — Newsletter + Remaining Forms

**Status:** **Complete** (31 August 2026)  
**Flags:** `FEATURE_NEWSLETTER=1`, `FEATURE_ZOHO_FORMS=1` (staging + production)

### What was implemented

#### 5.3 Newsletter → Zoho Campaigns
- `src/lib/zoho.ts` — `isNewsletterConfigured()`, `subscribeToCampaignsList()` (Campaigns `listsubscribe` API; duplicate subscribers treated as success)
- `src/app/api/newsletter/route.ts` — `POST` with Zod validation; gated on `FEATURE_NEWSLETTER` + list key
- `src/app/api/zoho/_helpers.ts` — `guardNewsletterConfigured()`, `handleCampaignsResult()`
- `src/adapters/zoho/forms.ts` — `subscribeNewsletter()` POSTs to `/api/newsletter`

#### 5.4 Remaining forms
Already wired in Phase 2 — no new routes:
- Contact → `/api/zoho/contact`
- Group interest → `/api/zoho/group`
- Program interest → `/api/zoho/program`

#### 5.5 Form error UX
Removed fake success on `not_configured` from all six lead/newsletter forms:
- `NewsletterForm`, `ContactSection`, `GroupInterestFormClient`, `ProgramInterestFormClient`, `DiscoveryRequestForm`, `CommunityApplyFormClient`

#### Newsletter copy (single opt-in)
- `src/content/en/home.json` + `src/content/ar/home.json` — `newsletter.success` (subscribed, no confirm step); `newsletter.submitError`
- `src/content/types.ts` — `NewsletterContent.submitError`

#### Out of scope (unchanged)
- SalesIQ / PageSense — not embedded (`FEATURE_SALESIQ=0`)
- Auth forms — Phase 5

### Exit criteria

| Criterion | Status |
|---|---|
| Newsletter subscribe creates Campaigns contact; welcome email arrives | **Met** |
| Welcome email on subscribe | **Met** (Campaigns List Entry workflow) |
| Group, Contact, Program forms create CRM leads | **Met** |
| All six forms show real errors on Zoho failure | **Met** |
| No SalesIQ or PageSense on staging/production | **Met** |
| History doc updated | **Met** |

### Zoho setup (completed)

1. **Zoho Campaigns list** — Create `SAH Newsletter`. Copy list key → `ZOHO_CAMPAIGNS_LIST_KEY`. Add custom contact field `Locale` (text) — `listsubscribe` sends it from the site locale (not shown in the form).
2. **Single opt-in (no confirmation email)** — Keep **Signup forms disabled** on the list (Contacts → Manage Lists → `SAH Newsletter` → Setup). API `listsubscribe` then adds contacts immediately (`"User successfully subscribed."`). Do **not** enable signup forms unless you want double opt-in.
3. **Welcome email** — see [Welcome workflow](#welcome-workflow-on-subscribe) below. Sent from Campaigns automation, not Next.js or ZeptoMail.
4. **OAuth scope** — Regenerate refresh token with `ZohoCampaigns.contact.ALL` (keep existing CRM scopes). Update `ZOHO_REFRESH_TOKEN` in `.env.local` + Vercel.
5. **Env vars** — Set `ZOHO_CAMPAIGNS_LIST_KEY`, `ZOHO_CAMPAIGNS_API_BASE=https://campaigns.zoho.sa`, and `FEATURE_NEWSLETTER=1` on staging; smoke-test AR + EN signup; then production.
6. **API host** — SA accounts must use `campaigns.zoho.sa` (not `.com`). `src/lib/env.ts` derives this from `ZOHO_API_BASE` when unset.

### Welcome workflow (on subscribe)

Website subscribe calls Campaigns `listsubscribe`. With signup forms **disabled**, the contact is added to `SAH Newsletter` immediately and a **List Entry** workflow can send the welcome email right away.

**Do not use a “signup form” / “form submission” trigger.** The site does not use a Campaigns embedded form; API joins will never fire that trigger.

#### In Zoho Campaigns (SA DC: Campaigns from [Zoho One](https://one.zoho.sa))

Preferred (current UI): **Automation → Workflows → Create**

1. Name: `SAH Newsletter Welcome`.
2. Trigger: **List Entry** (sometimes labelled “When a contact is added to a mailing list”).
3. List: `SAH Newsletter`.
4. Audience: **new contacts only** (do not backfill the whole list on activate).
5. First action: **Send email**, delay **Immediately** / `0`.
6. Branch on field `Locale` (custom field — site sends `ar` / `en`):
   - `Locale` = `ar` → Arabic template (RTL).
   - `Locale` = `en` → English template.
   - else → Arabic (site default).
7. Activate the workflow.

Fallback if Workflows is unavailable: **Automation → Autoresponders → Create → Signup / list-based**. Same list, first message delay **0**.

#### Templates (paste into the two Send email steps)

Sender: verified Campaigns sender on `sah.com.sa` (same SPF/DKIM/DMARC as ZeptoMail). Campaigns will append unsubscribe — do not remove it.

**English**

- Subject: `You're in — welcome to the SAH newsletter`
- Preheader: `Insights and offers from SAH Group. Unsubscribe anytime.`
- Body:

```
Hello,

Thank you for subscribing to the SAH Group newsletter.

We’ll send occasional news, insights, and offers — no spam, and you can unsubscribe anytime.

Explore SAH: https://sah.com.sa/en

— SAH Group
```

**Arabic**

- Subject: `أهلاً بك في نشرة سعة`
- Preheader: `أخبار ورؤى وعروض من مجموعة سعة. يمكنك إلغاء الاشتراك في أي وقت.`
- Body (RTL in the editor):

```
مرحباً،

شكراً لاشتراكك في نشرة مجموعة سعة.

سنرسل بين الحين والآخر أخباراً ورؤى وعروضاً — دون رسائل مزعجة، ويمكنك إلغاء الاشتراك في أي وقت.

اكتشف سعة: https://sah.com.sa

— مجموعة سعة
```

#### How to QA

1. Subscribe from `/en` with a fresh inbox → contact on `SAH Newsletter` + welcome EN within a few minutes.
2. Repeat from `/` (AR) → welcome AR.
3. Re-subscribe the same address → no second welcome (duplicate / already subscribed; re-enrollment off).

### Staging QA checklist

- [x] Footer newsletter (AR `/`) + inline form (EN `/en`) → active subscriber on `SAH Newsletter`
- [x] Welcome email arrives on subscribe (no separate opt-in step)
- [x] Contact / group / program forms still create CRM leads
- [x] Wrong list key → newsletter shows submit error (not fake success)
- [x] No SalesIQ/PageSense in page source

---

## Phase 4 — Marketing → Sanity Migration

**Status:** **Complete** (1 September 2026)  
**Flag:** `FEATURE_CMS=1` (same flag as coaches; marketing merges onto JSON fallback when CMS docs missing)

### Architecture

- **Hybrid document model:** localized `homePage`, `companyPage`, `program`, and `pageSeo` documents (document-per-locale via `@sanity/document-internationalization`).
- **Single swap points:** `getContent()` and `getPageSeo()` in `src/content/index.ts` — components unchanged.
- **Partial merge:** Sanity slices override matching JSON fallback fields; `FEATURE_CMS=0` serves full static JSON.
- **Assets:** marketing images uploaded to Sanity CDN via seed scripts; mappers resolve `imageWithAlt` → URL strings for existing components.

### What was implemented

#### Schemas
- Reusable marketing object types under `src/sanity/schemas/objects/` (`marketingPrimitives.ts`, `marketingSections.ts`)
- Expanded `homePage` — all homepage sections + nav/footer/UI chrome
- `companyPage` — six entity pages (`human`, `seera`, `nexus`, `connect`, `lego`, `impact`)
- `program` — 34 programs per locale with stable `programId`
- Completed `pageSeo` — `path`, `ogImage`, `absoluteTitle`, `robots`
- i18n plugin registers all four marketing document types

#### Mappers + facades
- `src/content/mappers/home.ts` — home, company, program mapping with image resolution
- `src/content/mappers/pageSeo.ts` — page SEO mapping
- `src/content/mappers/shared.ts` — merge + image helpers
- `getContent()` and `getPageSeo()` are **async** with tagged Sanity fetches (`home`, `seo`, `companies`, `programs`)
- `src/content/catalog/programs.ts` — Sanity-backed with JSON fallback

#### Seed + validation scripts
- `npm run seed:page-seo` — 20 AR/EN pageSeo pairs + OG image upload + translation links
- `npm run seed:marketing` — homePage, companyPage (×6), program (×34) per locale + assets
- `npm run validate:marketing` — document counts and SEO key parity check

#### Revalidation
- Webhook tag map extended: `companyPage` → `companies`, `program` → `programs`
- Sanity webhook filter should include: `homePage`, `pageSeo`, `companyPage`, `program`

### Exit criteria

| Criterion | Status |
|---|---|
| All marketing sections editable in Studio | **Met** |
| AR + EN published for all live URLs | **Met** |
| `home.json` is fallback only | **Met** (merge pattern; JSON retained for rollback) |
| Revalidation fires on content publish | **Met** |
| SEO checklist | **Met** |

### Staging QA checklist

- [x] `npm run seed:page-seo` + `npm run seed:marketing` run against staging dataset
- [x] `npm run validate:marketing` passes
- [x] AR/EN translation links verified in `/studio`; both locales published per document
- [x] `/` + `/en`, all six company pages, program detail pages, metadata, FAQ JSON-LD, nav anchors
- [x] Studio publish triggers revalidation without redeploy
- [x] Production dataset seeded; AR+EN published; webhook filter includes `companyPage` and `program`

### Rollback

- **Slice-level:** unpublish the affected Sanity document; JSON fallback serves that slice.
- **Emergency:** `FEATURE_CMS=0` + redeploy reverts all CMS content (including coaches).

---

## Phase 5 — Supabase Auth + Dashboard Guard

**Status:** **Complete** (3 September 2026)  
**Flag:** `FEATURE_AUTH=1` (enable on staging/production after env + redirect URLs are set)

### What was implemented

- Runtime-separated Supabase clients (`src/lib/supabase.ts`, `src/lib/supabase-server.ts`, `src/lib/supabase-middleware.ts`)
- `profiles` table migration with owner-only read/update RLS (`supabase/migrations/001_profiles.sql`)
- Email/password register, confirmation callback, login, sign-out, forgot-password, and password-update flows
- Hardened `/auth/callback` (PKCE `code`, `token_hash`, hash-fragment complete page) for recovery/confirmation links
- Idempotent `/api/auth/onboard` route; verified session creates a Zoho CRM Contact and linked Supabase profile
- Profile save API syncs Auth user metadata, `profiles`, and existing Zoho CRM Contact; email is immutable server-side
- Locale-aware dashboard guard + guest-auth redirect (login/register/forgot-password → dashboard when signed in) in `src/proxy.ts`
- Auth-aware marketing header (compact user menu) and minimal auth/dashboard chrome
- Dashboard shell redesign (collapsible sidebar, top bar, overview/courses/bookings/profile UX)
- Coach profile booking auth gate hidden when signed in

### Verification

| Criterion | Status |
|---|---|
| TypeScript check | **Met** (`npm run typecheck`) |
| Register → confirmation → login → dashboard → sign out | **Met** (local/`FEATURE_AUTH=1`) |
| Unauthenticated dashboard redirects to locale login | **Met** |
| Guest auth pages redirect signed-in users to dashboard | **Met** |
| Profile row created / updated after registration & save | **Met** |
| Zoho CRM Contact created/updated when Contacts scope is configured | **Met** (requires Zoho Contacts OAuth scope) |
| Auth pages remain `noindex` | **Met** |

### Ops notes (keep configured per environment)

1. Supabase Auth redirect allowlist includes `{SITE_URL}/auth/callback` (and local `http://localhost:3000/auth/callback`).
2. `supabase/migrations/001_profiles.sql` applied on each Supabase project.
3. Zoho refresh token includes Contacts create/update scope.
4. `FEATURE_AUTH=1` plus Supabase public + service-role env vars on staging/production.

---

## Phase 6 — Courses in Sanity + `/courses/[slug]`

**Implemented:** September 3, 2026

### Delivered

- Added locale-resolved `CourseDetail` and curriculum module mapping while keeping Mux playback identifiers outside the Phase 6 UI model.
- Added `/courses/[slug]` and `/en/courses/[slug]` with hero/thumbnail, course metadata, curriculum accordion, free-preview labels, and a disabled Coming Soon purchase CTA.
- Added localized metadata, Course JSON-LD, breadcrumb JSON-LD, canonical and hreflang alternates through the existing SEO helpers.
- Linked course listing cards to detail pages and added course URLs to ItemList JSON-LD and the localized sitemap.
- Added `npm run seed:courses`, which safely creates six unpublished course records in the Sanity `staging` dataset and preserves existing editorial content.

### Verification

| Criterion | Status |
|---|---|
| TypeScript check | **Met** (`npm run typecheck`) |
| ESLint | **Met** (0 errors; 2 unrelated existing warnings) |
| Production build | **Met** (`npm run build`) |
| Bilingual detail mapper and static fallback assertions | **Met** |
| Checkout or payment functionality absent | **Met** |
| Video playback absent | **Met** |
| CMS staging course pages (content + publish + locale QA) | **Met** (ops confirmed) |
| Rich Results Test + Search Console sitemap + request indexing | **Deferred** — do after deploy to the real public domain |

### Ops status

- Seed, Studio bilingual content, publish, and staging locale QA: **done**.
- Google crawlability checks remain open until production-domain deploy:
  1. Rich Results Test on one AR and one EN course URL
  2. Submit `sitemap.xml` in Google Search Console
  3. Request indexing for those course URLs
