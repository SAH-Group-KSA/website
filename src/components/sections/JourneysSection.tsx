"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { JourneyExample, SiteContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useRovingTablist } from "@/hooks/useRovingTablist";

type Props = {
  data: SiteContent["journeysSection"];
  examples: JourneyExample[];
};

export function JourneysSection({ data, examples }: Props) {
  const [activeId, setActiveId] = useState(examples[0]?.id ?? "individual");
  const active = examples.find((e) => e.id === activeId) ?? examples[0];
  const ids = useMemo(() => examples.map((e) => e.id), [examples]);
  const { onKeyDown } = useRovingTablist(ids, activeId, setActiveId);

  return (
    <Section
      aria-labelledby="journeys-title"
      className="client-journeys"
      tone="tinted"
      id="journeys"
      atmosphere
    >
      <Container>
        <SectionHeading
          align="center"
          reveal
          eyebrow={data.eyebrow}
          title={data.title}
          id="journeys-title"
        />

        {active ? (
          <div className="cj-panel reveal">
            {/* Dark header — switcher lives with the story chrome */}
            <div className="cj-header">
              <div
                aria-label={data.tabsAriaLabel}
                className="cj-tabs"
                role="tablist"
                onKeyDown={onKeyDown}
              >
                <div className="cj-tabs-track">
                  {examples.map((ex) => (
                    <button
                      key={ex.id}
                      id={`journey-tab-${ex.id}`}
                      type="button"
                      role="tab"
                      aria-selected={activeId === ex.id}
                      aria-controls="journey-example-panel"
                      tabIndex={activeId === ex.id ? 0 : -1}
                      className={`cj-tab${activeId === ex.id ? " is-active" : ""}`}
                      onClick={() => setActiveId(ex.id)}
                    >
                      {ex.id === "organization"
                        ? data.organizationTab
                        : data.individualTab}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="cj-header-main"
                key={active.id}
                id="journey-example-panel"
                role="tabpanel"
                aria-labelledby={`journey-tab-${active.id}`}
                tabIndex={-1}
              >
                <div className="cj-header-copy">
                  <span className="cj-badge">{active.badge}</span>
                  <h3 className="cj-title">{active.title}</h3>
                  <p className="cj-desc">{active.description}</p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <ol
              className="cj-steps"
              key={`steps-${active.id}`}
              style={
                { "--n-steps": active.steps.length } as CSSProperties
              }
            >
              {active.steps.map((step, i) => (
                <li key={`${step.entity}-${i}`} className="cj-step">
                  <div className="cj-step-node-row" aria-hidden="true">
                    <div className="cj-step-connector cj-step-connector-start" />
                    <div className="cj-step-node">
                      <span>{i + 1}</span>
                    </div>
                    <div className="cj-step-connector cj-step-connector-end" />
                  </div>

                  <div className="cj-step-body">
                    <b className="cj-step-title">{step.title}</b>
                    <p className="cj-step-text">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            {active.deliverables?.length ? (
              <div className="cj-deliverables">
                <span className="cj-del-label" id="cj-del-label">
                  {data.deliverablesLabel}
                </span>
                <ul className="cj-del-chips" aria-labelledby="cj-del-label">
                  {active.deliverables.map((item) => (
                    <li key={item} className="cj-del-chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
