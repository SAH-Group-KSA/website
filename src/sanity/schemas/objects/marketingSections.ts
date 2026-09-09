import { defineField, defineType } from "sanity";

const stringField = (name: string, rows?: number) =>
  defineField({
    name,
    type: rows ? "text" : "string",
    ...(rows ? { rows } : {}),
  });

export const needContent = defineType({
  name: "needContent",
  title: "Need / discovery",
  type: "object",
  fields: [
    stringField("eyebrow"),
    stringField("title"),
    stringField("intro", 3),
    defineField({ name: "stepLabels", type: "array", of: [{ type: "string" }] }),
    stringField("stepsAriaLabel"),
    defineField({
      name: "stages",
      type: "object",
      fields: [
        defineField({
          name: "audience",
          type: "object",
          fields: [
            stringField("title"),
            stringField("hint"),
            stringField("individualLabel"),
            stringField("organizationLabel"),
            stringField("individualIcon"),
            stringField("organizationIcon"),
            stringField("individualHint"),
            stringField("organizationHint"),
          ],
        }),
        defineField({
          name: "challenge",
          type: "object",
          fields: [
            stringField("title"),
            stringField("organizationTitle"),
            stringField("hint"),
          ],
        }),
        defineField({
          name: "result",
          type: "object",
          fields: [
            stringField("title"),
            stringField("intro", 3),
            stringField("outputsLabel"),
            stringField("engagementLabel"),
            stringField("startLabel"),
            stringField("contactCta"),
            stringField("backLabel"),
            stringField("pathwayKicker"),
          ],
        }),
      ],
    }),
    defineField({
      name: "page",
      title: "/discovery page",
      type: "object",
      description: "Copy used only on the standalone /discovery route.",
      fields: [
        stringField("heroReassure"),
        stringField("sectionAriaLabel"),
        stringField("breadcrumbTitle"),
        defineField({
          name: "requestForm",
          title: "Request form labels",
          type: "object",
          fields: [
            stringField("message"),
            stringField("submit"),
            stringField("success", 3),
            stringField("note", 3),
          ],
        }),
      ],
    }),
  ],
});

