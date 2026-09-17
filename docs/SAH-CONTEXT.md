# SAH Group — Business & Product Context

This document captures the business and product context a developer needs before working on this
codebase. It is derived entirely from repository content (`src/content/en/home.json`,
`docs/SCOPE_OF_WORK.md`, `docs/ZOHO_FIRST_ARCHITECTURE.md`, `COLOR_PALETTE.md`, Sanity schemas,
and adapter/domain code). Where the repository does not state something explicitly, it is marked
**TBD** rather than inferred or invented. See [`CLAUDE.md`](../CLAUDE.md) for the corresponding
technical/architecture rules.

---

## 1. What SAH Group Does

SAH Group ("From People to Impact") is described in the site's own metadata as:

> "An integrated Saudi ecosystem of six specialized entities that develops people and leadership,
> transforms business and technology, builds partnerships, and creates sustainable impact."
> — `src/content/en/home.json` (`meta.description`)

Motto: **"People First Business Follows"** (`meta.motto`).

**Vision** (site copy, `about.vision`):
> "To be the Kingdom's leading ecosystem for leadership development and sustainable impact."

**Mission** (site copy, `about.mission`):
> "We empower leaders and organizations to transform awareness into purposeful action, decisions
> into measurable growth, and growth into sustainable impact through one integrated ecosystem."

**Stated beliefs** (`about.beliefs`):
1. **People First** — "the quality of every outcome begins with the quality of the people behind it"
2. **Clarity Before Decisions** — "we build decisions on clarity — not assumptions"
3. **Leadership Before Expansion** — "organizations grow only as far as their leaders grow"
4. **Impact Before Activity** — "we measure value by lasting change — not activity alone"
5. **Integration Before Execution** — "we bring expertise and entities around one need to provide
   an integrated solution — not fragmented services"

Per `docs/ZOHO_FIRST_ARCHITECTURE.md`, SAH Group is characterized as "a human development and
coaching organisation serving the KSA market," delivered through six sub-brands (see §4).

