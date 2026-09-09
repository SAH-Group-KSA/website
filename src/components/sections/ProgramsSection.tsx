"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import type { Entity, EntityColors, Program, SiteContent } from "@/content/types";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { programsFromParamForPath } from "@/lib/companies";
import { resolveEntityColor, resolveEntityLabel, resolveEntityLogo } from "@/lib/utils/entity";
import { interpolate } from "@/lib/utils/format";
import { SAH_FILTER_PROGRAMS } from "@/lib/interactions";
import { useRovingTablist } from "@/hooks/useRovingTablist";
import type { Locale } from "@/types/locale";

type Props = {
  data: SiteContent["programsSection"];
  programs: Program[];
  entities: Entity[];
  entityColors: EntityColors;
  /** Hide entity filter chips (e.g. company pages locked to one entity). */
  hideEntityFilter?: boolean;
  /**
   * Force SAH Group accent on all cards (group homepage).
   * Company pages keep per-entity colors.
   */
  useGroupAccent?: boolean;
};

const PAGE = 9;

function normalizePath(pathname: string, locale: Locale): string {
  if (locale === "en" && (pathname === "/en" || pathname.startsWith("/en/"))) {
    return pathname.slice(3) || "/";
  }
  return pathname || "/";
}

export function ProgramsSection({
  data,
  programs,
  entities,
  entityColors,
  hideEntityFilter = false,
  useGroupAccent = false,
}: Props) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const from = programsFromParamForPath(normalizePath(pathname, locale));

  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("all");
  const [level, setLevel] = useState("all");
  const [entity, setEntity] = useState("all");
  const [visible, setVisible] = useState(PAGE);

  const levelNames = data.levelNames ?? [];
  const entityFilterIds = useMemo(
    () => ["all", ...entities.map((item) => item.id)],
    [entities],
  );
  const { onKeyDown: onEntityFilterKeyDown } = useRovingTablist(
    entityFilterIds,
    entity,
    (id) => {
      setEntity(id);
      setVisible(PAGE);
    },
    "horizontal",
    "radio",
  );

  useEffect(() => {
    const onFilter = (event: Event) => {
      const entityId = (event as CustomEvent<{ entityId: string }>).detail
        ?.entityId;
      if (!entityId) return;
      setEntity(entityId);
      setAudience("all");
      setLevel("all");
      setQuery("");
      setVisible(PAGE);
    };
    window.addEventListener(SAH_FILTER_PROGRAMS, onFilter);
    return () => {
      window.removeEventListener(SAH_FILTER_PROGRAMS, onFilter);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((p) => {
      const ok =
        (audience === "all" || p.audience === audience) &&
        (level === "all" || String(p.level) === level) &&
        (entity === "all" || p.entity === entity);
      const hay = [p.title, p.summary, p.outcome, p.problem]
        .join(" ")
        .toLowerCase();
      return ok && (!q || hay.includes(q));
    });
  }, [programs, query, audience, level, entity]);

  const shown = filtered.slice(0, visible);

  function formatLevel(n: number) {
    const name = levelNames[n - 1];
    if (name) return `${n} | ${name}`;
    return interpolate(data.levelLabelTemplate, { n });
  }

  return (
    <Section
      aria-labelledby="programs-title"
      className="programs"
      id="programs"
      atmosphere
    >
      <Container>
        <SectionHeading
          reveal
          eyebrow={data.eyebrow}
          title={data.title}
          id="programs-title"
          intro={data.intro}
        />

        <div className="program-toolbar reveal" data-delay="80">

          {/* ── Row 1: search + selects + count ── */}
          <div className="program-toolbar-top">
            <label className="search-field">
              <VisuallyHidden>{data.searchPlaceholder}</VisuallyHidden>
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="program-search"
                type="search"
                autoComplete="off"
                placeholder={data.searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(PAGE);
                }}
              />
              {query && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label={data.clearSearchLabel ?? "Clear search"}
                  onClick={() => { setQuery(""); setVisible(PAGE); }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </label>

            <div className="program-selects">
              <div className="program-select-wrap">
                <label htmlFor="program-audience" className="program-select-label">
                  {data.audienceSelectLabel ?? "Audience"}
                </label>
                <div className="program-select-inner">
                  <select
                    id="program-audience"
                    value={audience}
                    onChange={(e) => { setAudience(e.target.value); setVisible(PAGE); }}
                  >
                    <option value="all">{data.audienceAll}</option>
                    <option value="individual">{data.audienceIndividual}</option>
                    <option value="organization">{data.audienceOrganization}</option>
                  </select>
                  <svg className="select-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="program-select-wrap">
                <label htmlFor="program-level" className="program-select-label">
                  {data.levelSelectLabel ?? "Level"}
                </label>
                <div className="program-select-inner">
                  <select
                    id="program-level"
                    value={level}
                    onChange={(e) => { setLevel(e.target.value); setVisible(PAGE); }}
                  >
                    <option value="all">{data.levelAll}</option>
                    {[1, 2, 3].map((n) => (
                      <option key={n} value={String(n)}>
                        {levelNames[n - 1]
                          ? `${n} — ${levelNames[n - 1]}`
                          : interpolate(data.levelLabelTemplate, { n })}
                      </option>
                    ))}
                  </select>
                  <svg className="select-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <p aria-live="polite" className="program-count" id="program-count">
              {interpolate(data.showing, { shown: shown.length, total: filtered.length })}
            </p>
          </div>

          {/* ── Row 2: entity chips ── */}
          {!hideEntityFilter ? (
            <>
              <div className="program-toolbar-divider" aria-hidden="true" />
              <div
                role="radiogroup"
                aria-label={data.filterAriaLabel ?? "Filter programs by entity"}
                className="filter-group"
                onKeyDown={onEntityFilterKeyDown}
              >
                <Badge
                  interactive
                  variant="filter"
                  role="radio"
                  aria-checked={entity === "all"}
                  tabIndex={entity === "all" ? 0 : -1}
                  className={entity === "all" ? "is-active" : undefined}
                  data-filter-entity="all"
                  onClick={() => { setEntity("all"); setVisible(PAGE); }}
                >
                  {data.entityAll}
                </Badge>
                {entities.map((item) => (
                  <Badge
                    key={item.id}
                    interactive
                    variant="filter"
                    role="radio"
                    aria-checked={entity === item.id}
                    tabIndex={entity === item.id ? 0 : -1}
                    className={entity === item.id ? "is-active" : undefined}
                    data-filter-entity={item.id}
                    onClick={() => { setEntity(item.id); setVisible(PAGE); }}
                  >
                    {data.entityFilterLabels?.[
                      item.id as keyof NonNullable<typeof data.entityFilterLabels>
                    ] ?? item.name}
                  </Badge>
                ))}
              </div>
            </>
          ) : null}

        </div>

        <Grid className="program-grid" id="program-grid">
          {shown.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              color={
                useGroupAccent
                  ? resolveEntityColor(entityColors, "group")
                  : resolveEntityColor(entityColors, program.entity)
              }
              entityLabel={resolveEntityLabel(entities, program.entity)}
              entityLogo={resolveEntityLogo(entities, program.entity)}
              levelLabel={formatLevel(program.level)}
              outcomeLabel={data.outcomeLabel}
              openLabel={data.openLabel}
              from={from || undefined}
            />
          ))}
        </Grid>

        {filtered.length === 0 ? (
          <p id="program-empty">{data.empty}</p>
        ) : null}

        {visible < filtered.length ? (
          <div className="program-more">
            <Button
              type="button"
              variant="outline-dark"
              id="program-load-more"
              onClick={() => setVisible((v) => v + PAGE)}
            >
              {data.loadMore}
            </Button>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
