import type { Config } from "tailwindcss";

/**
 * Tailwind theme mirrors `src/styles/design-tokens.css`.
 * Prefer CSS variables so utilities stay in sync with the design system.
 * Do not approximate values — tokens are the source of truth.
 *
 * Usage note: live UI is mostly prototype CSS (`.button`, `.section`, …).
 * Use Tailwind for light layout/color helpers — never arbitrary `[…]` values
 * when a token exists.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: {
          DEFAULT: "var(--deep)",
          2: "var(--deep-2)",
          3: "var(--deep-3)",
        },
        cream: {
          DEFAULT: "var(--cream)",
          2: "var(--cream-2)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          soft: "var(--gold-soft)",
          hover: "var(--gold-hover)",
        },
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        surface: "var(--surface)",
        white: "var(--white)",
        error: "var(--error)",
        footer: "var(--footer-bg)",
        entity: {
          human: "var(--human)",
          seera: "var(--seera)",
          nexus: "var(--nexus)",
          connect: "var(--connect)",
          lego: "var(--lego)",
          impact: "var(--impact)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        serif: ["var(--font-serif)"],
        num: ["var(--font-mono-num)"],
      },
      fontSize: {
        micro: ["var(--fs-micro)", { lineHeight: "var(--lh-tight)" }],
        xs: ["var(--fs-xs)", { lineHeight: "var(--lh-base)" }],
        eyebrow: [
          "var(--fs-eyebrow)",
          { lineHeight: "var(--lh-tight)", letterSpacing: "var(--ls-label)" },
        ],
        sm: ["var(--fs-sm)", { lineHeight: "var(--lh-base)" }],
        base: ["var(--fs-base)", { lineHeight: "var(--lh-loose)" }],
        md: ["var(--fs-md)", { lineHeight: "var(--lh-lead)" }],
        lg: ["var(--fs-lg)", { lineHeight: "var(--lh-tight)" }],
        xl: ["var(--fs-xl)", { lineHeight: "var(--lh-tight)" }],
        h4: ["var(--fs-h4)", { lineHeight: "var(--lh-tight)" }],
        h3: ["var(--fs-h3)", { lineHeight: "var(--lh-tight)" }],
        h2: ["var(--fs-h2)", { lineHeight: "var(--lh-tight)" }],
        h1: ["var(--fs-h1)", { lineHeight: "var(--lh-snug)" }],
        hero: ["var(--fs-hero)", { lineHeight: "var(--lh-snug)" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },
      letterSpacing: {
        tight: "var(--ls-tight)",
        hero: "var(--ls-hero)",
        label: "var(--ls-label)",
        nav: "var(--ls-nav)",
        wide: "var(--ls-wide)",
        chip: "var(--ls-chip)",
      },
      lineHeight: {
        tight: "var(--lh-tight)",
        snug: "var(--lh-snug)",
        base: "var(--lh-base)",
        loose: "var(--lh-loose)",
        lead: "var(--lh-lead)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)",
        "card-compact": "var(--radius-card-compact)",
        "card-program": "var(--radius-card-program)",
        modal: "var(--radius-modal)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        dark: "var(--shadow-dark)",
        modal: "var(--shadow-modal)",
        dropdown: "var(--shadow-dropdown)",
        focus: "var(--focus-ring)",
        "focus-strong": "var(--focus-ring-strong)",
      },
      maxWidth: {
        container: "var(--container-max)",
        "section-heading": "var(--section-heading-max)",
        auth: "var(--auth-card-max)",
        modal: "var(--modal-max)",
        "content-md": "var(--content-max-md)",
        "content-lg": "var(--content-max-lg)",
      },
      minWidth: {
        viewport: "320px",
      },
      width: {
        container: "var(--container)",
        "dashboard-nav": "var(--dashboard-nav-width)",
      },
      /**
       * Brand 4px scale replaces default rem steps so `p-4` / `gap-3`
       * match design tokens (no parallel `p-space-4` aliases).
       */
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
        9: "var(--space-9)",
        10: "var(--space-10)",
        11: "var(--space-11)",
        12: "var(--space-12)",
        section: "var(--space-section)",
        content: "var(--space-content)",
        stack: "var(--space-stack)",
        "stack-sm": "var(--space-stack-sm)",
        "stack-lg": "var(--space-stack-lg)",
        header: "var(--header-height)",
        "header-scrolled": "var(--header-height-scrolled)",
        "grid-sm": "var(--grid-gap-sm)",
        grid: "var(--grid-gap)",
        "grid-md": "var(--grid-gap-md)",
        "grid-lg": "var(--grid-gap-lg)",
        "grid-xl": "var(--grid-gap-xl)",
        "layout-gap": "var(--layout-gap)",
        "layout-gap-md": "var(--layout-gap-md)",
        "form-gap": "var(--form-gap)",
        "card-pad": "var(--card-pad)",
        "card-pad-sm": "var(--card-pad-sm)",
        "card-pad-lg": "var(--card-pad-lg)",
        "icon-xs": "var(--icon-xs)",
        "icon-sm": "var(--icon-sm)",
        "icon-md": "var(--icon-md)",
        "icon-lg": "var(--icon-lg)",
        "icon-xl": "var(--icon-xl)",
        "icon-2xl": "var(--icon-2xl)",
        "avatar-sm": "var(--avatar-sm)",
        "avatar-md": "var(--avatar-md)",
        "avatar-lg": "var(--avatar-lg)",
        "avatar-xl": "var(--avatar-xl)",
        "btn-h": "var(--btn-height)",
        "btn-h-sm": "var(--btn-height-sm)",
      },
      transitionTimingFunction: {
        brand: "var(--ease)",
        "brand-out": "var(--ease-out)",
        spring: "var(--ease-spring)",
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
        panel: "var(--duration-panel)",
        reveal: "var(--duration-reveal)",
      },
      zIndex: {
        header: "var(--z-header)",
        dropdown: "var(--z-dropdown)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        skip: "var(--z-skip)",
      },
      screens: {
        xs: "430px",
        sm: "620px",
        md: "760px",
        lg: "860px",
        xl: "1100px",
      },
    },
  },
  plugins: [],
};

export default config;
