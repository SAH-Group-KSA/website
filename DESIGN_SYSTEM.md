# SAH Group — Design System

> **Extracted from the live site.** This is a standardization of what already ships — not a redesign.  
> **CSS source of truth:** [`src/styles/design-tokens.css`](./src/styles/design-tokens.css) (`:root` / Group)  
> **Company skins:** [`src/styles/brand-themes.css`](./src/styles/brand-themes.css) (`data-theme`)  
> **Theming how-to:** [`docs/theming.md`](./docs/theming.md)  
> **Brand sheets:** [`COLOR_PALETTE.md`](./COLOR_PALETTE.md)  
> **Additive primitives:** [`src/styles/design-system.css`](./src/styles/design-system.css)  
> **Prototype components:** [`src/styles/prototype-parity.css`](./src/styles/prototype-parity.css) (existing `.button`, `.section`, cards…)  
> **Tailwind mirror:** [`tailwind.config.ts`](./tailwind.config.ts) (utilities resolve to the same CSS variables)

---

## Principles

1. **Do not invent new brand values** — extend tokens only when extracting an existing literal.
2. **Prototype classes remain canonical** for shipping UI (`.button`, `.eyebrow`, `.lead`, `.entity-card`, …).
3. **Use `ds-*` classes** for new surfaces so they bind to tokens from day one.
4. **Use Tailwind utilities** that reference the same tokens (`bg-deep`, `rounded-sm`, `shadow-md`, `text-eyebrow`, `duration-base`).
5. **No new CSS frameworks or icon/UI libraries** without an explicit product decision.

---

## Load order

```tsx
// src/app/[locale]/layout.tsx
import "../globals.css";                 // Tailwind layers
import "@/styles/design-tokens.css";     // :root (Group) tokens
import "@/styles/brand-themes.css";      // company data-theme skins
import "@/styles/design-system.css";     // ds-* primitives
import "@/styles/prototype-parity.css";  // live component CSS
import "@/styles/typography.css";        // type system
import "@/styles/spacing.css";           // spacing rhythm
```

---

## Color palette (SAH Group defaults)

Values below are **Group** (`:root`). Company routes override the same semantic names via `data-theme` — see [`docs/theming.md`](./docs/theming.md) and [`COLOR_PALETTE.md`](./COLOR_PALETTE.md).

Sheet tokens map into semantic UI:

| Token | Group value | Tailwind | Use |
|---|---|---|---|
| `--brand-primary` | `#271710` | — | Primary Brown (sheet) |
| `--brand-accent` | `#C8A04D` | — | Accent Gold (sheet) |
| `--deep` | `var(--brand-primary)` | `deep` | Titles, primary buttons, dark sections |
| `--deep-2` | `var(--brand-deep)` `#342019` | `deep-2` | Section depth / hover |
| `--deep-3` | `var(--brand-dark)` `#1F120D` | `deep-3` | Deepest chrome |
| `--cream` | `var(--brand-bg)` `#F8F6F4` | `cream` | Page background |
| `--cream-2` | `var(--brand-beige)` `#E9E2DD` | `cream-2` | Cards / layered surfaces |
| `--white` | `#F8F6F4` | `white` | Group lightest (Off White — no pure white on Group) |
| `--gold` | `var(--brand-accent)` | `gold` | CTAs, links, highlights |
| `--gold-soft` | `var(--brand-soft)` `#A08373` | `gold-soft` | Soft accent / supporting |
| `--gold-hover` | `var(--brand-soft)` | `gold-hover` | Hover (Soft Brown on Group) |
| `--ink` | `var(--brand-primary)` | `ink` | Body / titles |
| `--muted` | `var(--brand-warm)` `#6A4A3C` | `muted` | Secondary text |
| `--line` | `var(--brand-beige)` | `line` | Borders |
| `--surface` | `var(--brand-bg)` | `surface` | Input fill, tinted sections |
| `--error` | `var(--deep-3)` | `error` | Invalid / errors (brand deep — no off-palette red) |
| `--success` | `var(--brand-primary)` | — | Confirmed / positive status |
| `--footer-bg` | `var(--brand-dark)` | `footer` | Footer |
| `--entity-bg` | `var(--brand-bg)` | — | Entity nested panels |
| `--modal-bg` | `var(--brand-bg)` | — | Modal surface |
| `--journey-bg` | `var(--brand-beige)` | — | Journey step rail |

