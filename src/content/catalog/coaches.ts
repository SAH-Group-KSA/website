import type { Coach, CoachRecord } from "@/domain/coach";
import type { Locale } from "@/types/locale";
import { features } from "@/lib/features";
import {
  COACHES_QUERY,
  COACH_BY_SLUG_QUERY,
  COACH_SLUGS_QUERY,
  sanityClient,
} from "@/lib/sanity";
import { mapCoachDocument } from "@/content/mappers/coach";

/**
 * Static coach catalog — single source for listing, detail, and sitemap.
 * When FEATURE_CMS=1, reads published coaches from Sanity instead.
 */
export const COACH_RECORDS: CoachRecord[] = [
  {
    slug: "ahmed-al-rashidi",
    name: "Ahmed Al-Rashidi",
    nameAr: "أحمد الرشيدي",
    specialty: "Leadership & Executive Coaching",
    specialtyAr: "القيادة والتدريب التنفيذي",
    bio: "10+ years developing leaders across Fortune 500 companies and the public sector in the GCC.",
    bioAr: "أكثر من 10 سنوات في تطوير القادة عبر شركات وقطاعات حكومية في منطقة الخليج.",
    fullBio:
      "Ahmed brings over a decade of hands-on experience coaching C-suite leaders, senior managers, and high-potential individuals across multinational corporations and Saudi government entities. His methodology blends behavioural science, systems thinking, and deep cultural intelligence to unlock measurable leadership growth.",
    fullBioAr:
      "أحمد يمتلك أكثر من عشر سنوات من الخبرة العملية في تدريب قادة المستوى التنفيذي والمديرين وأصحاب الإمكانات العالية في الشركات متعددة الجنسيات والجهات الحكومية السعودية.",
    rating: 4.9,
    reviewCount: 48,
    price: 650,
    currency: "SAR",
    experience: "12 years",
    experienceAr: "12 سنة",
    credentials: ["ICF PCC", "ORSC Certified", "Executive MBA — INSEAD"],
    credentialsAr: ["ICF PCC", "شهادة ORSC", "ماجستير إدارة الأعمال التنفيذي — INSEAD"],
    topics: ["Leadership", "Executive Presence", "Team Dynamics", "Strategic Thinking"],
    topicsAr: ["القيادة", "الحضور التنفيذي", "ديناميكيات الفريق", "التفكير الاستراتيجي"],
    languages: ["Arabic", "English"],
    languagesAr: ["العربية", "الإنجليزية"],
    sessionDuration: "60 min",
    reviews: [
      {
        author: "S.A.",
        rating: 5,
        body: "Ahmed helped me see my blind spots clearly. His structured approach was invaluable.",
        date: "2025-03",
      },
      {
        author: "K.M.",
        rating: 5,
        body: "Three sessions with Ahmed changed how I run my entire leadership team.",
        date: "2025-02",
      },
      {
        author: "R.H.",
        rating: 5,
        body: "Patient, insightful, and genuinely cares about your progress.",
        date: "2025-01",
      },
    ],
  },
  {
    slug: "sara-al-mutairi",
    name: "Sara Al-Mutairi",
    nameAr: "سارة المطيري",
    specialty: "Career & Life Coaching",
    specialtyAr: "التدريب المهني وتدريب الحياة",
    bio: "Certified ICF coach specialising in career transitions, burnout recovery, and personal purpose.",
    bioAr: "مدربة معتمدة من ICF متخصصة في تحولات المسار المهني والتعافي من الإرهاق.",
    fullBio:
      "Sara helps professionals who feel stuck—whether at a career crossroads, burnt out, or searching for deeper meaning in their work. Drawing on positive psychology and narrative coaching, she creates safe, honest conversations that move clients toward clarity and action.",
    fullBioAr:
      "سارة تساعد المهنيين الذين يشعرون بالتوقف، سواء كانوا في مفترق طرق مهني أو يعانون من الإرهاق.",
    rating: 4.8,
    reviewCount: 36,
    price: 500,
    currency: "SAR",
    experience: "8 years",
    experienceAr: "8 سنوات",
    credentials: ["ICF ACC", "Positive Psychology Certificate — U. Penn"],
    credentialsAr: ["ICF ACC", "شهادة علم النفس الإيجابي — جامعة بنسيلفانيا"],
    topics: ["Career Change", "Work-Life Balance", "Purpose", "Burnout Recovery"],
    topicsAr: ["تغيير المسار", "التوازن", "الهدف الشخصي", "التعافي من الإرهاق"],
    languages: ["Arabic", "English"],
    languagesAr: ["العربية", "الإنجليزية"],
    sessionDuration: "60 min",
    reviews: [
      {
        author: "L.A.",
        rating: 5,
        body: "Sara listened deeply and asked the right questions. I left every session with clarity.",
        date: "2025-03",
      },
      {
        author: "D.K.",
        rating: 5,
        body: "She helped me realise what I actually want — not what I thought I should want.",
        date: "2025-01",
      },
    ],
  },
  {
    slug: "khalid-al-omar",
    name: "Khalid Al-Omar",
    nameAr: "خالد العمر",
    specialty: "Business & Strategy Coaching",
    specialtyAr: "تدريب الأعمال والاستراتيجية",
    bio: "Former C-suite executive turned coach — helping founders and SME leaders scale with clarity.",
    bioAr: "مدير تنفيذي سابق تحوّل إلى مدرب — يساعد المؤسسين وقادة الشركات الصغيرة على التوسع.",
    rating: 4.9,
    reviewCount: 29,
    price: 750,
    currency: "SAR",
    topics: ["Strategy", "Business Growth", "Founder Mindset"],
    topicsAr: ["الاستراتيجية", "نمو الأعمال", "عقلية المؤسس"],
  },
  {
    slug: "nadia-hassan",
    name: "Nadia Hassan",
    nameAr: "نادية حسن",
    specialty: "Wellbeing & Resilience Coaching",
    specialtyAr: "تدريب الرفاه والمرونة",
    bio: "Psychologist and certified coach supporting professionals through stress, change, and growth.",
    bioAr: "عالمة نفس ومدربة معتمدة تدعم المهنيين في مواجهة التغيير والنمو.",
    rating: 4.7,
    reviewCount: 52,
    price: 480,
    currency: "SAR",
    topics: ["Wellbeing", "Resilience", "Stress Management"],
    topicsAr: ["الرفاه", "المرونة", "إدارة الضغط"],
  },
  {
    slug: "faris-al-qahtani",
    name: "Faris Al-Qahtani",
    nameAr: "فارس القحطاني",
    specialty: "Communication & Influence",
    specialtyAr: "التواصل والتأثير",
    bio: "Public speaking coach and communication strategist with a track record in media and education.",
    bioAr: "مدرب خطابة وخبير في استراتيجيات التواصل مع خبرة في الإعلام والتعليم.",
    rating: 4.8,
    reviewCount: 41,
    price: 550,
    currency: "SAR",
    topics: ["Public Speaking", "Storytelling", "Negotiation"],
    topicsAr: ["الخطابة", "رواية القصص", "التفاوض"],
  },
  {
    slug: "reem-al-dosari",
    name: "Reem Al-Dosari",
    nameAr: "ريم الدوسري",
    specialty: "Organisational & Team Coaching",
    specialtyAr: "تدريب المنظمات والفرق",
    bio: "Brings systemic coaching to teams — helping organisations build culture, trust, and performance.",
    bioAr: "تطبق التدريب المنظومي على الفرق لمساعدة المؤسسات في بناء الثقافة والثقة.",
    rating: 4.9,
    reviewCount: 23,
    price: 700,
    currency: "SAR",
    topics: ["Team Culture", "Trust", "Org Development"],
    topicsAr: ["ثقافة الفريق", "الثقة", "التطوير المؤسسي"],
  },
];

