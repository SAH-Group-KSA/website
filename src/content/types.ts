/**
 * Full shape of `src/content/{locale}/home.json`.
 *
 * These types are the contract between content (currently static JSON,
 * later a CMS-backed source — see `src/content/mappers/README.md`) and the
 * React components that render it. No component should hardcode
 * bilingual copy; everything flows through `SiteContent`.
 */

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

export type EntityId =
  "human" | "seera" | "nexus" | "connect" | "lego" | "impact" | "group";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** Short description shown inside rich dropdown panels. */
  description?: string;
  /**
   * When set with a company homepage href, the entities section can deep-link
   * to that entity after navigation (legacy hash flow).
   */
  entityId?: string;
  /** Optional sub-items — renders as a dropdown in the header. */
  children?: NavItem[];
}

export interface CtaContent {
  primary: string;
  /** Compact header CTA (AR prototype uses a shorter label than the hero). */
  header: string;
  path: string;
  contact: string;
  backToTop: string;
}

export interface LinkCta {
  label: string;
  href: string;
}

export interface MetaContent {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  siteName: string;
  tagline: string;
  motto: string;
}

export interface HeroProofItem {
  value: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  titleLines: string[];
  subtitle: string;
  body: string;
  primaryCta: LinkCta;
  secondaryCta: LinkCta;
  proof: HeroProofItem[];
  scrollLabel: string;
  proofAriaLabel: string;
  orbitAriaLabel: string;
  orbitCenterAriaLabel: string;
  scrollAriaLabel: string;
}

export interface PromiseStep {
  id: string;
  title: string;
  highlight: string;
  body: string;
}

export interface PromiseContent {
  eyebrow: string;
  titleLines: string[];
  intro: string;
  cta: LinkCta;
  steps: PromiseStep[];
}

export interface NeedStageAudience {
  title: string;
  hint?: string;
  individualLabel: string;
  organizationLabel: string;
  individualIcon?: string;
  organizationIcon?: string;
  individualHint?: string;
  organizationHint?: string;
}

export interface NeedStageChallenge {
  title: string;
  organizationTitle?: string;
  hint?: string;
}

export interface NeedStageResult {
  title: string;
  intro: string;
  outputsLabel: string;
  engagementLabel: string;
  startLabel: string;
  contactCta: string;
  backLabel: string;
  pathwayKicker?: string;
}

export interface NeedPageContent {
  heroReassure: string;
  sectionAriaLabel: string;
  breadcrumbTitle: string;
  requestForm: {
    message: string;
    submit: string;
    success: string;
    note: string;
  };
}

export interface NeedContent {
  eyebrow: string;
  title: string;
  intro: string;
  stepLabels: string[];
  stepsAriaLabel: string;
  stages: {
    audience: NeedStageAudience;
    challenge: NeedStageChallenge;
    result: NeedStageResult;
  };
  page: NeedPageContent;
}

export interface EntitiesSectionContent {
  eyebrow: string;
  title: string;
  intro: string;
  /** CTA label on each entity card (cards link to that entity's company homepage). */
  openLabel: string;
}

export interface MethodIntroContent {
  titleLines: string[];
  eyebrow: string;
  indexTitle: string;
  indexBody: string;
}

export interface MethodSectionContent {
  eyebrow: string;
  titleLines: string[];
  intro: string;
  outputsLabel: string;
  controlsAriaLabel: string;
}

export interface ProgramsSectionContent {
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  audienceAll: string;
  audienceIndividual: string;
  audienceOrganization: string;
  audienceSelectLabel?: string;
  levelAll: string;
  levelSelectLabel?: string;
  levelLabelTemplate: string;
  levelNames?: string[];
  entityAll: string;
  entityFilterLabels?: Partial<
    Record<"human" | "seera" | "nexus" | "connect" | "lego" | "impact", string>
  >;
  filterAriaLabel?: string;
  clearSearchLabel?: string;
  showing: string;
  empty: string;
  loadMore: string;
  openLabel: string;
  outcomeLabel: string;
  problemLabel: string;
  formatLabel: string;
  durationLabel: string;
  deliverablesLabel: string;
  nextLabel: string;
  askCta?: string;
  /** Detail page — register interest section */
  registerTitle?: string;
  registerLead?: string;
  registerSubmit?: string;
  registerSubmitting?: string;
  registerSuccessTitle?: string;
  registerSuccessBody?: string;
  registerBackLabel?: string;
  registerNameLabel?: string;
  registerEmailLabel?: string;
  registerPhoneLabel?: string;
  registerOrgLabel?: string;
  registerMessageLabel?: string;
  registerConsent?: string;
  registerProgramLabel?: string;
  registerError?: string;
}