### Entity accents (multi-brand UI)

Fixed on `:root` for cards/orbit/programs. Registry: `ENTITY_UI_COLORS` in [`src/lib/brand-themes.ts`](./src/lib/brand-themes.ts).

| Token | Value | Tailwind |
|---|---|---|
| `--human` | `#0F6B46` | `entity-human` |
| `--seera` | `#280A45` | `entity-seera` |
| `--nexus` | `#0D1B2A` | `entity-nexus` |
| `--connect` | `#2B2F36` | `entity-connect` |
| `--lego` | `#D4A017` | `entity-lego` |
| `--impact` | `#008A5E` | `entity-impact` |

---

## Typography scale

### Single system (`src/styles/typography.css`)

| Role | Rule | Token |
|---|---|---|
| **H1** | `h1`, `.page-hero h1`, `.auth-title` | `--fs-h1` |
| **H1 display** | `.hero h1` only | `--fs-hero` (same typeface/weight) |
| **H2** | all `h2` + section title classes | `--fs-h2` |
| **H3** | all `h3` | `--fs-h3` |
| **H4** | all `h4` | `--fs-h4` |
| **Body** | `body`, `p` | `--fs-base` / `--lh-loose` |
| **Lead** | `.lead`, `.hero-lead` | `--fs-md` / `--lh-lead` |
| **Small** | `small`, `.text-small` | `--fs-sm` |
| **Caption** | `.caption`, `.text-caption` | `--fs-xs` |
| **Eyebrow** | `.eyebrow` | `--fs-eyebrow` |
| **Button** | `.button`, `.button-small` | `--btn-fs` (same type; size only changes padding) |
| **Link** | `.text-link` | `--fs-base` / bold |

React helpers: `Eyebrow`, `Lead` (`src/components/ui/Text.tsx`), `TextLink`, `Button`.

Do **not** add arbitrary `text-[…]` Tailwind sizes or inline `fontSize` for UI copy.

### Fonts

| Role | Stack | Tailwind |
|---|---|---|
| Body | Thmanyah Sans → Tahoma → Arial | `font-sans` |
| Display / headings | Thmanyah Serif Display → Thmanyah Sans → Tahoma | `font-display` |
| Serif text | Thmanyah Serif Text → Thmanyah Sans → Georgia | `font-serif` |
| Numerals / wordmarks | Thmanyah Sans → Arial | `font-num` |

---

## Button sizes

Canonical class: **`.button`** (+ modifiers). Metrics tokenized:

| Size | Height | Padding | Font |
|---|---|---|---|
| Default | `--btn-height` 50px | 11×23 | `--btn-fs` (`--fs-sm`) |
| Small (`.button-small`) | `--btn-height-sm` 42px | 8×18 | `--btn-fs` (same type; height/padding only) |

Icon gap: `--btn-gap` → `--space-2` (8px)

| Variant | Class |
|---|---|
| Primary | `.button-primary` |
| Gold | `.button-gold` (hover → `--gold-hover`) |
| Ghost | `.button-ghost` |
| Outline | `.button-outline` |
| Outline dark | `.button-outline-dark` |
| Dark | `.button-dark` |

**Hover:** `translateY(var(--lift-button))` (−2px) · **Active:** reset lift · **Radius:** pill (`999px`)

---

## Container widths

| Token | Value |
|---|---|
| `--container-max` | `1180px` |
| `--container` | `min(1180px, 100% - 40px)` → md/sm at 1100 / 620 |
| `--section-heading-max` | `760px` |
| `--content-max-md` | `680px` |
| `--auth-card-max` | `460px` |
| `--modal-max` | `900px` |

