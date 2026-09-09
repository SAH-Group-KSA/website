# SAH Group — Zoho-First Architecture

> **Created:** August 12, 2026
> **Scope:** Fresh architecture review with objective: maximise Zoho One ecosystem, minimise custom backend development.
> **This-phase delivery:** [`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md) is binding. SalesIQ, Analytics, Desk, Sign, PageSense, Marketing Automation, WorkDrive, Connect, and Zoho sales automation are **architecture options / future**, not this phase. Sanity, Supabase, Moyasar/Tamara, and Mux video **are** this phase.
> **Companion docs:**
> - [`UI_ARCHITECTURE_GUIDE.md`](../UI_ARCHITECTURE_GUIDE.md) — IA, ownership, design system
> - [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./BACKEND_IMPLEMENTATION_GUIDE.md) — original phase-by-phase integration playbook
> - [`docs/ZOHO_FIRST_IMPLEMENTATION_PLAN.md`](./ZOHO_FIRST_IMPLEMENTATION_PLAN.md) — implementation plan derived from this architecture
> - [`IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md) — file-level build status

---

## Table of Contents

1. [What Was Found in the Codebase](#1-what-was-found-in-the-codebase)
2. [Complete Feature Inventory](#2-complete-feature-inventory)
3. [Zoho Mapping — Every Feature](#3-zoho-mapping--every-feature)
4. [Complete Feature → Zoho Mapping Table](#4-complete-feature--zoho-mapping-table)
5. [Opportunities to Eliminate Custom Backend](#5-opportunities-to-eliminate-custom-backend)
6. [Recommended Architecture](#6-recommended-architecture)
7. [Evaluation of Supabase, Sanity, and Other Services](#7-evaluation-of-supabase-sanity-and-other-services)
8. [Per-Recommendation Evaluation](#8-per-recommendation-evaluation)
9. [Architecture Diagrams](#9-architecture-diagrams)
10. [Recommended Implementation Phases](#10-recommended-implementation-phases)
11. [Priority Order Summary](#11-priority-order-summary)
12. [Risks and Mitigation](#12-risks-and-mitigation)
13. [Summary: What Zoho Covers vs Cannot Cover](#13-summary-what-zoho-covers-vs-cannot-cover)

---

## 1. What Was Found in the Codebase

**Project identity:** SAH Group (سعادة) — a human development and coaching organisation serving the KSA market. Six sub-brands: SAH Human, SEERA, Nexus, SAH Connect, Lego by SAH, SAH Impact.

**Stack today:** Next.js App Router · React 19 · TypeScript · Tailwind + `prototype-parity.css` · next-intl (AR default `/`, EN at `/en/*`). All backends are stubs — feature flags are all `false`. No live integrations yet.

### Pages / Routes

| # | Route | Status | Description |
|---|---|---|---|
| 1 | `/` | ✅ UI done | 15-section marketing homepage |
| 2 | `/discovery` | ✅ UI done | 3-step journey wizard + discovery request form |
| 3 | `/coaches` | ✅ UI done | Coach directory with search + specialty filter |
| 4 | `/coaches/[slug]` | ✅ UI done | Coach profile + disabled booking slots + reviews placeholder |
| 5 | `/coaches/group` | ✅ UI done | Group coaching interest form |
| 6 | `/courses` | ✅ UI done | Course catalogue (placeholder data) |
| 7 | `/courses/[slug]` | 🔴 not built | Course detail + purchase + Mux player |
| 8 | `/community/apply` | ✅ UI done | Community application form (Impact / Lego) |
| 9 | `/auth/login` | ✅ UI done | Login — stub |
| 10 | `/auth/register` | ✅ UI done | Register — stub |
| 11 | `/auth/forgot-password` | ✅ UI done | Password reset — stub |
| 12 | `/dashboard` | ✅ UI done | Authenticated overview — stub |
| 13 | `/dashboard/courses` | ✅ UI done | Enrolled courses — stub |
| 14 | `/dashboard/bookings` | ✅ UI done | Past/upcoming sessions — stub |
| 15 | `/dashboard/profile` | ✅ UI done | Profile edit — stub |
| 16 | `/[company]` | ✅ UI done | 6 entity landing pages (sah-human, seera, sah-nexus, sah-sponsor, lego-by-sah, sah-impact) |
| 17 | `/program/[id]` | ✅ UI done | Program detail + interest form |

---

## 2. Complete Feature Inventory

### 2.1 Forms (10 distinct forms)

| # | Form | Fields | Lead Type |
|---|---|---|---|
| 1 | Discovery Request | name, email, phone, pathway context (hidden: audience + challenge) | `DiscoveryLead` |
| 2 | Contact | name, email, phone, org, client-type, message | `ContactLead` |
| 3 | Group Coaching Interest | name, email, phone, org, program selection, message | `GroupInterestLead` |
| 4 | Community Application | name, email, phone, profession, community selection, motivation, experience | `CommunityApplication` |
| 5 | Program Interest | name, email, phone, org, programId, message | `ProgramInterestLead` |
| 6 | Newsletter Subscribe | email | `NewsletterSubscribe` |
| 7 | Login | email, password | Auth |
| 8 | Register | email, password, fullName | Auth |
| 9 | Forgot Password | email | Auth |
| 10 | Dashboard Profile Update | fullName, phone, locale | Profile update |

### 2.2 Business Processes

| # | Process | Actors | Steps |
|---|---|---|---|
| BP-1 | Discovery → Consultation | Prospect, SAH ops | Submit form → CRM lead (website). SAH then works the lead in Zoho (status / convert / deal stages) by hand — out of website scope |
| BP-2 | Group Coaching Interest | Prospect, SAH ops | Form → CRM lead (tagged) → hold until cohort forms → Campaigns segment → announcement |
| BP-3 | Community Application | Applicant, SAH reviewer | Form → CRM → manual review → approve/reject email → WhatsApp invite |
| BP-4 | Newsletter Lifecycle | Subscriber, SAH marketing | Subscribe → double opt-in → welcome → broadcasts → unsubscribe |
| BP-5 | 1:1 Booking | Client (auth'd), Coach | Slot selection → payment → booking confirmed → reminders → completed |
| BP-6 | Course Purchase | Client (auth'd), system | Browse → course detail → auth gate → Moyasar/Tamara checkout → webhook → enrollment → Mux unlock |
| BP-7 | User Registration | New user, system | Register form → Supabase auth → profiles row → Zoho CRM Contact (sync) |
| BP-8 | Community (ongoing) | Members | WhatsApp-first; application is the formal gate |
| BP-9 | Program Interest | Prospect, SAH ops | Form → CRM lead tagged by program → SAH manual follow-up in Zoho |
| BP-10 | Contact Inquiry | General prospect, SAH ops | Form → CRM lead → manual follow-up |

### 2.3 Data Models

| Model | Key Fields | Volume Estimate |
|---|---|---|
| Coach | slug, name (bilingual), specialty, bio, photo, topics, price, credentials, sessions, zohoBookingsServiceId | Tens (~10–50) |
| Course | slug, title, description, level, modules[], price, muxAssetId | Tens |
| Program | id, title, entity, audience, level, outcome, format, duration, deliverables | Tens |
| Entity/Brand | id, name, specialty, services[], deliverables[], audiences[], programs[] | 6 fixed |
| SiteContent | 30+ editorial content sections (hero, promise, FAQ, partners, impact metrics, etc.) | 2 locales |
| User Profile | id (=auth), fullName, phone, locale, zoho_crm_contact_id | Grows with users |
| CourseEnrollment | user_id, course_slug, payment_provider, payment_id, amount_sar, purchased_at | Grows with sales |
| CourseProgress | user_id, course_slug, module_index, completed_at | Per user per module |
| CoachReview | user_id, coach_slug, rating, body, created_at | Per booking completed |
| CRM Lead | name, email, phone, source, pathway, locale, UTM | All prospect touches |
| Booking | coach, client, slot, payment_id, status, reminders | Per coaching session |

### 2.4 Authentication Requirements

- **Scope:** Customer-facing only. Internal staff use Zoho's native login.
- **Methods needed:** Email + password (primary), optional Google/Apple OAuth later.
- **Protected routes:** `/dashboard/**` — unauthenticated requests redirect to `/auth/login`.
- **Session handling:** SSR-compatible (cookie-based), needed for Next.js middleware.
- **Post-register:** Create Zoho CRM Contact, store `zoho_crm_contact_id` on profile.

### 2.5 Media / Content Management

| Content Type | Volume | Characteristics |
|---|---|---|
| Coach portraits | ~10–50 images | High-quality, editorial, bilingual alt text |
| Course thumbnails | ~10–30 images | Marketing quality |
| Homepage editorial copy | 15+ sections × 2 locales | Rich, updated by non-developers |
| Program descriptions | Tens × 2 locales | Structured, form-like |
| Course modules (curriculum) | Tens of modules per course | Structured, includes Mux asset IDs |
| Private course videos | Tens per course | Streaming, access-gated |
| Partner / entity logos | ~20 images | Vector/PNG |
| Founder photos | ~3–5 | Editorial |

---

## 3. Zoho Mapping — Every Feature

Ratings: 🟢 = perfect fit · 🟡 = workable with trade-offs · 🔴 = not suitable.

### Discovery / Contact / Group / Program Forms

**Can Zoho handle entirely?** 🟢 Yes — almost entirely.

| Aspect | Detail |
|---|---|
| **Zoho App** | Zoho CRM (Leads API) → Zoho Flow → ZeptoMail |
| **Why best** | CRM stores full pipeline; Flow triggers emails automatically. Zero custom backend code for this path other than a thin proxy. |
| **Custom code** | A thin Next.js Route Handler to proxy the form POST (keeps API key server-side). The React form components stay as-is for brand consistency + pathway context injection. |
| **Limitations** | Zoho CRM API: 5,000 calls/day standard (15,000 Enterprise). Webhook latency ~1–3s. |
| **Note** | Call CRM Leads API directly — do not use Zoho Forms as an intermediary. The React UI is already the form. Zoho Forms is more useful for standalone embeds. |

### Community Application

**Can Zoho handle entirely?** 🟢 Yes, with a Zoho CRM Custom Module.

| Aspect | Detail |
|---|---|
| **Zoho App** | Zoho CRM (Custom Module "Applications") → Zoho Flow → ZeptoMail |
| **Why** | Applications need a review queue distinct from sales leads. A custom CRM module lets SAH reviewers work in one place: accept or reject with a CRM button; Flow sends the outcome email automatically. |
| **Custom code** | Route Handler proxy only. WhatsApp invite link is a URL pattern — zero additional code. |

### Newsletter Subscribe

**Can Zoho handle entirely?** 🟢 Yes — Zoho Campaigns.

| Aspect | Detail |
|---|---|
| **Zoho App** | Zoho Campaigns API |
| **Supports** | Double opt-in, PDPL/GDPR compliance (Saudi PDPL), welcome autoresponder, unsubscribe, Arabic RTL templates |
| **Custom code** | Server-side Route Handler (`POST /api/newsletter`) to hide Campaigns API key. ~20 lines. |

### Auth / User Accounts

**Can Zoho handle entirely?** 🔴 No — not appropriately for a public consumer app.

| Aspect | Analysis |
|---|---|
| **Zoho option** | Zoho Creator Portals — provides external user login backed by Zoho's identity layer |
| **Why Creator Portals fail** | (1) Dashboard must match SAH's brand exactly — Creator portals cannot be styled to this degree. (2) Course player requires Mux signed URLs validated against Supabase enrollment rows. (3) Zoho IAM is designed for B2B partner portals, not consumer apps with OAuth. (4) RLS on enrollment data requires a proper SQL layer with auth integration. |
| **Correct choice** | **Supabase Auth** — same service as DB, session cookies work with Next.js middleware, RLS is built in, OAuth support is clean. |
| **Zoho's role** | On register: create Zoho CRM Contact via server-side call, store `zoho_crm_contact_id` on the Supabase profile. |

### Customer Dashboard

**Can Zoho handle entirely?** 🔴 No — same reasons as auth. Custom Next.js dashboard is non-negotiable for brand fidelity, Mux player, RTL, and enrollment-gated content.

### Coach / Course Content (CMS)

**Can Zoho handle entirely?** 🟡 Technically yes; not the best choice.

| Aspect | Analysis |
|---|---|
| **Zoho option** | Zoho Creator — build Coach/Course forms, expose via REST API |
| **Why Creator is weaker** | No rich-text equivalent (portable text). No image CDN. No ISR webhook support. Authoring UX is spreadsheet-like, not narrative editorial. Bilingual content handling is awkward. |
| **Why Sanity is better** | Editorial-grade authoring UI, Sanity CDN for image delivery (WebP/AVIF), webhook ISR for Vercel, field-level AR/EN bilingual, TypeScript SDK with schema-driven types, live preview mode. |
| **Verdict** | Keep **Sanity**. Image CDN alone is critical for KSA Core Web Vitals. Creator does not have a compelling advantage and introduces more complexity. |

### 1:1 Session Booking

**Can Zoho handle entirely?** 🟢 Yes (scheduling). 🔴 No (KSA payment).

| Aspect | Detail |
|---|---|
| **Zoho App** | Zoho Bookings |
| **What it owns** | Coach availability, slot selection, calendar sync, confirmation emails, reminders, rescheduling, cancellation |
| **What it cannot do** | Accept Moyasar / Tamara payments natively in KSA. Zoho Bookings supports PayPal/Stripe/Razorpay — none support mada / Apple Pay / Tamara in Saudi Arabia. |
| **Pattern** | Bookings widget/API on `/coaches/[slug]` → user picks slot → custom Next.js checkout (Moyasar or Tamara) → on payment success → call Zoho Bookings API to confirm appointment. |
| **Phase 7 option** | Use Bookings in "request booking" mode (no payment) while merchant accounts are pending. |

### Course Purchase / Payment

**Can Zoho handle entirely?** 🔴 No. Zoho Payments is not available for KSA / SAR. Use **Moyasar** + **Tamara**.

### Course Video Delivery

**Can Zoho handle entirely?** 🔴 No. Zoho has no video streaming product. Use **Mux** with signed/private playback gated by Supabase enrollment.

### Email Marketing / Newsletter

**Can Zoho handle entirely?** 🟢 Yes — **Zoho Campaigns**. Full lifecycle: opt-in, welcome, segmentation, broadcasts, unsubscribe, PDPL compliance, Arabic RTL templates.

### Transactional Email

**Can Zoho handle entirely?** 🟢 Yes — **ZeptoMail** (Zoho's transactional email product). Template-based, high deliverability, triggered by Zoho Flow.

### Live Chat

**Can Zoho handle entirely?** 🟢 Yes — **Zoho SalesIQ**. One script embed. Chats auto-create CRM leads. Chatbot automation for pre-sales questions.

### Business Reporting

**Can Zoho handle entirely?** 🟢 Yes — **Zoho Analytics**. Natively connects to: Zoho CRM, Campaigns, Bookings. Connects to Supabase PostgreSQL via the PostgreSQL connector. Unified lead-to-revenue dashboards with zero custom BI code.

### Workflow Automation

**Can Zoho handle entirely?** 🟢 Yes — **Zoho Flow** + CRM Workflow Rules + Deluge scripting.

| Tool | Use Case |
|---|---|
| CRM Workflow Rules | Trigger on lead creation → assign owner, tag, move pipeline stage |
| Zoho Flow | Multi-app flows: CRM Lead → ZeptoMail → Campaigns add-to-list |
| Deluge | Custom logic: scoring, field transformations, complex conditions |

### Additional Zoho Apps Not in Previous Plan

| App | Opportunity | Effort |
|---|---|---|
| **Zoho Desk** | Customer support ticketing for enrolled users (Phase 5+). Connects to CRM. | Low |
| **Zoho Sign** | Digital consent/coaching agreements triggered from CRM on booking. | Low |
| **Zoho PageSense** | A/B testing on `/discovery` CTA variants, hero headlines, form position. Script embed, no code changes. | Very low |
| **Zoho Marketing Automation** | Behavioural triggers: visited `/coaches` but didn't book → nurture email after 3 days. More powerful than Campaigns alone. | Medium |
| **Zoho WorkDrive** | Internal: session notes, program workbooks, contracts. Not for public CDN. | Low |
| **Zoho Analytics** | Connect to Supabase PostgreSQL for unified revenue + engagement dashboards. | Medium |
| **Zoho Connect** | Structured community platform if/when WhatsApp communities are outgrown. Premature now. | Deferred |

---

## 4. Complete Feature → Zoho Mapping Table

| Website Feature | Recommended Zoho App | Why | Custom Code Needed | Integration Method | Notes |
|---|---|---|---|---|---|
| Discovery Request Form | Zoho CRM (Leads API) | Lead capture in system of record | Next.js Route Handler proxy (~20 lines) | REST API | Zoho Flow triggers ZeptoMail confirmation |
| Contact Form | Zoho CRM (Leads API) | Same intake path, different source tag | Same proxy | REST API | |
| Group Coaching Interest | Zoho CRM (Leads + tags) | Tag by program; Campaigns segment later | Same proxy | REST API + Flow | |
| Community Application | Zoho CRM (Custom Module) | Review queue with approve/reject in CRM | Same proxy | REST API | Flow sends ZeptoMail outcome |
| Program Interest Form | Zoho CRM (Leads) | Same intake path as discovery | Same proxy | REST API | |
| Newsletter Subscribe | Zoho Campaigns API | Full list lifecycle, double opt-in, PDPL | Route Handler proxy | Campaigns REST API | Arabic RTL templates |
| Transactional Emails | ZeptoMail | High-deliverability; template-based | Zoho Flow triggers | Flow → ZeptoMail action | |
| Lead Status / Deal stages | Zoho CRM (ops) | Client-owned Kanban and deal board | None (not website work) | Native | Existing Lead Status + Deal stages; convert and progress by hand — out of website scope |
| Automation | Zoho Flow + Deluge | Multi-app workflows, field transforms | None | Native | |
| 1:1 Slot Calendar | Zoho Bookings | Availability, reminders, reschedule | Booking confirm API call post-payment | REST API or embed widget | Service IDs stored on Sanity coach doc |
| Booking Payment | ❌ Zoho cannot (KSA) | Zoho Payments not available in KSA | Full checkout page | Moyasar + Tamara APIs | |
| Live Chat | Zoho SalesIQ | Chat + chatbot + CRM lead capture | Script embed in `layout.tsx` | Script tag | 30-min setup |
| Business Reporting | Zoho Analytics | Native CRM/Campaigns + Supabase connector | PostgreSQL connector setup | Native connector | Unified lead-to-revenue view |
| A/B Testing | Zoho PageSense | Heatmaps, session recordings, A/B tests | Script embed | Script tag | No component changes |
| Coaching Agreements | Zoho Sign | E-signatures on intake forms | CRM trigger | Flow → Sign | Phase 5+ |
| Customer Support | Zoho Desk | Helpdesk; CRM contact sync | Widget embed | Script tag | Phase 5+ |
| Internal Documents | Zoho WorkDrive | Session notes, program materials | None | WorkDrive UI | Not public-facing |
| Lead Nurturing | Zoho Marketing Automation | Behavioural triggers, lead scoring | Beacon script | Script + CRM sync | Phase 5+ |
| User Authentication | ❌ Supabase Auth | Creator portals can't power branded dashboard + enrollment RLS | Supabase SDK integration | Supabase JS + SSR | Non-negotiable |
| Enrollment Access Control | ❌ Supabase DB + RLS | Course access gating tied to auth session | Supabase tables + RLS policies | Supabase JS | Required for Mux gating |
| Course Progress Tracking | ❌ Supabase DB | Tied to auth session | Progress update API in Next.js | Supabase JS | |
| Coach Reviews | ❌ Supabase DB | Post-session; tied to authenticated booking | Review submit → Supabase | Supabase JS | |
| Coach / Course Content | ❌ Sanity | Rich text, image CDN, ISR, bilingual authoring | Sanity client + mappers (already stubbed) | Sanity GROQ + CDN | Creator has no image CDN |
| Site Marketing Copy | ❌ Sanity | Editorial team writes it; needs real CMS UI | `getContent()` swap | GROQ query | |
| Course Video | ❌ Mux | No Zoho equivalent | Signed URL Route Handler | Mux REST + signing | |
| KSA Payments | ❌ Moyasar + Tamara | mada, Apple Pay, BNPL — only KSA-certified | Checkout Route Handlers + webhooks | Moyasar + Tamara APIs | |

---

## 5. Opportunities to Eliminate Custom Backend Development

### Currently over-engineered paths that Zoho simplifies

**1. Email automation** — Replace any proposed "send email" Route Handler with Zoho Flow + ZeptoMail. When a CRM lead is created, Flow sends the confirmation. Zero Node.js code for email delivery.

**2. Lead notification to SAH team** — CRM Workflow Rules alert the relevant staff member instantly on lead creation. No custom notification service.

**3. Application review queue** — The Community Application CRM module gives reviewers a structured inbox with approve/reject buttons. The decision triggers ZeptoMail automatically. No custom admin panel.

**4. Newsletter segments** — Zoho Campaigns + CRM segment sync: when a Group Interest lead is tagged `group_program=X`, they are automatically added to the matching Campaigns list segment. No custom segmentation logic.

**5. Booking reminders** — Zoho Bookings handles reminders natively (email, SMS if configured). No cron jobs, no custom reminder service.

**6. Lead scoring and nurture** — Zoho Marketing Automation handles behavioural triggers based on website visits, form submissions, and CRM activity. No custom drip system.

**7. Business reporting** — Zoho Analytics pulls from CRM, Campaigns, Bookings, and Supabase. No custom BI dashboard to build.

**8. Customer support** — Zoho Desk handles tickets and connects to the CRM contact record. No custom support system.

---

## 6. Recommended Architecture

### The Three-Layer Boundary

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — PRESENTATION (Next.js on Vercel)                 │
│                                                             │
│  All React UI components (marketing, dashboard, player)     │
│  Bilingual routing (next-intl)                              │
│  SEO (metadata, JsonLD, sitemap)                            │
│  Branded auth pages (forms only; logic via Supabase)        │
│  Custom dashboard (courses, bookings, profile)              │
│  Route Handlers (thin proxies for Zoho + payments)          │
│  Middleware (session guard for /dashboard)                  │
│  Mux signed URL endpoint                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  LAYER 2 — OPERATIONS (Zoho One)                            │
│                                                             │
│  CRM         → all leads, contacts, pipeline management     │
│  Flow        → all multi-step automations                   │
│  ZeptoMail   → all transactional email delivery             │
│  Campaigns   → newsletter lifecycle                         │
│  Bookings    → 1:1 scheduling, calendar, reminders          │
│  SalesIQ     → live chat + chatbot                          │
│  Analytics   → business reporting + Supabase connector      │
│  PageSense   → A/B testing + heatmaps                       │
│  Sign        → coaching agreements (Phase 5+)               │
│  Desk        → support tickets (Phase 5+)                   │
│  Marketing Automation → lead nurturing (Phase 5+)           │
│  WorkDrive   → internal documents                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 — DATA & MEDIA (Specialist services)               │
│                                                             │
│  Sanity      → editorial CMS (coaches, courses, copy)       │
│  Supabase    → auth + transactional DB (enrollments, RLS)   │
│  Moyasar + Tamara → KSA payments                            │
│  Mux         → gated course video streaming                 │
└─────────────────────────────────────────────────────────────┘
```

### System Ownership Per Concern

| Concern | System | Rationale |
|---|---|---|
| Marketing copy, coach bios, course curriculum | **Sanity** | Editorial CMS with image CDN, rich text, ISR, AR/EN bilingual |
| User authentication + sessions | **Supabase Auth** | SSR-compatible, RLS-integrated, consumer-grade OAuth |
| User-generated data (enrollments, progress, reviews) | **Supabase PostgreSQL + RLS** | Row-level security gating Mux access; tied to auth session |
| All prospect/lead data | **Zoho CRM** | Single system of record for pipeline; SAH ops team lives here |
| All form submissions (non-auth) | **Zoho CRM via Route Handler** | Direct API, no Forms intermediary needed |
| Email newsletters | **Zoho Campaigns** | List lifecycle, double opt-in, PDPL |
| Transactional emails | **ZeptoMail** | High deliverability, triggered by Zoho Flow |
| Multi-step automations | **Zoho Flow** | Cross-app orchestration without code |
| Scheduling / calendar | **Zoho Bookings** | Availability, reminders, reschedule; no custom calendar engine |
| KSA payments | **Moyasar + Tamara** | mada, Apple Pay, BNPL; SAMA-approved gateways |
| Course video | **Mux** | Private signed playback; no Zoho equivalent |
| Live chat | **Zoho SalesIQ** | Chat + leads; script embed |
| Business analytics | **Zoho Analytics** | Unified CRM + Campaigns + Supabase reporting |
| A/B testing | **Zoho PageSense** | No-code conversion optimisation |

### What Goes Where

**Stays in Next.js:**
- All React UI rendering and routing
- Route Handlers as thin proxies (never expose API keys to browser)
- Mux signed URL generation (enrollment check → sign → return URL)
- Moyasar/Tamara webhook handlers (verify signature → write to Supabase)
- ISR revalidation endpoint (`/api/revalidate` for Sanity webhooks)

**Lives in Zoho CRM:**
- All lead records (discovery, contact, group, program, community)
- All registered user contacts (`profiles.zoho_crm_contact_id` bridges to Supabase)
- Booking history (Zoho Bookings native; surfaced in CRM via connector)
- Pipeline stages and assignment
- Segment tags for Campaigns

**Lives in Zoho Flow:**
- Lead created → confirmation email via ZeptoMail
- Community application approved → approval email + WhatsApp invite via ZeptoMail
- Group interest tagged → add to Campaigns segment
- Booking confirmed → reminder sequence

**Lives in Zoho Bookings:**
- Coach availability calendars
- Booking slots (service IDs stored on Sanity coach documents)
- Automated reminders (Bookings native)
- Reschedule and cancellation self-service

**Lives in Sanity:**
- All editorial content (what SAH team writes)
- Coach documents: slug, bio, photo, specialties, price, `zohoBookingsServiceId`, topics, credentials
- Course documents: slug, title, description, modules[], `muxAssetId`, price, level
- Marketing sections: hero, promise, FAQ, programs, partners, impact, initiatives
- Page SEO metadata

**Lives in Supabase:**
- `profiles` — user personal data, locale, `zoho_crm_contact_id`
- `course_enrollments` — purchased courses, payment provider/ID
- `course_progress` — per-module completion
- `coach_reviews` — post-session ratings and text

**Lives in Zoho WorkDrive:**
- Session notes from coaches
- Program workbooks and materials (distributed post-enrollment)
- Internal operational documents

**Uses Zoho Campaigns:**
- Newsletter list management
- Group coaching cohort announcements
- Promotional campaigns

**Uses Zoho SalesIQ:**
- Live chat widget on all public pages
- Pre-configured chatbot flows for common questions
- Chat-to-CRM lead creation

---

## 7. Evaluation of Supabase, Sanity, and Other Services

### Supabase

**Can Zoho replace it?** Partially, with significant trade-offs.

| Capability | Supabase | Zoho Creator Portal |
|---|---|---|
| Consumer auth (email/password, OAuth) | ✅ Purpose-built | 🟡 B2B focus, limited consumer UX |
| Row-level security | ✅ PostgreSQL RLS built-in | 🔴 Must implement at application level |
| Next.js SSR session | ✅ `@supabase/ssr` — cookie-based | 🔴 Cannot power Next.js middleware guard |
| Enrollment → Mux gating | ✅ RLS + JOIN in one query | 🔴 Requires two API calls across systems |
| Branded dashboard | ✅ Custom React | 🔴 Creator portals use Zoho-styled templates |
| Cost | Free tier → $25/mo | Included in Zoho One |

**Verdict: Keep Supabase.** The enrollment-to-video-access security requirement alone makes it non-negotiable. The cost ($25/mo) is trivial versus the architectural complexity of working around it.

**Vendor lock-in risk:** Low. Supabase is PostgreSQL-compatible — data can migrate to any PostgreSQL host.

### Sanity

**Can Zoho replace it?** Technically, but it should not.

| Capability | Sanity | Zoho Creator |
|---|---|---|
| Rich text (bilingual coach bios) | ✅ Portable Text | 🟡 HTML text field — limited formatting |
| Image CDN | ✅ Automatic + transformations | 🔴 No CDN; WorkDrive not for public delivery |
| ISR revalidation webhook | ✅ Webhook → Vercel tag revalidation | 🔴 No equivalent |
| Editorial authoring UX | ✅ Purpose-built CMS studio | 🟡 Form-based spreadsheet UI |
| Bilingual documents | ✅ `@sanity/document-internationalization` | 🟡 Custom multi-field solution |
| TypeScript SDK | ✅ GROQ with schema-derived types | 🟡 REST API, manually typed |
| Live preview | ✅ Built-in | 🔴 Not available |
| Monthly cost | Free → $99/mo | Included in Zoho One |

**Verdict: Keep Sanity.** The image CDN is critical for a KSA site — coach portrait delivery with WebP/AVIF directly affects Core Web Vitals and Google ranking. Creator has no CDN.

**Vendor lock-in risk:** Low-medium. Content exportable to JSON. Adapter pattern in `src/content/mappers/` already decouples it from the UI.

### Firebase / MongoDB / Express / Serverless

**Firebase:** No advantage over Supabase. Firestore is non-relational, making enrollment-to-progress queries more complex. Not recommended.

**MongoDB:** No. PostgreSQL's relational model (enrollment JOIN with course slugs, RLS, indexed queries) is the right fit. No compelling reason to add a document store.

**Custom Express backend:** No. Next.js Route Handlers are sufficient for all proxy and webhook endpoints. A separate Express service adds deployment complexity and another service to maintain.

**Separate serverless functions:** No. Next.js App Router is already serverless on Vercel.

**Auth0 / Clerk:** No. Supabase Auth covers this completely and is integrated with the DB layer.

**S3 / GCS:** Not needed. Sanity CDN handles editorial images. Mux handles video. Zoho WorkDrive handles internal files.

---

## 8. Per-Recommendation Evaluation

### Zoho CRM

| Attribute | Detail |
|---|---|
| **Pros** | Already licensed · Single source of truth for all prospects · Native integration with every Zoho app · Powerful workflow automation · Mobile app for SAH team · Reports and dashboards built-in |
| **Cons** | UI not designed for technical teams · Deluge scripting has a learning curve |
| **Cost** | Included in Zoho One |
| **Scalability** | Excellent — used by enterprise organisations |
| **Maintenance** | Very low — Zoho manages infrastructure |
| **Security** | SOC 2 Type II, ISO 27001, GDPR; Saudi data residency available on select plans |
| **API limits** | 5,000 calls/day standard; 15,000 Enterprise. Route Handler caching reduces this. |
| **Vendor lock-in risk** | Medium — CRM data exportable (CSV/API) but workflows need recreation on migration |

### Zoho Bookings

| Attribute | Detail |
|---|---|
| **Pros** | Calendar sync (Google, Outlook), automated reminders, rescheduling self-service, CRM connection |
| **Cons** | No native KSA payment gateway; widget styling customisation is limited |
| **Cost** | Included in Zoho One |
| **Scalability** | Fine for coaching business scale |
| **Maintenance** | Very low |
| **API limits** | 100 calls/minute |
| **Note** | Use Bookings API (not embed widget) for full design control |

### Zoho Campaigns

| Attribute | Detail |
|---|---|
| **Pros** | PDPL-ready (Saudi Personal Data Protection Law), Arabic RTL templates, native CRM sync, double opt-in |
| **Cons** | Deliverability adequate but not specialist-level at very high volumes |
| **Cost** | Included in Zoho One |
| **Scalability** | Scales to hundreds of thousands of subscribers |

### ZeptoMail

| Attribute | Detail |
|---|---|
| **Pros** | High deliverability for transactional email, template-based, Zoho product, low latency |
| **Cons** | Templates must be set up in UI; less developer-friendly than SendGrid for programmatic use |
| **Cost** | Included in Zoho One (or very low pay-per-send outside bundle) |

### Supabase

| Attribute | Detail |
|---|---|
| **Pros** | PostgreSQL-compatible, RLS built-in, SSR-compatible auth, TypeScript SDK, generous free tier, open-source |
| **Cons** | Another vendor to manage; cannot eliminate due to enrollment gating + RLS requirement |
| **Cost** | Free tier → Pro $25/mo |
| **Scalability** | Scales to millions of rows |
| **Security** | RLS enforced at database level — strongest possible authorization model for user data |
| **Vendor lock-in risk** | Low — it is standard PostgreSQL; migrate to Neon, Railway, or self-hosted if needed |

### Sanity

| Attribute | Detail |
|---|---|
| **Pros** | Purpose-built editorial CMS, image CDN, ISR webhook, TypeScript SDK, AR/EN bilingual via plugin, live preview |
| **Cons** | Another vendor; content team must learn Studio; cost at scale |
| **Cost** | Free (10GB storage, 2M CDN requests) → Growth $99/mo |
| **Scalability** | Enterprise-grade |
| **Vendor lock-in risk** | Low-medium; adapter pattern already decouples it from the UI |

### Moyasar + Tamara

| Attribute | Detail |
|---|---|
| **Pros** | KSA-native, mada + Apple Pay + Visa/Mastercard via Moyasar; BNPL via Tamara improves conversion; both SAMA-regulated |
| **Cons** | Merchant account setup takes time (KYC/compliance); blocking Phase 8–9 |
| **Cost** | Transaction fees (~1.9–2.9% + flat fee) |
| **Security** | PCI DSS Level 1; SAMA compliant |
| **Vendor lock-in risk** | Medium — all payment logic is in isolated Route Handlers + `src/lib/payments.ts` |

### Mux

| Attribute | Detail |
|---|---|
| **Pros** | Signed playback URLs (security), HLS adaptive streaming, analytics, global CDN, TypeScript SDK |
| **Cons** | Per-minute storage + delivery cost; no free tier at scale |
| **Cost** | ~$0.015/min storage + delivery fees |
| **Scalability** | Built for high-volume video delivery |
| **Vendor lock-in risk** | Low — video files are recoverable; switching means re-encoding and re-uploading |

---

## 9. Architecture Diagrams

### A. Ideal Architecture

```
┌─────────────────── Vercel Edge ───────────────────────────┐
│                                                            │
│  Next.js App Router                                        │
│  ├── Public routes (SSG/ISR via Sanity)                    │
│  │   /  /discovery  /coaches/*  /courses  /[company]      │
│  │   /community/apply  /program/[id]                       │
│  ├── Auth routes (no-index)                                │
│  │   /auth/login  /auth/register  /auth/forgot            │
│  ├── Protected routes (Supabase session middleware)        │
│  │   /dashboard  /dashboard/courses  /bookings  /profile  │
│  ├── CMS Studio (Sanity embedded)                         │
│  │   /studio                                              │
│  └── Route Handlers (server-only, secrets never in client)│
│      /api/zoho/discovery     → Zoho CRM Leads API         │
│      /api/zoho/contact       → Zoho CRM Leads API         │
│      /api/zoho/group         → Zoho CRM Leads API         │
│      /api/zoho/community     → Zoho CRM (Custom Module)   │
│      /api/zoho/program       → Zoho CRM Leads API         │
│      /api/newsletter         → Zoho Campaigns API         │
│      /api/payments/moyasar   → Moyasar API                │
│      /api/payments/tamara    → Tamara API                  │
│      /api/video/token        → Supabase check → Mux sign  │
│      /api/revalidate         → ISR tag revalidation        │
│      /api/bookings/confirm   → Zoho Bookings API          │
└────────────────────────────────────────────────────────────┘
         │                                │
         ▼                                ▼
  ┌─────────────┐                  ┌──────────────────┐
  │  Sanity     │                  │  Supabase        │
  │  Content    │                  │  Auth (sessions) │
  │  Lake       │                  │  DB:             │
  │  - Coaches  │                  │   profiles       │
  │  - Courses  │                  │   enrollments    │
  │  - Pages    │                  │   progress       │
  │  - SEO      │                  │   reviews        │
  │  CDN Assets │                  │  RLS enforced    │
  └─────────────┘                  └──────────────────┘
         │                                │
         ▼                                ▼
  ISR Revalidation              Mux signed URL
  on content publish            generation (server)
                                       │
                                       ▼
                                  ┌─────────┐
                                  │   Mux   │
                                  │ Private │
                                  │  Video  │
                                  └─────────┘

┌─────────────────── Zoho One Ecosystem ─────────────────────┐
│                                                             │
│  Zoho CRM ←──────────── leads, contacts, applications      │
│      │                                                      │
│      ├── Lead created (website) → Zoho Flow                 │
│      │       └── ZeptoMail (visitor confirmation)          │
│      │       └── ZeptoMail (SAH internal alert)            │
│      │                                                      │
│      ├── Lead Status / Deal stages (SAH ops in Zoho)       │
│      │       └── Out of website scope                      │
│      │                                                      │
│      ├── Application approved → Zoho Flow                  │
│      │       └── ZeptoMail (WhatsApp invite)               │
│      │                                                      │
│      └── CRM Contact (registered user) ← Supabase webhook │
│              (zoho_crm_contact_id bridge)                   │
│                                                             │
│  Zoho Bookings ← /api/bookings/confirm (post-payment)      │
│      └── Reminders, calendar sync, reschedule              │
│                                                             │
│  Zoho Campaigns ← /api/newsletter                          │
│      └── Double opt-in, welcome, broadcasts, segments      │
│                                                             │
│  Zoho SalesIQ ← script in layout.tsx                       │
│      └── Live chat → CRM lead creation                     │
│                                                             │
│  Zoho Analytics ← CRM + Campaigns + Supabase connector     │
│      └── Reporting (out of this phase)                     │
│                                                             │
│  Zoho PageSense ← script in layout.tsx                     │
│      └── A/B testing on /discovery, hero, CTAs             │
│                                                             │
│  [Phase 5+]                                                 │
│  Zoho Desk ← widget embed                                   │
│  Zoho Sign ← CRM booking trigger                           │
│  Zoho Marketing Automation ← replaces basic Campaigns flow │
│  Zoho WorkDrive ← internal team documents                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────── Payment Layer ──────────────────────────┐
│  Moyasar ← /api/payments/moyasar                           │
│    └── mada, Visa, Mastercard, Apple Pay                   │
│    └── Webhook → write course_enrollment → Supabase        │
│                                                             │
│  Tamara ← /api/payments/tamara                             │
│    └── BNPL installments                                   │
│    └── Webhook → write course_enrollment → Supabase        │
└─────────────────────────────────────────────────────────────┘
```

### B. Data Flow Diagram

```
DISCOVERY LEAD FLOW
───────────────────
User fills /discovery form
    → React validation (client)
    → POST /api/zoho/discovery (Route Handler, server-only)
    → Zoho CRM REST API: Leads module
    → CRM creates Lead record
    → Zoho Workflow Rule triggers
    → Zoho Flow: Lead → ZeptoMail template render
    → ZeptoMail sends:
        (a) "We received your request" → visitor email
        (b) "New discovery lead: {name}, {pathway}" → SAH team

COMMUNITY APPLICATION FLOW
──────────────────────────
User fills /community/apply
    → POST /api/zoho/community
    → Zoho CRM: Applications custom module
    → SAH reviewer opens CRM, clicks Approve
    → Zoho Flow: Application approved
    → ZeptoMail: "Welcome" + WhatsApp group invite link → applicant

NEWSLETTER FLOW
───────────────
User submits email in NewsletterForm
    → POST /api/newsletter
    → Zoho Campaigns API: subscribe to list
    → Campaigns: sends double opt-in email
    → User clicks confirm
    → Campaigns: triggers welcome autoresponder
    → Future broadcasts target this list

REGISTRATION FLOW
─────────────────
User registers at /auth/register
    → Supabase Auth: signUp()
    → Supabase creates auth.users row
    → Next.js server action (post-signup):
        → Zoho CRM: create Contact record
        → Supabase: insert profiles row with zoho_crm_contact_id
    → User redirected to dashboard

COACHING BOOKING FLOW
─────────────────────
User visits /coaches/[slug]
    → Sanity: fetches coach (bio, zohoBookingsServiceId)
    → Zoho Bookings API: fetches available slots for serviceId
    → User selects slot
    → Auth gate (must be logged in)
    → Next.js: Moyasar/Tamara checkout
    → User pays
    → Moyasar webhook → /api/payments/moyasar
    → Verify signature
    → POST /api/bookings/confirm → Zoho Bookings API: confirm appointment
    → Dashboard /dashboard/bookings pulls from Zoho Bookings API

COURSE PURCHASE FLOW
────────────────────
User on /courses/[slug]
    → Sanity: fetches course (title, modules, price)
    → User clicks Buy
    → Auth gate → login if needed
    → Next.js: Moyasar/Tamara checkout
    → User pays
    → Moyasar/Tamara webhook → /api/payments/{provider}
    → Verify signature, idempotency check
    → Supabase: INSERT course_enrollments
    → Dashboard /dashboard/courses:
        → Supabase: SELECT course_enrollments WHERE user_id
        → Sanity: fetch course modules
        → Enrolled module → GET /api/video/token
            → Supabase: verify enrollment (RLS)
            → Mux: sign playback URL
            → Return signed URL → Mux player
```

### C. Integration Diagram

```
┌──────────┐       API calls       ┌──────────────────────┐
│ Next.js  │──────────────────────▶│  Zoho CRM            │
│ App      │  /api/zoho/*          │  Leads / Contacts /  │
│          │◀──────────────────────│  Applications        │
│          │    Lead ID            └──────────┬───────────┘
│          │                                  │
│          │    Campaigns API                 │ CRM Workflow
│          │──────────────────────▶┌──────────▼───────────┐
│          │  /api/newsletter      │  Zoho Flow           │
│          │                       │  Automation          │
│          │                       └──────────┬───────────┘
│          │    Bookings API                  │
│          │──────────────────────▶┌──────────▼───────────┐
│          │  /api/bookings/confirm│  ZeptoMail           │
│          │◀──────────────────────│  Transactional Email │
│          │    Slot data          └──────────────────────┘
│          │
│          │    Supabase JS SDK    ┌──────────────────────┐
│          │──────────────────────▶│  Supabase            │
│          │  auth + queries       │  Auth + PostgreSQL   │
│          │◀──────────────────────│  + RLS               │
│          │    Session + rows     └──────────────────────┘
│          │
│          │    GROQ queries       ┌──────────────────────┐
│          │──────────────────────▶│  Sanity              │
│          │  getCoaches etc.      │  Content Lake + CDN  │
│          │◀──────────────────────│                      │
│          │    Coach/Course docs  └──────────────────────┘
│          │
│          │    Moyasar API        ┌──────────────────────┐
│          │──────────────────────▶│  Moyasar (KSA)       │
│          │  Create payment       │  mada/Apple Pay/Visa │
│          │◀── Webhook ───────────│                      │
│          │    Payment event      └──────────────────────┘
│          │
│          │    Tamara API         ┌──────────────────────┐
│          │──────────────────────▶│  Tamara BNPL         │
│          │  Create checkout      │  (KSA installments)  │
│          │◀── Webhook ───────────│                      │
│          │                       └──────────────────────┘
│          │
│          │    Mux REST + Sign    ┌──────────────────────┐
│          │──────────────────────▶│  Mux                 │
│          │  /api/video/token     │  Private video CDN   │
│          │◀──────────────────────│                      │
│          │    Signed URL         └──────────────────────┘
│          │
│          │  Script embeds (client-side):
│          ├─ SalesIQ widget → Zoho SalesIQ → CRM
│          └─ PageSense script → Zoho PageSense
└──────────┘
```

### D. User Flow Diagram

```
ANONYMOUS VISITOR
     │
     ├──▶ Homepage / → 15 sections → CTA: "Find Your Path"
     │           ↓
     │      /discovery
     │      Journey Wizard: Audience → Challenge → Pathway
     │           ↓
     │      Discovery Request Form
     │           ↓
     │      Zoho CRM Lead created → ZeptoMail confirmation
     │           ↓ (SAH team reviews, schedules off-platform)
     │      [Discovery call → solution design → proposal]
     │
     ├──▶ /coaches → browse + filter
     │           ↓
     │      /coaches/[slug]
     │           ↓ (click Book)
     │      AUTH GATE ──▶ /auth/login or /auth/register
     │           ↓ (authenticated)
     │      Zoho Bookings slot picker
     │           ↓
     │      Moyasar / Tamara checkout
     │           ↓
     │      Booking confirmed → Zoho Bookings → ZeptoMail reminder
     │           ↓
     │      /dashboard/bookings (upcoming session visible)
     │
     ├──▶ /courses → browse catalogue
     │           ↓
     │      /courses/[slug]
     │           ↓ (click Buy)
     │      AUTH GATE
     │           ↓ (authenticated)
     │      Moyasar / Tamara checkout
     │           ↓
     │      Enrollment written to Supabase
     │           ↓
     │      /dashboard/courses → Mux player (enrolled modules)
     │
     ├──▶ /community/apply
     │           ↓
     │      Form → Zoho CRM Applications module
     │           ↓ (SAH reviews, 2–3 business days)
     │      ZeptoMail: approve → WhatsApp invite
     │
     └──▶ /coaches/group or /program/[id]
                 ↓
           Form → Zoho CRM Lead (tagged)
                 ↓
           Zoho Campaigns segment → cohort announcement
```

---

## 10. Recommended Implementation Phases

> Full step-by-step detail: [`docs/ZOHO_FIRST_IMPLEMENTATION_PLAN.md`](./ZOHO_FIRST_IMPLEMENTATION_PLAN.md)

| Phase | Deliverable | Duration |
|---|---|---|
| 0 | Environment setup (Vercel, Sanity, Supabase, Mux accounts) | 1 week |
| 1 | Sanity Studio + CMS pipeline (schemas, mappers, flag-gated) | 2 weeks |
| 2 | Zoho CRM setup + first live lead forms (discovery + community) | 1 week |
| 3 | Newsletter + remaining forms *(SalesIQ / PageSense out of this phase)* | 2–3 days |
| 4 | Marketing → Sanity migration (section by section) | 3–4 weeks |
| 5 | Supabase Auth + dashboard guard + profile | 1 week |
| 6 | Courses in Sanity + `/courses/[slug]` (no purchase) | 2 weeks |
| 7 | Zoho Bookings calendar (request mode, no payment) | 1 week |
| 8 | Moyasar + Tamara → Supabase enrollments *(BLOCKED on merchants)* | 2 weeks |
| 9 | Mux signed playback *(BLOCKED on Phase 8)* | 1 week |
| 10 | ~~Zoho Analytics, Desk, Sign, ZMA~~ — **out of this phase** (future only if asked) | — |

---

## 11. Priority Order Summary

```
Priority  Phase   Deliverable                          Blocks
────────────────────────────────────────────────────────────────
1         0       Environments                          Everything
2         1       Sanity + CMS pipeline                Phase 4, 6
3         2       Zoho CRM + first live forms           Ops value now
4         3       Newsletter + remaining forms          Quick wins
5         4       Marketing → Sanity migration          SEO + editors
6         5       Supabase Auth + dashboard guard       Phase 8, 9
7         6       Courses in Sanity + /courses/[slug]   Phase 8, 9
8         7       Zoho Bookings (no payment)            Phase 8
9         8       Moyasar + Tamara + enrollments        Phase 9 (BLOCKED)
10        9       Mux signed playback                   (BLOCKED on 8)
11        10      (out of this phase)                   Future if asked
```

---

## 12. Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Zoho Payments not available in KSA | Confirmed | High | Use Moyasar + Tamara. Already planned. |
| Merchant accounts (Moyasar/Tamara) delayed | High | High | Deploy Phases 0–7 without payment. Bookings in request mode. |
| Zoho API rate limits hit at scale | Low (early stage) | Medium | Cache responses in Next.js; avoid polling; use webhooks where possible |
| Sanity outage (content unavailable) | Low | Medium | Static fallback catalogs remain in repo behind `FEATURE_CMS=0` |
| Supabase RLS misconfiguration → data leak | Medium | Critical | Thorough RLS testing; all SELECT via authenticated client only; service role only in server Route Handlers |
| ZeptoMail email in spam (KSA ISPs) | Medium | Medium | Verify SPF/DKIM for `sah.com.sa`; use dedicated sending domain; warm up gradually |
| Zoho Bookings widget styling mismatch | Medium | Low | Use Bookings API (not embed widget) to build a custom slot picker |
| Sanity i18n complexity (AR/EN) | Medium | Medium | Use `@sanity/document-internationalization` plugin; enforce both locales before publish |
| Zoho Flow automation failure | Low | Medium | Add error monitoring in Flow; set up dead letter alerts; test both email paths on every deploy |
| Tamara checkout redirect loop on mobile | Medium | Medium | Test on physical KSA devices; follow Tamara's mobile integration checklist |
| Zoho data center location (PDPL) | Medium | High | Confirm `.sa` or `.com` DC; Saudi PDPL may require data stored within KSA — verify with client's legal team |
| Vendor lock-in (Zoho) | Low | Low | All Zoho interactions are behind adapters and Route Handlers; swapping any module means changing the adapter only |

---

## 13. Summary: What Zoho Covers vs Cannot Cover

### Zoho One Covers — 14 of 22 Capabilities

| Capability | Zoho App | Coverage |
|---|---|---|
| Lead capture + CRM | CRM | 🟢 Full |
| Form submission handling | CRM API (direct) | 🟢 Full |
| Community application review | CRM Custom Module | 🟢 Full |
| Transactional email | ZeptoMail | 🟢 Full |
| Email marketing / newsletter | Campaigns | 🟢 Full |
| Workflow automation | Flow + Deluge | 🟢 Full |
| 1:1 scheduling | Bookings | 🟢 Full (scheduling only) |
| Live chat | SalesIQ | 🟢 Full |
| Business reporting | Analytics | 🟢 Full (with Supabase connector) |
| A/B testing | PageSense | 🟢 Full |
| Digital agreements | Sign | 🟢 Full (Phase 5+) |
| Support ticketing | Desk | 🟢 Full (Phase 5+) |
| Internal document management | WorkDrive | 🟢 Full (internal only) |
| Lead nurturing | Marketing Automation | 🟢 Full (Phase 5+) |

### Cannot Be Replaced by Zoho — 5 Capabilities

| Capability | System | Why Zoho Cannot |
|---|---|---|
| KSA payment processing | Moyasar + Tamara | Zoho Payments not available in Saudi Arabia; no Zoho gateway supports mada or Tamara |
| Course video streaming | Mux | Zoho has no video hosting or streaming product |
| Consumer authentication + sessions | Supabase Auth | Creator Portals are for B2B; cannot power Next.js SSR middleware or brand-matched dashboard |
| Enrollment-gated access control | Supabase PostgreSQL + RLS | Row-level security tied to auth session is mandatory for Mux token security |
| Editorial CMS (rich text, image CDN) | Sanity | Creator lacks image CDN, portable text, ISR webhooks, and editorial authoring UX |

---

*This document is the Zoho-first architecture north star. Stack decisions are re-evaluated here without prior assumptions. For the step-by-step integration plan, see [`docs/ZOHO_FIRST_IMPLEMENTATION_PLAN.md`](./ZOHO_FIRST_IMPLEMENTATION_PLAN.md).*
