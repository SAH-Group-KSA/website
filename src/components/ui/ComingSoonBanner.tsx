import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

type Props = {
  title: string;
  body: string;
};

/** Full-width coming-soon state for unfinished catalog pages. */
export function ComingSoonBanner({ title, body }: Props) {
  return (
    <Section tone="tinted">
      <Container>
        <div className="coming-soon-banner reveal" role="status">
          <span className="coming-soon-banner-eyebrow" aria-hidden="true">
            ★
          </span>
          <h2 className="coming-soon-banner-title">{title}</h2>
          <p className="coming-soon-banner-body">{body}</p>
        </div>
      </Container>
    </Section>
  );
}