Classes: `.container` (live) · `.ds-container` (token helper)  
Tailwind: `max-w-container`, `w-container`

---

## Spacing scale

| Token | px |
|---|---|
| `--space-1` … `--space-12` | 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80 |
| `--space-section` | 118px (86px ≤860px) |
| `--space-content` | 48px — gap from section heading → content |
| `--space-stack` / `-sm` / `-lg` | 16 / 12 / 24 — in-card stacks |
| `--header-height` | 72px (scrolled 66px) |

**Rule:** snap off-scale literals to the nearest step. Prefer semantic aliases over raw px.

Tailwind: `p-4`, `gap-grid`, `gap-grid-md`, `pt-section`, `h-header`, …  
(`p-1`…`p-12` = brand `--space-*`; no parallel `p-space-*` aliases.)

CSS enforcement layer: [`src/styles/spacing.css`](./src/styles/spacing.css) (loads after prototype + typography).

---

## Section & grid spacing

| Concern | Standard |
|---|---|
| Section vertical pad | `.section` / `.faq` → `var(--section-pad-y)` |
| Heading → content | `var(--space-content)` (48px) |
| Grid default | `--grid-gap` 16px |
| Grid small | `--grid-gap-sm` 12px |
| Grid medium | `--grid-gap-md` 20px |
| Grid large | `--grid-gap-lg` 24px |
| Hero / wide grid | `--grid-gap-xl` 40px |
| Split layouts | `--layout-gap` 80px / `--layout-gap-md` 64px |

Helpers: `.ds-section`, `.ds-grid`, `.ds-grid-md`, `.ds-grid-lg`

---

## Card padding

| Role | Token | Value |
|---|---|---|
| Marketing / profile cards | `--card-pad` | 28px |
| Compact / list / media bodies | `--card-pad-sm` | 20px |
| Auth / apply shells | `--card-pad-lg` | 40px |

---

## Form spacing

| Concern | Token |
|---|---|
| Field stack gap | `--form-gap` 16px |
| Compact form grids | `--form-gap-sm` 12px |
| Label → input | `--form-label-gap` 4px |
| Product inputs | `--input-pad-y/x` 12×16 |
| Contact inputs | `--input-contact-pad-y/x` 12×12 |

---

## Border radius scale

| Token | Value | Typical use |
|---|---|---|
| `--radius-xs` | 8px | Small controls |
| `--radius-sm` | 12px | Auth inputs, avatars square |
| `--radius-md` | 16px | Challenge / principle cards |
| `--radius` | 22px | Default marketing cards |
| `--radius-lg` | 34px | Auth card, journey shell |
| `--radius-pill` | 999px | Buttons, chips |
| `--radius-card-compact` | 14px | Entity cards |
| `--radius-card-program` | 18px | Program cards / toolbar / contact form shell |
| `--radius-modal` | 28px | All dialogs (entity, program, contact) |

> Card radius tiers (14 / 18 / 22) are **intentional**. Modals share one radius (`28px`).

Tailwind: `rounded-sm`, `rounded`, `rounded-lg`, `rounded-pill`, `rounded-modal`, …

---

## Shadow scale

| Token | Use |
|---|---|
| `--shadow-xs` | Subtle elevation |
| `--shadow-sm` | Buttons, card hover |
| `--shadow-md` | Auth card, gold hover |
| `--shadow-dark` | Dark panels, orbit |
| `--shadow-modal` | Dialog |
| `--shadow-dropdown` | Nav dropdown |

---

