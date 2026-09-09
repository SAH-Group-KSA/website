# SAH-v2 — Implementation Status

> **Last updated:** September 3, 2026
> **Architecture north star:** [`UI_ARCHITECTURE_GUIDE.md`](./UI_ARCHITECTURE_GUIDE.md)  
> **Integration playbook:** [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./docs/BACKEND_IMPLEMENTATION_GUIDE.md) (locked phases, Sanity Studio at `/studio`, Mux, staging)  
> This document tracks what the UI already delivers versus what still needs **Sanity**, **Supabase Auth / DB**, **Zoho One**, **Moyasar**, **Tamara**, and **Mux** — using the ownership model already decided in the architecture guide.

---

## Ownership reminder (do not invent alternatives)

| Data / capability | System |
|---|---|
| Editorial content (coaches, courses, landing copy, images) | **Sanity** |
| Customer auth + profiles, enrollments, progress, reviews | **Supabase Auth + Supabase DB** |
| Leads, applications, newsletter, 1:1 scheduling ops, essential transactional email | **Zoho One** (CRM, Campaigns, Bookings, ZeptoMail, Flow). Chat / reporting / extra Zoho apps are **out of this phase** — [`docs/SCOPE_OF_WORK.md`](./docs/SCOPE_OF_WORK.md) |
| Payments (courses + paid coaching) | **Moyasar** (cards / mada / Apple Pay) + **Tamara** (BNPL) — not Stripe |
| Course video | **Mux** (gated by Supabase enrollment; Phases 9–10 in backend guide) |

---

## ✅ What Was Implemented (UI / IA)

### 1. Hybrid multi-page shell
Marketing homepage kept; product routes added under `src/app/[locale]/`. Locale: Arabic `/`, English `/en/*`.

### 2. Navigation + CTAs
- Header: Coaching dropdown (1:1, Group, Courses), Community → apply, Find Your Path → `/discovery`, Sign In, Book Discovery → `/discovery`
- Footer: discovery, coaches, group, courses, community apply
- Homepage `#need` teaser (`NeedTeaserSection`) → `/discovery` (full wizard lives on `/discovery` via `JourneyWizard`)

### 3. CSS for product pages
`prototype-parity.css` extended for nav dropdowns, page heroes, coaches, courses, auth, dashboard, apply, group, discovery — same token system (cream / deep / gold).

### 4. `/discovery` — pathway wizard + request form
- `DiscoveryFormClient` + `JourneyWizard` + `DiscoveryRequestForm`
- Submit is mocked — **TODO: Zoho Forms → Zoho CRM** (pathway context: audience, need, name, email, phone)

### 5. `/coaches` + `/coaches/[slug]` + `/coaches/group`
- Listing with search/filter; profile pages for placeholder coaches; group interest form
- Data: in-file placeholders — **TODO: Sanity-backed coaches mapped to `Coach`**
- Slots disabled — **TODO: Zoho Bookings availability** + **Moyasar / Tamara** pay-after-slot
- Group submit mocked — **TODO: Zoho Forms / CRM** (+ Campaigns later)

### 6. `/community/apply`
- Form + success UI; community context cards
- Submit mocked — **TODO: Zoho Forms → CRM Application → Flow → ZeptoMail**

### 7. Auth pages
- `/auth/login`, `/register`, `/forgot-password`, `/reset-password` — validation + loading UX
- Wired to **Supabase Auth** (`FEATURE_AUTH=1`); confirmation/recovery via `/auth/callback`
- Pages are `noindex`; `robots.txt` disallows `/auth/`

### 8. Dashboard
- Layout + shell + overview / courses / bookings / profile
- Sign-out via `supabase.auth.signOut()`; session guard in `src/proxy.ts`
- Profile save syncs Auth metadata + `profiles` (+ Zoho Contact when linked)
- Bookings view will ultimately read **Zoho Bookings** (calendar), with payment history from Moyasar/Tamara as needed

### 9. `/courses` listing
- Sanity-backed course listing through the `Course` facade (`FEATURE_CMS`)
- Cards link to bilingual `/courses/[slug]` detail pages
- Course detail includes hero, metadata, curriculum accordion, SEO, and disabled Coming Soon CTA
- **TODO (later phases):** Moyasar/Tamara checkout, Supabase enrollment, and Mux playback

### 10. Newsletter
- `NewsletterForm` (default / inline / footer) — client success only
- **TODO: Zoho Campaigns API**

### 11. SEO plumbing
- `buildPageMetadata`, JsonLd (Organization, FAQ, ItemList, Breadcrumb, Person, Course), sitemap, robots
- Dynamic coach, course, and program detail URLs are included in the localized sitemap

