# SAH Group — Zoho-First Implementation Plan

> **Created:** August 12, 2026
> **Status:** Active — derived from [`docs/ZOHO_FIRST_ARCHITECTURE.md`](./ZOHO_FIRST_ARCHITECTURE.md)
> **Progress log:** [`docs/ZOHO_FIRST_IMPLEMENTATION_HISTORY.md`](./ZOHO_FIRST_IMPLEMENTATION_HISTORY.md)
> **Binding scope:** [`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md) — if this plan conflicts with that file, the scope document wins.
> **Scope:** Step-by-step wiring plan for backends **in this phase**. Does not replace [`docs/BACKEND_IMPLEMENTATION_GUIDE.md`](./BACKEND_IMPLEMENTATION_GUIDE.md) — read both.
> **Approach:** One surface per deploy. Feature flags gate everything. Never ship broken integrations to production.
>
> **This phase does not include:** SalesIQ, PageSense, Analytics, Desk, Sign, Marketing Automation, WorkDrive, Connect, or Zoho sales-process automation. Phase 3 = newsletter + remaining forms only. Phase 10 = out of this phase. Phases 8–9 (payments + video) **are** in this phase.

---

## Table of Contents

1. [How to Read This Plan](#1-how-to-read-this-plan)
2. [Phase 0 — Environments](#2-phase-0--environments)
3. [Phase 1 — Sanity CMS Pipeline](#3-phase-1--sanity-cms-pipeline)
4. [Phase 2 — Zoho CRM + First Live Lead Forms](#4-phase-2--zoho-crm--first-live-lead-forms)
5. [Phase 3 — Newsletter + Remaining Forms](#5-phase-3--newsletter--remaining-forms)
6. [Phase 4 — Marketing → Sanity Migration](#6-phase-4--marketing--sanity-migration)
7. [Phase 5 — Supabase Auth + Dashboard Guard](#7-phase-5--supabase-auth--dashboard-guard)
8. [Phase 6 — Courses in Sanity + `/courses/[slug]`](#8-phase-6--courses-in-sanity--coursesslug)
9. [Phase 7 — Zoho Bookings (Calendar Only)](#9-phase-7--zoho-bookings-calendar-only)
10. [Phase 8 — Moyasar + Tamara → Enrollments *(BLOCKED)*](#10-phase-8--moyasar--tamara--enrollments-blocked)
11. [Phase 9 — Mux Signed Playback *(BLOCKED on Phase 8)*](#11-phase-9--mux-signed-playback-blocked-on-phase-8) — Studio plugin, token API, player, progress
12. [Phase 10 — Out of this phase](#12-phase-10--out-of-this-phase)
13. [File Targets Quick Reference](#13-file-targets-quick-reference)
14. [Environment Variables Reference](#14-environment-variables-reference)
15. [Feature Flags Reference](#15-feature-flags-reference)
16. [Staging vs Production Habits](#16-staging-vs-production-habits)
17. [SEO Checklist (per phase)](#17-seo-checklist-per-phase)

---

## 1. How to Read This Plan

### Dependency chain

```
Phase 0 → Phase 1, 2 (can overlap after 0)
Phase 2 → Phase 3, 4, 5 (independent tracks)
Phase 5 → Phase 8, 9
Phase 6 → Phase 8, 9
Phase 7 → Phase 8
Phase 8 → Phase 9
```

### Key rules

- **One surface per deploy.** Wire one form, one route, one flag at a time.
- **Staging first, always.** All flags start at `0`. Test E2E on staging. Promote to production only after it passes.
- **No silent fake success in production.** If the integration is not live, show a real "coming soon" or disable the submit button entirely. Do not show fake success messages.
- **Secrets never in the browser.** All API keys live in server Route Handlers or server components only.
- **Rollback = flip the flag.** Every integration is behind a `FEATURE_*` flag so rollback is instantaneous.

### Per-task format

Each task below has:
- **What to do** — specific steps
- **Files to create / modify**
- **Env vars required**
- **Flag to flip**
- **Exit criteria** — what "done" looks like

---

## 2. Phase 0 — Environments

**Goal:** Safe staging forever. Production stays boring until flags flip.
**Duration:** ~1 week
**Who:** Developer + client (for Zoho org confirmation)

### 2.1 Vercel

- [ ] Confirm production project (`sah.com.sa`) is deployed from `main` branch.
- [ ] Create staging environment — preferred: `staging.sah.com.sa` on the same Vercel project as a branch or a dedicated staging project.
- [ ] All `FEATURE_*` env vars = `0` on both environments.
- [ ] Confirm `NEXT_PUBLIC_SITE_URL` is set correctly per environment.

### 2.2 Sanity

- [x] Create Sanity project (free tier is sufficient to start). Project `93kt9fuy` (“Sah”).
- [x] Create two datasets: `staging` and `production` (both public).
- [x] Generate API tokens:
  - Read token (CDN-backed, safe for server use): for `SANITY_API_READ_TOKEN`
  - Write/migration token (admin): store securely, never in env files committed to git
- [x] Note: `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` — pasted into `.env.local` (`staging` locally). Add the same vars to Vercel when staging/production deploys are wired.

### 2.3 Supabase

- [x] Create Supabase Cloud project (staging).
- [x] Production: deferred — using the staging project for local/dev for now; add a separate production project before go-live (or enforce careful RLS if one project is shared).
- [x] Note: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — pasted into `.env.local`. Accessors in `src/lib/env.ts`; placeholders in `.env.example`. Add the same vars to Vercel when staging/production deploys are wired. Do not install `@supabase/*` or add `src/lib/supabase.ts` until Phase 5.
- [x] Do not create any tables yet — that is Phase 5.

### 2.4 Mux

Mux is **encode + host + stream**, not a recorder. Coaches record elsewhere (OBS, Descript, phone, etc.), then editors upload in Studio. Sanity Free is enough for IDs + Studio; Mux is a **separate** account and bill.

- [x] Create Mux account (https://dashboard.mux.com).
- [x] Access Token: Video **Read + Write**, Data **Read**, and **System Read + Write** (required to create signing keys / signed playback).
- [x] Note: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` (server-only — never `NEXT_PUBLIC_`) — pasted into `.env.local`. Accessors in `src/lib/env.ts`; placeholders in `.env.example`. Add the same vars to Vercel when staging/production deploys are wired. Do not install `@mux/*` or add `src/lib/mux.ts` until Phase 9.
- [x] Generate a signing key for signed playback: `MUX_SIGNING_KEY_ID` and `MUX_SIGNING_PRIVATE_KEY` pasted into `.env.local` (Mux dashboard base64 PEM). Accessor unescapes `\n` and base64-decodes to PEM. Add the same vars to Vercel when staging/production deploys are wired.
- [x] No video uploads needed yet. Player stays off until Phase 9 (`FEATURE_VIDEO=0`).

### 2.5 Zoho

- [x] **Critical:** Zoho data center confirmed from Zoho One (`https://one.zoho.sa/zohoone/sahportal/home`) — **SA (Saudi Arabia)**.
  - Org portal: `one.zoho.sa` / `sahportal`
  - API base: `https://www.zohoapis.sa` → `ZOHO_API_BASE`
  - OAuth / Accounts: `https://accounts.zoho.sa`
  - Other DCs (not this org): `.com` (US), `.eu`, `.in`, `.com.au`, `.jp`
- [ ] Confirm Zoho One subscription is active and the correct modules are enabled for **this phase**: CRM, Campaigns, Bookings, Flow, ZeptoMail. Do not require SalesIQ, Analytics, PageSense, Desk, Sign, Marketing Automation, WorkDrive, or Connect.
- [ ] Do not configure any Zoho modules yet — that is Phase 2.

### 2.6 Exit Criteria

- [ ] Staging URL deploys the current UI with no broken pages.
- [ ] All external accounts exist (Sanity, Supabase, Mux, Zoho confirmed).
- [ ] `.env.local` on staging contains all placeholder vars (commented out where not yet active).

---

## 3. Phase 1 — Sanity CMS Pipeline

**Goal:** Editors can open Studio and publish content. The public site still reads static JSON/catalogs. No public cutover yet.
**Duration:** ~2 weeks
**Flags:** `FEATURE_CMS=0` throughout this phase (flip in Phase 2 for coaches only)

### 3.1 Sanity Studio at `/studio`

**Files to create:**
```
src/app/studio/[[...tool]]/page.tsx
```

**Steps:**
- [x] Install `next-sanity`, `sanity`, and the Mux Studio plugin:
  ```bash
  npm install next-sanity sanity sanity-plugin-mux-input
  ```
- [x] Create `src/sanity/sanity.config.ts` with project ID, dataset, plugins — include `muxInput()` (see Phase 9 for signed-URL defaults).
- [x] Create the Studio route (`src/app/studio/[[...tool]]/page.tsx`) using `NextStudio`.
- [x] Add `/studio` to `robots.ts` disallow list (already exists — add the entry).
- [x] Add `cdn.sanity.io` to `next.config.ts` image `remotePatterns`.
- [x] Allowlist production, staging, and `localhost:3000` in the Sanity project settings (CORS origins).
- [x] Test: open `http://localhost:3000/studio` — should load the Studio UI.

### 3.2 Sanity Schemas

**Files to create:**
```
src/sanity/schemas/coach.ts
src/sanity/schemas/course.ts
src/sanity/schemas/homePage.ts
src/sanity/schemas/pageSeo.ts
src/sanity/schemas/index.ts
```

#### Coach schema (field-level bilingual)

Required fields for the `Coach` app contract:

| Field | Type | Notes |
|---|---|---|
| `slug` | Slug | Shared across locales. **Immutable after publish.** |
| `name` | `{en: string, ar: string}` | Display name |
| `specialty` | `{en: string, ar: string}` | Short specialty title |
| `bio` | `{en: text, ar: text}` | Short bio (card) |
| `fullBio` | `{en: portableText, ar: portableText}` | Full bio (profile page) |
| `photo` | Image | Sanity asset |
| `topics` | `{en: string[], ar: string[]}` | Tag array |
| `languages` | string[] | Locale-independent list |
| `credentials` | `{en: string[], ar: string[]}` | |
| `experience` | `{en: string, ar: string}` | |
| `sessionDuration` | string | e.g. `"50 min"` |
| `priceSar` | number | Session price in SAR |
| `zohoBookingsServiceId` | string | From Zoho Bookings (Phase 7) |
| `published` | boolean | `false` by default |

#### Course schema (field-level bilingual)

| Field | Type | Notes |
|---|---|---|
| `slug` | Slug | Immutable after publish |
| `title` | `{en: string, ar: string}` | |
| `description` | `{en: portableText, ar: portableText}` | |
| `level` | `{en: string, ar: string}` | |
| `thumbnail` | Image | |
| `priceSar` | number | |
| `published` | boolean | |
| `modules` | Array of module objects | See below |

Module object:

| Field | Type | Notes |
|---|---|---|
| `title` | `{en: string, ar: string}` | |
| `duration` | string | e.g. `"12 min"` |
| `isPreview` | boolean | Free preview module |
| `video` | `mux.video` | Sanity → Mux plugin field. **Not** a Sanity `file` and **not** a plain string ID. Mapper extracts `playbackId` / `assetId` from the referenced `mux.videoAsset`. Older docs calling this `muxAssetId` mean those extracted IDs. |

Do **not** store lesson bytes in Sanity. The plugin uploads to Mux; Sanity only stores a reference. Configure the plugin with **Enable Signed URLs** before any production uploads (Phase 6 / 9).

#### Home page schema (document-per-locale)

Use `@sanity/document-internationalization` plugin for marketing pages. One document per locale: `homePage_ar`, `homePage_en`. Map into the existing `SiteContent` TypeScript type — do not change the component contracts, only the data source.

#### Page SEO schema

| Field | Type |
|---|---|
| `pageKey` | string (e.g. `"coaches"`, `"community"`) |
| `locale` | `"ar"` \| `"en"` |
| `title` | string |
| `description` | string |
| `ogTitle` | string |
| `ogDescription` | string |

### 3.3 Sanity Client + Queries

**Files to create:**
```
src/lib/sanity.ts
```

```typescript
// src/lib/sanity.ts
import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN,
})
```

### 3.4 Content Mappers

**Files to update:**
```
src/content/mappers/coach.ts      ← implement Sanity → Coach mapping
src/content/mappers/course.ts     ← implement Sanity → Course mapping
src/content/mappers/home.ts       ← implement Sanity → SiteContent mapping
```

The mapper `README.md` already documents the rules. Each mapper:
1. Accepts a raw Sanity document and a `locale` param.
2. Returns the typed app contract (`Coach`, `Course`, `SiteContent`).
3. Handles missing fields gracefully (fallback to `""` / `[]`).

### 3.5 Feature-Flagged Facades

**Files to update:**
```
src/content/index.ts
src/content/catalog/coaches.ts
src/content/catalog/courses.ts
```

Pattern:
```typescript
// src/content/catalog/coaches.ts (simplified)
import { features } from '@/lib/features'
import { sanityClient } from '@/lib/sanity'
import { mapCoach } from '@/content/mappers/coach'
import type { Coach } from '@/domain/coach'
import type { Locale } from '@/types/locale'
import staticCoaches from './coaches-static' // current placeholder

export async function getCoaches(locale: Locale): Promise<Coach[]> {
  if (!features.cms) return staticCoaches(locale) // current behavior
  const raw = await sanityClient.fetch(COACHES_QUERY, { locale })
  return raw.map((doc: unknown) => mapCoach(doc, locale))
}
```

### 3.6 ISR Revalidation Webhook

**File to create:**
```
src/app/api/revalidate/route.ts
```

```typescript
// src/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }
  const body = await req.json()
  const { _type } = body

  const tagMap: Record<string, string> = {
    coach: 'coaches',
    course: 'courses',
    homePage: 'home',
    pageSeo: 'seo',
  }

  const tag = tagMap[_type]
  if (tag) revalidateTag(tag)

  return NextResponse.json({ revalidated: true, tag })
}
```

- [ ] **Optional (do before `FEATURE_CMS=1`):** set `SANITY_REVALIDATE_SECRET` + configure the Sanity webhook: `POST https://sah.com.sa/api/revalidate?secret={SANITY_REVALIDATE_SECRET}` — triggered on document publish/unpublish. *(route implemented; secret + webhook URL still manual — tracked in [`ZOHO_FIRST_IMPLEMENTATION_HISTORY.md`](./ZOHO_FIRST_IMPLEMENTATION_HISTORY.md))*

### 3.7 Exit Criteria

- [x] `/studio` loads on staging without errors. *(verified locally at `/studio`; staging deploy still depends on Phase 0 Vercel staging)*
- [x] Can create one coach document in staging dataset with both AR and EN fields.
- [x] Coach pages on staging still serve static data (`FEATURE_CMS=0`).
- [x] Production site unchanged.

---

## 4. Phase 2 — Zoho CRM + First Live Lead Forms

**Goal:** Real leads land in Zoho CRM from day one. SAH ops team can start working in CRM immediately.
**Duration:** ~1 week
**Who:** Developer + SAH ops admin (for Zoho setup steps)
**Flags:** `FEATURE_ZOHO_FORMS=1` (after staging passes)

### 4.1 Zoho Admin Setup (before writing any code)

#### CRM — Lead Module

Configure the Leads module in Zoho CRM:

| Field label | Field name | Type | Notes |
|---|---|---|---|
| First Name | `First_Name` | Text | |
| Last Name | `Last_Name` | Text | |
| Email | `Email` | Email | |
| Phone | `Phone` | Phone | |
| Locale | `Locale` | Picklist | `ar`, `en` |
| Source Page | `Source_Page` | Text | e.g. `/discovery`, `/community/apply` |
| Lead Source | `Lead_Source` | Picklist (existing) | `Discovery`, `Contact Form`, `Group Coaching`, `Program Interest`, `Community Apply` |
| Pathway Title | `Pathway_Title` | Text | Discovery only |
| Audience Label | `Audience_Label` | Text | Discovery only |
| Need Label | `Need_Label` | Text | Discovery only |
| Program Interest | `Program_Interest` | Text | Program form only |
| UTM Source | `UTM_Source` | Text | |
| UTM Medium | `UTM_Medium` | Text | |
| UTM Campaign | `UTM_Campaign` | Text | |

**Website CRM scope (this phase):** create Leads with the fields above (plus Applications / Contact where those paths apply). Do not create Deals, move Lead Status, or automate sales stages from the site.

**Out of website scope — Zoho CRM ops (SAH owns):** Lead Status Kanban, Deal stages, convert Lead → Contact + Deal, assignment, scoring, and any sales-process automation. Use the client's existing stages as-is; do not invent new pipeline names for the website deliverable.

Client Lead Status values (reference only):
`Attempted to Contact`, `Contact in Future`, `Contacted`, `Junk Lead`, `Lost Lead`, `Not Contacted`, `Pre-Qualified`, `Not Qualified`, `UnAccounted`

Client Deal stages (reference only):
`عميل محتمل` → `إعداد العرض` → `تم إرسال العرض` → `متابعة` → `معلق` → `تم الفوز` / `لم يتم`

New website Leads should land with Zoho's default Lead Status (typically `Not Contacted`). SAH moves status and converts in CRM by hand.

#### CRM — Custom Module: Applications

Create a custom module called **"Applications"** for community applications:

| Field | Type | Notes |
|---|---|---|
| Name | Text | Applicant name |
| Email | Email | |
| Phone | Phone | |
| Community | Picklist | `impact`, `lego` |
| Profession | Text | |
| Motivation | Long Text | |
| Experience | Long Text | |
| Status | Picklist | `Pending Review`, `Approved`, `Rejected` |
| Locale | Picklist | `ar`, `en` |

#### Zoho Flow — Discovery Confirmation

Create a flow triggered on **Zoho CRM Lead creation** where `Lead_Source = Discovery`:

```
Trigger: CRM Lead Created (Lead_Source = "Discovery")
Action 1: ZeptoMail — send template "discovery-visitor-confirmation"
  To: {{Lead.Email}}
  Subject: "تم استلام طلبك — سعة" / "Your request received — SAH"
  (locale-aware via Lead.Locale field)
Action 2: ZeptoMail — send template "discovery-sah-internal"
  To: {SAH team inbox}
  Subject: "New Discovery Lead: {{Lead.Full_Name}}"
```

#### Zoho Flow — Community Application Outcome

Create a flow triggered on **CRM Application status change**:

```
Trigger: Applications.Status changed to "Approved"
Action: ZeptoMail — send template "community-approved"
  To: {{Application.Email}}
  Subject: "تم قبولك في مجتمع سعة! 🎉" / "You're in! Welcome to SAH community"

Trigger: Applications.Status changed to "Rejected"
Action: ZeptoMail — send template "community-rejected"
  To: {{Application.Email}}
```

#### ZeptoMail — Email Templates

Create the following templates in ZeptoMail (under the SAH sender domain):

| Template key | Subject | Recipients | Trigger |
|---|---|---|---|
| `discovery-visitor-confirmation` | Locale-based | Prospect | Discovery form submit |
| `discovery-sah-internal` | New lead notification | SAH team inbox | Discovery form submit |
| `contact-visitor-confirmation` | Locale-based | Prospect | Contact form submit |
| `group-interest-confirmation` | Locale-based | Prospect | Group interest form submit |
| `community-approved` | Welcome to SAH community | Applicant | CRM status → Approved |
| `community-rejected` | Application update | Applicant | CRM status → Rejected |

> **Important:** Set up SPF, DKIM, and DMARC for `sah.com.sa` in ZeptoMail before sending. Test deliverability to both Gmail and Outlook before going live.

#### OAuth / API Credentials

Generate a Zoho OAuth client for server-side use:
- Go to: `https://api-console.zoho.com/`
- Create a **Server-based** OAuth client
- Scopes needed: `ZohoCRM.modules.leads.CREATE`, `ZohoCRM.modules.leads.READ`, `ZohoBookings.appointments.CREATE` (Phase 7)
- Store: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`
- The access token must be refreshed automatically — implement a token cache in `src/lib/zoho.ts`.

### 4.2 Next.js — Zoho Helper Library

**File to create:**
```
src/lib/zoho.ts
```

```typescript
// src/lib/zoho.ts — server-only
// Token cache, CRM API client, Campaigns API client

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token
  }
  const res = await fetch(
    `https://accounts.zoho.sa/oauth/v2/token?` +
    `refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&` +
    `client_id=${process.env.ZOHO_CLIENT_ID}&` +
    `client_secret=${process.env.ZOHO_CLIENT_SECRET}&` +
    `grant_type=refresh_token`,
    { method: 'POST' }
  )
  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  return cachedToken.token
}

export async function createCrmLead(fields: Record<string, unknown>) {
  const token = await getAccessToken()
  const res = await fetch(
    `${process.env.ZOHO_API_BASE}/crm/v3/Leads`,
    {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [fields] }),
    }
  )
  return res.json()
}

export async function createCrmApplication(fields: Record<string, unknown>) {
  const token = await getAccessToken()
  const res = await fetch(
    `${process.env.ZOHO_API_BASE}/crm/v3/Applications`,
    {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [fields] }),
    }
  )
  return res.json()
}
```

### 4.3 Next.js — Route Handlers

**Files to create:**
```
src/app/api/zoho/discovery/route.ts
src/app/api/zoho/contact/route.ts
src/app/api/zoho/group/route.ts
src/app/api/zoho/community/route.ts
src/app/api/zoho/program/route.ts
```

Each Route Handler follows this pattern:

```typescript
// src/app/api/zoho/discovery/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createCrmLead } from '@/lib/zoho'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  pathwayTitle: z.string(),
  audienceLabel: z.string(),
  needLabel: z.string(),
  locale: z.enum(['ar', 'en']),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: 'validation' }, { status: 400 })
  }
  const d = parsed.data
  const [firstName, ...rest] = d.name.trim().split(' ')
  try {
    const result = await createCrmLead({
      First_Name: firstName,
      Last_Name: rest.join(' ') || '-',
      Email: d.email,
      Phone: d.phone,
      Lead_Source: 'Discovery',
      Source_Page: '/discovery',
      Locale: d.locale,
      Pathway_Title: d.pathwayTitle,
      Audience_Label: d.audienceLabel,
      Need_Label: d.needLabel,
    })
    const id = result?.data?.[0]?.details?.id
    return NextResponse.json({ ok: true, id })
  } catch {
    return NextResponse.json({ ok: false, code: 'upstream' }, { status: 500 })
  }
}
```

### 4.4 Wire Adapters

**Files to update:**
```
src/adapters/zoho/forms.ts
```

```typescript
// src/adapters/zoho/forms.ts — submitDiscoveryLead (replace stub)
export async function submitDiscoveryLead(
  payload: DiscoveryLead,
): Promise<AdapterResult> {
  track('lead_submitted', { kind: 'discovery', locale: payload.locale })
  if (!features.zohoForms) return notConfiguredResult('Zoho Forms (discovery)')

  const res = await fetch('/api/zoho/discovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (data.ok) return { ok: true, id: data.id }
  return { ok: false, code: data.code ?? 'upstream', message: data.message ?? 'Error' }
}
```

Apply same pattern for: `submitContactLead`, `submitGroupInterest`, `submitProgramInterest`, `submitCommunityApplication`.

### 4.5 CMS Cutover (Coaches Only)

After forms are live and trusted on staging:

- [ ] Seed all placeholder coaches into Sanity `staging` dataset (AR + EN). *(script ready; staging seed run — photos still manual)*
- [ ] Enable `FEATURE_CMS=1` on staging only.
- [ ] QA: `/coaches`, `/coaches/[slug]` (AR + EN), Person JsonLD, breadcrumbs, sitemap.
- [ ] Fix any mapper edge cases (missing photo → fallback, empty topics → `[]`). *(mapper + UI placeholders already handle missing photo)*
- [ ] Promote coaches to `production` dataset.
- [ ] Enable `FEATURE_CMS=1` on production after QA passes.

### 4.6 Exit Criteria

- [ ] Discovery form creates real Zoho CRM Lead in staging (correct fields + `Lead_Source`).
- [ ] Visitor receives ZeptoMail confirmation within 60 seconds.
- [ ] SAH team receives internal notification.
- [ ] Community apply creates record in CRM Applications module.
- [ ] No `not_configured` response returned when `FEATURE_ZOHO_FORMS=1`.
- [ ] AR and EN submissions both work.
- [ ] Coaches served from Sanity on production.

---

## 5. Phase 3 — Newsletter + Remaining Forms

**Goal:** Newsletter + remaining lead forms. **SalesIQ and PageSense are out of this phase** ([`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md) §3).
**Duration:** ~2–3 days

### 5.1 Zoho SalesIQ — **out of this phase**

Do not embed SalesIQ. Live chat is explicitly excluded from this delivery. See [`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md) §3.

### 5.2 Zoho PageSense — **out of this phase**

Do not embed PageSense. A/B testing is explicitly excluded. See [`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md) §3.

### 5.3 Newsletter → Zoho Campaigns

**File to create:**
```
src/app/api/newsletter/route.ts
```

- [ ] In Zoho Campaigns: create a mailing list `SAH Newsletter`. Note the list key `ZOHO_CAMPAIGNS_LIST_KEY`.
- [ ] Configure double opt-in for the list.
- [ ] Create welcome email template (AR default, EN variant).

Route Handler:
```typescript
// src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  locale: z.enum(['ar', 'en']),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: 'validation' }, { status: 400 })
  }
  const { email, locale } = parsed.data
  const url = new URL('https://campaigns.zoho.com/api/v1.1/json/listsubscribe')
  url.searchParams.set('resfmt', 'JSON')
  url.searchParams.set('listkey', process.env.ZOHO_CAMPAIGNS_LIST_KEY!)
  url.searchParams.set('contactinfo', JSON.stringify({ 'Contact Email': email, locale }))
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Authorization: `Zoho-oauthtoken ${await getCampaignsToken()}` },
  })
  const data = await res.json()
  if (data.status === 'success') return NextResponse.json({ ok: true })
  return NextResponse.json({ ok: false, code: 'upstream' }, { status: 500 })
}
```

- [ ] Wire `subscribeNewsletter()` in `src/adapters/zoho/forms.ts` to call `/api/newsletter`.
- [ ] Set `FEATURE_NEWSLETTER=1` on staging. Test AR + EN subscription. Confirm double opt-in email arrives.
- [ ] Enable on production.

### 5.4 Remaining Forms (Group Interest, Contact, Program Interest)

Apply the same Route Handler + adapter pattern from Phase 2:

- [ ] `src/app/api/zoho/group/route.ts` → `submitGroupInterest()` wired
- [ ] `src/app/api/zoho/contact/route.ts` → `submitContactLead()` wired
- [ ] `src/app/api/zoho/program/route.ts` → `submitProgramInterest()` wired

All under `FEATURE_ZOHO_FORMS=1` (already enabled from Phase 2).

### 5.5 Exit Criteria

- [ ] Newsletter subscribe creates a contact in Campaigns list. Double opt-in email arrives.
- [ ] Group, Contact, Program Interest forms create CRM leads.
- [ ] All forms show real error states when Zoho API fails (not fake success).
- [ ] No SalesIQ or PageSense scripts on staging or production.

---

## 6. Phase 4 — Marketing → Sanity Migration

**Goal:** Editors own all marketing content without touching code. Largest content phase.
**Duration:** 3–4 weeks
**Prerequisite:** Phase 1 (schemas + pipeline proven from Phase 2 coaches cutover)

### Workflow (repeat per section)

1. Model Sanity schema fields to match the **existing** TypeScript slice of `SiteContent`.
2. Seed AR + EN from current `src/content/{en,ar}/home.json` (manual or a one-time migration script).
3. Update mapper to return that slice from Sanity; rest may still come from JSON (partial merge in `getContent` is fine).
4. Staging QA: both locales, RTL, section anchors, JsonLD.
5. Sanity webhook revalidation tested.
6. Production promote + monitor.
7. Only then delete that JSON slice or mark as unused.

### Migration Order (lowest risk → largest blast radius)

| Step | What to migrate | Why this order |
|---|---|---|
| 4.1 | `pageSeo` docs | Small, SEO-critical — proves document-per-locale plugin works |
| 4.2 | FAQ section | Self-contained section + JsonLD schema |
| 4.3 | Company / entity pages (`/[company]`) | Real routes, smaller blast radius than homepage |
| 4.4 | Programs section (cards + `/program/[id]`) | Medium complexity |
| 4.5 | Homepage sections **one at a time** | Hero → Promise → Need → Entities → Method → Journeys → Partners → Impact → Initiatives → Community → Newsletter → About → Contact |
| 4.6 | Nav / mega-nav copy (if still in JSON) | Last — navigation errors are most visible |

### Notes

- Use `@sanity/document-internationalization` plugin for document-per-locale (marketing).
- Enforce both AR + EN fields as required before publish in Studio validation.
- The `getContent()` facade in `src/content/index.ts` is the single swap point — nothing in components changes.
- Keep `home.json` as emergency fallback (`FEATURE_CMS=0`).

### Exit Criteria

- [x] All marketing sections editable in Studio at `/studio`.
- [x] Both AR + EN versions published for all live URLs.
- [x] `home.json` is fallback only (or removed if confident in rollback).
- [x] Revalidation fires on every content publish.
- [x] SEO checklist passed for all migrated routes.

---

## 7. Phase 5 — Supabase Auth + Dashboard Guard

**Goal:** Real customer accounts. No payment or video yet.
**Duration:** ~1 week
**Flags:** `FEATURE_AUTH=1` after staging passes

### 7.1 Install Supabase Packages

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 7.2 Supabase Client Library

**File to create:**
```
src/lib/supabase.ts
```

```typescript
// src/lib/supabase.ts
// Exports: browser client (for client components), server client (for server components / Route Handlers)
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### 7.3 Database Tables

Run these in the Supabase SQL editor:

```sql
-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  locale TEXT DEFAULT 'ar',
  zoho_crm_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

> Note: `course_enrollments`, `course_progress`, `coach_reviews` tables are created in Phase 8.

### 7.4 Wire Auth Adapters

**File to update:**
```
src/adapters/supabase/auth.ts
```

```typescript
// signIn
export async function signIn(input: SignInInput): Promise<AdapterResult> {
  track('auth_sign_in', { emailDomain: input.email.split('@')[1] })
  if (!features.auth) return notConfiguredResult('Supabase Auth')
  const supabase = createSupabaseBrowserClient()
  const { error } = await supabase.auth.signInWithPassword(input)
  if (error) return { ok: false, code: 'upstream', message: error.message }
  return { ok: true }
}

// signUp — also creates Zoho CRM Contact + Supabase profile
export async function signUp(input: SignUpInput): Promise<AdapterResult> {
  track('auth_sign_up', { emailDomain: input.email.split('@')[1] })
  if (!features.auth) return notConfiguredResult('Supabase Auth')
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  })
  if (error || !data.user) return { ok: false, code: 'upstream', message: error?.message ?? 'Signup failed' }

  // Create CRM Contact + Supabase profile via server Route Handler
  await fetch('/api/auth/onboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: data.user.id, fullName: input.fullName, email: input.email }),
  })
  return { ok: true }
}
```

**File to create:**
```
src/app/api/auth/onboard/route.ts
```

This Route Handler (server-only):
1. Creates Zoho CRM Contact (using `src/lib/zoho.ts`).
2. Inserts `profiles` row with the `zoho_crm_contact_id` returned.

### 7.5 Dashboard Middleware Guard

**File to update:**
```
src/proxy.ts   (or rename to src/middleware.ts if not already the middleware entry)
```

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  )
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.includes('/dashboard')) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = `/${req.nextUrl.pathname.split('/')[1]}/auth/login`
    return NextResponse.redirect(loginUrl)
  }
  return res
}

export const config = {
  matcher: ['/:locale/dashboard/:path*'],
}
```

### 7.6 Auth-Aware Header

**File to update:**
```
src/components/layout/SiteHeader.tsx
```

Server component — read Supabase session on the server. Show "Dashboard / Sign out" when session exists, "Sign in" when not.

### 7.7 Exit Criteria

- [x] Register → email confirmation → login → dashboard (empty states) → sign out works.
- [x] Unauthenticated GET `/dashboard` redirects to `/auth/login` (in correct locale).
- [x] Profile row created in Supabase after registration.
- [x] Zoho CRM Contact created for new user.
- [x] Auth pages remain `noindex`.

> **Complete (3 September 2026).** See [`ZOHO_FIRST_IMPLEMENTATION_HISTORY.md`](./ZOHO_FIRST_IMPLEMENTATION_HISTORY.md) Phase 5. Keep Supabase redirect URLs, `profiles` migration, and Zoho Contacts scope configured per environment when enabling `FEATURE_AUTH=1` on staging/production.
---

## 8. Phase 6 — Courses in Sanity + `/courses/[slug]`

**Goal:** SEO-ready course pages. No purchase or video yet.
**Duration:** ~2 weeks
**Prerequisite:** Phase 1 (Sanity pipeline proven)

### Steps

- [ ] Seed course data into Sanity `staging` (AR + EN titles, descriptions, modules — `video` / Mux IDs can be empty now).
- [ ] Build `/courses/[slug]` page (currently missing):
  - Hero with thumbnail
  - Course meta (level, duration, module count, price)
  - Curriculum accordion — module list with title, duration, free preview badge
  - Sticky purchase CTA marked **"Coming Soon"** or disabled — do not collect payment yet
- [ ] Course JsonLD (`Course` schema), breadcrumbs, hreflang alternates.
- [ ] Add course slug URLs to `sitemap.ts` (dynamic, from Sanity).
- [ ] Enable CMS for courses (`FEATURE_CMS=1` already on from Phase 2; extend to courses).
- [ ] Optionally: upload Mux assets **from Studio** (`mux.video` on the module). In Studio → Videos → Configure plugin: paste Mux token + secret, **Enable Signed URLs**. Wait until asset `status` is `ready`. Keep original master files off Mux (Drive / disk). **Do not** ship signed playback until Phase 9 (`FEATURE_VIDEO=0`).

### Exit Criteria

- [ ] `/courses/[slug]` and `/en/courses/[slug]` crawlable in Google Search Console.
- [ ] Course JsonLD validates in Rich Results Test.
- [ ] No payment functionality. No video playback.

---

## 9. Phase 7 — Zoho Bookings (Calendar Only)

**Goal:** Real slot selection. No payment collected until Phase 8.
**Duration:** ~1 week
**Flags:** `FEATURE_BOOKINGS=1` after staging passes

### 9.1 Zoho Bookings Admin Setup

- [ ] In Zoho Bookings: create services matching each coaching offering (1:1 session types, durations, prices as reference only).
- [ ] Create staff members matching each coach. Map to coaches.
- [ ] Set working hours and availability.
- [ ] Configure **payment policy: "No payment required"** (request booking mode) — do not configure Stripe/PayPal, as payments go through Moyasar/Tamara in Phase 8.
- [ ] Note each coach's `serviceId` and/or `staffId`.

### 9.2 Update Sanity Coach Schema

- [ ] Add `zohoBookingsServiceId` field to coach schema (Phase 1 already included this field — populate it now).
- [ ] Update each coach document in Studio with the correct `serviceId`.

### 9.3 Update Zoho Bookings Adapter

**File to update:**
```
src/adapters/zoho/bookings.ts
```

```typescript
// getBookingsEmbedUrl — returns available slots for a serviceId
export async function getAvailableSlots(input: {
  serviceId: string
  date: string // YYYY-MM-DD
  locale: 'ar' | 'en'
}): Promise<AdapterResult & { slots?: Slot[] }> {
  if (!features.bookings) return notConfiguredResult('Zoho Bookings')
  const token = await getZohoAccessToken()
  const res = await fetch(
    `${process.env.ZOHO_API_BASE}/bookings/v1/json/availableslots?` +
    `service_id=${input.serviceId}&selected_date=${input.date}`,
    { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
  )
  const data = await res.json()
  return { ok: true, slots: data.response?.returnvalue?.data ?? [] }
}
```

### 9.4 Replace Disabled Slot Grid

**File to update:**
```
src/app/[locale]/coaches/[slug]/page.tsx
```

Replace the disabled slot grid placeholder with a real date picker + time slot selector component that calls `getAvailableSlots()`. On slot selection → redirect to `/dashboard` booking confirmation page (Phase 8: payment step).

### 9.5 Dashboard Bookings

**File to update:**
```
src/app/[locale]/dashboard/bookings/page.tsx
```

Fetch upcoming + past bookings from Zoho Bookings API (customer bookings by email) and render in SAH-branded UI.

### 9.6 Exit Criteria

- [ ] Visitors can select a slot on `/coaches/[slug]` and submit a booking request.
- [ ] Booking appears in Zoho Bookings admin.
- [ ] Automated reminder emails go out (Bookings native).
- [ ] Dashboard bookings tab shows the request.
- [ ] No payment collected.

---

## 10. Phase 8 — Moyasar + Tamara → Enrollments *(BLOCKED)*

**Blocked until:** Client provides Moyasar merchant account credentials and Tamara API token.

**Duration:** ~2 weeks after unblock
**Flags:** `FEATURE_CHECKOUT=1`

### 10.1 Additional Supabase Tables

```sql
-- course_enrollments
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  payment_provider TEXT NOT NULL, -- 'moyasar' | 'tamara'
  payment_id TEXT NOT NULL,       -- provider payment/order id
  amount_sar INTEGER NOT NULL,
  UNIQUE(user_id, course_slug)    -- prevent duplicate enrollments
);
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own enrollments"
  ON course_enrollments FOR SELECT USING (auth.uid() = user_id);

-- Service role (server only) has INSERT/UPDATE rights via bypass
```

### 10.2 Payment Helper Library

**File to create:**
```
src/lib/payments.ts
```

Exports:
- `createMoyasarPayment(request: CheckoutRequest): Promise<CheckoutSession>`
- `createTamaraCheckout(request: CheckoutRequest): Promise<CheckoutSession>`
- `verifyMoyasarWebhookSignature(body: string, signature: string): boolean`
- `verifyTamaraWebhookSignature(body: string, signature: string): boolean`

### 10.3 Route Handlers

**Files to create:**
```
src/app/api/payments/moyasar/route.ts          ← create payment
src/app/api/payments/moyasar/webhook/route.ts  ← receive webhook
src/app/api/payments/tamara/route.ts           ← create checkout
src/app/api/payments/tamara/webhook/route.ts   ← receive webhook
```

Webhook handler (both providers follow same pattern):

```typescript
// Webhook: verify signature → idempotency check → INSERT enrollment
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('x-moyasar-signature') ?? ''
  if (!verifyMoyasarWebhookSignature(body, sig)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  const event = JSON.parse(body)
  if (event.type !== 'payment.paid') return NextResponse.json({ ok: true })

  const { course_slug, user_id } = event.metadata
  const supabase = createSupabaseServiceClient() // service role — bypasses RLS
  await supabase.from('course_enrollments').upsert({
    user_id,
    course_slug,
    payment_provider: 'moyasar',
    payment_id: event.id,
    amount_sar: event.amount / 100,
  }, { onConflict: 'user_id,course_slug' }) // idempotent
  return NextResponse.json({ ok: true })
}
```

### 10.4 Optional: Coaching Payment After Slot Selection

After Phase 7 slot picker: instead of request mode, redirect to Moyasar/Tamara checkout. On payment success, call `/api/bookings/confirm`:

**File to create:**
```
src/app/api/bookings/confirm/route.ts
```

```typescript
// Confirms the Zoho Bookings appointment after payment verification
export async function POST(req: NextRequest) {
  const { serviceId, slotId, paymentId, customerEmail } = await req.json()
  const result = await confirmBookingAfterPayment({ serviceId, slotId, paymentId, customerEmail })
  return NextResponse.json(result)
}
```

### 10.5 Update `course_detail` Buy CTA

Enable the disabled Buy Now button on `/courses/[slug]`:
- Auth gate: if not logged in, redirect to login with `?return=/courses/[slug]`
- Payment picker: Moyasar (card/mada/Apple Pay) or Tamara (installments)
- Pass `{ course_slug, user_id }` as metadata in the payment creation call

### 10.6 Exit Criteria

- [ ] Test payment → `course_enrollments` row created → course appears in `/dashboard/courses`.
- [ ] Duplicate webhooks do not create duplicate enrollment rows.
- [ ] Unauthenticated users cannot access course player.
- [ ] Moyasar and Tamara both tested on staging.

---

## 11. Phase 9 — Mux Signed Playback *(BLOCKED on Phase 8)*

**Blocked until:** Phase 8 is complete (enrollments live). You may upload assets earlier (Phase 6); do **not** flip `FEATURE_VIDEO` until enrollments exist (or a staging-only test enrollment row).
**Duration:** ~1 week
**Flags:** `FEATURE_VIDEO=1`

Sanity does **not** host the stream. Studio is the upload UI; the plugin calls Mux; Sanity stores IDs; Next.js gates playback.

```
Record offline → /studio drop-zone → Mux (bytes) + Sanity (mux.videoAsset)
Visitor: /courses/[slug] SEO + locked curriculum
Enrolled: /dashboard/courses → GET /api/video/token → Mux Player
```

| Layer | Owns |
|---|---|
| **Sanity** | Course copy, modules, `isPreview`, Mux **reference** |
| **Mux** | File, HLS, signed stream |
| **Supabase** | Session, `course_enrollments`, `course_progress` |
| **Next.js** | Token route + player + dashboard |

**Hard rules**
- Sign the Mux **playback ID**, not the asset ID.
- Resolve `isPreview` and `playbackId` from Sanity on the **server**. Never trust `?preview=1` or `?asset=` from the client.
- Prefer `supabase.auth.getUser()` over `getSession()` for auth checks.
- Mux secrets stay server-side. No `NEXT_PUBLIC_MUX_*`.
- Sanity Free works for this flow. Mux is billed separately.

### 11.1 Packages + env

```bash
npm install @mux/mux-node @mux/mux-player-react jsonwebtoken
npm install -D @types/jsonwebtoken
```

(`sanity-plugin-mux-input` should already be installed in Phase 1.)

Extend `src/lib/env.ts` with `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_SIGNING_KEY_ID`, `MUX_SIGNING_PRIVATE_KEY`. Keep `VIDEO_PLATFORM=mux`. Unescape PEM `\n` when signing.

### 11.2 Studio plugin — signed uploads

In `src/sanity/sanity.config.ts`:

```typescript
import { muxInput } from 'sanity-plugin-mux-input'

plugins: [
  structureTool(),
  muxInput({
    video_quality: 'plus',
    max_resolution_tier: '1080p',
  }),
]
```

First time in `/studio` → **Videos → Configure plugin**:
- Paste Mux token ID + secret (stored as Sanity doc `secrets.mux` — non-root ID, editors only).
- **Enable Signed URLs** before any production (or even staging) uploads. Default plugin policy is **public** — paid courses would leak.
- DRM off for v1.

If uploads fail after toggling signed URLs: `sanity documents delete secrets.mux`, re-configure.

Editor workflow: record/edit offline → Course → module → drop MP4/MOV → wait until `status === "ready"` → set thumbnail time → `isPreview` only on free teasers → publish. Keep masters elsewhere.

### 11.3 Domain, GROQ, mapper

**Files:** `src/domain/course.ts`, `src/content/mappers/course.ts`, `src/lib/sanity.ts`

Extend the listing `Course` type with a detail shape (do not break catalogue cards):

```typescript
export type CourseModule = {
  index: number
  title: string
  duration: string
  isPreview: boolean
  playbackId?: string
  assetId?: string
  videoStatus?: 'preparing' | 'ready' | 'errored'
}

export type CourseDetail = Course & {
  modulesList: CourseModule[]
}
```

GROQ — expand the plugin reference; only treat `status == "ready"` as playable:

```groq
*[_type == "course" && slug.current == $slug && published == true][0] {
  slug, title, description, level, priceSar, thumbnail,
  modules[] {
    title, duration, isPreview,
    video {
      asset-> {
        assetId,
        playbackId,
        status,
        data { playback_ids[] { id, policy } }
      }
    }
  }
}
```

Mapper: locale → `title.en` / `title.ar`; copy `playbackId` / `assetId` from `video.asset`. Listing stays on `getCourses()`; detail uses `getCourseBySlug(slug, locale)`.

### 11.4 Sign playback IDs — `src/lib/mux.ts`

```typescript
import jwt from 'jsonwebtoken'
import { env } from '@/lib/env'

export function signMuxPlaybackId(playbackId: string, ttlSec = 3600) {
  const keyId = env.muxSigningKeyId()
  const privateKey = env.muxSigningPrivateKey()?.replace(/\\n/g, '\n')
  if (!keyId || !privateKey) throw new Error('Mux signing key missing')

  const now = Math.floor(Date.now() / 1000)
  return jwt.sign(
    { sub: playbackId, aud: 'v', exp: now + ttlSec, kid: keyId },
    privateKey,
    { algorithm: 'RS256' },
  )
}
```

Signed assets also need a thumbnail token (`aud: 't'`) if you render Mux posters before unlock. Skip posters or sign them server-side.

### 11.5 Video token Route Handler

**File:** `src/app/api/video/token/route.ts`

Gate: `FEATURE_VIDEO` off → 404. Then: session → load course + module **from Sanity** by `slug` + `moduleIndex` → allow if `module.isPreview` **or** `course_enrollments` row → sign `playbackId`.

```typescript
// GET /api/video/token?course=leadership&module=2
export async function GET(req: NextRequest) {
  if (!features.video) return NextResponse.json({ error: 'off' }, { status: 404 })

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const slug = req.nextUrl.searchParams.get('course')
  const moduleIndex = Number(req.nextUrl.searchParams.get('module'))
  if (!slug || Number.isNaN(moduleIndex) || moduleIndex < 0) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const course = await getCourseBySlugRaw(slug) // unpublished → 404
  const mod = course?.modules?.[moduleIndex]
  const playbackId = mod?.video?.asset?.playbackId
  if (!mod || !playbackId || mod.video.asset.status !== 'ready') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!mod.isPreview) {
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_slug', slug)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  }

  const token = signMuxPlaybackId(playbackId)
  return NextResponse.json({ playbackId, token })
}
```

SOW: previews may play without enrollment; still require login here unless product explicitly wants anonymous preview. Implement via `src/adapters/video/types.ts` (`resolvePlayback`) — UI must not import `@mux/mux-node`.

### 11.6 Player UI

**File:** `src/components/courses/LessonPlayer.tsx`

Public `/courses/[slug]`: accordion only. Preview CTA vs lock + Buy. Dashboard `/dashboard/courses` (add `[slug]` player if missing): enrolled lessons.

```tsx
'use client'
import MuxPlayer from '@mux/mux-player-react'

export function LessonPlayer({
  playbackId, token, title,
}: { playbackId: string; token: string; title: string }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={{ playback: token }}
      metadata={{ video_title: title }}
      streamType="on-demand"
      dir="auto"
      style={{ width: '100%', aspectRatio: '16 / 9' }}
    />
  )
}
```

Client: click lesson → `fetch('/api/video/token?course=…&module=…')` (cookies) → 401 login / 403 upsell / 200 mount player. Refresh token before expiry on long lessons. Do not embed unsigned `playbackId` URLs for paid modules.

### 11.7 Course progress

```sql
CREATE TABLE course_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  module_index INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, course_slug, module_index)
);
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read and write their own progress"
  ON course_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

On player `ended` (or ~90% watched): upsert progress. Dashboard reads it. Optional Route Handler: reject progress writes unless enrolled (or preview).

### 11.8 Flag + adapter

- `FEATURE_VIDEO=0` → no token route, no player, curriculum UI only.
- Staging: on after one test course + test enrollment.
- Production: on after AR/EN + mobile QA.

`src/adapters/video/types.ts` is the only Mux entry for the UI.

### 11.9 QA checklist

- [ ] Studio upload → Mux `ready` → `playback_ids[].policy === "signed"`.
- [ ] Anonymous cannot play paid modules (direct `/api/video/token`, forged `preview=1`, stolen `playbackId`).
- [ ] Preview plays per product rules.
- [ ] Enrolled user plays; progress survives refresh.
- [ ] Token expiry → refetch; playback continues.
- [ ] AR + EN + mobile (Safari iOS).
- [ ] `/studio` noindex.
- [ ] No Mux secrets in the client bundle.
- [ ] Unpublished course → 404. Video `preparing` → “Processing…”.

### 11.10 Common mistakes

| Mistake | Fix |
|---|---|
| Sanity `file` field instead of `mux.video` | Plugin type; bytes go to Mux |
| Public Mux playback | Enable signed URLs in the plugin **before** uploads |
| Sign `assetId` | Sign **playbackId** |
| Trust `?preview=1` / `?asset=` | Load module from Sanity |
| `getSession()` only | `getUser()` for auth checks |
| `NEXT_PUBLIC_MUX_*` | Server env only |
| Player before enrollments | Keep `FEATURE_VIDEO=0` |
| No master backup | Keep original files off Mux |

### 11.11 Exit Criteria

- [ ] Non-enrolled users cannot play non-preview modules (test with direct URL + token abuse).
- [ ] Preview modules play without enrollment (login still required unless product says otherwise).
- [ ] Progress persists across browser sessions.
- [ ] Both AR and EN course pages tested on mobile.

---

## 12. Phase 10 — Out of this phase

**Goal:** ~~Polish, unified reporting, customer support, and advanced automation.~~ **Not this delivery.**

Analytics, Desk, Sign, Marketing Automation, SalesIQ, PageSense, WorkDrive, and Connect are **out of scope**. Do not implement 12.1–12.4. Full list: [`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md) §3.

**Coach reviews remain in this phase** (Supabase, after a completed booking) — they are website/user data, not Zoho reporting.

### 12.1–12.4 Zoho expansion apps — **skip**

Reserved for a future SOW if SAH asks. Do not configure as acceptance criteria now.

### 12.5 Coach Reviews (Supabase) — **in this phase**

```sql
CREATE TABLE coach_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_slug TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE coach_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read reviews"
  ON coach_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews"
  ON coach_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
```

Wire the review form on the coach profile page (after a completed booking exists for that coach).

---

## 13. File Targets Quick Reference

```
src/
├── lib/
│   ├── sanity.ts                  Phase 1  ← Sanity client + GROQ helpers
│   ├── zoho.ts                    Phase 2  ← CRM/Campaigns/Bookings clients + token cache
│   ├── supabase.ts                Phase 5  ← Browser + server Supabase clients
│   ├── payments.ts                Phase 8  ← Moyasar + Tamara helpers
│   └── mux.ts                     Phase 9  ← signMuxPlaybackId (playback ID, RS256)
│
├── content/
│   └── mappers/
│       ├── coach.ts               Phase 1  ← Sanity → Coach
│       ├── course.ts              Phase 1 / 9  ← Sanity → Course + CourseDetail modules
│       └── home.ts                Phase 1  ← Sanity → SiteContent
│
├── adapters/
│   ├── zoho/
│   │   ├── forms.ts               Phase 2  ← submitDiscoveryLead etc. (implement stubs)
│   │   └── bookings.ts            Phase 7  ← getAvailableSlots, confirmBooking
│   ├── supabase/
│   │   └── auth.ts                Phase 5  ← signIn, signUp, signOut (implement stubs)
│   ├── payments/
│   │   └── index.ts               Phase 8  ← createCheckout adapter
│   └── video/
│       └── types.ts               Phase 9  ← resolvePlayback (Mux only; no Vimeo)
│
├── components/
│   └── courses/
│       └── LessonPlayer.tsx       Phase 9  ← Mux Player + signed token
│
├── app/
│   ├── studio/[[...tool]]/page.tsx Phase 1 ← Sanity Studio embed (+ muxInput)
│   └── api/
│       ├── revalidate/route.ts     Phase 1  ← ISR revalidation
│       ├── zoho/
│       │   ├── discovery/route.ts  Phase 2
│       │   ├── contact/route.ts    Phase 3
│       │   ├── group/route.ts      Phase 3
│       │   ├── community/route.ts  Phase 2
│       │   └── program/route.ts    Phase 3
│       ├── newsletter/route.ts     Phase 3
│       ├── auth/
│       │   └── onboard/route.ts    Phase 5  ← CRM Contact + profile creation
│       ├── bookings/
│       │   └── confirm/route.ts    Phase 8  ← Post-payment booking confirmation
│       ├── payments/
│       │   ├── moyasar/route.ts    Phase 8
│       │   ├── moyasar/webhook/route.ts  Phase 8
│       │   ├── tamara/route.ts     Phase 8
│       │   └── tamara/webhook/route.ts   Phase 8
│       └── video/
│           └── token/route.ts      Phase 9  ← Sanity module + enrollment → sign playbackId
│
└── middleware.ts                   Phase 5  ← Dashboard session guard
```

---

## 14. Environment Variables Reference

```bash
# ────────── Site ──────────
NEXT_PUBLIC_SITE_URL=https://sah.com.sa

# ────────── Feature flags ──────────
FEATURE_CMS=0
FEATURE_AUTH=0
FEATURE_ZOHO_FORMS=0
FEATURE_NEWSLETTER=0
FEATURE_BOOKINGS=0
FEATURE_CHECKOUT=0
FEATURE_VIDEO=0
FEATURE_SALESIQ=0          # keep off — out of this phase
FEATURE_ANALYTICS=0        # keep off — out of this phase

# ────────── Sanity (Phase 1) ──────────
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=staging          # or "production"
SANITY_API_READ_TOKEN=
SANITY_REVALIDATE_SECRET=                   # random 32-char string for webhook auth

# ────────── Zoho One (Phase 2) ──────────
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_API_BASE=https://www.zohoapis.sa       # SA DC — confirmed from one.zoho.sa
ZOHO_CAMPAIGNS_LIST_KEY=                    # Phase 3

# ────────── Zoho SalesIQ (Phase 3) ──────────
NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET=

# ────────── Zoho PageSense (Phase 3) ──────────
NEXT_PUBLIC_PAGESENSE_ID=

# ────────── Supabase (Phase 5) ──────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ────────── Payments — Moyasar + Tamara (Phase 8) ──────────
NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=
MOYASAR_SECRET_KEY=
MOYASAR_WEBHOOK_SECRET=
TAMARA_API_TOKEN=
TAMARA_NOTIFICATION_TOKEN=

# ────────── Video — Mux (Phase 9) ──────────
VIDEO_PLATFORM=mux
MUX_TOKEN_ID=                    # server only — never NEXT_PUBLIC_
MUX_TOKEN_SECRET=
MUX_SIGNING_KEY_ID=
MUX_SIGNING_PRIVATE_KEY=         # PEM; use \n for newlines in Vercel
```

---

## 15. Feature Flags Reference

| Flag | System | Flips in Phase | What it enables |
|---|---|---|---|
| `FEATURE_CMS` | Sanity | Phase 2 (coaches) | Live coach/course data from Sanity instead of static catalog |
| `FEATURE_ZOHO_FORMS` | Zoho CRM | Phase 2 | Discovery + Community + Group + Contact + Program forms → CRM |
| `FEATURE_NEWSLETTER` | Zoho Campaigns | Phase 3 | Newsletter subscribe → Campaigns list |
| `FEATURE_SALESIQ` | Zoho SalesIQ | **Out of this phase** | Keep `0` — live chat excluded |
| `FEATURE_ANALYTICS` | Zoho Analytics | **Out of this phase** | Keep `0` — reporting excluded |
| `FEATURE_AUTH` | Supabase | Phase 5 | Login, register, session guard, dashboard |
| `FEATURE_BOOKINGS` | Zoho Bookings | Phase 7 | Real slot picker on coach profiles |
| `FEATURE_CHECKOUT` | Moyasar + Tamara | Phase 8 | Course + coaching payment |
| `FEATURE_VIDEO` | Mux | Phase 9 | Signed course video playback (token route + player). Keep `0` until enrollments exist. |

---

## 16. Staging vs Production Habits

| Change type | Staging | Production |
|---|---|---|
| Schema / Studio | Always first | Deploy Studio route after staging QA |
| Content | Author in `staging` Sanity dataset | Promote or re-publish to `production` |
| Feature flags | Enable early | Enable only after staging E2E passes |
| Zoho CRM | Test leads tagged `[TEST]` | Real lists / inboxes |
| Zoho Campaigns | Use a test list | Real subscriber list |
| Webhooks | Staging URLs in Zoho Flow / payment providers | Swap to production URLs at go-live |
| Supabase | Staging Supabase project | Production Supabase project |
| Payments | Moyasar/Tamara test mode | Live mode (after SAH sign-off) |
| Mux | Staging library + signed uploads; `FEATURE_VIDEO` on after test enrollment | Same assets or re-upload to prod Mux env; flag on after AR/EN + mobile QA |

---

## 17. SEO Checklist (per content phase)

Run this checklist every time a new route or content type goes live:

- [ ] Unique `<title>` and `<meta name="description">` per locale
- [ ] `alternates.languages` configured: AR unprefixed (`/`), EN at `/en/*`
- [ ] Canonical URL matches locale URL rules
- [ ] JsonLD matches visible content (validate at [search.google.com/test/rich-results](https://search.google.com/test/rich-results))
- [ ] Sitemap includes new public slugs + `hreflang` entries
- [ ] `/auth`, `/dashboard`, `/studio` not indexed (`noindex` + `robots.txt` disallow)
- [ ] Image `alt` text in correct locale
- [ ] Sanity CDN allowlisted in `next.config.ts` image config
- [ ] Both AR + EN locales published before promoting any URL
- [ ] On-demand revalidation tested: publish in Studio → page updates within 30 seconds on staging

---

*This plan is the step-by-step integration north star. Binding scope: [`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md). Architecture: [`ZOHO_FIRST_ARCHITECTURE.md`](./ZOHO_FIRST_ARCHITECTURE.md). Original integration guide: [`BACKEND_IMPLEMENTATION_GUIDE.md`](./BACKEND_IMPLEMENTATION_GUIDE.md).*
