# SAH Group — Implementation Timeline

> 1 developer. Zoho access, Moyasar, and Tamara in hand.  
> **Start:** Mon 17 Aug 2026 · **Full-site target:** Fri 4 Sep 2026  
> **Scope:** [`SCOPE_OF_WORK.md`](./SCOPE_OF_WORK.md)

---

## Numbers

| Track | BD | Dates | Ships |
|---|---|---|---|
| **P0–P3** | **6** | 17–24 Aug | CRM leads, newsletter, CMS coaches |
| **P4–P5** | **4** | 24–28 Aug | marketing in Sanity, login / dashboard |
| **P6–P9** | **5** | 31 Aug – 4 Sep | courses, bookings, checkout, video |
| **Full site** | **15** | 17 Aug → **4 Sep** | ~3 weeks |

```
W1  17–21 Aug   P0 P1 P2 P3     → live forms + CMS coaches
W2  24–28 Aug   P3 P4 P5        → newsletter, auth, marketing
W3  31 Aug–4 Sep P6 P7 P8 P9    → courses, bookings, pay, video
```

Staging first. Prod only after staging pass. Flags off = disabled / coming soon — never fake success.

---

## Calendar

### Week 1 — 17–21 Aug

| BD | Date | P | Hours | Goes live |
|---|---|---|---|---|
| 1 | Mon 17 | **0** | ~5h | Staging. Sanity + Supabase + Mux accounts. Flags off. |
| 2 | Tue 18 | **1** | ~5h | `/studio` + schemas (Coach, Course, SEO). Publish webhook. |
| 3 | Wed 19 | **2** | ~5h | CRM OAuth + fields. Discovery + community APIs on **staging**. |
| 4 | Thu 20 | **2** | ~5h | Coaches → Sanity. ZeptoMail (6 templates × AR+EN). |
| 5 | Fri 21 | **2+3** | ~5h | **Prod:** Discovery + community + CMS coaches. Newsletter + remaining form APIs. |

### Week 2 — 24–28 Aug

| BD | Date | P | Hours | Goes live |
|---|---|---|---|---|
| 6 | Mon 24 | **3+5** | ~5h | **Prod:** newsletter DOI+welcome. Group / Contact / Programme → CRM. Auth start. |
| 7 | Tue 25 | **5** | ~5h | Register / login / reset + dashboard guard on **staging**. |
| 8 | Wed 26 | **5+4** | ~5h | **Prod:** login / dashboard / CRM Contact. Marketing seed: SEO, FAQ, companies, programmes. |
| 9 | Thu 27 | **4** | ~5h | Homepage sections in Studio (AR+EN). |
| 10 | Fri 28 | **4** | ~5h | Nav. **Prod:** all marketing from Sanity. |

### Week 3 — 31 Aug – 4 Sep *(1st week of September)*

| BD | Date | P | Hours | Goes live |
|---|---|---|---|---|
| 11 | Mon 31 | **6** | ~5h | `/courses/[slug]` built + seeded. Buy off until P8. |
| 12 | Tue 1 | **6+7** | ~5h | **Prod:** course pages (SEO). Bookings slot picker on staging. |
| 13 | Wed 2 | **7+8** | ~5h | Real slots + reminders. Moyasar + Tamara APIs + webhooks. |
| 14 | Thu 3 | **8+9** | ~5h | **Prod:** checkout + paid booking confirm. Mux player on staging. |
| 15 | Fri 4 | **9** | ~4h | **Prod target:** signed playback + previews + progress. Slip absorb. |

---

## Phase counts

| P | BD | Prod | Ships |
|---|---|---|---|
| 0 | 1 | — | Staging; all flags `0` |
| 1 | 1 | — | `/studio`; Coach/Course/SEO schemas; publish ~30s |
| 2 | 3 | **Fri 21** | Discovery + community → CRM. 12 ZeptoMail templates. Coaches from Sanity. |
| 3 | 2 | **Mon 24** | Newsletter DOI+welcome. Group / Contact / Programme → CRM |
| 4 | 3 | **Fri 28** | Homepage (15 sections) + 6 entities + programmes + FAQ + nav → Sanity |
| 5 | 2 | **Wed 26** | Register/login/reset. Dashboard guard. Profile + CRM Contact |
| 6 | 2 | **Tue 1 Sep** | `/courses/[slug]` SEO. Buy on with P8. |
| 7 | 2 | **Thu 3 Sep** | Real slots. Paid confirm. Reminders. `/dashboard/bookings` |
| 8 | 2 | **Thu 3 Sep** | Moyasar + Tamara. Enrollments. Paid coaching confirm |
| 9 | 2 | **Fri 4 Sep** | Signed Mux. Previews. Progress |
| 10 | 0 | — | Out of phase (chat, reporting, extra Zoho apps) |

**P2 CRM:** 5 lead types · 1 Applications module (3 statuses) · visitor mail **&lt;60s**.

**P4 order:** SEO → FAQ → 6 company pages → programmes → 15 homepage sections → nav.

Coach reviews = this phase (Supabase, after completed booking). Not P10.

---

## Slip (+days)

| If | Prod moves |
|---|---|
| DKIM not live by Fri 21 | P2 prod **+1–2** (staging mail ok; W2 absorbs) |
| RTL/content issues in P4 | **+1–2** (W3 still hits 4 Sep) |
| Payment sandbox quirks | P8 **+1** (checkout Fri 4, video same day or drop progress UI) |

Fri 4 is the hard end. Unused hours that day stay unused — no extra scope.

---

## Sign-off

| # | | ☐ |
|---|---|---|
| 1 | Start **Mon 17 Aug 2026** | |
| 2 | Forms + CMS coaches **Fri 21 Aug** | |
| 3 | Auth + marketing **Fri 28 Aug** | |
| 4 | Full site (courses, bookings, checkout, video) **Fri 4 Sep 2026** | |
