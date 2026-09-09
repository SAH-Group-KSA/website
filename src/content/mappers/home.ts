import type {
  CommunityCard,
  Entity,
  EntityPageContent,
  EntityPagesContent,
  Founder,
  InitiativeCard,
  Partner,
  Program,
  SiteContent,
} from "@/content/types";
import type { Locale } from "@/types/locale";
import {
  asString,
  mergeDefined,
  resolveImageUrl,
  type ImageWithAlt,
} from "@/content/mappers/shared";

type SanityHomeDocument = Partial<
  Omit<SiteContent, "locale" | "dir" | "entityPages" | "programs" | "entityColors">
> & {
  title?: string;
  published?: boolean;
};

function mapImageField(
  value: ImageWithAlt | string | undefined | null,
  fallback?: string,
): string | undefined {
  return resolveImageUrl(value, fallback);
}

function mapFounder(
  item: Founder & { photo?: ImageWithAlt | string },
  fallback?: Founder,
): Founder {
  return {
    ...item,
    photo: mapImageField(item.photo, fallback?.photo) ?? fallback?.photo ?? "",
  };
}

function mapCommunityCard(
  item: CommunityCard & { logo?: ImageWithAlt | string },
  fallback?: CommunityCard,
): CommunityCard {
  return {
    ...item,
    logo: mapImageField(item.logo, fallback?.logo) ?? fallback?.logo ?? "",
  };
}

function mapInitiativeCard(
  item: InitiativeCard & { logo?: ImageWithAlt | string },
  fallback?: InitiativeCard,
): InitiativeCard {
  return {
    ...item,
    logo: mapImageField(item.logo, fallback?.logo) ?? fallback?.logo,
  };
}

function mapEntity(
  item: Entity & { logo?: ImageWithAlt | string },
  fallback?: Entity,
): Entity {
  return {
    ...item,
    logo: mapImageField(item.logo, fallback?.logo) ?? fallback?.logo,
  };
}

function mapPartner(
  item: Partner & { logo?: ImageWithAlt | string; wordmark?: ImageWithAlt | string },
  fallback?: Partner,
): Partner {
  return {
    ...item,
    logo: mapImageField(item.logo, fallback?.logo) ?? fallback?.logo,
    wordmark: mapImageField(item.wordmark, fallback?.wordmark) ?? fallback?.wordmark,
  };
}

function mapAboutSection(
  about: SiteContent["about"] & {
    founders?: Array<Founder & { photo?: ImageWithAlt | string }>;
  },
  fallback: SiteContent["about"],
): SiteContent["about"] {
  return {
    ...about,
    founders: Array.isArray(about.founders)
      ? about.founders.map((founder, index) =>
          mapFounder(founder, fallback.founders[index]),
        )
      : fallback.founders,
  };
}

function mapCommunitySection(
  community: SiteContent["community"] & {
    cards?: Array<CommunityCard & { logo?: ImageWithAlt | string }>;
  },
  fallback: SiteContent["community"],
): SiteContent["community"] {
  const cmsApply = community.applyPage;
  const cmsNotice =
    typeof cmsApply?.formDevNotice === "string"
      ? cmsApply.formDevNotice.trim()
      : "";

  // CMS-only notice: never restore from JSON fallback when Sanity clears/omits it.
  const applyPage = {
    ...fallback.applyPage,
    ...(cmsApply ?? {}),
    ...(cmsNotice ? { formDevNotice: cmsNotice } : {}),
  };
  if (!cmsNotice) {
    delete (applyPage as { formDevNotice?: string }).formDevNotice;
  }

  return {
    ...fallback,
    ...community,
    applyPage,
    cards: Array.isArray(community.cards)
      ? community.cards.map((card, index) =>
          mapCommunityCard(card, fallback.cards[index]),
        )
      : fallback.cards,
  };
}

function mapInitiativesSection(
  initiatives: SiteContent["initiatives"] & {
    cards?: Array<InitiativeCard & { logo?: ImageWithAlt | string }>;
  },
  fallback: SiteContent["initiatives"],
): SiteContent["initiatives"] {
  return {
    ...initiatives,
    cards: Array.isArray(initiatives.cards)
      ? initiatives.cards.map((card, index) =>
          mapInitiativeCard(card, fallback.cards[index]),
        )
      : fallback.cards,
  };
}

export function mapEntities(
  entities: Array<Entity & { logo?: ImageWithAlt | string }> | undefined,
  fallback: Entity[],
): Entity[] {
  if (!Array.isArray(entities)) return fallback;
  return entities.map((entity, index) => mapEntity(entity, fallback[index]));
}

function mapPartners(
  partners: Array<Partner & { logo?: ImageWithAlt | string; wordmark?: ImageWithAlt | string }> | undefined,
  fallback: Partner[],
): Partner[] {
  if (!Array.isArray(partners)) return fallback;
  return partners.map((partner, index) => mapPartner(partner, fallback[index]));
}

