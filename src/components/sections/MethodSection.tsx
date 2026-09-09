"use client";

import { useMemo, useState } from "react";
import type { MethodStep, SiteContent } from "@/content/types";
import { MethodPanel } from "@/components/method/MethodPanel";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useRovingTablist } from "@/hooks/useRovingTablist";

type Props = { data: SiteContent["methodSection"]; steps: MethodStep[] };

export function MethodSection({ data, steps }: Props) {
  const [activeId, setActiveId] = useState(steps[0]?.id ?? "see");
  const active = steps.find((s) => s.id === activeId) ?? steps[0];
  const ids = useMemo(() => steps.map((s) => s.id), [steps]);
  const { onKeyDown } = useRovingTablist(ids, activeId, setActiveId, "vertical");

  return (
    <Section
      aria-labelledby="method-title"
      className="method"
      tone="dark"
      id="method"
    >
      <Container className="method-layout">
        <SectionHeading
          reveal
          tone="dark"
          eyebrow={data.eyebrow}
          titleLines={data.titleLines}
          id="method-title"
          intro={data.intro}
        >
          <div
            aria-label={data.controlsAriaLabel}
            className="method-controls"
            role="tablist"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
          >
            {steps.map((step) => (
              <button
                key={step.id}
                id={`method-tab-${step.id}`}
                type="button"
                role="tab"
                aria-selected={activeId === step.id}
                aria-controls="method-panel"
                tabIndex={activeId === step.id ? 0 : -1}
                data-method={step.id}
                onClick={() => setActiveId(step.id)}
              >
                <span>{step.number}</span>
                {step.title}
              </button>
            ))}
          </div>
        </SectionHeading>
        {active ? (
          <div
            className="reveal"
            data-delay="120"
            key={active.id}
            id="method-panel"
            role="tabpanel"
            aria-labelledby={`method-tab-${active.id}`}
            tabIndex={-1}
          >
            <MethodPanel step={active} />
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
