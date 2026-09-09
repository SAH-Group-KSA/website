"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import type { Entity, SiteContent } from "@/content/types";
import type { Locale } from "@/types/locale";
import { EntityCard } from "@/components/entities/EntityCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = {
  data: SiteContent["entitiesSection"];
  entities: Entity[];
};

export function EntitiesSection({ data, entities }: Props) {
  const locale = useLocale() as Locale;
  const isAr = locale === "ar";

  const trackRef = React.useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  /** One dot per reachable scroll stop (items − visible + 1). */
  const [pageCount, setPageCount] = useState(entities.length);

  const getTrackMetrics = React.useCallback(
    (el: HTMLDivElement) => {
      const card = el.firstElementChild as HTMLElement | null;
      const styles = getComputedStyle(el);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      const step = card ? card.getBoundingClientRect().width + gap : 1;
      // floor — round over-counts when min-width makes cards wider than 33%
      const visibleCount = Math.max(
        1,
        Math.min(
          entities.length,
          Math.floor((el.clientWidth + gap) / step) || 1,
        ),
      );
      const pages = Math.max(1, entities.length - visibleCount + 1);
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      // Track is forced LTR, so scrollLeft is always 0 → maxScroll.
      const scrollPos = Math.max(0, el.scrollLeft);
      return { step, visibleCount, pages, maxScroll, scrollPos };
    },
    [entities.length],
  );

  const updateNav = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { step, pages, maxScroll, scrollPos } = getTrackMetrics(el);
    setPageCount(pages);
    setCanPrev(scrollPos > 4);
    setCanNext(maxScroll > 4 && scrollPos < maxScroll - 4);
    if (maxScroll <= 4) {
      setActiveIdx(0);
      return;
    }
    if (scrollPos >= maxScroll - 4) {
      setActiveIdx(pages - 1);
      return;
    }
    const raw = Math.round(scrollPos / step);
    setActiveIdx(Math.max(0, Math.min(raw, pages - 1)));
  }, [getTrackMetrics]);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Ensure start position is stable after layout (esp. locale switches).
    el.scrollLeft = 0;
    updateNav();

    el.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);

    const ro = new ResizeObserver(() => updateNav());
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", updateNav);
      ro.disconnect();
    };
  }, [updateNav, entities.length]);

  const scroll = (dir: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const { step, pages, maxScroll, scrollPos } = getTrackMetrics(el);
    const current = Math.round(scrollPos / step);
    const nextPage =
      dir === "next"
        ? Math.min(current + 1, pages - 1)
        : Math.max(current - 1, 0);
    const target = Math.min(nextPage * step, maxScroll);
    setActiveIdx(nextPage);
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  const scrollTo = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const { step, pages, maxScroll } = getTrackMetrics(el);
    const page = Math.max(0, Math.min(idx, pages - 1));
    const target = Math.min(page * step, maxScroll);
    setActiveIdx(page);
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <Section
      id="entities"
      className="entities"
      aria-labelledby="entities-title"
      atmosphere
      divider
    >
      <Container>
        <SectionHeading
          align="center"
          reveal
          eyebrow={data.eyebrow}
          title={data.title}
          id="entities-title"
          intro={data.intro}
        />
        <div
          className="entity-carousel reveal"
          data-delay="80"
          role="region"
          aria-roledescription="carousel"
          aria-label={data.title}
        >
          <button
            type="button"
            className="entity-carousel-arrow entity-carousel-prev"
            aria-label={isAr ? "السابق" : "Previous"}
            onClick={() => scroll("prev")}
            disabled={!canPrev}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            className="entity-carousel-arrow entity-carousel-next"
            aria-label={isAr ? "التالي" : "Next"}
            onClick={() => scroll("next")}
            disabled={!canNext}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Track is LTR for stable scrollLeft across locales; cards keep page direction. */}
          <div
            className="entity-carousel-track"
            ref={trackRef}
            id="entity-grid"
            dir="ltr"
          >
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                openLabel={data.openLabel}
              />
            ))}
          </div>

          <div
            className="entity-carousel-dots"
            role="group"
            aria-label={isAr ? "شرائح الكيانات" : "Entity slides"}
          >
            {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={`entity-dot-${i}`}
                  type="button"
                  className={`entity-carousel-dot${i === activeIdx ? " is-active" : ""}`}
                  aria-label={
                    isAr
                      ? `الشريحة ${i + 1} من ${pageCount}`
                      : `Slide ${i + 1} of ${pageCount}`
                  }
                  aria-current={i === activeIdx ? "true" : undefined}
                  onClick={() => scrollTo(i)}
                />
            ))}
          </div>
        </div>
        <div id="solutions" className="section-anchor" />
      </Container>
    </Section>
  );
}
