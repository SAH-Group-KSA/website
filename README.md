# SAH Group v2

Production-ready Next.js App Router architecture for the SAH Group website.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- next-intl (`en` / `ar`)
- ESLint + Prettier

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run typecheck
```

## Structure

```text
src/app/                 # App Router (locale-aware)
src/components/layout/   # Shell chrome
src/components/ui/       # Reusable primitives
src/components/sections/ # Page section shells
src/hooks/               # Client hooks
src/i18n/                # Locale routing + request config
src/lib/                 # Shared utilities, SEO, constants
src/styles/              # Global styles + design tokens
src/types/               # Shared TypeScript types
messages/                # EN/AR message catalogs
public/                  # Static assets
prototypes/              # HTML prototypes (not part of build)
```

## Notes

Prototype HTML conversion has not started. Section components are architectural shells only.
