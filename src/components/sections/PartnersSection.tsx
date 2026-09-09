import type { CSSProperties } from "react";
import type { SiteContent } from "@/content/types";
import { AppImage } from "@/components/ui/AppImage";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PartnersSection({
  data,
  partners,
}: {
  data: SiteContent["partnersSection"];
  partners: SiteContent["partners"];
}) {
  const mid = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, mid);
  const row2 = partners.slice(mid);

  return (
    <Section
      aria-labelledby="partners-title"
      id="partners"
      className="partners-section"
      divider
    >
      <Container>
        <SectionHeading
          align="center"
          reveal
          eyebrow={data.eyebrow}
          title={data.title}
          id="partners-title"
          intro={data.intro}
        />
      </Container>

      <div className="partners-tracks" aria-hidden="true">
        <MarqueeRow items={row1} direction="left" speed={38} />
        <MarqueeRow items={row2} direction="right" speed={44} />
      </div>
      <ul className="visually-hidden">
        {partners.map((partner) => (
          <li key={partner.id}>{partner.name}</li>
        ))}
      </ul>
    </Section>
  );
}

function PartnerItem({
  partner,
}: {
  partner: SiteContent["partners"][number];
}) {
  return (
    <div className="partner-item">
      <div className="partner-item-logo">
        {partner.logo ? (
          <AppImage
            src={partner.logo}
            alt=""
            width={480}
            height={240}
            sizes="220px"
            className="partner-item-logo-img"
          />
        ) : partner.wordmark ? (
          <span
            className={`partner-item-wordmark${
              partner.id === "seu"
                ? " partner-item-wordmark-seu"
                : partner.id === "sewa"
                  ? " partner-item-wordmark-sewa"
                  : ""
            }`}
          >
            {partner.wordmark}
          </span>
        ) : (
          <span className="partner-item-wordmark">{partner.name[0]}</span>
        )}
      </div>
    </div>
  );
}

function MarqueeRow({
  items,
  direction,
  speed,
}: {
  items: SiteContent["partners"];
  direction: "left" | "right";
  speed: number;
}) {
  /* Two identical sequences; animation shifts by exactly 50% for a seamless loop. */
  const sequences = [items, items] as const;

  return (
    <div
      className="partners-marquee"
      data-direction={direction}
      dir="ltr"
      style={{ "--marquee-speed": `${speed}s` } as CSSProperties}
    >
      <div className="partners-marquee-inner">
        {sequences.map((sequence, sequenceIndex) => (
          <div
            key={`seq-${sequenceIndex}`}
            className="partners-marquee-group"
            aria-hidden={sequenceIndex > 0 ? true : undefined}
          >
            {sequence.map((partner, i) => (
              <PartnerItem
                key={`${partner.id}-${sequenceIndex}-${i}`}
                partner={partner}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
