import type { Entity, EntityColors, Program, ProgramsSectionContent } from "@/content/types";
import type { ReactNode } from "react";
import { interpolate } from "@/lib/utils/format";
import {
  resolveEntityColor,
  resolveEntityLabel,
  resolveEntityLogo,
} from "@/lib/utils/entity";

type Props = {
  program: Program;
  labels: ProgramsSectionContent;
  entities: Entity[];
  entityColors: EntityColors;
  /** Use h1 on the dedicated page; h2 when embedded. */
  titleAs?: "h1" | "h2";
  /**
   * Primary action (e.g. interest form). Placed beside the intro on desktop
   * and between intro + details on mobile so conversion stays above the fold.
   */
  action?: ReactNode;
};

export function ProgramDetail({
  program,
  labels,
  entities,
  entityColors,
  titleAs = "h1",
  action,
}: Props) {
  const color = resolveEntityColor(entityColors, program.entity);
  const entityLabel = resolveEntityLabel(entities, program.entity);
  const entityLogo = resolveEntityLogo(entities, program.entity);
  const levelNames = labels.levelNames ?? [];

  const audienceDisplay =
    program.audience === "individual"
      ? labels.audienceIndividual
      : labels.audienceOrganization;

  const levelText = levelNames[program.level - 1]
    ? `L${program.level} · ${levelNames[program.level - 1]}`
    : interpolate(labels.levelLabelTemplate, { n: program.level });

  const TitleTag = titleAs;

  return (
    <section
      className={
        action
          ? "program-detail-content program-detail-with-action"
          : "program-detail-content"
      }
      style={{ ["--modal-color" as string]: color }}
    >
      <div className="program-detail-hero">
        <div className="program-detail-hero-accent" aria-hidden="true" />

        <div className="program-detail-identity">
          {entityLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entityLogo}
              alt={entityLabel}
              className="program-detail-entity-logo"
            />
          ) : (
            <span className="program-detail-entity-name">{entityLabel}</span>
          )}
        </div>

        <TitleTag id="program-detail-title" className="program-detail-title">
          {program.title}
        </TitleTag>
        <p className="program-detail-lead">{program.summary}</p>

        <div className="program-detail-chips">
          <span className="program-detail-chip">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M1.5 10.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            {audienceDisplay}
          </span>
          <span className="program-detail-chip">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {levelText}
          </span>
          <span className="program-detail-chip">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <rect
                x="1.5"
                y="2.5"
                width="9"
                height="7"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M4 1.5v2M8 1.5v2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            {program.format}
          </span>
          <span className="program-detail-chip">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M6 4v2.5l2 1"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {program.duration}
          </span>
        </div>
      </div>

      {action ? (
        <aside className="program-detail-action" id="register">
          {action}
        </aside>
      ) : null}

      <div className="program-detail-body">
        <div className="program-detail-grid">
          <article className="pdetail-card">
            <span className="pdetail-n">01</span>
            <h2>{labels.problemLabel}</h2>
            <p>{program.problem}</p>
          </article>
          <article className="pdetail-card">
            <span className="pdetail-n">02</span>
            <h2>{labels.outcomeLabel}</h2>
            <p>{program.outcome}</p>
          </article>
          <article className="pdetail-card">
            <span className="pdetail-n">03</span>
            <h2>{labels.deliverablesLabel}</h2>
            <p>{program.deliverables}</p>
          </article>
          <article className="pdetail-card">
            <span className="pdetail-n">04</span>
            <h2>{labels.nextLabel}</h2>
            <p>{program.next}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