/**
 * Map a CMS home document into `SiteContent`, merged onto JSON fallback.
 * Returns null when the document is missing; callers merge onto JSON fallback.
 */
export function mapHomeDocument(
  doc: unknown,
  locale: Locale,
  fallback: SiteContent,
): SiteContent | null {
  if (!doc || typeof doc !== "object") return null;
  const raw = doc as SanityHomeDocument;
  if (raw.published === false) return null;

  const partial = {
    locale,
    dir: locale === "ar" ? "rtl" : "ltr",
  } as Partial<SiteContent>;

  const keys: Array<keyof SiteContent> = [
    "hero",
    "promise",
    "need",
    "entitiesSection",
    "methodIntro",
    "methodSection",
    "programsSection",
    "journeysSection",
    "partnersSection",
    "impact",
    "initiatives",
    "newsletter",
    "about",
    "community",
    "faq",
    "methodSteps",
    "journeyChallenges",
    "journeyExamples",
    "catalogPages",
  ];

  for (const key of keys) {
    const value = (raw as Record<string, unknown>)[key];
    if (value !== undefined && value !== null) {
      (partial as Record<string, unknown>)[key] = value;
    }
  }

  if (raw.about) {
    partial.about = mapAboutSection(
      raw.about as SiteContent["about"] & {
        founders?: Array<Founder & { photo?: ImageWithAlt | string }>;
      },
      fallback.about,
    );
  }

  if (raw.community) {
    partial.community = mapCommunitySection(
      raw.community as SiteContent["community"] & {
        cards?: Array<CommunityCard & { logo?: ImageWithAlt | string }>;
      },
      fallback.community,
    );
  }

  if (raw.initiatives) {
    partial.initiatives = mapInitiativesSection(
      raw.initiatives as SiteContent["initiatives"] & {
        cards?: Array<InitiativeCard & { logo?: ImageWithAlt | string }>;
      },
      fallback.initiatives,
    );
  }

  if (raw.partners) {
    partial.partners = mapPartners(
      raw.partners as Array<
        Partner & { logo?: ImageWithAlt | string; wordmark?: ImageWithAlt | string }
      >,
      fallback.partners,
    );
  }

  return mergeDefined(fallback, partial);
}

export function mapCompanyPageDocument(
  doc: unknown,
): EntityPageContent | null {
  if (!doc || typeof doc !== "object") return null;
  const raw = doc as { content?: EntityPageContent };
  if (!raw.content || typeof raw.content !== "object") return null;
  return raw.content;
}

export function mapCompanyPagesToEntityPages(
  docs: unknown[],
  fallback: EntityPagesContent,
): EntityPagesContent {
  const out = { ...fallback };
  for (const doc of docs) {
    if (!doc || typeof doc !== "object") continue;
    const raw = doc as { entityId?: string; content?: EntityPageContent };
    const entityId = asString(raw.entityId);
    if (!entityId || !(entityId in out) || !raw.content) continue;
    out[entityId as keyof EntityPagesContent] = raw.content;
  }
  return out;
}

export function mapProgramDocument(doc: unknown): Program | null {
  if (!doc || typeof doc !== "object") return null;
  const raw = doc as {
    programId?: string;
    title?: string;
    entity?: Program["entity"];
    audience?: Program["audience"];
    level?: number;
    summary?: string;
    outcome?: string;
    problem?: string;
    format?: string;
    duration?: string;
    deliverables?: string;
    next?: string;
    relatedEntities?: Program["relatedEntities"];
    published?: boolean;
  };

  const id = asString(raw.programId);
  if (!id || raw.published === false) return null;

  return {
    id,
    title: asString(raw.title),
    entity: raw.entity ?? "human",
    audience: raw.audience ?? "individual",
    level: typeof raw.level === "number" ? raw.level : 1,
    summary: asString(raw.summary),
    outcome: asString(raw.outcome),
    problem: asString(raw.problem),
    format: asString(raw.format),
    duration: asString(raw.duration),
    deliverables: asString(raw.deliverables),
    next: asString(raw.next),
    relatedEntities: Array.isArray(raw.relatedEntities)
      ? raw.relatedEntities.filter((item): item is Program["entity"] => typeof item === "string")
      : undefined,
  };
}

export function mapPrograms(
  docs: unknown[],
  fallback: Program[],
): Program[] {
  const mapped = docs
    .map((doc) => mapProgramDocument(doc))
    .filter((program): program is Program => program !== null);

  if (mapped.length === 0) return fallback;

  const byId = new Map(fallback.map((program) => [program.id, program]));
  for (const program of mapped) {
    byId.set(program.id, program);
  }
  return Array.from(byId.values());
}