export const entitiesSectionContent = defineType({
  name: "entitiesSectionContent",
  title: "Entities section",
  type: "object",
  fields: [
    stringField("eyebrow"),
    stringField("title"),
    stringField("intro", 3),
    defineField({
      name: "openLabel",
      title: "Card CTA label",
      type: "string",
      description:
        "Shown on each entity card. Cards link to that entity's company homepage (not a modal).",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const methodIntroContent = defineType({
  name: "methodIntroContent",
  title: "Method intro",
  type: "object",
  fields: [
    defineField({ name: "titleLines", type: "array", of: [{ type: "string" }] }),
    stringField("eyebrow"),
    stringField("indexTitle"),
    stringField("indexBody", 3),
  ],
});

export const methodSectionContent = defineType({
  name: "methodSectionContent",
  title: "Method section",
  type: "object",
  fields: [
    stringField("eyebrow"),
    defineField({ name: "titleLines", type: "array", of: [{ type: "string" }] }),
    stringField("intro", 3),
    stringField("outputsLabel"),
    stringField("controlsAriaLabel"),
  ],
});

export const programsSectionContent = defineType({
  name: "programsSectionContent",
  title: "Programs section",
  type: "object",
  fields: [
    stringField("eyebrow"),
    stringField("title"),
    stringField("intro", 3),
    stringField("searchPlaceholder"),
    stringField("audienceAll"),
    stringField("audienceIndividual"),
    stringField("audienceOrganization"),
    stringField("audienceSelectLabel"),
    stringField("levelAll"),
    stringField("levelSelectLabel"),
    stringField("levelLabelTemplate"),
    defineField({ name: "levelNames", type: "array", of: [{ type: "string" }] }),
    stringField("entityAll"),
    defineField({
      name: "entityFilterLabels",
      type: "object",
      fields: [
        stringField("human"),
        stringField("seera"),
        stringField("nexus"),
        stringField("connect"),
        stringField("lego"),
        stringField("impact"),
      ],
    }),
    stringField("filterAriaLabel"),
    stringField("clearSearchLabel"),
    stringField("showing"),
    stringField("empty"),
    stringField("loadMore"),
    stringField("openLabel"),
    stringField("outcomeLabel"),
    stringField("problemLabel"),
    stringField("formatLabel"),
    stringField("durationLabel"),
    stringField("deliverablesLabel"),
    stringField("nextLabel"),
    stringField("askCta"),
    stringField("registerTitle"),
    stringField("registerLead", 3),
    stringField("registerSubmit"),
    stringField("registerSubmitting"),
    stringField("registerSuccessTitle"),
    stringField("registerSuccessBody", 3),
    stringField("registerBackLabel"),
    stringField("registerNameLabel"),
    stringField("registerEmailLabel"),
    stringField("registerPhoneLabel"),
    stringField("registerOrgLabel"),
    stringField("registerMessageLabel"),
    stringField("registerConsent", 3),
    stringField("registerProgramLabel"),
    stringField("registerError"),
  ],
});

export const journeysSectionContent = defineType({
  name: "journeysSectionContent",
  title: "Journeys section",
  type: "object",
  fields: [
    stringField("eyebrow"),
    stringField("title"),
    stringField("individualTab"),
    stringField("organizationTab"),
    stringField("deliverablesLabel"),
    stringField("tabsAriaLabel"),
  ],
});

export const partnersSectionContent = defineType({
  name: "partnersSectionContent",
  title: "Partners section",
  type: "object",
  fields: [stringField("eyebrow"), stringField("title"), stringField("intro", 3)],
});

export const impactMetric = defineType({
  name: "impactMetric",
  title: "Impact metric",
  type: "object",
  fields: [
    defineField({ name: "value", type: "number" }),
    stringField("suffix"),
    stringField("label"),
  ],
});

export const impactContent = defineType({
  name: "impactContent",
  title: "Impact",
  type: "object",
  fields: [
    stringField("eyebrow"),
    stringField("title"),
    stringField("subtitle"),
    stringField("metricsEyebrow"),
    stringField("note", 3),
    defineField({ name: "chain", type: "array", of: [{ type: "string" }] }),
    stringField("chainAriaLabel"),
    defineField({ name: "metrics", type: "array", of: [{ type: "impactMetric" }] }),
  ],
});

export const initiativeStat = defineType({
  name: "initiativeStat",
  title: "Initiative stat",
  type: "object",
  fields: [stringField("value"), stringField("label")],
});

export const initiativeCard = defineType({
  name: "initiativeCard",
  title: "Initiative card",
  type: "object",
  fields: [
    stringField("id"),
    defineField({
      name: "kind",
      type: "string",
      options: { list: [{ title: "Link", value: "link" }] },
    }),
    stringField("owner"),
    defineField({ name: "logo", type: "imageWithAlt" }),
    defineField({
      name: "color",
      type: "string",
      options: {
        list: [
          { title: "Impact", value: "impact" },
          { title: "Deep", value: "deep" },
          { title: "SEERA", value: "seera" },
        ],
      },
    }),
    stringField("title"),
    stringField("body", 3),
    defineField({ name: "stats", type: "array", of: [{ type: "initiativeStat" }] }),
    defineField({ name: "cta", type: "linkCta" }),
  ],
});

export const initiativesContent = defineType({
  name: "initiativesContent",
  title: "Initiatives",
  type: "object",
  fields: [
    stringField("eyebrow"),
    stringField("title"),
    stringField("intro", 3),
    defineField({ name: "cards", type: "array", of: [{ type: "initiativeCard" }] }),
  ],
});

export const belief = defineType({
  name: "belief",
  title: "Belief",
  type: "object",
  fields: [stringField("title"), stringField("body", 3)],
});

export const founder = defineType({
  name: "founder",
  title: "Founder",
  type: "object",
  fields: [
    stringField("id"),
    stringField("name"),
    stringField("role"),
    stringField("bio", 4),
    defineField({ name: "photo", type: "imageWithAlt" }),
  ],
});

export const aboutContent = defineType({
  name: "aboutContent",
  title: "About",
  type: "object",
  fields: [
    stringField("eyebrow"),
    defineField({ name: "titleLines", type: "array", of: [{ type: "string" }] }),
    stringField("intro", 3),
    stringField("visionTitle"),
    stringField("vision", 4),
    stringField("missionTitle"),
    stringField("mission", 4),
    defineField({ name: "beliefs", type: "array", of: [{ type: "belief" }] }),
    stringField("beliefsAriaLabel"),
    stringField("foundersEyebrow"),
    stringField("foundersTitle"),
    stringField("foundersIntro", 3),
    defineField({ name: "founders", type: "array", of: [{ type: "founder" }] }),
    defineField({ name: "mediaMottoLines", type: "array", of: [{ type: "string" }] }),
  ],
});

export const communityCard = defineType({
  name: "communityCard",
  title: "Community card",
  type: "object",
  fields: [
    stringField("id"),
    defineField({
      name: "accent",
      type: "string",
      options: {
        list: [
          { title: "Impact", value: "impact" },
          { title: "LEGO", value: "lego" },
        ],
      },
    }),
    defineField({
      name: "icon",
      type: "string",
      options: {
        list: [
          { title: "Empathy", value: "empathy" },
          { title: "LEGO", value: "lego" },
        ],
      },
    }),
    defineField({ name: "logo", type: "imageWithAlt" }),
    stringField("label"),
    stringField("title"),
    stringField("body", 3),
    defineField({ name: "features", type: "array", of: [{ type: "string" }] }),
    stringField("cta"),
    stringField("whatsappMessage"),
  ],
});

export const communityContent = defineType({
  name: "communityContent",
  title: "Community",
  type: "object",
  fields: [
    stringField("eyebrow"),
    stringField("title"),
    stringField("intro", 3),
    stringField("joinCta"),
    defineField({ name: "cards", type: "array", of: [{ type: "communityCard" }] }),
    defineField({
      name: "applyPage",
      title: "/community/apply page",
      type: "object",
      description: "Copy used only on the standalone community application route.",
      fields: [
        stringField("breadcrumbCommunity"),
        stringField("heroTitle"),
        stringField("heroLead", 3),
        stringField("individualTitle"),
        stringField("individualBody", 3),
        defineField({
          name: "individualFeatures",
          type: "array",
          of: [{ type: "string" }],
        }),
        stringField("organisationTitle"),
        stringField("organisationBody", 3),
        defineField({
          name: "organisationFeatures",
          type: "array",
          of: [{ type: "string" }],
        }),
        stringField("formTitle"),
        stringField("formIntro", 3),
        stringField("formDevNotice", 3),
        defineField({
          name: "form",
          title: "Application form labels",
          type: "object",
          fields: [
            stringField("community"),
            stringField("communityPlaceholder"),
            stringField("impactOption"),
            stringField("legoOption"),
            stringField("fullName"),
            stringField("fullNamePlaceholder"),
            stringField("email"),
            stringField("phone"),
            stringField("profession"),
            stringField("professionPlaceholder"),
            stringField("motivation"),
            stringField("motivationPlaceholder"),
            stringField("experience"),
            stringField("experiencePlaceholder"),
            stringField("consent", 3),
            stringField("submit"),
            stringField("submitting"),
            stringField("successTitle"),
            stringField("successIntro", 3),
            stringField("successStepsAriaLabel"),
            defineField({
              name: "successSteps",
              title: "Success next steps",
              type: "array",
              of: [
                defineField({
                  name: "successStep",
                  type: "object",
                  fields: [
                    stringField("icon"),
                    stringField("label"),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
});

export const contactContent = defineType({
  name: "contactContent",
  title: "Contact",
  type: "object",
  fields: [
    stringField("eyebrow"),
    defineField({ name: "titleLines", type: "array", of: [{ type: "string" }] }),
    stringField("intro", 3),
    stringField("note", 3),
    stringField("individualLabel"),
    stringField("organizationLabel"),
    defineField({
      name: "fields",
      type: "object",
      fields: [
        stringField("name"),
        stringField("email"),
        stringField("phone"),
        stringField("org"),
        stringField("message"),
      ],
    }),
    defineField({
      name: "placeholders",
      type: "object",
      fields: [stringField("message")],
    }),
    stringField("submit"),
    stringField("success"),
    stringField("error"),
    stringField("whatsappLabel"),
    stringField("emailTo"),
    stringField("emailDisplay"),
    stringField("location"),
    stringField("audienceAriaLabel"),
    stringField("defaultContext"),
    stringField("mailSubjectPrefix"),
    defineField({
      name: "mailLabels",
      type: "object",
      fields: [
        stringField("name"),
        stringField("email"),
        stringField("phone"),
        stringField("organization"),
        stringField("clientType"),
        stringField("context"),
        stringField("individualValue"),
        stringField("organizationValue"),
      ],
    }),
    stringField("mailNotProvided"),
    stringField("mailChallengeHeading"),
  ],
});

export const entityContent = defineType({
  name: "entityContent",
  title: "Entity",
  type: "object",
  fields: [
    defineField({
      name: "id",
      title: "Entity ID",
      type: "string",
      description:
        "Stable key (human, seera, nexus, connect, lego, impact). Drives theme + company homepage URL.",
      options: {
        list: [
          { title: "SAH Human", value: "human" },
          { title: "SEERA", value: "seera" },
          { title: "SAH Nexus", value: "nexus" },
          { title: "SAH Sponsor", value: "connect" },
          { title: "LEGO by SAH", value: "lego" },
          { title: "SAH Impact", value: "impact" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "color",
      title: "Accent color",
      type: "string",
      description: "Overridden on the public site by the theme registry.",
      readOnly: true,
      hidden: true,
    }),
    stringField("name"),
    stringField("specialty"),
    defineField({ name: "logo", type: "imageWithAlt" }),
    stringField("tagline"),
    stringField("when", 3),
    defineField({ name: "audiences", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "services", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "deliverables", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "outcomes", type: "array", of: [{ type: "string" }] }),
    stringField("cardTitle"),
    stringField("cardText", 3),
  ],
});

export const methodStep = defineType({
  name: "methodStep",
  title: "Method step",
  type: "object",
  fields: [
    stringField("id"),
    stringField("number"),
    stringField("title"),
    stringField("text", 3),
    defineField({ name: "outputs", type: "array", of: [{ type: "string" }] }),
    stringField("decision", 3),
  ],
});

export const journeyPathStep = defineType({
  name: "journeyPathStep",
  title: "Journey path step",
  type: "object",
  fields: [stringField("entity"), stringField("title"), stringField("text", 3)],
});

export const journeyChallenge = defineType({
  name: "journeyChallenge",
  title: "Journey challenge",
  type: "object",
  fields: [
    stringField("id"),
    stringField("title"),
    stringField("hint"),
    stringField("color"),
    stringField("resultTitle"),
    stringField("summary", 3),
    defineField({ name: "path", type: "array", of: [{ type: "journeyPathStep" }] }),
    defineField({ name: "outputs", type: "array", of: [{ type: "string" }] }),
    stringField("engagement"),
    stringField("start"),
  ],
});

export const journeyChallengesContent = defineType({
  name: "journeyChallengesContent",
  title: "Journey challenges",
  type: "object",
  fields: [
    defineField({
      name: "individual",
      type: "array",
      of: [{ type: "journeyChallenge" }],
    }),
    defineField({
      name: "organization",
      type: "array",
      of: [{ type: "journeyChallenge" }],
    }),
  ],
});

export const journeyExampleStep = defineType({
  name: "journeyExampleStep",
  title: "Journey example step",
  type: "object",
  fields: [stringField("entity"), stringField("title"), stringField("text", 3)],
});

export const journeyExample = defineType({
  name: "journeyExample",
  title: "Journey example",
  type: "object",
  fields: [
    stringField("id"),
    stringField("title"),
    stringField("description", 3),
    stringField("badge"),
    defineField({
      name: "steps",
      type: "array",
      of: [{ type: "journeyExampleStep" }],
    }),
    defineField({ name: "deliverables", type: "array", of: [{ type: "string" }] }),
  ],
});

export const partnerContent = defineType({
  name: "partnerContent",
  title: "Partner",
  type: "object",
  fields: [
    stringField("id"),
    stringField("name"),
    defineField({ name: "logo", type: "imageWithAlt" }),
    defineField({ name: "wordmark", type: "imageWithAlt" }),
  ],
});

const catalogBreadcrumbs = defineType({
  name: "catalogBreadcrumbs",
  title: "Breadcrumbs",
  type: "object",
  fields: [
    stringField("parentBrand"),
    stringField("parentHref"),
  ],
});

const catalogDevNotice = defineType({
  name: "catalogDevNotice",
  title: "Developer notice",
  type: "object",
  fields: [stringField("label"), stringField("body", 3)],
});

const coachesListLabels = defineType({
  name: "coachesListLabels",
  title: "Coaches list labels",
  type: "object",
  fields: [
    stringField("searchPlaceholder"),
    stringField("searchAriaLabel"),
    stringField("clearSearchAriaLabel"),
    stringField("filterAriaLabel"),
    stringField("countTemplate"),
    stringField("emptyTitle"),
    stringField("emptyBody"),
    stringField("bookSession"),
    stringField("sessionSuffix"),
    stringField("reviewsLabel"),
    defineField({
      name: "specialties",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});

export const coachesCatalogPageContent = defineType({
  name: "coachesCatalogPageContent",
  title: "Coaches listing (/coaches)",
  type: "object",
  fields: [
    stringField("eyebrow"),
    stringField("title"),
    stringField("lead", 3),
    stringField("breadcrumbCurrent"),
    defineField({ name: "breadcrumbs", type: "catalogBreadcrumbs" }),
    defineField({
      name: "comingSoon",
      type: "object",
      fields: [stringField("title"), stringField("body", 3)],
    }),
    defineField({ name: "devNotice", type: "catalogDevNotice" }),
    defineField({ name: "list", type: "coachesListLabels" }),
    defineField({
      name: "groupCta",
      type: "object",
      fields: [
        stringField("title"),
        stringField("body", 3),
        stringField("button"),
      ],
    }),
  ],
});

const groupProgramOption = defineType({
  name: "groupProgramOption",
  title: "Group programme option",
  type: "object",
  fields: [
    stringField("id"),
    stringField("title"),
    stringField("desc", 3),
  ],
});

const groupInterestFormLabels = defineType({
  name: "groupInterestFormLabels",
  title: "Group interest form labels",
  type: "object",
  fields: [
    stringField("programLegend"),
    stringField("programRequired"),
    stringField("fullName"),
    stringField("fullNamePlaceholder"),
    stringField("email"),
    stringField("phone"),
    stringField("organisation"),
    stringField("organisationPlaceholder"),
    stringField("goals"),
    stringField("goalsPlaceholder"),
    stringField("consent", 3),
    stringField("submit"),
    stringField("submitting"),
    stringField("successTitle"),
    stringField("successBody", 3),
    stringField("browseCoaches"),
  ],
});

export const coachesGroupCatalogPageContent = defineType({
  name: "coachesGroupCatalogPageContent",
  title: "Group coaching (/coaches/group)",
  type: "object",
  fields: [
    stringField("title"),
    stringField("lead", 3),
    stringField("breadcrumbCurrent"),
    defineField({ name: "breadcrumbs", type: "catalogBreadcrumbs" }),
    stringField("formTitle"),
    stringField("formIntro", 3),
    stringField("devNotice", 3),
    defineField({ name: "form", type: "groupInterestFormLabels" }),
    defineField({
      name: "programs",
      type: "array",
      of: [{ type: "groupProgramOption" }],
    }),
  ],
});

export const coursesCatalogPageContent = defineType({
  name: "coursesCatalogPageContent",
  title: "Courses listing (/courses)",
  type: "object",
  fields: [
    stringField("title"),
    stringField("lead", 3),
    stringField("breadcrumbCurrent"),
    defineField({ name: "breadcrumbs", type: "catalogBreadcrumbs" }),
    defineField({
      name: "comingSoon",
      type: "object",
      fields: [stringField("title"), stringField("body", 3)],
    }),
    defineField({ name: "devNotice", type: "catalogDevNotice" }),
    stringField("getAccess"),
    stringField("lessonsLabel"),
    stringField("hoursLabel"),
  ],
});

export const coachProfileCatalogPageContent = defineType({
  name: "coachProfileCatalogPageContent",
  title: "Coach profile chrome (/coaches/[slug])",
  type: "object",
  fields: [
    stringField("breadcrumbCoaches"),
    stringField("reviewsLabel"),
    stringField("experienceLabel"),
    stringField("languagesLabel"),
    stringField("sessionLabel"),
    stringField("priceLabel"),
    stringField("sessionSuffix"),
    stringField("bookSession"),
    stringField("aboutTitle"),
    stringField("credentialsTitle"),
    stringField("bookSectionTitle"),
    stringField("bookSectionLead", 3),
    stringField("authHint", 3),
    stringField("signIn"),
    stringField("createAccount"),
    stringField("authSub", 3),
    stringField("reviewsTitle"),
    stringField("reviewsFootnote", 3),
  ],
});

export const catalogPagesContent = defineType({
  name: "catalogPagesContent",
  title: "Catalog pages",
  type: "object",
  fields: [
    defineField({ name: "coaches", type: "coachesCatalogPageContent" }),
    defineField({ name: "coachesGroup", type: "coachesGroupCatalogPageContent" }),
    defineField({ name: "courses", type: "coursesCatalogPageContent" }),
    defineField({ name: "coachProfile", type: "coachProfileCatalogPageContent" }),
  ],
});

export const marketingSectionTypes = [
  needContent,
  entitiesSectionContent,
  methodIntroContent,
  methodSectionContent,
  programsSectionContent,
  journeysSectionContent,
  partnersSectionContent,
  impactMetric,
  impactContent,
  initiativeStat,
  initiativeCard,
  initiativesContent,
  belief,
  founder,
  aboutContent,
  communityCard,
  communityContent,
  contactContent,
  entityContent,
  methodStep,
  journeyPathStep,
  journeyChallenge,
  journeyChallengesContent,
  journeyExampleStep,
  journeyExample,
  partnerContent,
  catalogBreadcrumbs,
  catalogDevNotice,
  coachesListLabels,
  coachesCatalogPageContent,
  groupProgramOption,
  groupInterestFormLabels,
  coachesGroupCatalogPageContent,
  coursesCatalogPageContent,
  coachProfileCatalogPageContent,
  catalogPagesContent,
];
