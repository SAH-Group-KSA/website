# Zoho PageSense — setup and operating guide

Audience: whoever administers the SAH PageSense project (marketing / growth), plus any
developer changing analytics code.

The **code side is complete and verified**. Everything below is dashboard configuration.

Most of it is UI-only. PageSense does expose a REST API that can create custom events and
project-level goals, but the site's Zoho OAuth token is scoped to CRM and Campaigns only
(`ZohoCRM.modules.ALL`, `ZohoCampaigns.contact.*`) — using it would mean adding a PageSense
scope and regenerating the refresh token. For three goals that is slower than clicking
through the UI. See [Appendix: doing this by API](#appendix-doing-this-by-api) if you would
rather automate it.

|                  |                                                  |
| ---------------- | ------------------------------------------------ |
| PageSense portal | `sahportal`                                      |
| Project key      | `0fe41457ecb44b8e965b49447b79302a`               |
| Project name     | `my-project` ← rename this (step 6)              |
| Production site  | `https://sah.com.sa`                             |
| Arabic URLs      | unprefixed — `https://sah.com.sa/discovery`      |
| English URLs     | `/en` prefix — `https://sah.com.sa/en/discovery` |

---

## What the site already sends

| Signal                                             | Status                | Where                                                          |
| -------------------------------------------------- | --------------------- | -------------------------------------------------------------- |
| Consent handshake (`zpc<projectKey>` cookie)       | ✅ live               | `src/components/analytics/AnalyticsScripts.tsx`                |
| Basic web analytics (pageviews, sessions, sources) | ✅ live               | PageSense tag, `is_full_tracking_enabled: true`                |
| SPA soft navigations                               | ✅ native             | PageSense patches `pushState`/`replaceState`/`popstate` itself |
| Visitor attributes `locale`, `direction`, `brand`  | ✅ live               | `AnalyticsScripts.tsx` → `trackUser`                           |
| Conversion events (goal + funnel step)             | ✅ sent               | `src/adapters/analytics/track.ts` → `trackEvent`               |
| Session-recording tags on conversions              | ✅ sent               | `track.ts` → `tagRecording`                                    |
| Heatmaps / scroll maps                             | ⚠️ **not configured** | dashboard — step 2                                             |
| Goals / funnels                                    | ⚠️ **not configured** | dashboard — steps 1 and 3                                      |
| Form analytics                                     | ⚠️ **not configured** | dashboard — step 4                                             |
| Session recordings                                 | ⚠️ **not configured** | dashboard — step 5                                             |

The warning rows are why the dashboard looks thin. The tag is loading and tracking, but
PageSense only collects heatmap/recording/goal data for things you have explicitly created
— with no heatmap defined, its heatmap script never even loads.

---

## Step 1 — Create the Goals

**Goals → New Goal → Custom Event.** The wizard asks for three things, in this order:

1. **A descriptive name for the goal** — free text, just a label; nothing depends on it
2. **The URL** of the page to track the event on → **enter `*`**
3. **The custom event name** — type it, then click **+ Create "<name>"**

There is no "Description" field and no "Apply to" field; the URL step is what scopes the
goal. Only three site events actually fire today, so create these three and nothing else:

| Goal name (your label) | URL | Custom event name (must match **exactly**) |
| ---------------------- | --- | ------------------------------------------ |
| Lead submitted         | `*` | `lead_submitted`                           |
| Newsletter subscribed  | `*` | `newsletter_subscribed`                    |
| CTA click              | `*` | `cta_click`                                |

**On the URL step**, either of these works — they are equivalent in effect:

| Option      | What to enter            | Notes                                                          |
| ----------- | ------------------------ | -------------------------------------------------------------- |
| Starts with | `https://www.sah.com.sa` | **What is configured today.** Verified correct — see below.    |
| Wildcard    | `*`                      | Also fine; skips URL matching entirely for custom-event goals. |

What must **not** happen is pinning a goal to a single page. `lead_submitted` fires from five
different pages (`/discovery`, home, `/coaches/group`, `/community/apply`, `/program/<id>`)
across both locales, and `newsletter_subscribed` fires from the footer on every page.

> **The existing "Starts with `https://www.sah.com.sa`" setting is correct — do not change
> it.** The tag strips `https://`, `http://` and `www.` from both sides before comparing, so
> it matches `sah.com.sa/...` and `www.sah.com.sa/...` equally, on every page of the site.
> A useful side effect: it does **not** match `localhost` or Vercel preview domains, so local
> and preview traffic never pollutes your conversion numbers.

> ### Ignore the code snippet PageSense shows you
>
> After you create the event, the wizard displays an "event API code" snippet and tells you
> to paste it into your page. **Do not paste it anywhere.** The site already fires these
> events from `src/adapters/analytics/track.ts` — that is what this integration is. Pasting
> the snippet would at best do nothing and at worst double-count. Click through to
> **Launch**.

> **Do not rename the event names.** They are the contract between
> `src/adapters/analytics/events.ts` and this dashboard. Rename one in either place and the
> goal silently stops counting, with no error anywhere. The goal _label_ is yours to write
> however you like.

`lead_submitted` and `newsletter_subscribed` are the two that carry real volume.
`cta_click` currently has exactly one trigger in the whole site (`contact-section-email`),
so expect low numbers — it is worth creating, but it is not a primary KPI yet.

### Events that exist in code but do not fire yet — do not create goals for these

| Event                                                                     | Why it is dormant                                                                                               |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `wizard_step`                                                             | Declared in `events.ts` but has **no call site**. The discovery form is a single form, not a multi-step wizard. |
| `auth_sign_in` / `auth_sign_up` / `auth_reset_password` / `auth_sign_out` | Auth is behind `FEATURE_AUTH`, which is off.                                                                    |
| `checkout_started`                                                        | Payments (Moyasar/Tamara) are stubbed.                                                                          |
| `booking_confirmed`                                                       | Zoho Bookings is stubbed.                                                                                       |

Creating goals for these produces permanently empty reports. Come back when the feature
ships — the code already fires them, so the goal is all that will be needed.

---

## Step 2 — Heatmaps

**PageSense → Heatmaps → Create Heatmap.** URL match type: **Simple match** — _not_ Exact
match.

PageSense's three match types behave like this (read off the tag's own matcher):

