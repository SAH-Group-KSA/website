# SAH Group Website — Technical Map

A route-by-route and flow-by-flow technical reference for the current codebase, built by direct
inspection of the source (file:line citations throughout). This is a snapshot as of 2026-09-17 —
re-verify citations before relying on exact line numbers after future edits. See also
[`CLAUDE.md`](../CLAUDE.md) (architecture rules) and [`SAH-CONTEXT.md`](./SAH-CONTEXT.md)
(business context).

No application code was modified in producing this document.

---

## Global Notes That Apply Across Routes

- Every locale page is `src/app/[locale]/.../page.tsx`, an async Server Component. `params.locale`
  is validated with `isLocale()` (`src/types/locale.ts`) and `notFound()` fires on an invalid
  locale segment — the only 404 trigger tied to locale itself.
- `setRequestLocale(locale)` (next-intl) is called near the top of every page before any content
  fetch, enabling static rendering per locale.
- Content is fetched through `getContent(locale)` (`src/content/index.ts:114-151`), `React.cache`-
  wrapped so multiple components in one request share a single fetch. It branches on
  `features.cms` (`src/lib/features.ts:15`, env `FEATURE_CMS`, default `false`).
- **Two hardcoded kill switches, independent of any env flag, currently gate the coach and course
  catalogs off entirely**: `COACHES_COMING_SOON = true` (`src/lib/coaches-availability.ts:5`) and
  `COURSES_COMING_SOON = true` (`src/lib/courses-availability.ts:5`). Both are source-level
  constants, not env-driven — flipping them requires a code change + redeploy. While true, every
  coaches/courses route renders `ComingSoonBanner` instead of real data, and — critically — the
  `[slug]` detail pages **skip their own `getCoachBySlug`/`getCourseBySlug` + `notFound()` calls
  entirely**, meaning an invalid slug currently returns 200 (coming-soon content) instead of a 404.
- No `middleware.ts` exists — Next.js 16 uses `src/proxy.ts` instead (locale routing, dashboard
  "unready" redirects, Supabase session guarding).
- No try/catch wraps `getContent`'s `Promise.all` Sanity fetch (`src/content/index.ts:124-129`) or
  the page-level `getCoaches`/`getCourses`/`getCoachBySlug`/`getCourseBySlug`/`getProgramById`
  calls — a Sanity outage under `FEATURE_CMS=1` bubbles as an unhandled rejection (500), with no
  fallback to static content for these specific calls (the homepage's `catalogPages` merge is the
  one deliberate exception, via `mergeFilled` at `src/content/index.ts:144-147`).

---

## Part 1 — Route-by-Route Reference

### `/` — Homepage

- **Route**: `/` (ar), `/en` (en). File: `src/app/[locale]/page.tsx`.
- **Purpose**: Marketing homepage assembling all top-of-funnel sections (hero, promise, entities,
  method, programs, journeys, partners, impact, initiatives, about, community, FAQ, contact)
  (`page.tsx:82-135`).
- **Data source**: `getContent(locale)` (`page.tsx:80`) — off `FEATURE_CMS`: `staticContent(locale)`
  reading `src/content/{ar,en}/home.json` (`index.ts:61-72`); on: parallel Sanity fetches for
  `homePage`, `siteSettings`, `companyPage`, `program` docs (`index.ts:124-129`, tags
  `home`/`site-settings`/`companies`/`programs`, home doc uses `revalidate: 30`). `getPageSeo(locale,
  "home")` for metadata (`page.tsx:60-68`).
