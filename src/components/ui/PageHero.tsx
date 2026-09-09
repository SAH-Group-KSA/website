import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Lead } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: ReactNode;
  lead?: ReactNode;
  eyebrow?: ReactNode;
  /** Content before the title (e.g. Breadcrumbs). */
  before?: ReactNode;
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  /** Extra class on the section (e.g. `discovery-hero`, `not-found-page`). */
  toneClassName?: string;
  /** Photo background with brand overlay (coaches / courses / programs). */
  media?: boolean;
  /** Render as `div` for not-found etc. */
  as?: "section" | "div";
};

/**
 * Inner-page hero shell — `.page-hero` + `.page-hero-inner`.
 * Home full-bleed hero stays `HeroSection` (different layout).
 */
export function PageHero({
  title,
  lead,
  eyebrow,
  before,
  children,
  className,
  innerClassName,
  id,
  toneClassName,
  media = false,
  as: Tag = "section",
}: PageHeroProps) {
  return (
    <Tag
      className={cn(
        "page-hero",
        media && "page-hero-media",
        toneClassName,
        className,
      )}
      id={id}
    >
      <span
        className="float-shape float-shape-gold"
        style={{ width: 220, height: 220, top: "12%", insetInlineEnd: "8%" }}
        aria-hidden="true"
      />
      <span
        className="float-shape float-shape-deep"
        style={{ width: 160, height: 160, bottom: "8%", insetInlineStart: "6%" }}
        aria-hidden="true"
      />
      <Container className={cn("page-hero-inner", innerClassName)}>
        {before}
        {eyebrow ? (
          typeof eyebrow === "string" ? (
            <Eyebrow light>{eyebrow}</Eyebrow>
          ) : (
            eyebrow
          )
        ) : null}
        <h1>{title}</h1>
        {lead ? (
          typeof lead === "string" ? (
            <Lead>{lead}</Lead>
          ) : (
            lead
          )
        ) : null}
        {children}
      </Container>
    </Tag>
  );
}
