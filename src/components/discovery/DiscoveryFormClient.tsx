"use client";

import type { EntityColors, SiteContent } from "@/content/types";
import { JourneyWizard } from "@/components/journey/JourneyWizard";
import { Container } from "@/components/ui/Container";

type Props = {
  data: SiteContent["need"];
  challenges: SiteContent["journeyChallenges"];
  entityColors: EntityColors;
  locale: string;
  requestFormLabels: {
    name: string;
    email: string;
    phone: string;
    message: string;
    submit: string;
    success: string;
    error: string;
    note: string;
  };
};

/**
 * Discovery-page wrapper for the 3-step journey wizard.
 * Uses the lighter "page" variant with an on-page request form.
 */
export function DiscoveryFormClient({
  data,
  challenges,
  entityColors,
  requestFormLabels,
}: Props) {
  return (
    <Container>
      <JourneyWizard
        data={data}
        challenges={challenges}
        entityColors={entityColors}
        variant="page"
        requestFormLabels={requestFormLabels}
      />
    </Container>
  );
}
