import type { SiteContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { FaqAccordion } from "@/components/ui/Accordion";

type Props = {
  data: SiteContent["faq"];
};

export function FaqSection({ data }: Props) {
  return (
    <Section aria-labelledby="faq-title" className="faq" id="faq" atmosphere divider>
      <Container>
        <div className="faq-layout">
          <div className="faq-heading reveal">
            <Eyebrow>{data.eyebrow}</Eyebrow>
            <h2 id="faq-title" className="faq-main-title">
              {data.title}
            </h2>
            <p className="faq-intro">{data.intro}</p>
          </div>

          <FaqAccordion items={data.items} />
        </div>
      </Container>
    </Section>
  );
}