## Motion

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(.2,.8,.2,1)` |
| `--ease-out` | `cubic-bezier(0,0,.3,1)` |
| `--ease-spring` | `cubic-bezier(.22,1,.36,1)` |
| `--duration-fast` | 150ms |
| `--duration-base` | 250ms |
| `--duration-slow` | 350ms |
| `--duration-reveal` | 750ms |

### Hover behavior

| Element | Lift |
|---|---|
| Buttons | `--lift-button` (−2px) |
| Challenge cards | `--lift-card-sm` (−3px) |
| Interactive cards (entity, program, coach, course) | `--lift-card` (−6px) + accent border + `--shadow-sm` |

Opt-in helpers: `.ds-lift-button`, `.ds-lift-card`, `.ds-card-interactive`

### Focus states

| Token | Use |
|---|---|
| `--focus-ring` | 3px gold halo — **marketing / contact / newsletter (light)** |
| `--focus-ring-strong` | 4px gold halo — **product** (auth, apply, discovery, search, profile) |
| `--focus-ring-error` | Error halo |
| `--focus-ring-on-dark` | Inset 2px gold — **inputs on deep/footer chrome** |
| `--focus-border` | `--gold` |

Helper: `.ds-focusable:focus-visible`

### Disabled states

Opacity `0.55`, `cursor: not-allowed`, no lift/shadow.  
Helper: `.ds-disabled` / `:disabled`

Respect `prefers-reduced-motion` (already in prototype CSS; skeletons stop animating).

---

## Input styles

**Product standard** (auth / apply / profile):

- Padding `13×14` · radius `--radius-sm` · bg `--surface`  
- Focus: gold border + `--focus-ring-strong`  
- Invalid: `--error` + `--focus-ring-error`  
- Label: `.75rem` / semibold / `--muted`

Classes: `.ds-label`, `.ds-input`, `.ds-textarea`, `.ds-select`  
Live: `.auth-form`, `.apply-form`, `.profile-form`, `.contact-form` (legacy 10px radius — keep as-is)

---

## Card styles

| Pattern | Live class | Tokenized helper |
|---|---|---|
| Marketing card | `.entity-card`, `.solution-card`, … | `.ds-card` |
| Interactive hover | most product cards | `.ds-card-interactive` |
| Large shell | `.auth-card`, `.apply-card` | `.ds-card-lg` |
| Compact | entity 14px | `.ds-card-compact` |

Do not force-migrate existing card class radii in one pass — use tokens for **new** work.

---

## Modal styles

CSS tokens remain available for future dialogs (`--modal-max`, `--radius-modal`, …).
There is no live `Modal.tsx` component today — rebuild from tokens when needed.

Helper panel: `.ds-modal-panel`

---

## Icon sizing

| Token | px | Tailwind spacing |
|---|---|---|
| `--icon-xs` | 10 | `size-icon-xs` / `w-icon-xs` |
| `--icon-sm` | 12 | `w-icon-sm` |
| `--icon-md` | 14 | `w-icon-md` |
| `--icon-lg` | 16 | `w-icon-lg` |
| `--icon-xl` | 20 | `w-icon-xl` |
| `--icon-2xl` | 24 | `w-icon-2xl` |

Helpers: `.ds-icon`, `.ds-icon-sm`, … Prefer SVG strokes over emoji on product UI.

---

## Image treatment

- Wrapper: prefer `AppImage` (`quality` default 100 — intentional for brand assets)  
- Radius: `--img-radius` (sm) / `--img-radius-lg`  
- Fit: `cover`  
- Placeholder: `--img-placeholder-bg` gradient  
- Helpers: `.ds-media`, `.ds-media-lg`, `.ds-media-placeholder`

---

## Badge / tag / chip

Use `Badge` from `@/components/ui/Badge`:

| `variant` | Class | Role |
|---|---|---|
| `badge` (default) | `.ds-badge` | Neutral gold-tint status pill |
| `tag` | `.ds-tag` | Entity-colored tag (`--tag-accent`) |
| `chip` | `.ds-chip` | Generic chip |
| `filter` | `.filter-chip` | Live listing filters (`interactive`) |

Domain-only classes (`.entity-card-tag`, `.program-level`, `.course-badge`, `.coach-specialty`) stay on their cards.

---

## Reusable UI components

Import from `@/components/ui` (or deep paths). Prefer composition; do not add UI libraries.

| Component | Role |
|---|---|
| `Button` | `.button` variants; **LocaleLink** for app paths, `<a>` for hash/external |
| `TextLink` | `.text-link`; same locale rules as Button |
| `Badge` | badge / tag / chip / filter |
| `Card` | Generic surfaces (`ds-card`, `stat-card`, `auth-card`) |
| `ListingCard` | Shared coach/course media+body+footer shell |
| `FormField` / `FormShell` | Label + control + error; parent form class owns chrome |
| `PageHero` | Inner-page `.page-hero` (not home hero) |
| `Section` / `SectionHeading` / `Container` / `Grid` | Layout |
| `Accordion` / `FaqAccordion` | Live FAQ accordion (`.faq-*`) |
| `Eyebrow` / `Lead` | Typography helpers |
| `Accordion` / `FaqAccordion` | Disclosure lists |
| `Grid` / `ListingCard` / `Breadcrumbs` | Layout & listing primitives |
| `LocaleLink` / `AppImage` / `Breadcrumbs` | Navigation / media |

**Domain cards** (keep specialized): `EntityCard`, `ProgramCard`.  
**Absent by design:** drawers, testimonials, pricing tables — no live UI yet.

**Nav / Footer:** `SiteHeader` (dropdowns), `SiteFooter` — single implementations.

| Size | Token | Class |
|---|---|---|
| SM | 40px | `.ds-avatar-sm` |
| MD | 54px | `.ds-avatar-md` |
| LG | 72px | `.ds-avatar-lg` |
| XL | 120px | `.ds-avatar-xl` |

Base: `.ds-avatar` (circle, deep gradient placeholder). Live: `.profile-avatar`, `.coach-avatar`, `.audience-icon`.

---

## Skeleton loading (future)

Tokens: `--skeleton-base`, `--skeleton-shine`, `--skeleton-radius`  
Classes: `.ds-skeleton`, `.ds-skeleton-text`, `.ds-skeleton-avatar`, `.ds-skeleton-media`  
Animation disabled under `prefers-reduced-motion`.

Not wired into pages yet — ready when needed.

---

## Toast (future)

Tokens: `--toast-*`, `--z-toast`  
Classes: `.ds-toast`, `.ds-toast-success`, `.ds-toast-error`, `.ds-toast-gold`  
RTL/LTR margin aware. Not wired into pages yet.

---

## Tailwind cheat sheet

**Reality check:** Live UI is mostly prototype CSS (`.button`, `.section`, `.entity-card`). Tailwind is a thin token mirror for one-off layout/color helpers — not a parallel design system.

### Do

```html
<!-- Token colors / type / space -->
<p class="text-muted text-sm mb-4" />
<button class="button button-gold w-full" />
<section class="py-section">
  <div class="w-container mx-auto gap-grid-md grid" />