- **Important components**: Static imports — `HeroSection`, `PromiseSection`, `NeedTeaserSection`,
  `MethodIntroSection`, `PartnersSection`, `ImpactSection`, `AboutSection`, `CommunitySection`,
  `FaqSection`. `next/dynamic` (still SSR'd) — `EntitiesSection`, `MethodSection`,
  `ProgramsSection`, `JourneysSection`, `InitiativesSection`, `ContactSection`. All from
  `src/components/sections/*`.
- **Server/client boundary**: Page is a server component. `EntitiesSection`, `ProgramsSection`,
  `JourneysSection`, `MethodSection`, `ContactSection` are `"use client"` — all interactivity
  (carousels, filters, lead forms) lives there.
- **External APIs**: `ContactSection`'s form → `submitContactLead` → `POST /api/zoho/contact`.
- **Authentication requirements**: None — fully public.
- **Potential failure points**: Unhandled `Promise.all` rejection on Sanity outage (`FEATURE_CMS=1`)
  → 500 for the whole homepage; partial/missing Sanity fields silently render blank strings (no
  error); `revalidate: 30` means CMS edits can lag up to 30s, longer if the revalidate webhook
  fails; empty CMS FAQ could emit an empty JSON-LD `FAQPage` block.

### `/discovery`

- **Route**: `/discovery`, `/en/discovery`. File: `src/app/[locale]/discovery/page.tsx`.
- **Purpose**: Hosts the journey wizard that recommends a pathway and captures a discovery-call
  lead (`page.tsx:54-87`).
- **Data source**: `getContent(locale)` — reads `content.need`, `content.contact`,
  `content.journeyChallenges`, `content.entityColors`.
- **Important components**: `PageHero`; `DiscoveryFormClient` (thin `"use client"` wrapper) →
  `JourneyWizard` (`"use client"`, 3-stage state machine: audience → challenge → contact) →
  `JourneyStage`, `DiscoveryRequestForm` (`"use client"`, the compact lead form).
- **Server/client boundary**: Page is server-rendered; all interactivity is in `JourneyWizard` +
  `DiscoveryRequestForm`. Wizard state (`stageIndex`) is local — a page refresh resets to stage 0,
  no URL/query persistence.
- **External APIs**: `DiscoveryRequestForm.onSubmit` → `submitDiscoveryLead()` →
  `POST /api/zoho/discovery`, gated by `guardZohoConfigured()`.
- **Authentication requirements**: None — public.
- **Potential failure points**: With default env (`FEATURE_ZOHO_FORMS` off), every submission
  fails with a 503 `not_configured`, surfaced to the user as a generic error banner (no
  distinction between "feature off," "Zoho down," or "network error"). Zod requires
  `pathwayTitle`/`audienceLabel`/`needLabel` non-empty — a partial CMS doc with empty labels would
  400 with a generic message. `postZohoForm` catches network errors gracefully (no unhandled
  rejection). No dynamic-segment 404 risk.

### `/coaches`

- **Route**: `/coaches`, `/en/coaches`. File: `src/app/[locale]/coaches/page.tsx`.
- **Purpose**: Coach marketplace listing (search + specialty filter + booking CTA) —
  **currently coming-soon gated**.
- **Data source**: `content.catalogPages!.coaches` for chrome; `getCoaches(locale)`
  (`src/content/catalog/coaches.ts:191-202`) **only called when not coming-soon**
  (`const coaches = COACHES_COMING_SOON ? [] : await getCoaches(locale)`, `page.tsx:44`). Off CMS:
  maps static `COACH_RECORDS` (6 seed coaches, `coaches.ts:16-163`) via `resolveCoach()`; on CMS:
  `sanityClient.fetch(COACHES_QUERY, {}, {tags:["coaches"]})` → `mapCoachDocument`, filtering nulls.
- **Important components**: `ComingSoonBanner` (currently live). Dead-path real UI:
  `CoachesListClient` (`"use client"`) — client-side search/filter over the server-passed array
  (no client-side fetching), `ListingCard` grid.
- **Server/client boundary**: Page server-rendered; `CoachesListClient` is the only client
  component, filtering purely against the prop it receives.
- **External APIs**: None client-side — all reads happen server-side.
- **Authentication requirements**: None — public.
- **Potential failure points**: `COACHES_COMING_SOON` hardcoded `true` — entire catalog +
  booking flow unreachable regardless of CMS readiness, requires a code change to lift. No
  try/catch around `getCoaches` at the page level — a Sanity outage (once lifted) would 500 the
  page. Client-side specialty filter is a fragile substring match against localized label text.

### `/coaches/[slug]`

- **Route**: `/coaches/[slug]`, `/en/coaches/[slug]`. File: `src/app/[locale]/coaches/[slug]/page.tsx`.
- **Purpose**: Individual coach profile — bio, credentials, topics, a disabled booking-slot grid,
  reviews (`page.tsx:121-310`).
- **Data source**: `getCoachSlugs()` drives `generateStaticParams`. `getCoachBySlug(locale, slug)`
  (`coaches.ts:204-219`) — off CMS: linear `find()` over `COACH_RECORDS`; on CMS: Sanity
  `COACH_BY_SLUG_QUERY` (filters `published == true`) → `mapCoachDocument`.
- **Important components**: No dedicated component file — entire layout inlined in `page.tsx:121-
  310` (unlike courses, coaches has no `CoachDetail.tsx`).
- **Server/client boundary**: Fully server-rendered, zero interactivity — booking-slot buttons are
  static `disabled` buttons (`page.tsx:276`).
- **External APIs**: None. Reads `createSupabaseServerClient()` directly (not via adapter) to check
  auth state for the booking-gate message only (`page.tsx:104-107`).
- **Authentication requirements**: Conditional messaging only — if `FEATURE_AUTH` is on and the
  visitor isn't signed in, shows a sign-in/create-account prompt instead of the (still-disabled)
  booking slots (`page.tsx:251-264`). Has no functional consequence today since booking itself
  doesn't work regardless.
- **Potential failure points**: **While `COACHES_COMING_SOON=true` (current default), this page
  never calls `getCoachBySlug` at all — an invalid slug returns 200 (coming-soon content) instead
  of 404**, masking broken links. Once the flag is lifted: `notFound()` correctly fires for a
  missing coach (`page.tsx:95-96`). Supabase session lookup is try/caught, fails closed to
  `isAuthenticated=false` on error (safe but could mis-render the auth gate during a Supabase
  outage). `languages.join("، ")` hardcodes the Arabic comma separator even in English locale — a
  display bug, not a crash.

### `/coaches/group`

- **Route**: `/coaches/group`, `/en/coaches/group`. File: `src/app/[locale]/coaches/group/page.tsx`.
- **Purpose**: Static lead-gen page for group/organizational coaching interest with a program-
  selection + contact form.
- **Data source**: `getContent(locale)` only — `content.catalogPages!.coachesGroup` for all copy
  including the list of selectable programs. No dedicated coach/course data fetch.
- **Important components**: `GroupInterestFormClient` (`"use client"`) — radio program picker +
  name/email/phone/org/message fields.
- **Server/client boundary**: Page server-rendered; all form state in the client component.
- **External APIs**: `submitGroupInterest()` → `POST /api/zoho/group`, same `guardZohoConfigured()`
  gate as discovery.
- **Authentication requirements**: None — public.
- **Potential failure points**: Same Zoho-not-configured 503 risk as discovery. Client blocks
  submit if no program is selected (good UX guard). If `catalogPages!.coachesGroup.programs` were
  ever empty, the form has no guard against an empty radio group (would permanently block
  submission) — currently theoretical since this content is static.

### `/courses`

- **Route**: `/courses`, `/en/courses`. File: `src/app/[locale]/courses/page.tsx`.
- **Purpose**: Course catalog listing (price/modules/duration cards) — **currently coming-soon
  gated**.
- **Data source**: `content.catalogPages!.courses` for chrome; `getCourses(locale)` (`courses.ts:
  125-136`), only called when not coming-soon. Off CMS: maps static `COURSE_RECORDS` (6 seed
  courses); on CMS: Sanity `COURSES_QUERY` → `mapCourseDocument`.
- **Important components**: `ComingSoonBanner` (currently live). Dead-path real UI: plain
  server-rendered `ListingCard` grid inlined in `page.tsx:97-140` — **no client-side search/filter
  exists here** (unlike coaches).
- **Server/client boundary**: Entirely server component, zero `"use client"` anywhere in this
  route's tree.
- **External APIs**: None.
- **Authentication requirements**: None — public.
- **Potential failure points**: Same hardcoded coming-soon gate as coaches. No try/catch around
  `getCourses` — a Sanity outage (once lifted) would 500 the page. No filtering means no future-
  proofing if the catalog grows.

### `/courses/[slug]`

- **Route**: `/courses/[slug]`, `/en/courses/[slug]`. File: `src/app/[locale]/courses/[slug]/page.tsx`.
- **Purpose**: Course detail/curriculum page with module accordion and a disabled purchase CTA.
- **Data source**: `getCourseSlugs()` drives `generateStaticParams`. `getCourseBySlug(locale,
  slug)` (`courses.ts:138-153`) returns a `CourseDetail` (course + `modulesList`). Off CMS: static
  branch **always returns an empty `modulesList`** (`courses.ts:144`) — curriculum accordion is
  empty by design when CMS is off, for all 6 seed courses. On CMS: Sanity `COURSE_BY_SLUG_QUERY` →
  `mapCourseDetailDocument`.
- **Important components**: `CourseDetail` (`src/components/courses/CourseDetail.tsx`, server
  component) — hero, `Accordion` of modules, purchase sidebar with a disabled "Coming Soon" button
  (no `onClick`).
- **Server/client boundary**: Fully server-rendered.
- **External APIs**: None — no purchase/checkout API is invoked from this page.
- **Authentication requirements**: None — no auth gate on this route (contrast with
  `/coaches/[slug]`, which does check Supabase auth for messaging purposes).
- **Potential failure points**: Same coming-soon short-circuit as coaches — invalid slugs return
  200 while the flag is on. Once lifted, `notFound()` correctly fires for a missing course. Even
  with the flag off, static (non-CMS) courses always show "empty curriculum" since `modulesList`
  is hardcoded empty. No try/catch around `getCourseBySlug` under `FEATURE_CMS=1`.

### `/community/apply`

- **Route**: `/community/apply`, `/en/community/apply`. File:
  `src/app/[locale]/community/apply/page.tsx`.
- **Purpose**: Application form to join SAH Impact or LEGO by SAH community.
- **Data source**: `getContent(locale)` — `content.community.cards`, `content.community.applyPage`.
  `getPageSeo(locale, "communityApply")`.
- **Important components**: `CommunityApplyFormClient` (`"use client"`) — the only interactive
  piece.
- **Server/client boundary**: Page server-rendered; all form state client-side.
- **External APIs**: `submitCommunityApplication()` → `POST /api/zoho/community`, validated by
  Zod, gated by `guardZohoConfigured()`, creates a Zoho CRM **Application** record (different
  module from the Leads-based routes).
- **Authentication requirements**: None — public.
- **Potential failure points**: A stray non-empty `apply.formDevNotice` CMS field would leak a
  visible dev-mode banner to real users (`page.tsx:129-131`). Same 503/500 Zoho-gating pattern as
  other lead forms, same generic error messaging regardless of cause.

### `/[company]` — Entity landing pages

- **Route**: `/{slug}`, `/en/{slug}` for `slug ∈ {sah-human, seera, sah-nexus, sah-sponsor,
  lego-by-sah, sah-impact}` (`src/lib/companies.ts:20-27`). File: `src/app/[locale]/[company]/page.tsx`.
- **Purpose**: Full marketing landing page for one SAH Group sub-brand.
- **Data source**: `getCompanyBySlug(company)` — pure lookup, no CMS branch. `getContent(locale)`.
  Body: `content.entityPages[route.entityId]` and `content.entities.find(...)`.
- **Important components**: `CompanyHomePage` → `CompanyHero`, `CompanyOfferings`,
  `CompanyProfile`, plus shared sections (`PromiseSection`, `NeedTeaserSection`, `FaqSection`
  static; `ProgramsSection`, `JourneysSection`, `ContactSection` via `next/dynamic`, still SSR'd).
- **Server/client boundary**: Entire `src/components/company/*` set is server components — no
  client state owned at this layer.
- **External APIs**: None directly; `ContactSection` (dynamically imported) wires to the same
  Zoho lead adapters used elsewhere.
- **Authentication requirements**: None — public.
- **Potential failure points**: Invalid `company` slug → `notFound()` (only the 6 known slugs are
  statically generated). **Key CMS-fallback gap**: if `content.entityPages[entityId]` or the
  matching entity is missing (e.g. a not-yet-published Sanity doc under `FEATURE_CMS=1`), the
  whole route 404s — `entityPages` has **no static-JSON fallback merge** (unlike `catalogPages`,
  which does), so an unauthored entity page hard-fails rather than degrading.

### `/program/[id]`

- **Route**: `/program/[id]`, `/en/program/[id]`. File: `src/app/[locale]/program/[id]/page.tsx`.
- **Purpose**: Program detail page with a "register your interest" lead form.
- **Data source**: `getProgramIds()` (**always reads the English catalog**, `programs.ts:37`) for
  `generateStaticParams`. `getProgramById(locale, id)` — off CMS: `staticPrograms(locale)`; on
  CMS: Sanity `PROGRAMS_QUERY` (locale-scoped via `language == $locale`) → `mapPrograms()`, **no
  static fallback if the Sanity result set is empty** (returns `[]`, not static data).
- **Important components**: `ProgramDetail` (server component) with `ProgramInterestFormClient`
  (`"use client"`) in its action slot.
- **Server/client boundary**: Page and `ProgramDetail` are server components; form state is
  entirely client-side in `ProgramInterestFormClient`.
- **External APIs**: `submitProgramInterest()` → `POST /api/zoho/program`.
- **Authentication requirements**: None — public.
- **Potential failure points**: `notFound()` fires correctly for an unknown `id`. Since
  `getProgramIds()` always enumerates from the **English** catalog, an Arabic-only or English-only
  program (if CMS data ever diverges by locale) would 404 on the locale missing that document,
  despite the id being "valid" in the other locale. Under `FEATURE_CMS=1` with an empty/misconfigured
  Sanity dataset, `programsFor` returns `[]` and **every** `/program/[id]` request 404s — a
  stricter failure mode than `getContent`'s partial-fallback pattern.

### `/auth/login`

- **Route**: `/auth/login`, `/en/auth/login`. File: `src/app/[locale]/auth/login/page.tsx`.
- **Purpose**: Email/password sign-in, surfaces errors forwarded from the `/auth/callback` flow
  via `?error=`.
- **Data source**: `getContent(locale)` for `siteName`/`logoAlt` only; `getPageSeo(locale,
  "authLogin")`.
- **Important components**: `LoginFormClient`, wrapped in `<Suspense>` (uses `useSearchParams`).
- **Server/client boundary**: Page server-rendered; all state (email/password, submit, `linkError`
  derived from query params) in `LoginFormClient`.
- **External APIs**: `signIn()` (`src/adapters/supabase/auth.ts:39-49`) →
  `supabase.auth.signInWithPassword()`. On success, `postAuthDestination(next, pathname)`.
- **Authentication requirements**: **Guest-only** — `src/proxy.ts` redirects signed-in users away
  when `FEATURE_AUTH` is on. When the flag is off, the guard is skipped entirely (page reachable
  by anyone) but `signIn()` itself always short-circuits to `not_configured`.
- **Potential failure points**: `linkError` code mapping covers `otp_expired`, `access_denied`,
  `invalid_callback`, `callback_failed`, `not_configured` — any new error code introduced
  elsewhere without updating this mapping falls through to a generic message. A fully "dead" login
  form is publicly reachable when `FEATURE_AUTH` is off (proxy guard bypassed, form permanently
  non-functional).

### `/auth/register`

- **Route**: `/auth/register`, `/en/auth/register`. File: `src/app/[locale]/auth/register/page.tsx`.
- **Purpose**: Account creation (name/email/password/confirm) with a "check your email"
  confirmation state.
- **Data source**: Same pattern as login.
- **Important components**: `RegisterFormClient` (not wrapped in Suspense — no `useSearchParams`).
- **Server/client boundary**: Page server-rendered; client component owns all form state.
- **External APIs**: `signUp()` (`auth.ts:51-80`) — sets `emailRedirectTo` to
  `/auth/callback?next=...`, stores `full_name`/`locale` metadata. **If Supabase returns an
  immediate session** (email confirmation disabled in the Supabase project), the adapter
  immediately POSTs `/api/auth/onboard` itself — this is one of **three independent onboarding
  triggers** (see Flow 3 below).
- **Authentication requirements**: Guest-only, same mechanism as login.
- **Potential failure points**: **Duplicate onboarding race**: `signUp`'s immediate-session path,
  the server `/auth/callback` route, and the client `/auth/callback/complete` page can all
  independently call `onboardUser()`. Its only guard is a non-atomic
  `existing?.zoho_crm_contact_id` read-then-upsert — two near-simultaneous calls can both read
  `null` before either upsert completes, creating **two Zoho CRM contacts** for one user (the
  Supabase `profiles` row itself is protected by `onConflict:"id"`, so no duplicate profile rows
  result). If the eager onboard POST fails, the user sees "Account created, but profile setup
  failed" even though the Supabase account was created successfully.

### `/auth/forgot-password`

- **Route**: `/auth/forgot-password`, `/en/auth/forgot-password`. File:
  `src/app/[locale]/auth/forgot-password/page.tsx`.
- **Purpose**: Collects an email and triggers a Supabase password-reset email.
- **Data source**: `getContent(locale)` for `logoAlt` only.
- **Important components**: `ForgotPasswordFormClient`.
- **Server/client boundary**: Page server-rendered; client component owns email/state/error.
- **External APIs**: `resetPassword()` → `supabase.auth.resetPasswordForEmail(email, {redirectTo:
  callbackUrl(prefix + "/auth/reset-password")})`.
- **Authentication requirements**: Guest-only (same `proxy.ts` mechanism).
- **Potential failure points**: Only client-side email-format validation, no rate limiting in this
  code (Supabase's own throttling would apply upstream). Success/failure disclosure for unknown
  emails is Supabase's own behavior (always shows "check your email" for a valid-format address,
  preventing enumeration) — but a genuine Supabase-side error (e.g. rate-limited) shows the raw
  message verbatim to the user.

### `/auth/reset-password`

- **Route**: `/auth/reset-password`, `/en/auth/reset-password`. File:
  `src/app/[locale]/auth/reset-password/page.tsx`. **Deliberately excluded** from
  `isGuestAuthPath()` in `proxy.ts` (comment: "reset-password stays reachable for recovery
  sessions").
- **Purpose**: Lets a user with a valid Supabase recovery session set a new password.
- **Data source**: `getContent(locale)` for `logoAlt` only. Uses a **static** `export const
  metadata` (`robots: {index:false, follow:false}`) rather than `generateMetadata`/`getPageSeo`.
- **Important components**: `ResetPasswordFormClient` — runs `supabase.auth.getSession()` on
  mount to verify a recovery session exists before rendering the form.
- **Server/client boundary**: Page server-rendered; client component gates its own render on
  session-check state (`"checking"` → `"ready"`/`"invalid"`).
- **External APIs**: `updatePassword()` → `supabase.auth.updateUser({password})`. Relies on a
  recovery session already established by `/auth/callback` or `/auth/callback/complete`.
- **Authentication requirements**: Effectively "recovery-session-only," enforced **purely
  client-side** — there is no server-side (proxy-level) guard for this path at all.
- **Potential failure points**: If `getSession()` returns no session (expired/used link, or direct
  navigation without a token), state becomes `"invalid"` with a "request a new link" CTA — the
  only fallback. This is the terminal failure point for the entire password-reset chain; if the
  earlier hash/code exchange silently failed, this page offers no diagnostic beyond "invalid."

### `/auth/callback` and `/auth/callback/complete` (non-locale)

- **Routes**: `/auth/callback` (server GET route handler), `/auth/callback/complete` (client
  page). Both excluded from all `proxy.ts` processing (`pathname.startsWith("/auth/callback")`
  short-circuits to `NextResponse.next()`).
- **Purpose**: Exchange a Supabase auth code/OTP/hash-fragment token set for a session, run
  onboarding, redirect to a safe destination.
- **Data source**: N/A — pure auth plumbing. Uses `postAuthDestination()`
  (`src/lib/dashboard-availability.ts:32-48`) and `onboardUser()` (`src/lib/onboard-user.ts`).
- **Server/client boundary**: `route.ts` is server-only and can only read query params, not hash
  fragments — hence the redirect-to-client-page branch for implicit/hash-based flows.
  `complete/page.tsx` is `"use client"` and parses both `location.search` and `location.hash`.
- **External APIs**: Server: `exchangeCodeForSession(code)` or `verifyOtp({type, token_hash})`.
  Client: `setSession()` (hash flow), `exchangeCodeForSession()`, or `verifyOtp()`, then a fetch to
  `/api/auth/onboard` (since client code can't call `onboardUser` directly).
- **Authentication requirements**: None inherently — this route pair *creates* the session.
  `FEATURE_AUTH` off → immediate redirect to login with `not_configured`.
- **Potential failure points — the most fragile part of the app**:
  - `SAFE_NEXT_PATH` allowlist (`route.ts:8-9`, mirrored independently in `complete/page.tsx:7-16`
    and `proxy.ts`) is duplicated in **three places** — any future change to allowed redirect
    targets must be updated in all three or the halves diverge.
  - Hash-fragment blind spot: server can't distinguish "hash-based success" from "no params at
    all" — both forward to `/auth/callback/complete`.
  - All session-exchange errors collapse into just two codes (`otp_expired` / `callback_failed`) —
    network errors, rate limits, and misconfiguration all look identical to the user.
  - Onboarding only runs when `next` targets `/dashboard*`, `/`, or `/en` — a recovery-flow visit
    (`next=/auth/reset-password`) never triggers onboarding (acceptable, since recovery implies an
    existing account, but worth knowing).
  - **Duplicate onboarding race** (cross-referenced from `/auth/register` above) — three
    independent trigger points, non-atomic guard.

### `/dashboard`

- **Route**: `/dashboard`, `/en/dashboard`. Files: `src/app/[locale]/dashboard/page.tsx`,
  `layout.tsx`.
- **Purpose**: Dashboard overview — greeting, 4 stat cards, "continue learning"/"next session"
  empty-state panels, quick-action shortcuts.
- **Data source**: `getContent(locale)`. If `FEATURE_AUTH` is on: Supabase `auth.getUser()` +
  `profiles.select("full_name")` for the greeting name. **All 4 stat values are hardcoded** (`"0"`,
  `"0%"`, name-conditional `"75%"/"40%"`) — no live enrollment/booking/progress data is wired.
- **Important components**: `DashboardShell` (client, sidebar nav, persists collapsed-state to
  `localStorage["sah-dashboard-sidebar"]`), calls `signOut`.
- **Server/client boundary**: Page/layout are server components; `DashboardShell` wraps children
  and is a client component.
- **External APIs**: Supabase only (auth + `profiles` read), no Zoho/Sanity here.
- **Authentication requirements vs. actual reachability**: Nominally gated by `proxy.ts`'s
  `/dashboard/**` session check when `FEATURE_AUTH` is on. **However, `isUnreadyDashboardPath()`
  (`src/lib/dashboard-availability.ts`) intercepts this exact path unconditionally, before the
  auth check runs — every request, authenticated or not, is redirected to the locale home page.
  This route is currently dead in production regardless of auth state.**
- **Potential failure points**: If `FEATURE_AUTH` is true but Supabase env vars are missing,
  `createSupabaseServerClient()` throws inside the Server Component — an unhandled render error,
  not a graceful message (moot today given the unready redirect, but relevant if lifted).

### `/dashboard/courses`

- **Route**: `/dashboard/courses`, `/en/dashboard/courses`. File:
  `src/app/[locale]/dashboard/courses/page.tsx`.
- **Purpose**: "My Courses" — in-progress and completed sections, both hardcoded empty (badge
  `0`), with an explicit dev notice about future wiring.
- **Data source**: Static content only (`getContent`, `getPageSeo`) — no Supabase/Sanity/LMS calls
  at all.
- **Important components**: `Button` and hand-rolled empty-state blocks only.
- **Server/client boundary**: Fully server component, zero interactivity.
- **External APIs**: None.
- **Authentication requirements vs. reachability**: Same as `/dashboard` — listed in
  `UNREADY_EXACT`/`UNREADY_PREFIXES`, unconditionally redirected home. Not reachable in
  production.
- **Potential failure points**: None functional (static page); the unready redirect is the only
  thing intercepting it.

### `/dashboard/bookings`

- **Route**: `/dashboard/bookings`, `/en/dashboard/bookings`. File:
  `src/app/[locale]/dashboard/bookings/page.tsx`.
- **Purpose**: "My Bookings" — upcoming/past sessions, static empty states, dev notice about
  future scheduling-system sync.
- **Data source**: Static content only — no booking/Zoho Bookings API calls despite
  `features.bookings` existing as a flag.
- **Important components**: `Button`, static SVG empty-state blocks.
- **Server/client boundary**: Fully server component.
- **External APIs**: None.
- **Authentication requirements vs. reachability**: Same unready-redirect pattern — not reachable
  in production regardless of session state.
- **Potential failure points**: None functional; static page.

### `/dashboard/profile`

- **Route**: `/dashboard/profile`, `/en/dashboard/profile`. File:
  `src/app/[locale]/dashboard/profile/page.tsx` + `src/components/dashboard/ProfileFormClient.tsx`.
- **Purpose**: Account settings — edit full name, phone, preferred language; email is
  read-only/immutable.
- **Data source**: Server-side initial load: if `FEATURE_AUTH`, Supabase `auth.getUser()` +
  `profiles.select("full_name, phone, locale")`, falling back to empty strings without a session.
  Client save: POSTs `/api/auth/profile`.
- **Important components**: `ProfileFormClient` (client) — maps API error `code` values
  (`unauthorized`, `email_immutable`, `zoho`, generic) to bilingual messages.
- **Server/client boundary**: Page fetches `initialProfile` server-side, passes as a prop; all
  mutation logic is client-side via `fetch`.
- **External APIs**: Supabase Auth + Postgres directly in the page; indirectly (via
  `/api/auth/profile`) Supabase Admin API and Zoho CRM `updateCrmContact`.
- **Authentication requirements vs. reachability**: **This is the only `/dashboard/*` sub-route
  NOT in the unready lists — the sole dashboard page actually reachable end-to-end.** Gated by
  `proxy.ts`'s standard `/dashboard/**` session check when `FEATURE_AUTH` is on, and is the one
  deep link `postAuthDestination()` explicitly allows to survive.
- **Potential failure points**: If `FEATURE_AUTH` is false, the page renders with empty defaults
  and no session check, but the form's POST target itself immediately 503s. Client validation
  treats any unexpected/missing error `code` with a generic message. Phone number is sanitized
  server-side only (`/[^\d+]/g` strip) — the UI can briefly show a value the server persists
  differently.

### `/studio`

- **Route**: `/studio` and all sub-paths. Files:
  `src/app/studio/[[...tool]]/{page.tsx,layout.tsx,StudioClient.tsx}`, config
  `src/sanity/sanity.config.ts`.
- **Purpose**: Embedded Sanity Studio (CMS admin UI).
- **Data source**: Sanity project via `NEXT_PUBLIC_SANITY_PROJECT_ID`/`DATASET` (non-null-asserted
  with `!`). Plugins: `structureTool`, `muxInput` (video, 1080p), `documentInternationalization`
  scoped to `homePage`/`siteSettings`/`pageSeo`/`companyPage`/`program`.
- **Important components**: `StudioClient` (`"use client"`) isolates `NextStudio` — deliberately
  kept out of the RSC/server graph since Studio plugins need browser APIs. `layout.tsx` renders
  its own `<html><body>`, entirely outside the `[locale]` tree — no marketing chrome.
- **Server/client boundary**: `page.tsx`/`layout.tsx` are server components with `dynamic =
  "force-static"`; the entire interactive Studio UI is client-rendered inside `StudioClient`.
- **External APIs**: Sanity Content Lake; Mux (via `sanity-plugin-mux-input` for video uploads).
- **Authentication requirements**: `proxy.ts` explicitly excludes `/studio` and `/en/studio` from
  **all** middleware processing — no app-level auth guard whatsoever. Studio's own Sanity-hosted
  login is the only gate; reachable at all times regardless of `FEATURE_AUTH`.
- **Potential failure points**: Non-null-asserted env vars throw at module evaluation/build time
  if missing, not a graceful error page. Because `proxy.ts` fully bypasses this route, there is no
  IP allowlist or custom app-level auth — security relies entirely on Sanity's hosted auth plus
  Sanity project/dataset ACLs, invisible to this codebase.

---

## Part 2 — API Route Handlers

### Shared helpers — `src/app/api/zoho/_helpers.ts`

Central to all 5 `/api/zoho/*` routes and reused by `/api/newsletter`:

- `validationError()` → 400 `{ok:false, code:"validation"}`.
- `upstreamError(message?)` → 500 `{ok:false, code:"upstream", message}`.
- `notConfiguredResponse(message?)` → 503 `{ok:false, code:"not_configured", message}`.
- `successResponse(id?)` → 200 `{ok:true, id}`.
- `parseJsonBody(req)` — wraps `req.json()` in try/catch, returns `null` on malformed JSON (so a
  bad body flows into Zod validation and becomes a clean 400 rather than an unhandled exception).
- `guardZohoConfigured()` — 503 if `FEATURE_ZOHO_FORMS` is off; 500 if the flag is on but Zoho
  OAuth creds are missing; else `null` (proceed).
- `guardNewsletterConfigured()` — same pattern for `FEATURE_NEWSLETTER` + `ZOHO_CAMPAIGNS_LIST_KEY`.
- `handleCrmResult`/`handleCampaignsResult` — translate adapter results into HTTP responses.
- **No rate limiting, idempotency keys, or CSRF protection anywhere in these routes** (confirmed —
  no rate-limit library or in-memory/Redis counters exist in the codebase).

### `POST /api/newsletter`

- **Purpose**: Subscribe to the Zoho Campaigns mailing list.
- **Dependencies**: `subscribeToCampaignsList()` (`src/lib/zoho.ts:283-351`). No Supabase/Sanity.
- **Request validation**: Zod — `firstName`/`lastName` (trim, min 1, max 100), `email` (`.email()`),
  `locale` (enum ar/en), `source` (optional enum, unused downstream).
- **External calls**: `guardNewsletterConfigured()` then `subscribeToCampaignsList(...)`.
- **Authentication**: Public.
- **Potential failure points**: 503 if flag off; 500 if creds/list key missing; malformed JSON →
  clean 400; Zoho token refresh failure → 500; non-JSON Zoho response → 500; **duplicate
  subscriptions are treated as success** (`isDuplicateSubscriberResponse()` matches
  "already exists"/"already subscribed"/"duplicate" and returns `{ok:true}`); Zoho error code
  `"1007"` gets a detailed datacenter-mismatch remediation message (server logs only); no rate
  limiting — the same email can be POSTed unlimited times.

### `POST /api/revalidate`

- **Purpose**: Sanity webhook receiver triggering on-demand ISR via `revalidateTag`.
- **Dependencies**: No DB reads/writes — pure cache-tag invalidation. `tagMap`: `coach→coaches`,
  `course→courses`, `homePage→home`, `siteSettings→site-settings`, `pageSeo→seo`,
  `companyPage→companies`, `program→programs`.
- **Request validation**: Manual — `?secret=` must equal `SANITY_REVALIDATE_SECRET`; body must
  parse as JSON; `_type` must be extractable (checks top-level and several nested payload shapes
  to accommodate different Sanity webhook formats).
- **Authentication**: Shared-secret query parameter, not session-based — effectively public if the
  secret leaks (it's a query param, so it can appear in logs/referrers).
- **Potential failure points**: Missing env var → 503 (checked *before* secret comparison, so an
  attacker can distinguish "not configured" from "wrong secret"); mismatch → 401; malformed JSON →
  400; missing `_type` → 400; **unknown `_type` intentionally returns 200** (`revalidated:false`)
  to avoid Sanity's webhook retry storms; secret compared with `!==` (not constant-time — a
  theoretical timing-attack surface, low real-world impact here).

### `POST /api/auth/onboard`

- **Purpose**: Post-signup hook ensuring a `profiles` row and Zoho CRM Contact exist.
- **Dependencies**: `onboardUser()` (`src/lib/onboard-user.ts`) — Supabase Admin client, Zoho CRM
  Contacts module.
- **Request validation**: None — no body, identity comes entirely from the session.
- **External calls**: `supabase.auth.getUser()`, then `onboardUser(user)` (profiles read/upsert +
  optional CRM contact create).
- **Authentication**: Requires an active session — 401 if none; 503 if `FEATURE_AUTH` off (checked
  before any Supabase call).
- **Potential failure points**: Profile read/upsert DB errors → 500 `upstream`. **Zoho contact
  creation failure is swallowed** (only `console.error`'d) — profile upsert proceeds regardless,
  so a Zoho outage never blocks account creation but the user permanently lacks a linked CRM
  contact with no retry mechanism. Concurrent calls before either upsert completes could create
  duplicate Zoho contacts (non-atomic guard).

### `POST /api/auth/profile`

- **Purpose**: Update display name, phone, preferred language across Supabase Auth metadata,
  `profiles`, and (if linked) the Zoho CRM Contact.
- **Dependencies**: Supabase Auth Admin API, `profiles` table, Zoho CRM `updateCrmContact`.
- **Request validation**: Manual pre-check rejects any body containing an `"email"` key at all
  (400 `email_immutable`) before Zod runs. Zod schema is `.strict()` — any other unknown key also
  fails (400 `invalid`). `name`/`phone` have no `.trim()`/`.min()` in the schema itself; trimming
  happens manually after parse.
- **External calls**: `auth.getUser()` → `admin.auth.admin.updateUserById()` → `profiles.update()`
  → conditional `updateCrmContact()` if a `zoho_crm_contact_id` exists.
- **Authentication**: Requires active session (401 without); 503 if `FEATURE_AUTH` off.
- **Potential failure points**: **Malformed JSON body is caught by the outer try/catch and
  returns 500**, unlike the Zoho routes' `parseJsonBody` pattern which cleanly 400s — an
  inconsistency worth knowing when debugging client errors. Supabase Admin or `profiles` update
  errors return the **raw Supabase error message verbatim** to the client (500). If Auth metadata
  updates but the `profiles` row update fails, the two stores are left inconsistent with no
  rollback. Zoho update failure is a distinct 502 `zoho` code with a dedicated client-side
  message. Phone sanitization (`/[^\d+]/g`) silently discards invalid characters rather than
  validating format.

### `POST /api/zoho/contact`, `/api/zoho/discovery`, `/api/zoho/group`, `/api/zoho/program`

All four share an identical flow: `guardZohoConfigured()` → `parseJsonBody()` → `schema.safeParse()`
→ `splitName()` → `createCrmLead()` → `handleCrmResult()`. Differences are only in Zod fields and
the CRM payload's `Lead_Source`/custom fields:

| Route | Zod fields (beyond name/email/phone/locale) | `Lead_Source` | Notes |
|---|---|---|---|
| `contact` | `organization`, `message` (required), `context` | `"Contact Form"` | `Description` built via `joinDescription(message, context)` |
| `discovery` | `pathwayTitle`, `audienceLabel`, `needLabel` (all required) | `"Discovery"` | Custom CRM fields must exist in the Zoho Leads module schema — not otherwise validated |
| `group` | `organization`, `programId` (required), `message` (optional) | `"Group Coaching"` | `Description` set directly from `message` (not `joinDescription`) — can be omitted entirely |
| `program` | `organization`, `programId` (required), `programTitle`, `message` | `"Program Interest"` | `Source_Page` interpolates raw `d.programId` into a template string — not sanitized (harmless, sent to Zoho only, not reflected in HTML) |

- **Authentication**: All four are public, no session check.
- **Potential failure points (shared)**: 503 if `FEATURE_ZOHO_FORMS` off; 500 if creds missing; 400
  on Zod failure; Zoho HTTP non-OK → 500 `"CRM API error (<status>)"`; unexpected Zoho response
  shape → 500 with the CRM's own message or a generic fallback; network/exception → 500 with the
  raw error message. **No duplicate-lead detection** — resubmitting always creates a new Lead (Zoho
  org config may or may not dedupe by email, not handled by this codebase). No rate limiting.

### `POST /api/zoho/community`

- **Purpose**: Community application (Impact/Lego) → Zoho CRM **Application** record (a different
  module than the Leads-based routes above).
- **Request validation**: Zod — `communityId` is a closed `enum(["impact","lego"])` (the only
  route with a closed enum for a domain identifier); `motivation` required; `profession`/
  `experience` optional.
- **External calls**: `createCrmApplication({Name, Email, Phone, Community, Profession,
  Motivation, Experience, Locale, Status:"Pending Review"})` — note this route sends a single
  `Name` field rather than calling `splitName()`, a different field convention than Leads/Contacts.
- **Authentication**: Public.
- **Potential failure points**: Same shared guard/validation/upstream error shapes as the Lead
  routes. An unrecognized `communityId` is rejected outright (no typo tolerance). No rate limiting
  or duplicate-application detection — unlimited "Pending Review" applications can be submitted
  for the same email.

---

## Part 3 — Main Flow Traces

### Flow 1 — Newsletter Signup

1. **Component**: `src/components/forms/NewsletterForm.tsx` (`"use client"`). Native validation
   disabled (`noValidate`); all validation is manual JS.
2. **Client-side validation** (before any network call): first/last name non-empty (trimmed) →
   error; email format via `isValidEmail()` regex (`src/lib/email.ts`) → error.
3. On pass: `subscribeNewsletter({firstName, lastName, email, locale, source})`
   (`src/adapters/zoho/forms.ts:91-99`) fires a `track("newsletter_subscribed", ...)` analytics
   event, then `postZohoForm("/api/newsletter", payload)`.
4. `postZohoForm` (`forms.ts:26-50`): success → `{ok:true, id}`; server-reported failure →
   `{ok:false, code, message}`; **thrown network exception → synthetic `{ok:false, code:"upstream",
   message:"Network error"}`** — the only client-detectable network-failure branch, indistinguishable
   in the UI from any other upstream error.
5. **API route** `src/app/api/newsletter/route.ts`: `guardNewsletterConfigured()` → `parseJsonBody`
   → Zod `safeParse` (max 100 chars on names, stricter email validator than the client's regex —
   some edge-case strings could pass client-side and fail server-side, surfacing generically) →
   `subscribeToCampaignsList()`.
6. `subscribeToCampaignsList()` (`src/lib/zoho.ts:283-351`): checks list key configured →
   `getAccessToken()` (shared OAuth token cache/refresh, module-level, resets on cold start) →
   Zoho Campaigns `listsubscribe` API call → success **or duplicate-subscriber match** both
   resolve to `{ok:true}` → detailed diagnostic errors for known Zoho error codes (`1007` =
   datacenter/scope mismatch, `1001/2002/2102/2501` = invalid list key) logged server-side only.
7. **Back to UI**: `NewsletterForm` never reads `result.message` — any adapter failure always
   shows the static `data.submitError` translation string. The rich Zoho diagnostics only reach
   `console.error` server-side, never the browser (a deliberate simplicity choice, but worth
   knowing when debugging a live signup failure — check server logs, not the browser).

**Failure points**: client-side name/email checks (no network call); 503 flag-off; 500
creds/list-key missing; 500 OAuth token refresh failure; 500 non-JSON Zoho response; 500 Zoho
business error (detailed message server-log only); 200 for duplicate subscriber (treated as
success); 400 body/schema failure; network failure client-side. All non-success paths render the
same generic `data.submitError` text to the user.

### Flow 2 — Contact/Discovery Forms (shared Zoho CRM lead pattern)

All of Discovery, Contact, Program, Group, and Community follow one architecture:

1. Component calls one of `submitDiscoveryLead`/`submitContactLead`/`submitGroupInterest`/
   `submitProgramInterest`/`submitCommunityApplication` (`src/adapters/zoho/forms.ts:52-89`), each
   firing a `track("lead_submitted", ...)` event then `postZohoForm(path, payload)`.
2. Route: `guardZohoConfigured()` → `parseJsonBody` + Zod → `splitName(d.name)` (first token =
   first name, remainder = last name, or `"-"` if none) → `createCrmLead()` →
   `createCrmRecord("Leads", fields)` (or `createCrmApplication()` for community) →
   `handleCrmResult()`.
3. `createCrmRecord` (`src/lib/zoho.ts:126-165`): shares `getAccessToken()` with the newsletter
   flow; POSTs to `${ZOHO_API_BASE}/crm/v3/{module}`; non-OK HTTP, non-success record status, or a
   thrown exception all resolve to `{ok:false, error: <message>}`.

**Discovery-specific**: `DiscoveryFormClient` wraps `JourneyWizard` (`"use client"`, 3-stage state
machine — audience → challenge → result; `stageIndex` is local state only, **a page refresh
resets to stage 0**, no URL/query persistence). At the result stage, the CTA opens
`DiscoveryRequestForm` inline, pre-filled with wizard-derived context (`pathwayTitle`,
`audienceLabel`, `needLabel`) rather than user re-entry. Client validation via
`getLeadValidationError()` blocks submission before any network call.

**Contact-specific** (`src/components/sections/ContactSection.tsx`): a full-page form (not
wizard-driven) with a hidden `context` field that can be pre-filled by a custom
`SAH_OPEN_CONTACT` window event dispatched from elsewhere on the page. `Source_Page` is
hardcoded `"/"` regardless of which section actually triggered the submission — less granular
than Discovery's dedicated source tracking.

**Error message handling (important difference from Flow 1)**: `getFormSubmitError()`
(`src/lib/form-validation.ts:83-109`) **can leak real backend error text to the user** — if
`result.message` is present and isn't one of three known generic placeholder strings
(`"Submission failed"`, `"Upstream error"`, `"Network error"`), it's shown verbatim. This means a
raw Zoho error like `"CRM API error (401)"` or a `FEATURE_ZOHO_FORMS is off` message can surface
directly in the form UI — unlike the newsletter form, which discards `result.message` entirely.

**Failure points**: client-side name/email/message validation blocks submission pre-network; 503
flag-off (message often shown verbatim); 500 creds missing (message shown verbatim); 400 Zod
failure (generic "complete required fields," localized); 500 Zoho HTTP/response errors (shown
verbatim); network failure client-side (filtered to generic fallback, since "Network error" is one
of the three excluded placeholder strings).

### Flow 3 — Authentication (full lifecycle)

**A. Registration** — `RegisterFormClient`: name → email → password-required → confirm-match →
`isStrongPassword()` (≥8 chars, upper/lower/digit/special) → `signUp()`
(`src/adapters/supabase/auth.ts:51-80`). `FEATURE_AUTH` off → immediate `not_configured`, no
network call. `emailRedirectTo` is built as `/auth/callback?next=...` with the correct locale
prefix. **If Supabase returns an immediate session** (email confirmation disabled project-side),
the adapter eagerly POSTs `/api/auth/onboard` itself — trigger #1 of the duplicate-onboarding
race described below.

**B. Login** — `LoginFormClient`: reads `?error=`/`?from=recovery` from the URL (set by the
callback flow on failure) and maps known error codes to bilingual messages, with a "request a new
reset link" hint shown for OTP/recovery-related codes. Email/password validation, then `signIn()`
→ `supabase.auth.signInWithPassword()`. On success, computes the redirect via
`postAuthDestination(next, pathname)` and does a client-side `router.push` + `router.refresh()`.

**C. Server callback** (`src/app/auth/callback/route.ts`): validates `next` against a
`SAFE_NEXT_PATH` allowlist (only `/dashboard(/.*)?` and `/auth/reset-password`, with optional
`/en/` prefix — this exact regex is duplicated in three places: here, the client completion page,
and conceptually in `proxy.ts`). Passes through provider error params directly to the login page.
If neither `code` nor `token_hash` is present (implicit/hash-based flow), redirects to
`/auth/callback/complete` since hash fragments never reach the server. Otherwise exchanges the
code/OTP for a session, and — **only if `next` targets `/dashboard*` or the locale home** (not
`/auth/reset-password`) — synchronously calls `onboardUser(user)` before redirecting. Trigger #2
of the onboarding race.

**D. Client callback completion** (`src/app/auth/callback/complete/page.tsx`): parses both query
and hash params; resolution priority is `access_token`+`refresh_token` (hash/implicit) →
`code` (PKCE) → `token_hash`+`type` (OTP) → none present (treated as `otp_expired`). On success
targeting dashboard/home, fires a client-side POST to `/api/auth/onboard` (trigger #3 of the race)
then does a full `window.location.replace()` (not a soft nav, to guarantee fresh cookies are
sent).

**E. Onboarding** (`src/lib/onboard-user.ts`): reads `profiles.zoho_crm_contact_id` via the admin
client; **returns early if already set** (the only guard against duplicate work, and it's
non-atomic — a race between any two of the three triggers above, before either upsert completes,
can create two Zoho CRM contacts for the same user; the Supabase `profiles` row itself can't
duplicate, protected by `onConflict:"id"`). Zoho contact-creation failure is swallowed
(`console.error` only) — never blocks the profile upsert, but leaves the user permanently
unlinked from CRM with no retry.

**F. Route guarding** (`src/proxy.ts`): skips `/studio*`, `/api/*`, `/auth/callback*` entirely.
`isUnreadyDashboardPath()` redirects `/dashboard`, `/dashboard/courses`, `/dashboard/bookings`
home **unconditionally, regardless of `FEATURE_AUTH`** — this runs before any session check. When
`FEATURE_AUTH` is off, **no session check runs at all**, for any path — a "ready" dashboard route
like `/dashboard/profile` would be reachable without login if the flag were off (the page's own
optional Supabase check is the only remaining gate in that configuration). When the flag is on:
unauthenticated `/dashboard*` visits redirect to login with `?next=<path>`; signed-in visits to
guest-only auth pages redirect home.

**G. Password reset**: `ForgotPasswordFormClient` → `resetPassword()` → Supabase always reports
success regardless of whether the email exists (prevents enumeration, inherent to Supabase's API,
not special-cased in this code). `ResetPasswordFormClient` checks for a recovery session
client-side only — **no server-side guard exists preventing direct navigation to
`/auth/reset-password` without a valid session**, it simply has nothing to submit against if one
is missing.

**Failure points summary**: `FEATURE_AUTH` off → every adapter call short-circuits to
`not_configured` before any network call, and the proxy skips all session checks; duplicate
onboarding race across three trigger points (non-atomic guard, can create duplicate Zoho
contacts); raw Supabase error messages shown verbatim in login/register/reset forms; all
session-exchange errors collapse into just `otp_expired`/`callback_failed` (no finer-grained
diagnosis); `SAFE_NEXT_PATH` allowlist duplicated in three places, a maintenance risk; unready
dashboard paths are redirected home even for successfully authenticated users; reset-password page
has no server-side session guard.

### Flow 4 — Coach Browsing

1. `/coaches` → `getCoaches(locale)`, **only invoked when `COACHES_COMING_SOON` is false**
   (currently always `true`, so this call never actually runs in production today). Off CMS: maps
   `COACH_RECORDS`; on CMS: `COACHES_QUERY` (filters `published == true` server-side — unpublished
   coaches are simply absent, no distinct "draft" state) → `mapCoachDocument()`, which returns
   `null` (silently filtered) for any doc missing a `slug`.
2. `CoachesListClient` (`"use client"`) does 100% in-memory search/filter over the
   server-passed array — no client-side fetching. Empty-result state is a dedicated UI branch.
3. Card CTA → `/coaches/[slug]`. `generateStaticParams` from `getCoachSlugs()`.
   `generateMetadata` returns `{}` silently for an unknown slug (soft fallback) — **only reached
   once the coming-soon flag is off**; while it's on, metadata never references a real coach.
4. `getCoachBySlug()` — same CMS/static branch as the list, plus the same
   `published == true` filter (an unpublished-but-matching-slug coach is indistinguishable from
   nonexistent — both yield `null`).
5. **The actual hard 404** fires only once coming-soon is off: `if (!coach) notFound()`. While
   coming-soon is on, the detail page never reaches this check for any slug — valid or invalid —
   so broken links currently return 200 with generic "coming soon" content.
6. Image resolution: static coaches use a plain string URL; CMS coaches go through
   `urlForImage()` (`src/lib/sanity.ts:26-43`), a three-tier fallback (builder unavailable → build
   failure → expanded `asset.url`) that returns `undefined` if all three fail — every consumer
   then falls back to a `👤` emoji placeholder.
7. Bilingual fields are resolved server-side once per request into a locale-specific object — no
   client-side re-localization; switching locale re-runs the whole data-load with the new locale.

**Failure points**: `COACHES_COMING_SOON` master kill-switch (list and detail both dark, detail
page can't distinguish valid from invalid slugs while it's on); silent `null`-filtering of CMS
docs with missing slugs; `published == true` GROQ filter with no draft-preview UI; three-tier
image fallback ending in an emoji placeholder; Supabase auth-check failure on the detail page
fails closed (`isAuthenticated=false`) rather than erroring.

### Flow 5 — Program Browsing

1. Homepage/company pages pass `content.programs` (from `getContent()`) into `ProgramsSection`
   (`"use client"`, code-split via `next/dynamic` but still SSR'd). Off CMS: straight from
   `home.json`; on CMS: `PROGRAMS_QUERY`, **locale-scoped server-side** (`language == $locale`) —
   unlike coaches, programs are one Sanity doc *per locale*, not one bilingual doc.
2. All filtering (search, audience, level, entity) and pagination ("load more," 9 per page) are
   client-side against the full array — no re-fetch. A custom DOM event
   (`SAH_FILTER_PROGRAMS`) lets other page sections cross-filter this one.
3. Card → `/program/[id]`, with an optional `?from=<companySlug>` query param so the detail page's
   "back to programs" link returns to the correct anchor.
4. `getProgramById(locale, id)` — a simple linear scan over the full locale-resolved programs
   array (no dedicated single-doc Sanity query, unlike coaches). `getProgramIds()` for
   `generateStaticParams` **always enumerates from the English catalog** — a locale-specific
   program that only exists in one language could 404 on the other locale despite a "valid" id.
5. `notFound()` fires correctly for a genuinely unknown `id`. Under `FEATURE_CMS=1` with an empty
   Sanity dataset, `programsFor()` returns `[]` and **every** program detail request 404s — no
   static-content fallback here (contrast with `catalogPages`, which does fall back).
6. `ProgramInterestFormClient` — client validation (name/email) blocks submission pre-network;
   on pass, fires a `track("lead_submitted", ...)` analytics event then
   `submitProgramInterest()` → `POST /api/zoho/program` (see API reference above and Flow 2 for
   the shared error-message-leakage behavior).

**Failure points**: soft metadata fallback (`{}`) for unknown id; hard 404 for genuinely unknown
id; empty-state UI for zero filter matches; English-only id enumeration risk if content ever
diverges by locale; empty-Sanity-dataset 404-everything risk under `FEATURE_CMS=1`; same shared
Zoho lead-submission failure modes as Flow 2, including potential verbatim backend error leakage.

### Flow 6 — Booking (Coaching Session)

**Bottom line: booking is entirely unimplemented. No live network call exists anywhere in this
path today.**

1. The coach profile's "Book a session" section (`/coaches/[slug]`, only reachable once
   `COACHES_COMING_SOON` is lifted) shows an auth gate (sign-in/create-account prompt, currently
   always shown since `FEATURE_AUTH` is off by default) above a grid of **6 hardcoded fake
   date/time slots, each rendered as a `<button disabled>` with no click handler, no state, and no
   selection logic whatsoever**. An explicit on-page dev notice admits: "This coach's data is
   placeholder... Zoho Bookings handling scheduling. Payment via Moyasar or Tamara after slot
   selection."
2. `src/adapters/zoho/bookings.ts` (27 lines total) — both exported functions,
   `getBookingsEmbedUrl()` and `confirmBookingAfterPayment()`, **unconditionally return
   `notConfiguredResult("Zoho Bookings")` regardless of the `FEATURE_BOOKINGS` flag's value** —
   the "flag on" branch returns the identical stub as the "flag off" branch. There is no `fetch()`,
   no Zoho Bookings API call, anywhere in this file. Neither function is imported/called anywhere
   else in the codebase. `confirmBookingAfterPayment` does fire one real side effect —
   `track("booking_confirmed", {paymentId})` — **before** the not-configured check, meaning this
   analytics event could theoretically fire even though the function can never actually succeed.
3. `src/lib/dashboard-availability.ts` lists `/dashboard/bookings` as unready — any post-auth deep
   link there is silently redirected home rather than shown a 404 or an explicit "coming soon"
   page.
4. No `/api/bookings/*` route exists anywhere under `src/app/api` — the `/api/bookings/confirm`
   endpoint described in `docs/ZOHO_FIRST_ARCHITECTURE.md` is documentation-only, not implemented.
   `ZOHO_BOOKINGS_ORG_ID` env var is declared but referenced nowhere else in the codebase.

**Failure points**: this entire flow is NOT IMPLEMENTED. The type/adapter signatures and UI shell
are fully scaffolded (intentionally, as forward-looking structure), but zero functional behavior
exists — treat any request to "fix a booking bug" as a request to build the feature from scratch,
not patch an existing one.

### Flow 7 — Payment

**Bottom line: payment is entirely unimplemented — the identical pattern as bookings.**

1. No checkout/buy/enroll UI exists anywhere. `CourseDetail.tsx` and the coach profile page both
   render price as static text only (`{course.price.amount} {course.price.currency}`) — no
   button, link, or handler triggers a purchase anywhere in the codebase.
2. `src/adapters/payments/index.ts` (36 lines total) — `createCheckoutSession()` fires
   `track("checkout_started", {provider, kind, productId})` **unconditionally** (same
   "analytics-before-check" pattern as bookings), then **regardless of `FEATURE_CHECKOUT`'s
   value, always returns `notConfiguredResult(`Checkout (${provider})`)`**.
   `createMoyasarCheckout()`/`createTamaraCheckout()` are thin wrappers that just inject a
   `provider` value and delegate — **no provider-specific logic, no Moyasar SDK call, no Tamara
   API call exists anywhere**. None of these three functions are imported/called anywhere else in
   the codebase — this adapter is fully disconnected from any UI trigger.
3. `src/domain/money.ts` defines the eventual shape: `Money` (SAR-only), `PaymentProvider`
   (`"moyasar"|"tamara"`), `CheckoutKind`, `CheckoutRequest`, `CheckoutSession` (which already
   anticipates a `"not_configured"` status value, consistent with the adapter's current behavior).
4. Five env accessors exist for Moyasar/Tamara credentials
   (`moyasarPublishableKey`/`moyasarSecretKey`/`moyasarWebhookSecret`/`tamaraApiToken`/
   `tamaraNotificationToken`, `src/lib/env.ts:60-64`) — **confirmed via repo-wide search: none of
   these accessors is referenced anywhere outside their own declaration.** They exist purely as
   forward-declared configuration surface; no code path constructs a Moyasar/Tamara API request.

**Failure points**: this entire flow is NOT IMPLEMENTED, identically to bookings. The domain types
and adapter signatures fully anticipate the eventual integration (down to a `"not_configured"`
status enum value), but there is zero functional behavior — treat as build-from-scratch, not
bug-fix, work.

### Flow 8 — Arabic/English Switching

1. `LanguageSwitcher` (`src/components/layout/LanguageSwitcher.tsx`) computes the target locale's
   path via `localePath()` — Arabic (default) never gets a URL prefix, English always gets `/en`.
   **Renders a plain `<a href>`, not a Next `<Link>`, deliberately** — the code comment explains
   this triggers a full document navigation, not a soft RSC transition, because the Arabic home is
   served via a `/` → `/ar` rewrite that a client-side transition would leave desynced.
2. `next.config.ts`: `/` internally rewrites to `/ar` (URL bar still shows `/`); `/ar` and
   `/ar/:path*` **permanently redirect (308)** to their unprefixed equivalents — meaning `/ar`
   URLs never persist publicly, and `localePath()` never emits an `/ar` prefix (doing so would
   immediately redirect).
3. `src/proxy.ts` bypasses next-intl's own routing middleware for `/` and `/ar*` specifically (to
   avoid a rewrite↔redirect loop with the config above) and lets `next.config.ts` handle those;
   every other path (including all `/en/*` paths) goes through `handleI18nRouting`.
4. `src/i18n/routing.ts`: `localePrefix: "as-needed"`, **`localeDetection: false`** — no
   `Accept-Language` or cookie-based auto-redirect, and critically, **no locale cookie is ever
   set** — every fresh navigation to `/` serves Arabic regardless of any prior session's language
   choice. Locale is derived purely from the URL structure on every single request.
5. On a dynamic route (`/coaches/[slug]`, `/program/[id]`), switching locale keeps the same
   slug/id segment. **Coach and program lookups are locale-agnostic keys** — `getCoachBySlug()`
   filters by `slug` alone (no locale filter in the query), `getProgramById()` filters the
   already-locale-resolved array by `id` alone. This means the same slug/id resolves in both
   locales as long as the underlying record exists at all — switching locale on a valid dynamic
   page will **not** typically 404, even if that record's translated fields are incomplete for one
   locale (it would render with empty/missing text instead, not a 404). `generateStaticParams` for
   both routes enumerates from a single canonical dataset reused across both locale segments,
   reinforcing that ids/slugs are locale-agnostic primary keys throughout.

**Failure points**: locale switching is always a full page reload by design (no soft-nav loading
state); direct navigation to `/ar*` always 308-redirects away; there is no persisted locale
preference across sessions — every fresh visit to `/` is Arabic; adding a new locale without a
matching `messages/<locale>.json` file would throw at request time (not caught); a dynamic-route
record that doesn't exist at all 404s identically in both locales, but one with incomplete
translations for a given locale would silently render with missing text rather than erroring —
this needs a deeper per-field trace of the CMS mappers if precise fallback text (empty string vs.
other-locale fallback vs. placeholder) matters for a specific bug report.

---

## Cross-Cutting Findings Worth Flagging to Product/Client

1. **Coaches and courses are fully dark in production today** via hardcoded
   `COACHES_COMING_SOON`/`COURSES_COMING_SOON` constants — not env flags. Lifting them requires a
   code change and redeploy, and would also need the coming-soon-branch `notFound()` gap fixed
   (currently invalid slugs 200 while the flag is on).
2. **Booking and payment are 100% unimplemented** — fully scaffolded types/adapters/UI shells, zero
   functional behavior, confirmed by direct inspection with no live network calls anywhere in
   either path. Both fire analytics events (`booking_confirmed`, `checkout_started`) *before*
   their not-configured check, which could produce misleading analytics data if anyone were to
   trigger those code paths today (they currently can't be triggered from the UI, so this is
   latent, not active).
3. **Only `/dashboard/profile` is reachable** — `/dashboard`, `/dashboard/courses`, and
   `/dashboard/bookings` are unconditionally redirected home by `dashboard-availability.ts`,
   independent of authentication state.
4. **A non-atomic duplicate-onboarding race** exists across three independent trigger points
   (immediate-session signup, server callback, client callback completion) — can create duplicate
   Zoho CRM contacts for one user (not duplicate Supabase profile rows, which are protected).
5. **Backend error messages can leak verbatim to end users** in the Contact/Discovery/Program/
   Group/Community lead forms (via `getFormSubmitError`'s pass-through of non-generic
   `result.message` values) — the newsletter form does not have this issue since it discards
   `result.message` entirely.
6. **`/[company]` entity pages and `/program/[id]` have no static-content fallback** if their
   Sanity documents are missing/unpublished under `FEATURE_CMS=1` — they 404 outright, unlike the
   homepage's `catalogPages`, which does fall back to static defaults.
7. **No rate limiting anywhere** in the API layer — newsletter, all Zoho lead forms, and community
   applications can all be submitted an unlimited number of times per email/IP.