export function resolveCoach(record: CoachRecord, locale: Locale): Coach {
  const ar = locale === "ar";
  return {
    slug: record.slug,
    name: ar ? record.nameAr : record.name,
    specialty: ar ? record.specialtyAr : record.specialty,
    bio: ar ? record.bioAr : record.bio,
    fullBio: ar ? record.fullBioAr ?? record.fullBio : record.fullBio,
    rating: record.rating,
    reviewCount: record.reviewCount,
    price: { amount: record.price, currency: "SAR" },
    experience: ar ? record.experienceAr ?? record.experience : record.experience,
    credentials: ar ? record.credentialsAr ?? record.credentials : record.credentials,
    topics: ar ? record.topicsAr : record.topics,
    languages: ar ? record.languagesAr ?? record.languages : record.languages,
    sessionDuration: record.sessionDuration,
    zohoBookingsServiceId: record.zohoBookingsServiceId,
    photo: record.photo,
    reviews: record.reviews,
  };
}

function staticCoaches(locale: Locale): Coach[] {
  return COACH_RECORDS.map((r) => resolveCoach(r, locale));
}

export async function getCoaches(locale: Locale): Promise<Coach[]> {
  if (!features.cms) return staticCoaches(locale);

  const raw = await sanityClient.fetch<unknown[]>(
    COACHES_QUERY,
    {},
    { next: { tags: ["coaches"] } },
  );
  return (raw ?? [])
    .map((doc) => mapCoachDocument(doc, locale))
    .filter((coach): coach is Coach => coach !== null);
}

export async function getCoachBySlug(
  locale: Locale,
  slug: string,
): Promise<Coach | null> {
  if (!features.cms) {
    const record = COACH_RECORDS.find((r) => r.slug === slug);
    return record ? resolveCoach(record, locale) : null;
  }

  const raw = await sanityClient.fetch<unknown | null>(
    COACH_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ["coaches"] } },
  );
  return mapCoachDocument(raw, locale);
}

export async function getCoachSlugs(): Promise<string[]> {
  if (!features.cms) return COACH_RECORDS.map((r) => r.slug);

  const slugs = await sanityClient.fetch<(string | null)[]>(
    COACH_SLUGS_QUERY,
    {},
    { next: { tags: ["coaches"] } },
  );
  return (slugs ?? []).filter((s): s is string => typeof s === "string" && s.length > 0);
}
