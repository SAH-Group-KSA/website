"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { EntityColors, SiteContent } from "@/content/types";
import type { Locale } from "@/types/locale";
import { Button } from "@/components/ui/Button";
import { DiscoveryRequestForm } from "@/components/discovery/DiscoveryRequestForm";
import { JourneyStage } from "@/components/journey/JourneyStage";
import { resolveEntityColor } from "@/lib/utils/entity";
import { cn } from "@/lib/utils";

type Audience = "individual" | "organization";

type RequestFormLabels = {
  name: string;
  email: string;
  phone: string;
  message: string;
  submit: string;
  success: string;
  error: string;
  note: string;
};

type Props = {
  data: SiteContent["need"];
  challenges: SiteContent["journeyChallenges"];
  entityColors: EntityColors;
  /** `page` = lighter discovery UX; `embedded` = denser shell (default). */
  variant?: "page" | "embedded";
  /** Inline request form labels (required for `variant="page"`). */
  requestFormLabels?: RequestFormLabels;
};

/**
 * The interactive 3-step pathway wizard.
 * Renders the `journey-shell` only — no Section/Container/Heading wrapper.
 */
export function JourneyWizard({
  data,
  challenges,
  entityColors,
  variant = "embedded",
  requestFormLabels,
}: Props) {
  const locale = useLocale() as Locale;
  const isRTL = locale === "ar";
  const isPage = variant === "page";

  const [audience, setAudience] = useState<Audience | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const stageIndex = (challengeId ? 2 : audience ? 1 : 0) as 0 | 1 | 2;
  const shellRef = useRef<HTMLDivElement>(null);

  const available = useMemo(
    () => (audience ? challenges[audience] : []),
    [audience, challenges],
  );
  const selected = useMemo(
    () => available.find((c) => c.id === challengeId) ?? null,
    [available, challengeId],
  );

  const stepLabels = data.stepLabels ?? [
    data.stages.audience.title,
    data.stages.challenge.title,
    data.stages.result.title,
  ];

  const challengeTitle =
    audience === "organization" && data.stages.challenge.organizationTitle
      ? data.stages.challenge.organizationTitle
      : data.stages.challenge.title;

  const back = () => {
    if (stageIndex === 2) { setChallengeId(null); setContactOpen(false); }
    else if (stageIndex === 1) { setAudience(null); setChallengeId(null); }
  };

  const reset = () => {
    setAudience(null);
    setChallengeId(null);
    setContactOpen(false);
  };

  const navigateToStage = (index: 0 | 1 | 2) => {
    if (index === 0) reset();
    else if (index === 1) setChallengeId(null);
  };

  useEffect(() => {
    if (stageIndex === 0) return;
    const shell = shellRef.current;
    if (!shell) return;
    const headerH = 90;
    const rect = shell.getBoundingClientRect();
    if (rect.top < headerH || rect.top > window.innerHeight * 0.55) {
      window.scrollTo({
        top: window.scrollY + rect.top - headerH - 12,
        behavior: "smooth",
      });
    }
  }, [stageIndex]);

  const backArrow = isRTL ? "→" : "←";
  const resetLabel = isRTL ? "البداية من جديد" : "Start over";
  const backLabel = data.stages.result.backLabel;
  const chooseHint = isRTL ? "اختر خياراً واحداً" : "Choose one to continue";

  const audienceLabel =
    audience === "individual"
      ? data.stages.audience.individualLabel
      : audience === "organization"
        ? data.stages.audience.organizationLabel
        : null;

  const individualIcon = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 19c1.5-3.2 4-5 7-5s5.5 1.8 7 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );

  const organizationIcon = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20V8.5L12 4l8 4.5V20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 10h.01M15 10h.01M12 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const chevron = (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={isRTL ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div
      className={cn("journey-shell", isPage && "is-discovery")}
      ref={shellRef}
    >
      <div className="journey-progress-bar">
        <JourneyStage
          labels={stepLabels}
          currentIndex={stageIndex}
          ariaLabel={data.stepsAriaLabel}
          onNavigate={navigateToStage}
          variant={isPage ? "discovery" : "default"}
        />
        <p className="journey-step-status" aria-live="polite">
          {isRTL
            ? `الخطوة ${stageIndex + 1} من 3`
            : `Step ${stageIndex + 1} of 3`}
          {audienceLabel && stageIndex > 0 ? (
            <>
              <span aria-hidden="true"> · </span>
              <span className="journey-step-status-context">{audienceLabel}</span>
            </>
          ) : null}
        </p>
      </div>

      {stageIndex === 0 ? (
        <div
          key="stage-audience"
          className="journey-stage journey-stage-animated"
          id="journey-stage-audience"
        >
          <div className="journey-stage-heading">
            {!isPage ? (
              <span className="stage-number" aria-hidden="true">
                1
              </span>
            ) : null}
            <div>
              <h3>{data.stages.audience.title}</h3>
              <p>{data.stages.audience.hint ?? chooseHint}</p>
            </div>
          </div>
          <div className="audience-options">
            <button
              className="audience-card"
              data-audience="individual"
              type="button"
              onClick={() => {
                setAudience("individual");
                setChallengeId(null);
              }}
            >
              <span aria-hidden="true" className="audience-icon">
                {isPage
                  ? individualIcon
                  : (data.stages.audience.individualIcon ?? "I")}
              </span>
              <b>{data.stages.audience.individualLabel}</b>
              <small>{data.stages.audience.individualHint ?? ""}</small>
              <span aria-hidden="true" className="card-arrow">
                {isPage ? chevron : isRTL ? "←" : "→"}
              </span>
            </button>
            <button
              className="audience-card"
              data-audience="organization"
              type="button"
              onClick={() => {
                setAudience("organization");
                setChallengeId(null);
              }}
            >
              <span aria-hidden="true" className="audience-icon">
                {isPage
                  ? organizationIcon
                  : (data.stages.audience.organizationIcon ?? "O")}
              </span>
              <b>{data.stages.audience.organizationLabel}</b>
              <small>{data.stages.audience.organizationHint ?? ""}</small>
              <span aria-hidden="true" className="card-arrow">
                {isPage ? chevron : isRTL ? "←" : "→"}
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {stageIndex === 1 ? (
        <div
          key="stage-challenge"
          className="journey-stage journey-stage-animated"
          id="journey-stage-challenge"
        >
          <div className="journey-stage-heading">
            <button
              aria-label={backLabel}
              className="back-button"
              type="button"
              onClick={back}
            >
              <span className="back-arrow" aria-hidden="true">
                {backArrow}
              </span>
            </button>
            {!isPage ? (
              <span className="stage-number" aria-hidden="true">
                2
              </span>
            ) : null}
            <div>
              <h3 id="challenge-heading">{challengeTitle}</h3>
              <p>{data.stages.challenge.hint ?? chooseHint}</p>
            </div>
          </div>
          <div className="challenge-grid" id="challenge-grid">
            {available.map((ch) => (
              <button
                key={ch.id}
                className="challenge-card"
                type="button"
                data-challenge={ch.id}
                style={{
                  ["--challenge-color" as string]: resolveEntityColor(
                    entityColors,
                    ch.color,
                  ),
                }}
                onClick={() => setChallengeId(ch.id)}
              >
                <span>
                  <b>{ch.title}</b>
                  <small>{ch.hint}</small>
                </span>
                <span className="challenge-arrow" aria-hidden="true">
                  {isPage ? chevron : isRTL ? "←" : "→"}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {stageIndex === 2 && selected ? (
        <div
          key="stage-result"
          aria-live="polite"
          className="journey-stage journey-stage-animated"
          id="journey-stage-result"
        >
          <div className="journey-stage-heading">
            <button
              aria-label={backLabel}
              className="back-button"
              type="button"
              onClick={back}
            >
              <span className="back-arrow" aria-hidden="true">
                {backArrow}
              </span>
            </button>
            {!isPage ? (
              <span className="stage-number" aria-hidden="true">
                3
              </span>
            ) : null}
            <div>
              <h3>{data.stages.result.title}</h3>
              <p>{data.stages.result.intro}</p>
            </div>
          </div>
          <div className="recommendation" id="journey-result">
            <section className="recommendation-main">
              <span className="recommendation-kicker">
                {data.stages.result.pathwayKicker ?? data.stages.result.title}
              </span>
              <h4>{selected.resultTitle}</h4>
              <p className="recommendation-summary">{selected.summary}</p>
              <div className="recommendation-path">
                {selected.path.map((step, i) => (
                  <div
                    key={`${step.entity}-${i}`}
                    className="path-item"
                    style={{
                      ["--path-color" as string]: resolveEntityColor(
                        entityColors,
                        step.entity,
                      ),
                    }}
                  >
                    <span className="path-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <b>{step.title}</b>
                      <p>{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <aside
              className="recommendation-side"
              data-contact-open={contactOpen ? "" : undefined}
            >
              {!contactOpen ? (
                <div className="rec-summary" key="summary">
                  <h4>{data.stages.result.outputsLabel}</h4>
                  <ul className="output-list">
                    {selected.outputs.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="recommendation-meta">
                    <div>
                      <small>{data.stages.result.engagementLabel}</small>
                      <b>{selected.engagement}</b>
                    </div>
                    <div>
                      <small>{data.stages.result.startLabel}</small>
                      <b>{selected.start}</b>
                    </div>
                  </div>
                  {isPage && requestFormLabels ? (
                    <Button
                      type="button"
                      variant="gold"
                      className="rec-cta"
                      onClick={() => setContactOpen(true)}
                    >
                      {data.stages.result.contactCta}
                      <span aria-hidden="true"> {chevron}</span>
                    </Button>
                  ) : (
                    <Button
                      href="#contact"
                      variant="gold"
                      className="rec-cta"
                    >
                      {data.stages.result.contactCta}
                      <span aria-hidden="true"> {chevron}</span>
                    </Button>
                  )}
                </div>
              ) : requestFormLabels ? (
                <div className="rec-contact" key="contact">
                  <button
                    type="button"
                    className="rec-contact-back"
                    onClick={() => setContactOpen(false)}
                    aria-label={backLabel}
                  >
                    <span aria-hidden="true">{backArrow}</span>
                    {isRTL ? "عودة" : "Back"}
                  </button>
                  <DiscoveryRequestForm
                    pathwayTitle={selected.resultTitle}
                    audienceLabel={audienceLabel ?? ""}
                    needLabel={selected.title}
                    labels={requestFormLabels}
                    isRTL={isRTL}
                    onSuccess={() => {
                      /* stay in place — form shows success state */
                    }}
                  />
                </div>
              ) : null}

              <button
                type="button"
                className="journey-start-over"
                onClick={reset}
              >
                {backArrow} {resetLabel}
              </button>
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  );
}
