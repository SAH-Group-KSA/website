# Meta (Facebook + Instagram) — setup and operating guide

Audience: whoever administers SAH's Meta Business portfolio and ads, plus any developer
changing analytics code.

One Pixel (dataset) serves the whole site and all six sub-brands. Instagram ads use the same
Pixel — there is no separate Instagram tracking code. The website links to the Instagram and
Facebook profiles from the footer.

---

## What the site sends

Nothing is sent to Meta unless **all** of these hold: `FEATURE_ANALYTICS=1`, a valid
`NEXT_PUBLIC_META_PIXEL_ID`, and the visitor clicked **Accept** on the cookie banner.

| Site action                                            | Meta event                  | Browser Pixel | Server (CAPI) |
| ------------------------------------------------------ | --------------------------- | ------------- | ------------- |
| Any page view (incl. client-side nav)                  | `PageView`                  | ✅            | —             |
| Contact / discovery / group / program / community form | `Lead`                      | ✅            | ✅            |
| Apply-as-coach form (spam filtered out)                | `SubmitApplication`         | ✅            | ✅            |
| Newsletter signup                                      | `NewsletterSignup` (custom) | ✅            | ✅            |
| Click on an email (`mailto:`) link                     | `Contact`                   | ✅            | —             |
| Account sign-up (when auth is on)                      | `CompleteRegistration`      | ✅            | —             |

Every event carries these parameters, usable in Custom Conversions:

| Parameter          | Values                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `brand`            | `group`, `human`, `seera`, `nexus`, `connect`, `lego`, `impact` (the page's sub-brand)                                                     |
| `content_category` | Lead: `contact` / `discovery` / `group` / `program` / `community`. Coach: `coach_application`. Newsletter: `footer` / `inline` / `default` |
| `content_name`     | Program id on program leads; link id on `Contact`                                                                                          |
| `language`         | `ar` / `en`                                                                                                                                |

**Deduplication:** form events are sent from both the browser and the server with the same
`event_id`, so Meta counts each once. In Events Manager → Overview, the event shows
"Browser • Server" with deduplication.

**Server-side data:** email, phone and name are SHA-256 hashed before sending; plus IP, user
agent, page URL and Meta's `_fbp` / `_fbc` cookies. If `_fbc` is missing, it is rebuilt from
the `fbclid` captured by first-touch attribution.

Code: `src/adapters/analytics/meta.ts` (event mapping, shared), `src/adapters/analytics/track.ts`
(browser), `src/adapters/meta/capi.ts` + `reportConversion()` in `src/app/api/zoho/_helpers.ts`
(server), `src/components/analytics/AnalyticsScripts.tsx` (Pixel loader, consent revoke).

---

## Setup steps (Meta side)

1. **Business portfolio** — business.facebook.com → Settings. Confirm it is owned by SAH and
   you are an admin.
2. **Facebook Page** — Settings → Accounts → Pages → Add.
3. **Instagram** — Settings → Accounts → Instagram accounts → Add → log in. The account must
   be a **Professional (Business)** account (IG app → Settings → Account type).
4. **Ad account** — Settings → Accounts → Ad accounts. Currency **SAR**, time zone
   **Asia/Riyadh** (cannot be changed later). Add a payment method.
5. **Pixel / dataset** — Events Manager → Connect data sources → Web → name "SAH Website".
   When offered installation options, choose manual / skip: **do not paste Meta's code into
   the site**, it is already there. Copy the dataset ID (digits only).
6. **Conversions API token** — Events Manager → the dataset → Settings → Conversions API →
   Generate access token. This is a secret: put it straight into Vercel, nowhere else.
7. **Domain verification** — Settings → Brand safety → Domains → Add `sah.com.sa` → DNS TXT
   record. Add the TXT record at the DNS host, wait for propagation, click Verify.
8. **Connect assets** — Settings → Data sources → Datasets → SAH Website → Connected assets →
   add the ad account (and Page / Instagram if offered).

## Vercel environment variables

| Variable                    | Production | Preview    | Notes                                                                                                           |
| --------------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| `FEATURE_ANALYTICS`         | `1`        | `1`        | Also enables any other analytics tool whose ID is set — check GA4 / PostHog / LinkedIn / PageSense values first |
| `NEXT_PUBLIC_META_PIXEL_ID` | dataset ID | dataset ID |                                                                                                                 |
| `META_CAPI_ACCESS_TOKEN`    | token      | token      | Server-only secret                                                                                              |
| `META_CAPI_TEST_EVENT_CODE` | **unset**  | test code  | Events with it are excluded from ad reporting                                                                   |

`NEXT_PUBLIC_*` values are inlined at build time — **redeploy** after changing them.

## Verify

1. Install the **Meta Pixel Helper** Chrome extension.
2. Open the Preview deployment, accept cookies → Pixel Helper shows `PageView`.
3. Events Manager → Test events (with the test code set on Preview) → submit a form →
   `Lead` appears twice (Browser and Server) with the same event ID, marked deduplicated.
4. Decline cookies in a fresh window → Pixel Helper shows nothing; submit a form → no server
   event appears.

## After go-live

- Events Manager → Custom conversions: e.g. "Seera leads" = `Lead` where `brand` = `seera`.
- Optimise lead campaigns on `Lead` (or a Custom Conversion), not on `Contact`.
- Optional: Instant Form lead ads → Zoho CRM via CRM → Setup → Marketplace → Facebook
  (independent of the website).