</section>
<article class="rounded shadow-sm duration-slow ease-brand" />
```

### Don’t

- Arbitrary values (`min-w-[320px]`, `text-[#003d2c]`, `p-[13px]`) — use tokens (`min-w-viewport`, `text-deep`, `p-3`)
- Long utility stacks that reinvent `.button` / `.ds-card` / `.section`
- Duplicate aliases (`accent` ≈ `gold`, `p-space-4` ≈ `p-4`) — removed; use `gold` and numeric scale
- Hardcoded inline `style={{ color, margin, padding }}` when `text-*` / `m*` / `p*` tokens exist

### Spacing

Numeric `p-1`…`p-12` map to `--space-1`…`--space-12`. Semantic: `py-section`, `gap-grid`, `gap-grid-md`, `h-header`, `p-card-pad`.

Compose with prototype classes:

```html
<a class="button button-gold">…</a>
<div class="section-heading"><p class="eyebrow">…</p><h2>…</h2><p class="lead">…</p></div>
```

---

## What this does *not* do

- Does not restyle existing pages wholesale  
- Does not replace `.button` / `.entity-card` / `.contact-form` yet  
- Does not add component libraries  
- Does not change payment/CMS architecture  

Gradual migration: when touching a component, swap literals for `var(--…)` or adopt `ds-*` / Tailwind token utilities.

---

*Created July 29, 2026 — extracted from prototype-parity visual language.*