| Match type       | Ignores protocol / `www` | Ignores `?query` and `#fragment` | Supports `*` |
| ---------------- | ------------------------ | -------------------------------- | ------------ |
| **Simple match** | yes                      | **yes**                          | no           |
| Exact match      | yes                      | **no**                           | no           |
| Wildcard match   | yes                      | partly                           | yes          |

"Exact match" therefore requires the query string to match too, so a visitor arriving on
`/discovery?utm_source=instagram` would **not** be counted. Since most campaign traffic
carries UTMs, Simple match is the right default for every heatmap below.

Create Arabic and English as **separate heatmaps**. This is not housekeeping: Arabic
renders RTL and English LTR, so the two are mirror images of each other. Pooling them
averages two opposite layouts into noise. Name them with the locale so nobody merges them
later.

**Start with these six** (highest traffic and the conversion path):

| Heatmap name     | URL                               |
| ---------------- | --------------------------------- |
| `Home — AR`      | `https://sah.com.sa/`             |
| `Home — EN`      | `https://sah.com.sa/en`           |
| `Discovery — AR` | `https://sah.com.sa/discovery`    |
| `Discovery — EN` | `https://sah.com.sa/en/discovery` |
| `Coaches — AR`   | `https://sah.com.sa/coaches`      |
| `Coaches — EN`   | `https://sah.com.sa/en/coaches`   |

**Add later if quota allows:**

