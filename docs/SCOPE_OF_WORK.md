# SAH Group — Scope of Work (This Phase)

> **Status:** Binding for this delivery · **Created:** 13 August 2026  
> **Applies to:** `sah.com.sa` + staging  
> **Companions:** [`IMPLEMENTATION_TIMELINE.md`](./IMPLEMENTATION_TIMELINE.md) · [`ZOHO_FIRST_IMPLEMENTATION_PLAN.md`](./ZOHO_FIRST_IMPLEMENTATION_PLAN.md) · [`ZOHO_FIRST_ARCHITECTURE.md`](./ZOHO_FIRST_ARCHITECTURE.md)

Source of truth for **what we deliver now**. If another doc conflicts, **this file wins**. Out of scope here is not this phase — even if it appears in architecture or the plan.

**Brief:** Ship a bilingual production site where SAH edits content, captures leads into Zoho, and customers can create accounts, buy courses, book coaching, and watch paid video — **without** Zoho sales automation, live chat, reporting, or extra Zoho apps.

---

## 1. Principle

| On the website / must land in Zoho / visitor expects the email immediately | **In scope** |
| Sales/ops process *after* the lead exists / Zoho app the site does not need | **Out of scope** (future only if asked) |

**Zoho this phase = website → CRM/Campaigns/Bookings + essential visitor emails.**  
SAH works leads, bookings, and applications **manually** in Zoho.

---

## 2. In scope

UI already exists except `/courses/[slug]`. This phase **wires it live** (AR + EN), plus staging/production behind feature flags, SEO (metadata, hreflang, sitemap, robots, JsonLD), and `/studio` (not indexed).

### Website

| Surface | Live behaviour |
|---|---|
| `/` | Marketing from Sanity |
| `/discovery` | Wizard + form → CRM Lead |
| `/coaches`, `/coaches/[slug]` | Sanity coaches + real booking slots |
| `/coaches/group` | Interest → CRM |
| `/courses`, `/courses/[slug]` | Sanity catalogue/detail + purchase + video |
| `/community/apply` | → CRM Applications |
| `/[company]` (6 entities), `/program/[id]` | Sanity content; programme interest → CRM |
| Contact, Newsletter | → CRM / Campaigns |
| `/auth/*`, `/dashboard/*` | Real auth, enrollments, bookings, profile |

### Sanity

Studio at `/studio`. Schemas: Coach, Course, marketing, page SEO (AR + EN). Coaches, courses, homepage, entities, programmes, FAQ, nav from CMS. Images via Sanity CDN. Mux IDs on modules. Publish updates the live page (~30s). Editors do not need a code release.

### Supabase

Email/password register, login, logout, reset (cookie SSR session). Dashboard middleware. `profiles` (incl. `zoho_crm_contact_id`). Register → CRM Contact. `course_enrollments` (payment webhook only), `course_progress`, `coach_reviews` (after completed booking; no moderation product). RLS: users see only their rows. Staff use Zoho login. **No** Google/Apple OAuth.

### Payments *(in scope; blocked only on SAH merchant keys)*

**Moyasar** (mada / Visa / Mastercard / Apple Pay) + **Tamara** (BNPL). Course Buy: auth → picker → pay → enrollment → `/dashboard/courses`. Optional: pay after coaching slot → confirm Bookings. Webhooks signed + idempotent. Until keys arrive, Buy stays disabled / coming soon — timing, not a scope cut.

### Video courses

`/courses/[slug]` crawlable AR + EN. Mux signed playback only with login + enrollment **or** preview flag. Previews free; paid modules blocked without enrollment (incl. direct URL). Progress on dashboard.

### Zoho (website needs only)