export interface JourneysSectionContent {
  eyebrow: string;
  title: string;
  individualTab: string;
  organizationTab: string;
  deliverablesLabel: string;
  tabsAriaLabel: string;
}

export interface PartnersSectionContent {
  eyebrow: string;
  title: string;
  intro: string;
}

export interface ImpactMetric {
  value: number;
  suffix: string;
  label: string;
}

export interface ImpactContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  metricsEyebrow: string;
  note: string;
  chain: string[];
  chainAriaLabel?: string;
  metrics: ImpactMetric[];
}

export interface InitiativeStat {
  value: string;
  label: string;
}

export interface InitiativeCard {
  id: string;
  kind: "link";
  owner: string;
  /** Entity / platform logo under /public */
  logo?: string;
  color: "impact" | "deep" | "seera";
  title: string;
  body: string;
  stats?: InitiativeStat[];
  cta?: LinkCta;
}

export interface InitiativesContent {
  eyebrow: string;
  title: string;
  intro: string;
  cards: InitiativeCard[];
}

export interface NewsletterContent {
  eyebrow: string;
  title: string;
  body: string;
  firstNameLabel: string;
  lastNameLabel: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  emailLabel: string;
  placeholder: string;
  cta: string;
  success: string;
  error: string;
  nameError: string;
  submitError: string;
  hint?: string;
}

export interface Belief {
  title: string;
  body: string;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
}

export interface AboutContent {
  eyebrow: string;
  titleLines: string[];
  intro: string;
  visionTitle: string;
  vision: string;
  missionTitle: string;
  mission: string;
  beliefs: Belief[];
  /** Accessible name for the beliefs list. */
  beliefsAriaLabel?: string;
  foundersEyebrow: string;
  foundersTitle: string;
  foundersIntro: string;
  founders: Founder[];
  /** Latin brand motto shown LTR in both locales (prototype). */
  mediaMottoLines: string[];
}

export interface CommunityCard {
  id: string;
  accent: "impact" | "lego";
  icon: "empathy" | "lego";
  logo: string;
  label: string;
  title: string;
  body: string;
  features: string[];
  cta: string;
  whatsappMessage: string;
}

export interface CommunityApplyFormLabels {
  community: string;
  communityPlaceholder: string;
  impactOption: string;
  legoOption: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  phone: string;
  profession: string;
  professionPlaceholder: string;
  motivation: string;
  motivationPlaceholder: string;
  experience: string;
  experiencePlaceholder: string;
  consent: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successIntro: string;
  successStepsAriaLabel: string;
  successSteps: Array<{ icon: string; label: string }>;
}

export interface CommunityApplyPageContent {
  breadcrumbCommunity: string;
  heroTitle: string;
  heroLead: string;
  individualTitle: string;
  individualBody: string;
  individualFeatures: string[];
  organisationTitle: string;
  organisationBody: string;
  organisationFeatures: string[];
  formTitle: string;
  formIntro: string;
  /** Optional CMS-only developer notice; omit when empty. */
  formDevNotice?: string;
  form: CommunityApplyFormLabels;
}