| Page            | Arabic             | English               |
| --------------- | ------------------ | --------------------- |
| Courses         | `/courses`         | `/en/courses`         |
| Group coaching  | `/coaches/group`   | `/en/coaches/group`   |
| Community apply | `/community/apply` | `/en/community/apply` |
| SAH Human       | `/sah-human`       | `/en/sah-human`       |
| Seera           | `/seera`           | `/en/seera`           |
| SAH Nexus       | `/sah-nexus`       | `/en/sah-nexus`       |
| SAH Sponsor     | `/sah-sponsor`     | `/en/sah-sponsor`     |
| Lego by SAH     | `/lego-by-sah`     | `/en/lego-by-sah`     |
| SAH Impact      | `/sah-impact`      | `/en/sah-impact`      |

Do **not** create a wildcard heatmap on `https://sah.com.sa/*` — it will swallow every page
into one unreadable map, and the six sub-brands have completely different layouts.

The coach, course and program detail pages (`/coaches/<slug>`, `/courses/<slug>`,
`/program/<id>`) are dynamic. Skip them for now: that area of the site is under
reconsideration, and per-slug heatmaps would need recreating afterwards.

### Segmenting a heatmap

Once data arrives, the site's visitor attributes are available as heatmap/report filters:

| Attribute   | Values                                                 |
| ----------- | ------------------------------------------------------ |
| `locale`    | `ar`, `en`                                             |
| `direction` | `rtl`, `ltr`                                           |
| `brand`     | `human`, `seera`, `nexus`, `connect`, `lego`, `impact` |

Use `direction` as a sanity check — if a heatmap shows both `rtl` and `ltr` visitors, its
URL rule is too loose and the map is mixing mirrored layouts.

---

## Step 3 — Funnels

**PageSense → Funnels → Create Funnel.** The events already fire, so this is pure
dashboard work.

**Funnel 1 — Discovery (the main conversion path)**

| Step | Type                | Value                          |
| ---- | ------------------- | ------------------------------ |
| 1    | Page URL            | `https://sah.com.sa/discovery` |
| 2    | Goal / custom event | `lead_submitted`               |

Build the English one separately with `https://sah.com.sa/en/discovery`.

**Funnel 2 — Home to lead**

| Step | Type                | Value                          |
| ---- | ------------------- | ------------------------------ |
| 1    | Page URL            | `https://sah.com.sa/`          |
| 2    | Page URL            | `https://sah.com.sa/discovery` |
| 3    | Goal / custom event | `lead_submitted`               |

There is no intermediate wizard step to add — `wizard_step` never fires (see step 1).

---

## Step 4 — Form Analytics

**PageSense → Form Analytics → Add Form.** This gives per-field drop-off and time-on-field,
which is the single most actionable report for a lead-gen site and something neither
PostHog nor GA4 provides.

These are the site's real forms, with the exact field names PageSense will show:

| Form                    | Page (AR / EN)                             | CSS selector      | Fields                                                                          |
| ----------------------- | ------------------------------------------ | ----------------- | ------------------------------------------------------------------------------- |
| **Discovery request** ★ | `/discovery` · `/en/discovery`             | `form.dreq-form`  | `name`, `email`, `phone`, `audience`, `need`, `pathway`                         |
| **Contact** ★           | `/` · `/en` (section `#contact`)           | `#contact form`   | `name`, `email`, `phone`, `organization`, `clientType`, `context`, `challenge`  |
| Community application   | `/community/apply` · `/en/community/apply` | `form.apply-form` | `name`, `email`, `phone`, `profession`, `experience`, `motivation`, `community` |
| Group interest          | `/coaches/group` · `/en/coaches/group`     | `form.apply-form` | `name`, `email`, `phone`, `org`, `program`, `message`                           |
| Program interest        | `/program/<id>`                            | `form`            | `name`, `email`, `phone`, `org`, `message`                                      |
| Newsletter              | site-wide (footer)                         | `footer form`     | `newsletterFirstName`, `newsletterLastName`, `newsletterEmail`                  |

★ = start with these two. They are the longest forms and the ones on the conversion path,
so they have the most drop-off to recover.

Note that **Community application and Group interest share the class `apply-form`** but live
on different pages — set the page URL on each so PageSense keeps them apart.

