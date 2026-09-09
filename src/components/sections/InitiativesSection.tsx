import type { SiteContent } from "@/content/types";
import { AppImage } from "@/components/ui/AppImage";
import { Container } from "@/components/ui/Container";
import { LocaleLink } from "@/components/ui/LocaleLink";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const colorVars = {
  impact: "var(--impact)",
  deep: "var(--deep)",
  seera: "var(--seera)",
} as const;

type Props = {
  data: SiteContent["initiatives"];
};

function InitiativeCta({
  href,
  label,
  programId,
}: {
  href: string;
  label: string;
  programId?: string;
}) {
  const chevron = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (href.startsWith("/")) {
    return (
      <LocaleLink
        href={href as `/${string}`}
        className="initiative-panel-cta"
        data-program={programId}
      >
        {label}
        {chevron}
      </LocaleLink>
    );
  }

  return (
    <a href={href} className="initiative-panel-cta" data-program={programId}>
      {label}
      {chevron}
    </a>
  );
}

export function InitiativesSection({ data }: Props) {
  return (
    <Section
      aria-labelledby="initiatives-title"
      className="initiatives"
      id="initiatives"
      atmosphere
    >
      <Container>
        <SectionHeading
          align="center"
          reveal
          eyebrow={data.eyebrow}
          title={data.title}
          id="initiatives-title"
          intro={data.intro}
        />

        <div className="initiatives-panels reveal" data-delay="90">
          {data.cards.map((card, index) => (
            <article
              key={card.id}
              className="initiative-panel"
              style={{
                ["--initiative-color" as string]: colorVars[card.color],
              }}
            >
              <div className="initiative-panel-glow" aria-hidden="true" />

              <div className="initiative-panel-head">
                {card.logo ? (
                  <div className="initiative-panel-logo">
                    <AppImage
                      src={card.logo}
                      alt={card.owner}
                      width={160}
                      height={80}
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <span className="initiative-panel-owner">{card.owner}</span>
                )}
                <span className="initiative-panel-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="initiative-panel-title">{card.title}</h3>
              <p className="initiative-panel-body">{card.body}</p>

              {card.stats?.length ? (
                <div className="initiative-panel-stats">
                  {card.stats.map((stat) => (
                    <div
                      key={`${stat.value}-${stat.label}`}
                      className="initiative-panel-stat"
                    >
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="initiative-panel-spacer" aria-hidden="true" />
              )}

              {card.cta ? (
                <InitiativeCta
                  href={card.cta.href}
                  label={card.cta.label}
                  programId={
                    card.cta.href.includes("seera-story")
                      ? "seera-story"
                      : undefined
                  }
                />
              ) : null}
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