---

## 🔴 Pending integrations (by decided system)

### A. Supabase Authentication + DB
**Phase 5 auth/profile:** done (`FEATURE_AUTH`). Remaining tables belong to later phases.

| Work | Status / notes |
|---|---|
| `signInWithPassword` / `signUp` / `signOut` / password reset | Done |
| `profiles` + RLS + `zoho_crm_contact_id` onboard | Done |
| Dashboard session + guest-auth guards (`src/proxy.ts`) | Done |
| Profile save → Auth metadata + Zoho Contact update | Done |
| `course_enrollments`, `course_progress`, `coach_reviews` | Phase 8 |
| Enrollment payment fields | Phase 8 (`payment_provider`, `payment_id`, `amount_sar`) |

**Env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`  
**Packages:** `@supabase/supabase-js`, `@supabase/ssr`  
**Clients:** `src/lib/supabase.ts`, `supabase-server.ts`, `supabase-middleware.ts`

---

### B. Sanity CMS
**Blocked on:** project setup + dataset + content modeling + content entry

Sanity owns editorial content. **Do not copy a Prismic-era schema** (`coach_profile`, `uid`, flat bilingual field lists, etc.). Design Sanity document types, i18n, images, and rich text during integration. What is fixed today:

| Capability needed | Consumed by | Maps into |
|---|---|---|
| Coach editorial content (slug, bio, photo, specialties, Zoho Bookings id, …) | `/coaches`, `/coaches/[slug]` | `Coach` via `getCoaches` / `getCoachBySlug` |
| Course editorial content (slug, modules, pricing, video ids, …) | `/courses`, `/courses/[slug]` | `Course` / `CourseDetail` via `getCourses` / `getCourseBySlug` |
| Site / landing copy (later) | Homepage + shared chrome | `SiteContent` via `getContent()` |

**Integration rule:** Fetch Sanity → map in `src/content/mappers/` → keep facades as the only UI entry points. See architecture guide §10 for the full capability checklist.

**Env:** define once the Sanity integration starts  
**Add:** Sanity client helpers + mappers (schema TBD)  
**Images:** Sanity-managed assets (or the final chosen asset pipeline)

---

### C. Zoho One — Forms / CRM / Flow / ZeptoMail / Campaigns / SalesIQ
**Blocked on:** Zoho One org credentials + form/module setup  

| UI surface | Zoho path |
|---|---|
| `DiscoveryRequestForm` | Forms → CRM Lead → Flow → ZeptoMail |
| `GroupInterestFormClient` | Forms / CRM Lead (+ tag) → later Campaigns segment |
| `CommunityApplyFormClient` | Forms → CRM Application → Flow → ZeptoMail |
| `NewsletterForm` | Campaigns API subscribe |
| Locale `layout.tsx` | SalesIQ script (quick win) |
| Contact section (optional) | Same Forms/CRM pattern as discovery if kept as lead source |

**Add:** `src/lib/zoho.ts` (or route handlers that proxy secrets server-side)  
**Do not** store leads in Supabase — CRM is the system of record for pipeline.

---

### D. Zoho Bookings — 1:1 scheduling (calendar only)
**Blocked on:** Bookings API / embed IDs  

| Work | Notes |
|---|---|
| Availability on `/coaches/[slug]` | Service/staff IDs come from coach editorial content (`Coach.zohoBookingsServiceId`) |
| Payment | **Moyasar** / **Tamara** after slot selection — not Zoho/Stripe checkout |
| Confirm booking | On successful payment, create/confirm appointment via Bookings API |
| Dashboard bookings | Fetch via Bookings API into SAH UI |

Replace disabled slot grid — do not build a custom calendar engine.

---

### E. Moyasar + Tamara — payments (KSA)
**Blocked on:** Moyasar + Tamara merchant credentials  

| Work | Notes |
|---|---|
| Moyasar | Cards, mada, Apple Pay — pay-in-full for courses (and coaching when offered) |
| Tamara | BNPL / installments where conversion needs it |
| Checkout APIs | `src/app/api/payments/moyasar/...`, `src/app/api/payments/tamara/...` |
| Webhooks | Verify signature → write `course_enrollments` (`course_slug`, `payment_provider`, `payment_id`) |
| Course Buy CTA | Auth gate → choose Moyasar or Tamara → unlock player |
| Coaching pay | After Zoho Bookings slot pick → same providers → confirm booking |

**Env (indicative):** `MOYASAR_SECRET_KEY`, `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY`, `TAMARA_API_TOKEN`, webhook secrets  
**Add:** `src/lib/payments.ts`  
**Do not** introduce Stripe for customer-facing checkout.

---

### F. Mux — course modules
**Locked:** **Mux** (not Vimeo). Store per-module `muxAssetId` on Sanity course documents.  

**Blocked on for signed playback:** Moyasar/Tamara enrollments (Phase 9) + Mux signed token API (Phase 10). Account + asset IDs can be prepared earlier (Phase 7).

Player on dashboard / course detail; unlock only if Supabase enrollment exists. See [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./docs/BACKEND_IMPLEMENTATION_GUIDE.md).

---

### G. `/courses/[slug]` page
**Phase 6 built.** Sanity-backed bilingual detail route, curriculum display, Course JSON-LD, breadcrumbs/hreflang, sitemap entries, and a disabled purchase CTA are complete. Staging content/publish/locale QA confirmed. Payment, enrollment, and playback remain later-phase work.

**Deferred until real-domain deploy:** Rich Results Test, Search Console sitemap submit, and request indexing.

---

## 📂 Route status matrix

| Route | UI | Data / backend next |
|---|---|---|
| `/` | ✅ | JSON → later Sanity-backed `SiteContent` |
| `/discovery` | ✅ | Zoho Forms / CRM |
| `/coaches` | ✅ | Sanity → `Coach` facade |
| `/coaches/[slug]` | ✅ | Sanity → `Coach` + Zoho Bookings + Moyasar/Tamara |
| `/coaches/group` | ✅ | Zoho CRM |
| `/courses` | ✅ | Sanity → `Course` facade |
| `/courses/[slug]` | ✅ Phase 6 | Sanity → `CourseDetail`; payment/enrollment/playback deferred |
| `/community/apply` | ✅ | Zoho CRM |
| `/auth/*` | ✅ | Supabase Auth |
| `/dashboard/*` | ✅ empty | Supabase (+ Bookings for sessions); middleware pending |

---

## 📂 Integration file targets (to add)

```
src/lib/sanity.ts               # Sanity client + queries (after schema design)
src/content/mappers/            # Sanity docs → SiteContent / Coach / Course
src/lib/supabase.ts             # browser + server clients
src/lib/zoho.ts                 # Forms / CRM / Campaigns / Bookings helpers
src/lib/payments.ts             # Moyasar + Tamara
src/app/api/payments/moyasar/   # create payment + webhook
src/app/api/payments/tamara/    # create checkout + webhook
src/app/api/zoho/...            # optional proxies
src/middleware.ts               # Supabase session → protect dashboard
```

---

## ⚡ Priority order (locked — see backend guide)

Full step-by-step: [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./docs/BACKEND_IMPLEMENTATION_GUIDE.md).

1. **Environments** — Vercel staging, Sanity `staging`/`production`, Supabase Cloud, Mux account  
2. **Sanity** — Studio at `/studio`; schemas; coaches cutover (placeholders OK); then marketing document-per-locale  
3. **Zoho One greenfield** — CRM/Forms setup; discovery first; then group, apply, contact, Campaigns, SalesIQ  
4. **Supabase** — auth, proxy guard, profiles, dashboard  
5. **Courses** — Phase 6 complete (Buy disabled); Google Rich Results / Search Console indexing deferred until production-domain deploy
6. **Zoho Bookings** — calendar only until payments  
7. **Moyasar + Tamara** → enrollments *(blocked on client merchants)*  
8. **Mux signed playback** + progress *(blocked on enrollments)*  

---

## Notes from latest site pass (August 11, 2026)

- Hybrid IA from the architecture guide is in place; remaining work is integration, not a new sitemap.
- **Payments = Moyasar + Tamara** (KSA); Stripe is out of scope; merchants not ready yet → Phases 9–10 deferred.
- **Video = Mux** (locked).
- **Sanity Studio** = `sah.com.sa/studio` (Content Lake remains Sanity Cloud).
- **i18n** = document-per-locale (marketing) + field-level bilingual (coaches/courses).
- Homepage journey builder relocated to `/discovery` via need teaser — keep that pattern.
- `getContent()` / catalog facades remain the single swap points for CMS → app contracts.
- Zoho One account exists but modules are **not** configured yet — greenfield setup is part of Phase 3+.

---

*UI builds under `src/app/[locale]/**` and `src/components/**` are in place. Backend SDKs are intentionally not installed until credentials exist. Execute phases from `docs/BACKEND_IMPLEMENTATION_GUIDE.md`.*