---

## Step 5 — Session recordings

**Read "One recorder, not two" below before enabling this.**

If you do enable it: **PageSense → Session Recordings → Create**, scoped to
`https://sah.com.sa/discovery` and `https://sah.com.sa/en/discovery` rather than the whole
site. Recordings burn plan quota fast and most home-page sessions teach you nothing.

The site already tags recordings automatically, so you can filter straight to sessions that
converted instead of scrubbing by hand. Available tags:

`lead_submitted` · `newsletter_subscribed` · `auth_sign_up` · `checkout_started` ·
`booking_confirmed`

(The last three are dormant until those features ship.)

---

## Step 6 — Housekeeping

- **Rename the project** from `my-project` to `sah-website` (Settings → Project).
- **Domain allowlist**: confirm it includes `sah.com.sa`. Add your Vercel preview domain
  only if you want preview traffic in the same reports — usually you do not.
- **Privacy → consent**: leave as it is (currently "no consent needed"). The site's own
  cookie banner is the real gate — the PageSense tag is not injected at all until the
  visitor accepts, and the site then writes PageSense's consent cookie on their behalf. If
  this is ever switched back to "ask for consent", everything still works; that path is
  handled and tested.
- **Exclude internal traffic**: add your team's office/VPN IPs under Settings → Exclude
  visitors, otherwise your own QA clicks will dominate early heatmaps.

---

## One recorder, not two — a decision worth making

The site currently runs **PostHog session recording** (live,
`disable_session_recording: false`). If you also enable PageSense session recording, every
visitor is recorded twice: double client CPU and upload bandwidth, double storage cost, and
two places to look for the same session.

Recommended split for a Zoho-centric marketing site:

- **PageSense** → CRO: heatmaps, scroll maps, form analytics, A/B tests, polls/popups,
  funnels. Things PostHog does not do well or at all, and already paid for in Zoho One.
- **PostHog** → product analytics and **session recording** (keep the one that works).

So: do steps 1–4, skip step 5. If you would rather watch recordings in Zoho next to CRM
data, that is legitimate — but then turn PostHog recording off in `AnalyticsScripts.tsx`
(`disable_session_recording: true`) instead of running both.

Your call; the site works either way.

---

## Testing before you deploy

The goals are scoped "starts with `https://www.sah.com.sa`", so they can never fire on
`localhost` — which is correct behaviour, but it means a plain local test cannot prove them.
To test the real thing locally, serve the production build under the real hostname by
overriding DNS **in the browser only** (nothing on your machine changes):

```bash
npm run build && npm run start          # production build, port 3000

# then launch a throwaway Chrome that resolves the domain to localhost:
open -na "Google Chrome" --args \
  --user-data-dir=/tmp/sah-test \
  --host-resolver-rules="MAP sah.com.sa 127.0.0.1, MAP www.sah.com.sa 127.0.0.1" \
  http://sah.com.sa:3000/en/discovery
```

Accept the cookie banner, complete the discovery wizard, submit the form, then in the
console:

```js
window.ZAB.goalsAchieved.map((k) => window.ZAB.data.goal[k].custom_event_name);
// → ["lead_submitted"]
```

**Careful:** a real submission this way creates a real lead in Zoho CRM. To exercise the
full client path without writing to Zoho, block the API route in DevTools (Network →
right-click the `/api/zoho/discovery` request → Block request URL) — the adapter treats a
blocked request as a failure, so instead override it with a fake success using a local
override or a request-interception script.

Traffic from this test does reach PageSense and will appear in your reports as real
conversions, so do it sparingly or discount the numbers for that day.

## Verifying it works

On `https://sah.com.sa`, accept the cookie banner, then open the browser console:

```js
// 1. Consent handshake reached PageSense
document.cookie.match(/zpc[0-9a-f]+=\d/); // → ["zpc0fe4…=2"]

// 2. Tracking actually started (not just the tag loaded)
window.ZAB.data.privacy_value; // → 1
typeof window.ZAB.zab; // → "object"

// 3. Your new goals are now in the config
Object.keys(window.ZAB.data.goal); // → non-empty once step 1 is done

// 4. Fire a test conversion by hand
window.pagesense.push(["trackEvent", "lead_submitted"]);
window.ZAB.funnel_queue; // → [{step_name: "lead_submitted", …}]
```

Goals and funnel steps are batched and flushed on PageSense's 30-second heartbeat, so allow
a minute before checking the dashboard. Reports typically lag live traffic by a few minutes.

If `window.ZAB` is undefined: the visitor declined cookies, `FEATURE_ANALYTICS` is not `1`,
or `NEXT_PUBLIC_ZOHO_PAGESENSE_SRC` is unset in the Vercel environment.

---

## Possible next step (not implemented)

`identifyUser` would tie PageSense sessions to a known account, so recordings and funnels
could be traced to a specific person. Deliberately **not** wired up yet: the site does not
identify users to any analytics provider today (PostHog `identify` is also unused), auth is
behind `FEATURE_AUTH`, and all of `/dashboard` except `/profile` is hard-redirected. Worth
doing when the authenticated area ships — `pageSenseIdentify()` in
`src/adapters/zoho/pagesense.ts` is ready for it.

---

## For developers

The PageSense command helpers live in `src/adapters/zoho/pagesense.ts`:

```ts
pageSenseTrackGoal(name); // goal + funnel step + poll/popup trigger
pageSenseTagRecording(tag); // make a session findable
pageSenseSetUser(attributes); // segment heatmaps/funnels/recordings
pageSenseIdentify(userId); // stable cross-device id (unused so far)
```

Do not call these from components. Add the event to `src/adapters/analytics/events.ts` and
let `track()` fan it out to every provider at once — that is what keeps GA4, Meta, PostHog
and PageSense from drifting apart. Then create a matching goal in the dashboard, using the
event name verbatim.

The helpers push onto `window.pagesense`, which is created **only** by the consent-gated
inline script. That absence is the consent guarantee: after a decline, every helper is a
no-op with no extra check.

---

## Appendix: doing this by API

PageSense has a REST API that can create custom events and project-level goals. It is not
worth it for three goals, but it is the right tool if you ever need to recreate a project
or manage many events.

Your account is on the **SA** data centre (the tag loads from `cdn-sa.pagesense.io` and
reports to `pagesense.zoho.sa`), so use the `.sa` host, not the `.com` one in Zoho's docs:

```bash
POST https://pagesense.zoho.sa/pagesense/rest/v1/portal/sahportal/customevents
Authorization: Zoho-oauthtoken {access_token}
Content-Type: application/json

{ "customevent": { "event_name": "lead_submitted", "project_linkname": "my-project" } }
```

`project_linkname` is `my-project` today; **if you rename the project in step 6, this value
changes too.**

To use it you would need to:

1. In [Zoho API Console](https://api-console.zoho.sa/), edit the existing Self Client / app
   and add the scope `PageSense.customevents.CREATE` (plus the equivalent goals scope) on
   top of the current `ZohoCRM.modules.ALL` and `ZohoCampaigns.contact.ALL`.
2. Regenerate `ZOHO_REFRESH_TOKEN` through the consent flow — **keeping the existing CRM and
   Campaigns scopes**, or lead capture and the newsletter will break.
3. Update `ZOHO_REFRESH_TOKEN` in `.env.local` and in Vercel.

Step 2 is the risky part: a regenerated token missing a scope silently breaks lead capture.
Unless you need the API for something else, use the UI.

Sources: [Create a custom event goal](https://help.zoho.com/portal/en/kb/pagesense/setup-goals/articles/create-custom-event-goals)
· [Goals API overview](https://www.zoho.com/pagesense/developerguide/apidocs/goalsapioverview.html)
· [Create Custom Event API](https://www.zoho.com/pagesense/developerguide/apidocs/createeventsapi.html)
