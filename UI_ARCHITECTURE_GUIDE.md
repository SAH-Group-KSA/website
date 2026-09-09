# SAH Group: Comprehensive UI Architecture Guide

> **Last updated:** August 11, 2026  
> **Companion docs:** [`IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md) (file-level build status + credentials) · [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./docs/BACKEND_IMPLEMENTATION_GUIDE.md) (phase-by-phase integration playbook)

## Table of Contents
1. [Current Site Assessment](#1-current-site-assessment)
2. [Architecture Decision](#2-architecture-decision-keep-landing-page-or-change)
3. [Site Map & Routing](#3-site-map--routing-structure)
4. [Workflow-by-Workflow UI Guide](#4-workflow-by-workflow-ui-guide)
5. [Personal Dashboard](#5-the-personal-dashboard)
6. [Navigation](#6-navigation)
7. [Landing Page Connections](#7-how-the-landing-page-connects-to-all-these-flows)
8. [Technical Prerequisites](#8-technical-prerequisites-summary)
9. [Zoho One Integration](#9-zoho-one-integration)
10. [Data Architecture](#10-data-architecture)
11. [Implementation Phases](#11-recommended-implementation-order-phases)
12. [Design Recommendations](#12-key-design-recommendations)
13. [Summary & Next Steps](#summary--next-steps)

---

## Ownership model (do not change)

This guide’s stack decisions are fixed. Every new feature must respect this split:

| Concern | System | Rule |
|---|---|---|
| Editorial content SAH team writes | **Sanity** | Coach bios, courses, module video IDs (Mux), landing-page copy (migrate from JSON), community page copy, images via the CMS asset pipeline |
| Customer accounts & user-generated data | **Supabase Auth + Supabase DB** | Login/register/sessions, `profiles`, enrollments, progress, reviews |
| Leads, forms, newsletter, booking ops, essential email | **Zoho One** (this phase) | CRM, Campaigns, Bookings, ZeptoMail, Flow. **Not this phase:** SalesIQ, Analytics, Desk, Sign, PageSense, ZMA, WorkDrive, Connect — see [`docs/SCOPE_OF_WORK.md`](./docs/SCOPE_OF_WORK.md) |
| Payments (courses + paid flows) | **Moyasar** + **Tamara** | Moyasar for cards / mada / Apple Pay; Tamara for BNPL installments. Prefer these over Stripe for KSA. |
| Course video delivery | **Mux** | Private / signed playback unlocked only after Supabase enrollment check (see backend guide Phases 9–10) |

> **Guiding principle:** *If a human at SAH writes it → Sanity. If software generates it from user behavior → Supabase. If it is a lead, schedule, newsletter, or ops email → Zoho One. If money moves in KSA → Moyasar and/or Tamara.*

---

## 1. Current Site Assessment

Status as of **July 29, 2026** — the hybrid multi-page app from this guide is largely **UI-complete**. Integrations (Sanity / Supabase / Zoho / Moyasar / Tamara / Mux) are still stubs.

| Aspect | Current State |
|---|---|
| Architecture | Hybrid: marketing homepage (anchor sections) + dedicated product routes |
| Routing | Locale App Router — Arabic unprefixed `/`, English `/en/*` |
| Homepage | 15 sections; journey wizard moved to `/discovery` (homepage uses `NeedTeaserSection` CTA) |
| Auth UI | `/auth/login`, `/register`, `/forgot-password` — forms validate; submit stubs pending **Supabase Auth** |
| Dashboard UI | `/dashboard/*` with shell + empty states — no middleware guard yet |
| Coaching UI | `/coaches`, `/coaches/[slug]` (placeholder data), `/coaches/group` (form stub) |
| Courses UI | `/courses` listing (placeholder) — `/courses/[slug]` **not built** |
| Discovery UI | Full pathway wizard + request form — submit stub pending **Zoho Forms → CRM** |
| Community UI | `/community/apply` form stub pending **Zoho Forms → CRM** |
| Newsletter UI | Homepage + footer form — success is client-only; pending **Zoho Campaigns** |
| Contact | Homepage `#contact` still present; discovery is the primary pathway entry |
| CMS | Static JSON via `getContent()` — designed to swap to **Sanity** without component changes |
| Database / Auth | None live — TODOs point at **Supabase** |
| Payment | None live — scheduling via **Zoho Bookings**; money via **Moyasar** + **Tamara** |
| Design system | `prototype-parity.css` tokens (cream / deep / gold / Noto Arabic) + thin Tailwind mirror |

**Status:** Front-door marketing + product page shells are in place. Remaining work is **wiring the decided backends**, not inventing a new IA.

---

## 2. Architecture Decision: Keep Landing Page or Change?

### Decision (executed): **Hybrid Multi-Page App**

**Keep the landing page as the homepage — product flows live on dedicated routes.**

### Reasoning (unchanged):

- The landing page does brand awareness, entities, programs, FAQ, and contact well.
- Customer journeys start on the homepage CTAs, then branch into discovery, coaching, courses, community, and dashboard.
- Auth, booking, course library, and member dashboard do not belong inside a single scroll page.

### The model in production today:

**Landing page = front door → dedicated routes for each product/service/flow → Zoho / Supabase / Sanity behind the scenes**

---

## 3. Site Map & Routing Structure

Legend: ✅ UI live · 🟡 UI live, backend stub · 🔴 not built · 🔒 auth required (middleware pending)

```
/[locale]/                          ✅ Marketing homepage (JSON content → future Sanity)

── Discovery ──
/[locale]/discovery                 🟡 Pathway wizard + request form → Zoho Forms / CRM

── SAH Human Coaches ──
/[locale]/coaches                   🟡 Listing (placeholder) → Sanity coach documents
/[locale]/coaches/[slug]            🟡 Profile + disabled slots → Sanity + Zoho Bookings widget
/[locale]/coaches/group             🟡 Interest form → Zoho Forms / CRM (+ Campaigns later)
/[locale]/courses                   🟡 Catalog (placeholder) → Sanity course documents
/[locale]/courses/[slug]            🔴 Detail + purchase + player → Sanity + Moyasar/Tamara + Supabase + Mux

── Account & Dashboard ──
/[locale]/auth/login                🟡 UI → Supabase Auth
/[locale]/auth/register             🟡 UI → Supabase Auth (+ Zoho CRM Contact on signup)
/[locale]/auth/forgot-password      🟡 UI → Supabase Auth reset (+ ZeptoMail if customized)
/[locale]/dashboard                 🟡 Empty states 🔒 → Supabase profiles / aggregates
/[locale]/dashboard/courses         🟡 Empty states 🔒 → Supabase course_enrollments + progress
/[locale]/dashboard/bookings        🟡 Empty states 🔒 → Zoho Bookings API + Supabase bridge
/[locale]/dashboard/profile         🟡 Form stub 🔒 → Supabase profiles

── Community ──
/[locale]/community/apply           🟡 Application form → Zoho Forms / CRM → ZeptoMail via Flow
/[locale]/community/[id]            🔴 Optional detail page (apply page covers both communities today)

── Newsletter ──
Homepage + footer NewsletterForm     🟡 Client success only → Zoho Campaigns API

── Programs (homepage section) ──
#programs on home                    ✅ Modal UX; dedicated /programs pages deferred
```

Locale notes:
- Default locale **Arabic** at `/` (`localePrefix: "as-needed"`).
- English at `/en/...`.
- `robots.txt` disallows `/auth/` and `/dashboard/`; those pages also send `noindex`.

---

## 4. Workflow-by-Workflow UI Guide

### Workflow 1: Request a Discovery Session

**Flowchart:** Form (no login) → Confirmation → SAH reviews in CRM → Discovery session → Solution Design → Implementation

#### UI today
- Homepage `#need` is a **teaser banner** (`NeedTeaserSection`) linking to `/discovery`.
- `/discovery` runs the 3-step `JourneyWizard` (audience → challenge → recommendation) plus `DiscoveryRequestForm` on the result step.
- Homepage `#contact` remains as a secondary contact path.

#### Target UI (unchanged intent)

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                             │
├─────────────────────────────────────────────────────┤
│  Eyebrow / H1 / short reassure copy                 │
│  Step indicator: About you → Need → Done            │
│  Step 1–2: Journey wizard (existing)                │
│  Step 3: Name, email, phone + pathway context       │
│  Confirmation: within 24 hours                      │
└─────────────────────────────────────────────────────┘
```

#### Backend (decided)
- ✅ No login required
- 🟡 **Zoho One:** Submit → **Zoho Forms API** → **Zoho CRM** Lead → **Zoho Flow** → **ZeptoMail** (visitor + SAH team)
- No custom lead DB in Supabase for this workflow

#### Implementation status
| Layer | Status |
|---|---|
| UI / routing | ✅ Done |
| Zoho Forms / CRM / Flow / ZeptoMail | 🟡 TODO in `DiscoveryRequestForm` |

---

### Workflow 2: Book Coaching or Enroll in a Program

**Flowchart:** Account (login/create) → Select coach/program → Payment → Dashboard

#### 2a. Coaches Listing (`/coaches`) — UI ✅ / data 🟡

Built with search + specialty filters, coach cards, group CTA. Data is placeholder arrays.

**Replace with:** Sanity-backed coach content mapped into the app `Coach` contract (bilingual as needed). Images via the CMS asset pipeline.

#### 2b. Coach Profile (`/coaches/[slug]`) — UI 🟡 / booking 🟡

Sidebar profile, about, credentials, disabled slot grid, reviews placeholder.

**Key Elements (target):**
- Editorial fields from **Sanity**, mapped into the app `Coach` contract (bio, photo, specialties, Zoho Bookings service id)
- Ratings/reviews from **Supabase** `coach_reviews` (two-query pattern)
- Sticky booking card embeds **Zoho Bookings** widget (real slots); collect payment with **Moyasar** / **Tamara** after slot selection (or a thin custom checkout that creates the Zoho booking on success)
- Auth gate before confirming paid booking when dashboard linkage is required

> **Zoho Bookings** owns calendar sync, reminders, reschedule/cancel. Do not rebuild a custom calendar engine. **Do not rely on Stripe** for customer-facing checkout — use Moyasar (cards/mada/Apple Pay) and Tamara (installments).

#### 2c. Account Gate — UI 🟡 / auth 🟡

Pages exist at `/auth/login`, `/register`, `/forgot-password`.

**Wire to:** **Supabase Auth** (`signInWithPassword`, `signUp`, `resetPasswordForEmail`). Optional Google/Apple OAuth later. After auth, return user to coach/slot context.

On register: create **Supabase** `profiles` row + **Zoho CRM Contact**; store `zoho_crm_contact_id` on the profile.

#### 2d. Payment

| Product | Scheduling | Payment |
|---|---|---|
| 1:1 coaching session | **Zoho Bookings** (slots, calendar, reminders) | **Moyasar** and/or **Tamara** after slot pick → then confirm booking |
| Recorded course | — | **Moyasar** (pay in full) and/or **Tamara** (BNPL) → webhook → **Supabase** `course_enrollments` |

**Payment UX notes (KSA):**
- Offer Moyasar for mada / Visa / Mastercard / Apple Pay
- Offer Tamara where installment / “pay later” improves conversion
- Store `payment_provider` (`moyasar` \| `tamara`) + provider payment/order id on the enrollment (or booking bridge) row
- Prefer a branded Next.js checkout step over Zoho-hosted payment pages so Tamara + Moyasar stay consistent with the design system

#### 2e. Group Coaching (`/coaches/group`) — UI ✅ / CRM 🟡

Interest form with program radios. No login. No upfront payment.

**Backend:** **Zoho Forms / CRM** Lead tagged with group program → later **Zoho Campaigns** to that segment when dates confirm.

---

### Workflow 3: Recorded Courses

#### Library (`/courses`) — UI ✅ / CMS 🟡
Placeholder cards. Replace with Sanity-backed course content mapped into the app `Course` contract.

#### Detail (`/courses/[slug]`) — 🔴 Not built
Depends on Sanity integration (schema designed then) + Moyasar/Tamara + Mux + Supabase enrollment.

**Target:** Hero, sticky purchase card, curriculum accordion (free preview vs locked), enroll → auth gate → Moyasar/Tamara → unlock Mux player in dashboard.

---

### Workflow 4: Community Apply (`/community/apply`) — UI ✅ / CRM 🟡

Form + success UI live. Context cards for Impact / Lego communities.

**Backend:** **Zoho Forms → CRM Application** → team reviews in CRM → **Zoho Flow → ZeptoMail** (approve with WhatsApp invite / reject). Communities stay on WhatsApp unless later moved to Zoho Connect.

---

### Workflow 5: Newsletter — UI ✅ / Campaigns 🟡

`NewsletterForm` (default / inline / footer). Client-side validation + fake success.

**Backend:** **Zoho Campaigns API** (double opt-in, welcome, unsubscribe, sends). No Mailchimp/Resend.

---

## 5. The Personal Dashboard (`/dashboard`)

**UI today:** `DashboardShell` sidebar + overview / courses / bookings / profile empty states. Sign-out and data are stubs. **Middleware auth guard not installed** (requires Supabase).

**Target sections (unchanged):**
1. Welcome greeting from **Supabase** `profiles`
2. My Courses — enrollments + progress from **Supabase**; curriculum metadata from **Sanity** keyed by stable course slug
3. Upcoming / past sessions — **Zoho Bookings** API (and/or CRM activity), shown in SAH-branded UI
4. Profile / preferences — **Supabase** `profiles` (bridge field `zoho_crm_contact_id`)

Dashboard is custom Next.js UI. Zoho does **not** replace the customer-facing dashboard.

---

## 6. Navigation

### Implemented (matches upgraded plan)

```
[SAH Group Logo]

Primary Nav:
├── Find Your Path          → /discovery
├── Coaching ▼
│  ├── 1:1 Coaching         → /coaches
│  ├── Group Coaching       → /coaches/group
│  └── Recorded Courses     → /courses
├── Community               → /community/apply
└── About / site sections   → homepage hashes (#promise … #contact)

Right side:
├── [Sign In]               → /auth/login
└── [Book Discovery Session]→ /discovery   (primary CTA)
```

Footer links updated for discovery, coaches, courses, community apply.

**Still pending:** Auth-aware header (Dashboard / Sign out when **Supabase** session exists).

---

## 7. How the Landing Page Connects to All These Flows

| Landing Section | Behavior today | Target backend |
|---|---|---|
| Hero primary CTA | → `/discovery` (or hash where configured) | — |
| `#need` teaser | → `/discovery` | Zoho CRM via discovery form |
| Journey wizard | On `/discovery` (not embedded on home) | Zoho Forms / CRM |
| Programs “Ask about” | → `/discovery` (gold CTA in modal) | Zoho CRM (+ optional `?program=` later) |
| Community CTA | → `/community/apply` | Zoho CRM Application |
| Entities / SAH Human | Modal; coaching links toward `/coaches` | Sanity coaches |
| Newsletter | Client success | **Zoho Campaigns** |
| Header Book Discovery | → `/discovery` | Zoho CRM |
| Contact `#contact` | Local form UX | Prefer discovery for pathway leads; contact may also post to Zoho Forms |

---

## 8. Technical Prerequisites Summary

### Current frontend stack (live)
- ✅ Next.js (App Router)
- ✅ React 19
- ✅ Tailwind CSS (thin token mirror) + **`prototype-parity.css`** as visual source of truth
- ✅ next-intl
- ✅ TypeScript
- ✅ SEO helpers (`buildPageMetadata`, JsonLd, sitemap, robots)

### What to add (unchanged decisions)

| Capability | System |
|---|---|
| Editorial CMS | **Sanity** |
| Auth / sessions | **Supabase Auth** |
| Transactional DB | **Supabase** PostgreSQL + RLS |
| 1:1 booking + session pay | **Zoho Bookings** (schedule) + **Moyasar** / **Tamara** (pay) |
| Course pay | **Moyasar** + **Tamara** |
| Course video | **Mux** |
| Images | **CMS asset pipeline** |
| Transactional email | **Zoho ZeptoMail** |
| Newsletter | **Zoho Campaigns** |
| Leads / applications | **Zoho CRM** (+ **Zoho Forms**, **Zoho Flow**) |
| Live chat | **Zoho SalesIQ** |
| Business reporting | **Zoho Analytics** |

### Recommended stack (complete)

```
Frontend:
  - Next.js App Router + React + next-intl + prototype-parity design system

CMS (editorial — what SAH writes):
  - Sanity → landing content (migrate from JSON), coaches, courses, community copy
  - CMS-managed assets for editorial imagery

Backend (transactional — what users do):
  - Supabase Auth → login, sessions, OAuth
  - Supabase DB  → profiles, enrollments, progress, reviews
  - Moyasar      → card / mada / Apple Pay (courses + paid coaching)
  - Tamara       → BNPL installments (courses + where offered on coaching)

Zoho One (ops — already licensed):
  - CRM, Forms, Bookings (calendar/reminders), Campaigns, ZeptoMail, Flow, SalesIQ, Analytics

External:
  - Mux → private course modules
```

---

## 9. Zoho One Integration

The client has **Zoho One**. Prefer Zoho for ops before adding new SaaS. Custom Next.js remains for brand UI, auth, dashboard, and course player.

### Zoho App → Workflow Mapping

| Zoho App | Replaces | Used For |
|---|---|---|
| **Zoho CRM** | Custom lead DB + admin | Discovery, group interest, community applications |
| **Zoho Forms** | Custom form backend | `/discovery`, `/coaches/group`, `/community/apply` (and optionally contact) |
| **Zoho Bookings** | Custom calendar | 1:1 slots, reminders, reschedule (payment via Moyasar/Tamara) |
| **Zoho Campaigns** | Mailchimp / Resend broadcast | Newsletter + group announcements |
| **Zoho ZeptoMail** | SendGrid / Resend transactional | Confirmations, approvals, notifications |
| **Zoho Flow** | Custom webhooks | Form → CRM → email automations |
| **Zoho SalesIQ** | Third-party chat | Live chat + lead capture |
| **Zoho Analytics** | Custom BI | Pipeline + (later) Supabase metrics |

### Detailed pipelines

#### Discovery → CRM

```
Website (/discovery) DiscoveryRequestForm
       → Zoho CRM Leads API
       → Zoho CRM Lead (fields + Lead_Source)
       → Zoho Flow → ZeptoMail (visitor + SAH team)
       → SAH works Lead Status / Deals in Zoho by hand (out of website scope)
```

#### Community apply → CRM

```
/community/apply → Zoho Forms → CRM Application
  → Review in CRM → Zoho Flow → ZeptoMail (approve + WhatsApp invite / reject)
```

#### Group interest → CRM + Campaigns

```
/coaches/group → CRM Lead tagged "Group — [Program]"
  → Later: Zoho Campaigns to that CRM segment
```

#### Newsletter → Campaigns

```
NewsletterForm → Zoho Campaigns API → list + double opt-in + welcome
```

#### 1:1 booking → Bookings + Moyasar/Tamara

```
/coaches/[slug] → Zoho Bookings (availability; service id from the CMS)
  → customer picks slot
  → Moyasar and/or Tamara checkout (SAR)
  → on payment success: confirm booking in Zoho Bookings + show in dashboard
```

#### Live chat → SalesIQ

One script in locale layout; chats can create CRM leads.

### Full integration diagram

```
SAH Website (Next.js)
        │
        ├── Discovery Form ──────────────→ Zoho Forms → CRM → Flow → ZeptoMail
        ├── Newsletter Form ─────────────→ Zoho Campaigns
        ├── Community Apply ─────────────→ Zoho Forms → CRM → Flow → ZeptoMail
        ├── Group Coaching Form ─────────→ Zoho CRM (+ later Campaigns)
        ├── Coach Profile ───────────────→ Zoho Bookings (slots) → Moyasar / Tamara (pay)
        ├── SalesIQ ─────────────────────→ Zoho SalesIQ → CRM
        ├── Course Purchase ─────────────→ Moyasar / Tamara → Supabase enrollments
        ├── Auth / Dashboard ────────────→ Supabase Auth + DB
        ├── Editorial pages ─────────────→ Sanity
        ├── Course video ────────────────→ Mux (gated by enrollment)
        └── Reporting ───────────────────→ Zoho Analytics
```

### What Zoho does **not** replace

| Capability | Why |
|---|---|
| Public customer auth | Use **Supabase Auth**, not Zoho IAM |
| `/dashboard` UX | Brand-specific; custom Next.js |
| Course player + progress | Custom UI + **Supabase** + **Mux** |
| Enrollment access control | **Supabase RLS** |
| Pixel-perfect marketing UI | Embed Zoho widgets; do not host full funnels on Zoho pages |

### Quick wins (still valid; UI already waiting)

| Action | Effort |
|---|---|
| CRM pipelines for discovery / apply / group | Ops setup |
| Wire form stubs to Zoho Forms / CRM | ~1–2 days |
| SalesIQ script in layout | ~30 min |
| Newsletter → Zoho Campaigns | ~half day |

---

## 10. Data Architecture

### Guiding principle

> **"If a human at SAH writes it → Sanity. If software generates it from user behavior → Supabase. If it is pipeline/ops → Zoho."**

| Type | Examples | Lives in |
|---|---|---|
| Editorial | Coach bio, photo, specialties, pricing, course modules, landing copy | **Sanity** |
| Transactional | Enrollments, ratings, progress, profiles | **Supabase** |
| Scheduling | Availability, appointments | **Zoho Bookings** |
| Business pipeline | Leads, applications | **Zoho CRM** |

### Binding key: stable public slug

Supabase rows reference coaches/courses by a **stable public slug** (e.g. `dr-sarah-al-rashidi`, `human-architecture-foundations`). That slug is the cross-system binding key for routes, enrollments, and reviews. Never change it after go-live; change display `name` only.

How Sanity stores that slug (field name, document type, localization strategy) is decided during Sanity integration — not prescribed here.

### Editorial content requirements (CMS-agnostic)

Sanity is the **system of record** for editorial content. The **Sanity schema is not fixed yet** — design it during integration so editors get a good authoring UX. What *is* fixed today is the set of capabilities the website needs, and the TypeScript contracts those capabilities must map into.

**Integration rule:** UI components depend only on app contracts (`SiteContent`, `Coach`, `Course`, `PageSeo`). Fetch Sanity → map in `src/content/mappers/` → expose via `getContent` / `getCoaches` / `getCourses` / `getPageSeo`. Do not leak Sanity SDK types into React components.

#### Coaches (maps to `Coach` / listing + `/coaches/[slug]`)
Must be able to author and publish, per locale as needed:
- Stable public **slug** (binding key)
- Name, specialty/title, short bio, optional full bio
- Photo / portrait
- Specialty tags / topics, languages, credentials, experience, session duration
- Session price (SAR) and optional session-type variants
- Publish / active flag
- Zoho Bookings service (or staff) id for live availability

#### Courses (maps to `Course` / listing + future `/courses/[slug]`)
Must be able to author and publish:
- Stable public **slug**
- Title, description, level, thumbnail
- Module count / duration metadata for cards
- Price (SAR) and published flag
- Curriculum modules: title, duration, free-preview flag, and a Mux asset id (`muxAssetId`)
- Optional instructor / entity / category metadata for filtering and detail UI

#### Site / landing (maps to `SiteContent`)
Today: `src/content/{en,ar}/home.json` via `getContent()`.  
Later: migrate landing/editorial copy into Sanity in whatever document shape fits editors best, then map into the same `SiteContent` type so homepage components stay unchanged (`src/content/index.ts` remains the single swap point).

> **Do not treat older Prismic-era field lists or type names (`coach_profile`, `uid`, etc.) as the Sanity schema.** Those were planning placeholders for a different CMS. Sanity document types, field names, Portable Text vs plain text, image objects, and i18n strategy should be designed for Sanity.

### Supabase tables (transactional only)

```sql
profiles
  id UUID (= auth.users.id)
  full_name, phone, locale
  zoho_crm_contact_id TEXT
  created_at

course_enrollments
  id, user_id
  course_slug TEXT              -- stable public slug from CMS / catalog
  purchased_at
  payment_provider TEXT        -- "moyasar" | "tamara"
  payment_id TEXT              -- provider payment / order id
  amount_sar INTEGER

course_progress
  user_id, course_slug, module_index, completed_at

coach_reviews
  id, user_id, coach_slug, rating, body, created_at
```

Enable **RLS** so users only touch their own rows.

### Two-query page pattern

```typescript
const [coach, stats] = await Promise.all([
  getCoachBySlug(locale, params.slug), // CMS-backed when FEATURE_CMS is on
  supabase.from("coach_reviews").select("rating").eq("coach_slug", params.slug),
]);
```

CMS fetch (via content facade): cached / revalidated. Supabase: fresh.

### Complete data flow

```
SAH TEAM → Sanity (coaches, courses, landing)
USERS    → Supabase Auth / profiles
         → Moyasar / Tamara → course_enrollments
         → Mux unlock via enrollment
         → Zoho Bookings for 1:1 slots (+ Moyasar/Tamara pay)
         → coach_reviews in Supabase
OPS      → Zoho CRM / Campaigns / Bookings / Analytics
```

### Community platform

WhatsApp remains the community surface. `/community/apply` is the formal gate; approved applicants get the WhatsApp invite via ZeptoMail. Evaluate **Zoho Connect** only if structured community features are needed later.

### Why Supabase Auth (unchanged)

Same service as DB, RLS uses auth user id, email/password + OAuth. Zoho IAM is for internal staff, not public customers. `profiles.zoho_crm_contact_id` bridges to CRM; email is the universal match key.

---

## 11. Recommended Implementation Order (Phases)

Checkmarks reflect **July 29, 2026** reality: UI shells done; integrations next.

### Phase 1 — Foundation (No Auth, No Payment)
**Goal:** Real form handling + coach directory from CMS

| Item | Status |
|---|---|
| Multi-page routing + nav/CTAs | ✅ Done |
| `/discovery` UI | ✅ Done |
| `/coaches` + `/coaches/[slug]` UI | ✅ Done (placeholder data) |
| `/coaches/group` UI | ✅ Done (stub submit) |
| `/community/apply` UI | ✅ Done (stub submit) |
| Newsletter UI | ✅ Done (stub subscribe) |
| Design **Sanity** schemas for coach/course requirements; map into app contracts; replace placeholders | ⬜ |
| Wire discovery / group / apply → **Zoho Forms → CRM** | ⬜ |
| Wire newsletter → **Zoho Campaigns** | ⬜ |
| **Zoho SalesIQ** script | ⬜ |
| **Zoho Flow** + **ZeptoMail** automations | ⬜ |
| Embed **Zoho Bookings** on coach profiles (even before full auth) | ⬜ |

**Output when Phase 1 integrations complete:** Live leads in CRM, real coach content from Sanity, chat + newsletter live. Still no customer accounts.

---

### Phase 2 — Auth + Dashboard
| Item | Status |
|---|---|
| Auth page UI | ✅ Done |
| Dashboard shell + empty states | ✅ Done |
| **Supabase** project + `profiles` | ⬜ |
| Wire login/register/forgot/sign-out | ⬜ |
| Middleware: protect `/dashboard/**` | ⬜ |
| On register: create Zoho CRM Contact → store id | ⬜ |
| Auth-aware header (Dashboard / Sign out) | ⬜ |

---

### Phase 3 — Courses + Payment
| Item | Status |
|---|---|
| `/courses` listing UI | ✅ Done (placeholder) |
| Sanity-backed courses + real data (schema designed during integration) | ⬜ |
| `/courses/[slug]` page | 🔴 Build |
| Upload private **Mux** videos (IDs on Sanity modules) | ⬜ |
| **Moyasar** + **Tamara** checkout + webhooks → `course_enrollments` | ⬜ |
| `course_progress` + dashboard player | ⬜ |
| RLS on enrollment tables | ⬜ |

---

### Phase 4 — 1:1 Booking polish
| Item | Status |
|---|---|
| Coach profile booking UI shell | ✅ Done (disabled slots) |
| Finalize Zoho Bookings availability embed | ⬜ |
| Moyasar / Tamara pay-after-slot + confirm booking | ⬜ |
| Dashboard bookings from Bookings API | ⬜ |
| Reminder / reschedule QA | ⬜ |

---

### Phase 5+ — Polish & growth
- Coach/course reviews in Supabase
- Zoho Analytics unified reporting
- SalesIQ chatbot refinement
- Optional `/programs` dedicated routes, `/community/[id]`
- Design-system consolidation (single Button API, form field recipe, token sync Tailwind ↔ CSS) — see recent UI audit

---

## 12. Key Design Recommendations

### 1. Maintain the existing visual language
Source of truth: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) + `src/styles/design-tokens.css`.

- **Colors:** `--deep` `#003d2c`, `--cream` `#f5f1e8`, `--gold` `#c89a13`, `--ink` / `--muted` / `--line` / `--surface`
- **Entity accents (CSS):** Human `#004530`, Seera `#241238`, Nexus `#12304A`, Connect `#090A0C`, Lego `#D4A017`, Impact `#008A5E`
- **Typography:** Noto Sans Arabic (body) + Noto Kufi Arabic (display); avoid introducing Inter/system stacks
- **Components:** Extend `.button`, `.section`, cards, modals — or new `ds-*` primitives / Tailwind token utilities
- **Tailwind:** `tailwind.config.ts` mirrors CSS variables (no parallel hex approximations)

### 2. Dashboard = brand continuation
Not a gray SaaS shell. Reuse cream/deep/gold, section headings, entity badges, card hover language already in `prototype-parity.css`.

### 3. Auth pages = minimal
Centered `.auth-card` on cream/deep field, logo, clean fields, no chrome clutter. OAuth later under primary email/password (**Supabase Auth**).

### 4. Coaches = curated directory
High-trust photography from the CMS; specialty tags; ratings only after real **Supabase** review data exists.

### 5. Mobile-first booking
KSA traffic is mobile-heavy. Stack Zoho Bookings embed below profile on small screens; large touch targets.

### 6. RTL from day one
`dir` + next-intl already in place. Re-test auth, dashboard, forms, and embeds in Arabic after each integration.

### 7. Progressive disclosure
Keep the discovery wizard step pattern; avoid one long form where a staged flow exists.

### 8. Messaging & trust
Keep “within 24 hours” / “3–5 business days” expectation copy; confirmation states already sketched in apply/discovery success UIs.

### 9. SEO
- Per-route `buildPageMetadata` + alternates: done on most public pages
- JsonLd: Organization + FAQ (home), ItemList + Breadcrumb (coaches/courses), Person (coach slug)
- Still TODO: sitemap entries for each coach slug; `/courses/[slug]` when built; richer OG images per page

### 10. Performance
Homepage already dynamic-imports heavy sections. Prefer `AppImage` for all photos; use CMS-aware image sizing once integrated; cache CMS fetches.

### 11. UI consistency (post-audit priorities)
When touching UI, prefer:
1. One CTA path: `Button` + `LocaleLink` for internal hrefs  
2. One form-field recipe across contact / auth / apply / discovery  
3. Shared catalog card for coach/course  
4. No emoji-as-icon on product surfaces long-term (replace with SVG set)

---

## Summary & Next Steps

### Single biggest recommendation
Do **not** redesign the IA. The hybrid app is built. Unlock value by wiring **the systems already decided**, in the order locked in [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./docs/BACKEND_IMPLEMENTATION_GUIDE.md):

1. **Environments** — Vercel staging + Sanity datasets + Supabase Cloud + Mux account  
2. **Sanity** — Studio at `/studio`, schemas (document-per-locale marketing + field-level coaches/courses), then coaches cutover  
3. **Zoho One** — greenfield CRM/Forms; discovery first, then remaining forms / Campaigns / SalesIQ  
4. **Marketing → Sanity** — section by section (required)  
5. **Supabase Auth + DB** — accounts + dashboard guard  
6. **Courses + `/courses/[slug]`** — Sanity + Mux IDs; Buy disabled until merchants  
7. **Zoho Bookings** — calendar only until Moyasar/Tamara  
8. **Moyasar + Tamara → Mux signed playback** — blocked on client merchant accounts  

### Immediate next actions
1. Follow **Phase 0–1** in [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./docs/BACKEND_IMPLEMENTATION_GUIDE.md)  
2. See **`IMPLEMENTATION_STATUS.md`** for file-level TODOs and env vars

---

## Appendix: File Structure (as built)

```
src/
├── app/
│   ├── layout.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   └── [locale]/
│       ├── layout.tsx                 fonts, SiteShell, CSS
│       ├── page.tsx                   landing
│       ├── not-found.tsx
│       ├── discovery/page.tsx         ✅
│       ├── coaches/
│       │   ├── page.tsx               ✅ placeholder → Sanity → Coach
│       │   ├── [slug]/page.tsx        ✅ placeholder → Sanity → Coach + Zoho Bookings
│       │   └── group/page.tsx         ✅ stub → Zoho
│       ├── courses/
│       │   └── page.tsx               ✅ placeholder → Sanity → Course
│       │   └── [slug]/                🔴 build with Sanity → Course + Moyasar/Tamara + Mux + Supabase
│       ├── community/apply/page.tsx   ✅ stub → Zoho
│       ├── auth/{login,register,forgot-password}/  ✅ UI → Supabase Auth
│       └── dashboard/{page,courses,bookings,profile}/  ✅ UI → Supabase (+ Bookings API)
├── components/
│   ├── sections/                      landing sections
│   ├── layout/                        SiteShell, Header, Footer, …
│   ├── ui/                            Button, Modal, Section, …
│   ├── forms/NewsletterForm.tsx       → Zoho Campaigns
│   ├── discovery/                     wizard page + request form → Zoho
│   ├── journey/                       JourneyWizard, JourneyStage
│   ├── coaches/                       list + group form
│   ├── community/                     apply form
│   ├── auth/                          login/register/forgot clients → Supabase
│   ├── dashboard/                     shell + profile form → Supabase
│   └── seo/JsonLd.tsx
├── content/
│   ├── index.ts                       getContent() — swap body for Sanity later
│   ├── mappers/                       Sanity docs → app contracts (schema TBD)
│   ├── types.ts
│   └── {en,ar}/home.json              interim CMS
├── lib/
│   ├── seo.ts, constants.ts, utils.ts
│   ├── sanity.ts                      🔴 add after schema design
│   ├── supabase.ts / auth helpers     🔴 add
│   ├── payments.ts (Moyasar + Tamara) 🔴 add
│   └── zoho.ts                        🔴 add
└── styles/prototype-parity.css        design tokens + page CSS
```

---

**This guide is the IA / ownership north star.** Day-to-day integration steps live in [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./docs/BACKEND_IMPLEMENTATION_GUIDE.md). Stack ownership (Sanity / Supabase / Zoho One / Moyasar / Tamara / Mux) is fixed; CMS schema is designed during Phase 1 against §10 content requirements and app contracts.

---

*Last updated: August 11, 2026 — linked backend implementation guide; video locked to Mux; Studio at `/studio`.*