| App | Use |
|---|---|
| **CRM** | Website creates Leads (Discovery, Contact, Group, Programme), Applications (community), and Contact on register. Fields: source/type, locale, page, pathway, UTM, programme id. Applications: Pending / Approved / Rejected. Lead Status, Deal stages, convert-to-Deal, and sales process are Zoho CRM ops — not website deliverables; no sales automation in this phase. |
| **Bookings** | Availability on coach pages, reminders, dashboard list. Request mode until payments live, then paid confirm. |
| **Campaigns** | Newsletter list, double opt-in, welcome (AR + EN). |
| **ZeptoMail + Flow** | Essential visitor/internal mail only (below). |
| Zoho Forms | **Not used** — the React site is the form. |

**Essential emails:** Discovery visitor confirmation + SAH internal alert; newsletter double opt-in + welcome; auth confirm/reset (Supabase); community approved/rejected; Bookings reminders; payment/enrollment confirm if the gateway does not already send it.

SAH works CRM records by hand. We do not build the internal sales machine.

---

## 3. Out of scope

May be done later if asked — or never. Not acceptance criteria.

| Exclude | Examples |
|---|---|
| **Live chat** | SalesIQ, any third-party chat |
| **Reporting** | Analytics dashboards, custom BI, Supabase connectors |
| **Sales automation in Zoho** | Pipeline/proposal flows, scoring, assignment, SLAs, nurture/drips, cohort broadcasts beyond storing the lead, quotes/invoices, Deluge/Flow for internal ops |
| **Extra Zoho apps** | Desk, Sign, PageSense, Marketing Automation, WorkDrive, Analytics, Connect (community stays WhatsApp) |
| **Other** | Redesign / new IA / new pages; OAuth; Stripe or non-KSA pay; replacing CRM; staff/coach website portals; moderated reviews, certificates, gamification; non-SAR currency |

---

## 4. Acceptance

On production, AR + EN, a visitor can:

1. Read marketing, coaches, programmes, courses from Sanity  
2. Submit Discovery, Contact, Group, Programme, Community → records in CRM  
3. Subscribe to newsletter (double opt-in + welcome)  
4. Register, confirm email, log in, dashboard, update profile  
5. Request or (once payments live) pay for a coaching slot from real Bookings availability  
6. Pay for a course via Moyasar **and** Tamara; see it in `/dashboard/courses`  
7. Play enrolled + preview video on Mux; progress saved  
8. See a real error or “coming soon” — **never** fake success  

SAH can edit coaches/courses/marketing in `/studio` without a release, and work leads/applications/bookings **manually** in Zoho.

Payments + video stay **in scope** even if keys arrive after the content/CRM/auth track.

---

## 5. SAH must provide

| Item | Blocks |
|---|---|
| Zoho data centre / org + admin or integration user | CRM, Campaigns, Bookings, Flow, ZeptoMail |
| Modules: **CRM, Campaigns, Bookings, Flow, ZeptoMail** only | Capture, newsletter, calendar, email |
| SPF / DKIM / DMARC for `sah.com.sa` | Production email |
| Ops inbox; ZeptoMail / Campaigns copy (AR + EN) | Alerts + visitor mail |
| Coach hours + bookable services | Bookings |
| Course copy + video files (AR + EN) | Course pages + Mux |
| **Moyasar** keys + webhook secret; **Tamara** API + notification tokens | Checkout |
| Written sandbox → live payment sign-off | Production checkout |

No need to license or staff SalesIQ, PageSense, Desk, Sign, ZMA, WorkDrive, Analytics, or Connect.

---

## 6. Systems

**This phase:** Next.js (Vercel), Sanity, Supabase, Moyasar + Tamara, Mux, Zoho CRM / Bookings / Campaigns / ZeptoMail+Flow (essential email only).

**Not this phase:** SalesIQ, Analytics, Desk, Sign, PageSense, Marketing Automation, WorkDrive, Connect, sales-pipeline automation.

§3 items can be a **separate future SOW** if SAH asks. We do not pre-build them. Default: if unsure whether something is in scope, it is **out** unless it is a visitor-facing path in §2.