Company registration details, founding year, physical HQ address, and legal entity structure:
**TBD** (not present in the repository beyond the footer's location/contact placeholders).

---

## 2. Website Goals

Per `docs/SCOPE_OF_WORK.md` ("Brief"), the binding goal for the current delivery phase is:

> "Ship a bilingual production site where SAH edits content, captures leads into Zoho, and
> customers can create accounts, buy courses, book coaching, and watch paid video — **without**
> Zoho sales automation, live chat, reporting, or extra Zoho apps."

Concretely, on production (AR + EN), a visitor should be able to (Acceptance criteria, §4 of
`SCOPE_OF_WORK.md`):

1. Read marketing, coaches, programmes, courses — all sourced from Sanity
2. Submit Discovery, Contact, Group, Programme, or Community forms → records created in Zoho CRM
3. Subscribe to the newsletter (double opt-in + welcome email)
4. Register, confirm email, log in, view dashboard, update profile
5. Request — or, once payment keys are live, pay for — a coaching slot from real Zoho Bookings
   availability
6. Pay for a course via Moyasar **and** Tamara, and see it reflected in `/dashboard/courses`
7. Play enrolled/preview video via Mux, with progress saved
8. Always see a real error or "coming soon" state — **never a fake success**

Explicitly **out of scope** for this phase (§3 of `SCOPE_OF_WORK.md`): live chat (SalesIQ or any
third-party), analytics/reporting dashboards, Zoho sales automation (pipelines, scoring,
assignment, nurture flows), additional Zoho apps (Desk, Sign, PageSense, Marketing Automation,
WorkDrive, Analytics, Connect), site redesign/new IA, OAuth login, Stripe or any non-KSA payment
provider, staff/coach portals, moderated reviews, certificates, gamification, and non-SAR currency.

Longer-term product vision beyond this phase: **TBD** (no roadmap document beyond the current
scope-of-work was found).

---

## 3. Target Audience

Derived from the entity audience lists in `src/content/en/home.json` (`entities[].audiences`) and
the Discovery journey's two top-level segments (`need.stages.audience`):

- **Individuals** — the site explicitly frames one path as "for your personal growth and
  leadership" (Discovery wizard copy). Audience roles named across entities include: Chief
  Executives, Executive Leaders, Managers, Emerging Leaders, Founders, Experts, Speakers,
  Decision-Makers, and Professional Influencers.
- **Organizations** — framed as "for your team, company, or institution." Audience types named
  across entities include: Ministries, Government/Authorities, Large Enterprises, Startups,
  Transformation Teams, Companies, Nonprofits/Grant-Making Institutions, Academic Institutions,
  and Business & Real Estate sector organizations.
- **Sector focus**: Kingdom of Saudi Arabia (KSA) specifically — confirmed by SAR-only pricing,
  Moyasar/mada as a payment method, `sah.com.sa` as the production domain (per
  `SCOPE_OF_WORK.md`), and Arabic as the default locale.

No demographic data (age ranges, company size bands, seniority thresholds) beyond the role/sector
lists above is present in the repository — anything more granular is **TBD**.

---

## 4. Major Website Sections

Based on the homepage content structure (`src/content/en/home.json`) and the route inventory in
`docs/ZOHO_FIRST_ARCHITECTURE.md` §1:

| Section / Route | Purpose |
|---|---|
| `/` (homepage) | Marketing homepage: hero, "Promise," entities overview, method, programs, journeys, partners, impact metrics, initiatives, newsletter, about, community, FAQ, contact |
| `/discovery` | Interactive 3-step wizard that recommends a pathway/entity based on audience + challenge |
| `/coaches`, `/coaches/[slug]` | Coach directory and individual coach profile with booking |
| `/coaches/group` | Group coaching interest form |
| `/courses`, `/courses/[slug]` | Course catalogue and course detail (purchase + video) |
| `/community/apply` | Community membership application (individual or organisation) |
| `/[company]` (6 routes) | Landing page per sub-brand/entity (e.g. `/sah-human`, `/seera`, `/sah-nexus`, `/sah-sponsor`, `/lego-by-sah`, `/sah-impact`) |
| `/program/[id]` | Individual program detail page with an interest/registration form |
| `/auth/*` | Login, register, forgot-password, reset-password |
| `/dashboard/*` | Authenticated area: overview, courses, bookings, profile |
| `/studio` | Sanity Studio (content editing, not publicly indexed) |

---

## 5. Entities (Sub-Brands)

SAH Group operates **six specialized entities**, each with its own brand theme, route, and target
audience (`src/content/en/home.json` `entities[]`, cross-referenced with `COLOR_PALETTE.md`):

| Entity ID | Brand Name | Route | Specialty | Tagline |
|---|---|---|---|---|
| `human` | SAH HUMAN | `/sah-human` (+ `/coaches`, `/courses`) | People & Leadership Development | "We develop leaders from within—turning awareness into readiness, readiness into decisions, and decisions into impact across teams and organizations." |
| `seera` | SEERA | `/seera` | Professional Identity & Leadership Reputation | "We turn expertise into a clear identity, a trusted voice, and a leadership reputation built with confidence and consistency." |
| `nexus` | SAH NEXUS | `/sah-nexus` | Business, AI & Digital Transformation | "We develop business and lead digital and AI transformation by connecting technology with value and people." |
| `connect` | SAH SPONSOR | `/sah-sponsor` | Sponsorships & Strategic Partnerships | "We connect impact with opportunity and design sponsorship and partnership solutions that strengthen brands, support meaningful initiatives, and create shared value." |
| `lego` | LEGO® BY SAH | `/lego-by-sah` | Experiential Learning | "We turn ideas into clear insights, conversations into decisions, and challenges into executable plans through constructive thinking and equitable participation." |
| `impact` | SAH IMPACT | `/sah-impact` | Sustainable Impact & Social Responsibility | "We design meaningful community initiatives, build clear measurement models, and turn responsibility into sustainable impact that can be managed and improved." |

Each entity page follows the same content shape (`entityPages.<id>`): hero, promise, offerings,
profile, programs, journeys, FAQ, contact context — see `src/content/en/home.json`.

Note: **coaches and courses are modeled as belonging to the `human` entity** specifically (see
`COLOR_PALETTE.md` line: `SAH Human | /sah-human, /coaches, /courses | human`) — they are not a
cross-entity feature.

**Coaches/courses redesign in progress**: per team discussion (2026-09-17), the current
coaches/courses data model and approach may change after further client input — see
[`CLAUDE.md`](../CLAUDE.md) "Things That Must Not Be Changed Without Asking."

---

## 6. Programs

"Programs" are the structured offerings within each entity, listed at `src/content/en/home.json`
→ `programs[]` (34 entries in the static content) and rendered via the homepage's Programs section
and `/program/[id]` detail pages.

Each program record has (per `programs[]` schema observed in content):
- `id`, `title`, `entity` (which of the six entities it belongs to), `audience` (`individual` or
  `organization`), `level` (numeric)
- `summary`, `outcome`, `problem` (the need it addresses), `format`, `duration`, `deliverables`,
  and `next` (a suggested follow-on program)

Example (`human-architecture`):
> Summary: "A journey that reveals personal assets, patterns, and capabilities and connects them
> with role and choice." Outcome: "Deeper awareness that changes behavior, decisions, and
> direction." Next: "Executive Leadership Readiness or a SEERA pathway depending on the goal."

Programs can be filtered by audience, entity, and level on the homepage Programs section
(`programsSection` copy: search, audience filter, level filter, entity filter). A visitor can
register interest in a program via a form (`programsSection.registerTitle` etc.), which — per
`SCOPE_OF_WORK.md` — creates a **Programme lead in Zoho CRM**.

Per `SCOPE_OF_WORK.md`, program content (titles, descriptions, etc.) is intended to be authored in
**Sanity** in production, not the static JSON — the static `programs[]` array is the pre-CMS
content, used when `FEATURE_CMS=0`.

---

## 7. Coaches

Coach directory (`/coaches`) and individual coach profile (`/coaches/[slug]`) fall under the
**SAH Human** entity (see §5).

Per the static catalog shape (`src/content/catalog/coaches.ts`, `CoachRecord`), each coach has:
- Bilingual name, specialty, short bio, and full bio (`name`/`nameAr`, `specialty`/`specialtyAr`,
  `bio`/`bioAr`, `fullBio`/`fullBioAr`)
- `rating`, `reviewCount`, and a list of written `reviews` (author, rating, body, date)
- `price` (in SAR) and `sessionDuration`
- `experience` (years), `credentials` (e.g. "ICF PCC", "Executive MBA — INSEAD"), `topics` (e.g.
  Leadership, Executive Presence), and spoken `languages`

Per `docs/SCOPE_OF_WORK.md`, in production a coach's page should show **real booking availability
via Zoho Bookings**. Per `docs/ZOHO_FIRST_ARCHITECTURE.md`'s route inventory, the coach profile
page currently ships with "disabled booking slots and reviews placeholder" — i.e. the booking UI
exists but is not wired to live data (see §10, Booking Journey, and [`CLAUDE.md`](../CLAUDE.md)
External Integrations table, which confirms Zoho Bookings is currently stubbed in code).

Per `SCOPE_OF_WORK.md` §5, **coach hours and bookable services must be provided by SAH** — this is
listed as an external dependency blocking the Bookings integration, not something the codebase
can determine on its own.

Whether coaches are SAH employees, independent contractors, or a mix: **TBD**.

---

## 8. Discovery Journey

The "Discovery" flow (`/discovery`, and the `need` section embedded on the homepage) is the site's
primary lead-qualification mechanism. Per `src/content/en/home.json` (`need` section) and
`docs/SCOPE_OF_WORK.md`:

1. **Step 1 — "Who is this for?"**: visitor selects **Individual** or **Organization**
   (`need.stages.audience`).
2. **Step 2 — "What do you need help with?"**: visitor selects the challenge closest to their
   situation from a list (`need.stages.challenge`; the underlying challenge options are stored in
   `journeyChallenges.individual[]` / `journeyChallenges.organization[]`, 8 options each).
3. **Step 3 — Recommended pathway**: the wizard shows a recommended entity/pathway with what to
   expect, engagement model, and a starting point, then invites the visitor to "Find My Path"
   (`need.stages.result`).

Framing copy: "Answer two quick questions and we'll show you the pathway that fits your need," and
"No account needed — just choose, and we'll guide you" (`need.page.heroReassure`) — i.e. Discovery
is intentionally a **no-login, low-friction** entry point.

Per `docs/SCOPE_OF_WORK.md` §2 (Website table): `/discovery` is "Wizard + form → CRM Lead" — the
end of the Discovery flow submits a lead into **Zoho CRM** (via `POST /api/zoho/discovery`, per
the codebase's route naming), tagged with fields including source/type, locale, page, pathway, and
UTM parameters (`SCOPE_OF_WORK.md` §2, Zoho/CRM row). An automatic **visitor confirmation email**
and an **internal SAH alert email** are both listed as "essential emails" for this journey
(`SCOPE_OF_WORK.md` §2, "Essential emails").

The exact algorithm mapping (audience, challenge) → recommended entity/pathway is UI/content logic
in the wizard, not something confirmed at the business-rule level in any doc — the specific mapping
rules are **TBD** (would need to inspect the wizard component logic, which was out of scope for
this document's business-context research and may change with the entity/coaches-courses
redesign).

---

## 9. Newsletter Journey

Per `src/content/en/home.json` (`newsletter` section) and `docs/SCOPE_OF_WORK.md`:

1. Visitor submits first name, last name, and email via the newsletter form (present in the
   homepage footer/section area).
2. Submission goes to **Zoho Campaigns** (per `SCOPE_OF_WORK.md` §2: "Newsletter list, double
   opt-in, welcome (AR + EN)").
3. Subscriber must complete **double opt-in** (confirm via email) before being considered
   subscribed.
4. A **welcome email** (in both Arabic and English) is sent after confirmation.

This is listed as one of the "essential emails" required for this phase (`SCOPE_OF_WORK.md` §2).
The newsletter list name/segment, sending cadence, and content strategy: **TBD**.

---

## 10. Booking Journey

Booking coaching sessions is tied to the coach directory (§7) and is intended to use **Zoho
Bookings** as the system of record (`docs/SCOPE_OF_WORK.md` §2, "Bookings" row):

> "Availability on coach pages, reminders, dashboard list. Request mode until payments live, then
> paid confirm."

Two operating modes are described:

1. **Request mode** (until payment keys are live): a visitor requests a coaching slot; SAH
   confirms manually. No payment is collected at this stage.
2. **Paid confirm mode** (once Moyasar/Tamara are live): a visitor can pay to confirm a coaching
   slot directly, per the payment journey (§11), and receive a confirmed booking automatically.

Booking reminders are sent as one of the "essential emails" (`SCOPE_OF_WORK.md` §2). Confirmed
bookings should be visible in `/dashboard/bookings`.

**Current implementation status**: per [`CLAUDE.md`](../CLAUDE.md) (External Integrations table)
and `docs/ZOHO_FIRST_ARCHITECTURE.md`'s route inventory, the Zoho Bookings integration in the
codebase is currently **stubbed** — `src/adapters/zoho/bookings.ts` always returns
`not_configured` regardless of the `FEATURE_BOOKINGS` flag, and the coach profile page ships with
disabled booking slots. This is a gap between the scope-of-work's intended behavior and the
current code state, not a business-rule contradiction — the feature is simply not yet built.

Coach hours, bookable service definitions, session lengths beyond what's in the static coach
catalog, and cancellation/rescheduling policy: **TBD** (per `SCOPE_OF_WORK.md` §5, "coach hours and
bookable services" must be supplied by SAH and are not yet in the repository).

---

## 11. Payment Journey

Per `docs/SCOPE_OF_WORK.md` §2 ("Payments") and §4 (Acceptance criteria):

- **Payment providers**: **Moyasar** (mada, Visa, Mastercard, Apple Pay) and **Tamara** (Buy Now
  Pay Later / BNPL). Explicitly **no Stripe and no non-KSA payment provider** — this is a firm
  constraint, not a placeholder choice (also codified in [`CLAUDE.md`](../CLAUDE.md)).
- **Currency**: SAR (Saudi Riyal) only — no other currency is in scope.
- **Course purchase flow** (as designed): authenticate → select course/pricing → pay → enrollment
  is created → redirect to `/dashboard/courses`.
- **Coaching payment flow** (optional, as designed): pay after selecting a coaching slot → booking
  is confirmed in Zoho Bookings.
- **Webhooks**: payment gateway webhooks must be signature-verified and idempotent
  (`SCOPE_OF_WORK.md` §2).
- **Blocked on external dependency**: the scope-of-work explicitly states payments are "in scope;
  blocked only on SAH merchant keys" — i.e. this is fully intended functionality, just waiting on
  SAH to provide Moyasar API keys/webhook secret and Tamara API/notification tokens
  (`SCOPE_OF_WORK.md` §5). Until keys arrive, "Buy stays disabled / coming soon — timing, not a
  scope cut."
- **Hard rule**: the site must never show a fake success state for a payment or booking it cannot
  actually confirm (`SCOPE_OF_WORK.md` §4, acceptance item 8: "See a real error or 'coming soon' —
  never fake success").

**Current implementation status**: per [`CLAUDE.md`](../CLAUDE.md), `src/adapters/payments/**` is
currently **stubbed** — it returns `not_configured` unconditionally regardless of the
`FEATURE_CHECKOUT` flag. No live Moyasar/Tamara API calls exist in the codebase yet.

---

## 12. Arabic/English Requirements

- **Arabic is the default, primary locale** (unprefixed `/`); **English is secondary**, served at
  `/en`. This is confirmed both by routing config (`src/i18n/routing.ts`) and by the scope-of-work
  language, which lists "AR + EN" for every in-scope surface.
- Every visitor-facing surface listed in `docs/SCOPE_OF_WORK.md` §2 (marketing, discovery, coaches,
  courses, community, contact, newsletter, auth, dashboard, essential emails) is required to exist
  in **both languages** — this is a binding requirement for the current phase, not aspirational.
  See `docs/SCOPE_OF_WORK.md` §4: "On production, AR + EN, a visitor can: ...".
- SEO must support both languages with correct hreflang, per `docs/SCOPE_OF_WORK.md` §2 ("SEO
  (metadata, hreflang, sitemap, robots, JsonLD)").
- RTL layout is required for Arabic — see [`CLAUDE.md`](../CLAUDE.md) "RTL Requirements" for the
  technical implementation (`dir="rtl"` on `<html>` for the `ar` locale).
- Coach and course content is bilingual at the field level (e.g. `name`/`nameAr`, `bio`/`bioAr`)
  rather than as separate localized documents — see [`CLAUDE.md`](../CLAUDE.md) Localization
  section for why this differs from other content types.

---

## 13. CMS Responsibilities (Sanity)

Per `docs/SCOPE_OF_WORK.md` §2 ("Sanity"):

> "Studio at `/studio`. Schemas: Coach, Course, marketing, page SEO (AR + EN). Coaches, courses,
> homepage, entities, programmes, FAQ, nav from CMS. Images via Sanity CDN. Mux IDs on modules.
> Publish updates the live page (~30s). Editors do not need a code release."

In scope for Sanity ownership:
- Coach directory/profile content
- Course catalogue/detail content (including Mux video IDs on course modules)
- Homepage marketing content
- Entity/company landing page content (all six entities)
- Program/programme content
- FAQ content
- Site navigation
- Page-level SEO metadata (bilingual)
- All images (served via Sanity's CDN)

SAH's content editors are expected to be able to publish changes to any of the above **without a
code release** — publishing should propagate to the live site within roughly 30 seconds via the
revalidation webhook (see [`CLAUDE.md`](../CLAUDE.md) "Sanity Architecture" for the technical
mechanism).

**Current status**: per the earlier repository audit, Sanity integration is scaffolded and
flag-gated (`FEATURE_CMS`) but not the default active path — static JSON/TS content
(`src/content/{ar,en}/**`, `src/content/catalog/**`) currently serves as the stand-in until the
CMS cutover is complete. Coach/course Sanity schemas exist but are excluded from the
`documentInternationalization` plugin used by other content types (see [`CLAUDE.md`](../CLAUDE.md)
and §5/§7 above re: the pending coaches/courses redesign).

---

## 14. External Service Responsibilities

Per `docs/SCOPE_OF_WORK.md` §2 and §6, this phase's system landscape is:

| Service | Responsibility |
|---|---|
| **Next.js (on Vercel)** | Site rendering, routing, API routes |
| **Sanity** | All editorial content (see §13) |
| **Supabase** | Email/password authentication (register, login, logout, password reset), session management, `profiles` table, `course_enrollments` (written only by payment webhook), `course_progress`, `coach_reviews` (created only after a completed booking — no moderation product exists). Row-Level Security restricts users to their own rows. **No Google/Apple OAuth** — email/password only. Staff use Zoho login, not the site's Supabase auth. |
| **Zoho CRM** | Receives every lead/application generated by the site: Discovery, Contact, Group interest, Programme interest (as Leads), Community applications (as Applications, tracked Pending/Approved/Rejected), and a Contact record on user registration. SAH staff work these records **manually** — no sales automation, lead scoring, or pipeline automation is built by the website. |
| **Zoho Bookings** | Coach availability, booking reminders, and the bookings list shown on the dashboard. Request mode until payments are live, then paid-confirm mode. |
| **Zoho Campaigns** | Newsletter list management, double opt-in, and welcome emails (AR + EN). |
| **Zoho ZeptoMail + Flow** | Sends only the "essential" transactional/visitor emails listed in §8–§11 above (Discovery confirmation + internal alert, newsletter opt-in/welcome, auth confirm/reset via Supabase, community approve/reject, booking reminders, payment/enrollment confirmation if the gateway doesn't already send one). |
| **Moyasar** | Card, mada, and Apple Pay payment processing for course purchases and (optionally) coaching bookings. |
| **Tamara** | BNPL payment option for the same purchases. |
| **Mux** | Video hosting/playback for paid and preview course content, with signed playback tied to login + enrollment (or an explicit preview flag). |

Explicitly **not used** this phase, even though available in Zoho One: SalesIQ (live chat), Zoho
Analytics, Desk, Sign, PageSense, Marketing Automation, WorkDrive, Connect. **Zoho Forms is not
used** — per `SCOPE_OF_WORK.md`: "the React site is the form" (i.e. the site's own React forms post
directly into Zoho CRM/Campaigns rather than embedding a Zoho Forms widget).

Items SAH Group must supply before these integrations can go live (`SCOPE_OF_WORK.md` §5): a Zoho
data centre/org with an admin or integration user; the CRM, Campaigns, Bookings, Flow, and
ZeptoMail modules specifically (no others required); SPF/DKIM/DMARC records for `sah.com.sa`; an
operations inbox and bilingual email copy; coach hours and bookable services; course copy and
video files (AR + EN); Moyasar and Tamara credentials; and written sign-off moving from sandbox to
live payments.

---

## 15. Important Business Rules

1. **Zoho is worked manually by SAH staff.** The website's job ends at creating a Lead,
   Application, or Contact record in Zoho CRM — SAH is responsible for qualifying, following up,
   and progressing those records by hand. No sales automation, pipeline, or scoring logic should
   be built into the site or its integrations this phase.
2. **Never show a fake success state.** If a payment, booking, or submission cannot actually be
   confirmed (e.g. missing merchant keys, service not configured), the visitor must see a real
   error or an explicit "coming soon" state — never a success message that isn't backed by a real
   outcome. This is a binding acceptance criterion (`SCOPE_OF_WORK.md` §4, item 8).
3. **Payments are SAR-only, via Moyasar and Tamara exclusively.** No Stripe, no other gateway, no
   other currency, without a separate future scope-of-work.
4. **No sales automation or extra Zoho apps this phase.** Live chat, reporting/analytics
   dashboards, and any Zoho app beyond CRM/Campaigns/Bookings/Flow/ZeptoMail are explicitly out of
   scope — do not wire these up even if convenient, without a new scope-of-work.
5. **No OAuth login (Google/Apple).** Authentication is email/password via Supabase only.
6. **No moderated reviews, certificates, or gamification.** Coach reviews are created only after a
   completed booking, with no moderation workflow — keep this simple; do not add moderation
   tooling without being asked.
7. **SAH edits content without a release.** Any workflow that requires a code deployment to change
   coach, course, program, homepage, entity, FAQ, or nav content works against this goal — such
   content changes must go through Sanity once the CMS cutover is live.
8. **AR + EN parity is required for every in-scope surface**, including transactional emails —
   partial localization is not acceptable for anything listed in `SCOPE_OF_WORK.md` §2.
9. **"If unsure whether something is in scope, it is out"** — direct quote from
   `SCOPE_OF_WORK.md` §6. When a requested feature isn't clearly a visitor-facing path described in
   §2 of that document, treat it as out of scope and confirm before building it.
10. **`SCOPE_OF_WORK.md` is the tie-breaker.** Per its own header: "Source of truth for what we
    deliver now. If another doc conflicts, this file wins." When other docs (including
    `UI_ARCHITECTURE_GUIDE.md` or `IMPLEMENTATION_STATUS.md`) disagree with it, `SCOPE_OF_WORK.md`
    takes precedence — though per team discussion on 2026-09-17, even some of its underlying UI
    approaches (particularly around coaches/courses) may be revisited; confirm before assuming any
    document is final.

---

## Open Questions / TBD Items

- Legal entity structure, founding date, physical headquarters address
- Exact demographic/firmographic targeting beyond the role and sector lists in §3
- Longer-term product roadmap beyond the current scope-of-work phase
- The specific decision logic mapping Discovery wizard answers to a recommended entity/pathway
- Employment relationship between SAH Group and its coaches (employee vs. contractor)
- Coach hours, bookable service catalog, and cancellation/rescheduling policy (explicitly SAH's to
  provide, not yet in the repository)
- Newsletter list segmentation, sending cadence, and content strategy
- Final direction of the coaches/courses redesign referenced in `CLAUDE.md` and §5/§7 above