export interface CommunityContent {
  eyebrow: string;
  title: string;
  intro: string;
  joinCta: string;
  cards: CommunityCard[];
  applyPage: CommunityApplyPageContent;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqContent {
  eyebrow: string;
  title: string;
  intro: string;
  items: FaqItem[];
}

export interface SahHumanOffering {
  id: string;
  href: string;
  title: string;
  body: string;
}

/** @deprecated Use EntityPageOffering — alias kept during rename. */
export type EntityPageOffering = SahHumanOffering;

export interface EntityPageContent {
  hero: HeroContent;
  promise: PromiseContent;
  offerings: {
    eyebrow: string;
    title: string;
    intro: string;
    items: EntityPageOffering[];
  };
  profile: {
    eyebrow: string;
    title: string;
    intro: string;
    whenLabel: string;
    audiencesLabel: string;
    servicesLabel: string;
    deliverablesLabel: string;
    outcomesLabel: string;
  };
  programs: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  journeys: {
    eyebrow: string;
    title: string;
  };
  faq: FaqContent;
  contactContext: string;
}

/** @deprecated Use EntityPageContent */
export type SahHumanPageContent = EntityPageContent;

export type CompanyEntityId = "human" | "seera" | "nexus" | "connect" | "lego" | "impact";

export type EntityPagesContent = Record<CompanyEntityId, EntityPageContent>;

export interface ContactFields {
  name: string;
  email: string;
  phone: string;
  org: string;
  message: string;
}

export interface ContactPlaceholders {
  message: string;
}

export interface ContactMailLabels {
  name: string;
  email: string;
  phone: string;
  organization: string;
  clientType: string;
  context: string;
  individualValue: string;
  organizationValue: string;
}

export interface ContactContent {
  eyebrow: string;
  titleLines: string[];
  intro: string;
  note: string;
  individualLabel: string;
  organizationLabel: string;
  fields: ContactFields;
  placeholders: ContactPlaceholders;
  submit: string;
  success: string;
  error: string;
  whatsappLabel: string;
  emailTo: string;
  emailDisplay?: string;
  location?: string;
  audienceAriaLabel: string;
  defaultContext: string;
  /** Subject prefix before ` — {clientType} — {context}` */
  mailSubjectPrefix: string;
  mailLabels: ContactMailLabels;
  mailNotProvided: string;
  mailChallengeHeading: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  logoAlt: string;
  blurb: string;
  /** New pages / services column */
  services: FooterColumn;
  /** Landing-page section bookmarks */
  explore: FooterColumn;
  /** Contact + account shortcuts */
  connect: FooterColumn;
  emailAddress: string;
  locationLabel: string;
  copyright: string;
  motto: string;
}

export interface UiContent {
  close: string;
  language: string;
  menuOpen: string;
  menuClose: string;
  skipToContent: string;
  backToTop: string;
  backToHome: string;
  /** Breadcrumb label for the site root (replaces hardcoded Home / الرئيسية). */
  breadcrumbHome?: string;
  primaryNav: string;
  mobileNav: string;
  footerNav?: string;
  /** Header auth/dashboard shortcuts */
  signIn: string;
  signOut: string;
  dashboard: string;
  myCourses: string;
  myBookings: string;
  myProfile: string;
  editProfile: string;
}

export interface CatalogBreadcrumbs {
  parentBrand: string;
  parentHref: string;
}

export interface CatalogDevNotice {
  label: string;
  body: string;
}

export interface CoachesListLabels {
  searchPlaceholder: string;
  searchAriaLabel: string;
  clearSearchAriaLabel: string;
  filterAriaLabel: string;
  /** Use `{count}` as placeholder, e.g. "{count} coaches available". */
  countTemplate: string;
  emptyTitle: string;
  emptyBody: string;
  bookSession: string;
  sessionSuffix: string;
  reviewsLabel: string;
  specialties: string[];
}

export interface CoachesCatalogPageContent {
  eyebrow?: string;
  title: string;
  lead: string;
  breadcrumbCurrent: string;
  breadcrumbs: CatalogBreadcrumbs;
  /** Shown when the coaches catalog is gated as coming soon. */
  comingSoon: {
    title: string;
    body: string;
  };
  devNotice: CatalogDevNotice;
  list: CoachesListLabels;
  groupCta: {
    title: string;
    body: string;
    button: string;
  };
}

export interface GroupProgramOption {
  id: string;
  title: string;
  desc: string;
}

export interface GroupInterestFormLabels {
  programLegend: string;
  programRequired: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  phone: string;
  organisation: string;
  organisationPlaceholder: string;
  goals: string;
  goalsPlaceholder: string;
  consent: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  browseCoaches: string;
}

export interface CoachesGroupCatalogPageContent {
  title: string;
  lead: string;
  breadcrumbCurrent: string;
  breadcrumbs: CatalogBreadcrumbs;
  formTitle: string;
  formIntro: string;
  /** Optional CMS-only developer notice; omit when empty. */
  devNotice?: string;
  form: GroupInterestFormLabels;
  programs: GroupProgramOption[];
}

export interface CoursesCatalogPageContent {
  title: string;
  lead: string;
  breadcrumbCurrent: string;
  breadcrumbs: CatalogBreadcrumbs;
  /** Shown when the courses catalog is gated as coming soon. */
  comingSoon: {
    title: string;
    body: string;
  };
  devNotice: CatalogDevNotice;
  getAccess: string;
  viewCourse: string;
  lessonsLabel: string;
  hoursLabel: string;
}

export interface CourseProfileCatalogPageContent {
  breadcrumbCourses: string;
  levelLabel: string;
  durationLabel: string;
  modulesLabel: string;
  priceLabel: string;
  curriculumTitle: string;
  curriculumLead: string;
  previewLabel: string;
  emptyCurriculum: string;
  comingSoon: string;
  purchaseNote: string;
}

export interface CoachProfileCatalogPageContent {
  breadcrumbCoaches: string;
  reviewsLabel: string;
  experienceLabel: string;
  languagesLabel: string;
  sessionLabel: string;
  priceLabel: string;
  sessionSuffix: string;
  bookSession: string;
  aboutTitle: string;
  credentialsTitle: string;
  bookSectionTitle: string;
  bookSectionLead: string;
  authHint: string;
  signIn: string;
  createAccount: string;
  authSub: string;
  reviewsTitle: string;
  reviewsFootnote: string;
}

export interface CatalogPagesContent {
  coaches: CoachesCatalogPageContent;
  coachesGroup: CoachesGroupCatalogPageContent;
  courses: CoursesCatalogPageContent;
  courseProfile: CourseProfileCatalogPageContent;
  coachProfile: CoachProfileCatalogPageContent;
}

/** Desktop mega-menu copy for Services / Explore panels. */
export interface MegaNavContent {
  servicesEyebrow: string;
  servicesTitle: string;
  servicesBody: string;
  servicesCtaLabel: string;
  servicesCtaHref: string;
  servicesExploreLabel: string;
  humanStripLabel: string;
  humanCoachingLabel: string;
  humanGroupLabel: string;
  humanCoursesLabel: string;
  exploreEyebrow: string;
  exploreTitle: string;
  exploreBody: string;
  exploreGroups: {
    id: string;
    label: string;
    itemIds: string[];
  }[];
}

/** Slim entity card data for the Services mega menu. */
export interface MegaNavEntity {
  id: string;
  name: string;
  specialty: string;
  color: string;
  logo?: string;
}

export interface FeaturedProgram {
  title: string;
  description: string;
  related: EntityId[];
}

export interface Entity {
  id: EntityId;
  color: string;
  name: string;
  specialty: string;
  symbol: string;
  /** Official entity logo path under /public */
  logo?: string;
  tagline: string;
  when: string;
  audiences: string[];
  services: string[];
  deliverables: string[];
  outcomes: string[];
  programs: string[];
  cardTitle: string;
  cardText: string;
  cardWhen: string;
  featuredPrograms: FeaturedProgram[];
}

export type EntityColors = Record<EntityId, string>;

export type ProgramAudience = "individual" | "organization";

export interface Program {
  id: string;
  title: string;
  entity: EntityId;
  audience: ProgramAudience;
  level: number;
  summary: string;
  outcome: string;
  problem: string;
  format: string;
  duration: string;
  deliverables: string;
  next: string;
  relatedEntities?: EntityId[];
}

export interface JourneyPathStep {
  entity: EntityId;
  title: string;
  text: string;
}

export interface JourneyChallenge {
  id: string;
  title: string;
  hint: string;
  color: EntityId;
  resultTitle: string;
  summary: string;
  path: JourneyPathStep[];
  outputs: string[];
  engagement: string;
  start: string;
}

export interface JourneyChallenges {
  individual: JourneyChallenge[];
  organization: JourneyChallenge[];
}

export interface MethodStep {
  id: string;
  number: string;
  title: string;
  text: string;
  outputs: string[];
  decision: string;
}

export interface JourneyExampleStep {
  entity: EntityId;
  title: string;
  text: string;
}

export interface JourneyExample {
  id: string;
  title: string;
  description: string;
  badge: string;
  steps: JourneyExampleStep[];
  deliverables?: string[];
}

export type PartnerCategory = "government" | "academic" | "network";

export interface Partner {
  id: string;
  name: string;
  logo?: string;
  wordmark?: string;
}

export interface SiteContent {
  locale: Locale;
  dir: Dir;
  meta: MetaContent;
  nav: NavItem[];
  cta: CtaContent;
  hero: HeroContent;
  promise: PromiseContent;
  need: NeedContent;
  entitiesSection: EntitiesSectionContent;
  methodIntro: MethodIntroContent;
  methodSection: MethodSectionContent;
  programsSection: ProgramsSectionContent;
  journeysSection: JourneysSectionContent;
  partnersSection: PartnersSectionContent;
  impact: ImpactContent;
  initiatives: InitiativesContent;
  newsletter: NewsletterContent;
  about: AboutContent;
  community: CommunityContent;
  faq: FaqContent;
  contact: ContactContent;
  footer: FooterContent;
  ui: UiContent;
  megaNav: MegaNavContent;
  /** Per-company homepage copy (SAH Human, SEERA, Nexus, …). */
  entityPages: EntityPagesContent;
  entities: Entity[];
  entityColors: EntityColors;
  programs: Program[];
  journeyChallenges: JourneyChallenges;
  methodSteps: MethodStep[];
  journeyExamples: JourneyExample[];
  partners: Partner[];
  /** Copy for coaches/courses catalog routes and coach profile chrome. */
  catalogPages?: CatalogPagesContent;
}
