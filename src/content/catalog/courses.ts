import type { Course, CourseDetail, CourseRecord } from "@/domain/course";
import type { Locale } from "@/types/locale";
import { features } from "@/lib/features";
import {
  COURSES_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSE_SLUGS_QUERY,
  sanityClient,
} from "@/lib/sanity";
import { mapCourseDetailDocument, mapCourseDocument } from "@/content/mappers/course";

/**
 * Static course catalog — listing today; `/courses/[slug]` later.
 * When FEATURE_CMS=1, reads published courses from Sanity instead.
 */
export const COURSE_RECORDS: CourseRecord[] = [
  {
    slug: "leadership-fundamentals",
    titleEn: "Leadership Fundamentals",
    titleAr: "أساسيات القيادة",
    descEn:
      "Build the core mindsets and behaviours that define effective modern leadership.",
    descAr: "طوّر عقليات وسلوكيات القيادة الحديثة الفعّالة.",
    modules: 8,
    durationHours: 6,
    price: 490,
    currency: "SAR",
    level: "Beginner",
    levelAr: "مبتدئ",
  },
  {
    slug: "strategic-thinking",
    titleEn: "Strategic Thinking for Leaders",
    titleAr: "التفكير الاستراتيجي للقادة",
    descEn:
      "Master the frameworks and tools used by senior leaders to make better decisions.",
    descAr: "أتقن الأطر والأدوات التي يستخدمها القادة لاتخاذ قرارات أفضل.",
    modules: 10,
    durationHours: 8,
    price: 690,
    currency: "SAR",
    level: "Intermediate",
    levelAr: "متوسط",
  },
  {
    slug: "wellbeing-at-work",
    titleEn: "Wellbeing at Work",
    titleAr: "الرفاه في بيئة العمل",
    descEn:
      "Practical techniques to build resilience, manage stress, and thrive professionally.",
    descAr: "تقنيات عملية لبناء المرونة وإدارة الضغط والازدهار المهني.",
    modules: 6,
    durationHours: 4,
    price: 350,
    currency: "SAR",
    level: "Beginner",
    levelAr: "مبتدئ",
  },
  {
    slug: "executive-communication",
    titleEn: "Executive Communication",
    titleAr: "التواصل التنفيذي",
    descEn:
      "Communicate with confidence, influence, and clarity at every organisational level.",
    descAr: "تواصل بثقة وتأثير ووضوح على جميع المستويات المؤسسية.",
    modules: 7,
    durationHours: 5,
    price: 490,
    currency: "SAR",
    level: "Intermediate",
    levelAr: "متوسط",
  },
  {
    slug: "change-management",
    titleEn: "Leading Change",
    titleAr: "قيادة التغيير",
    descEn:
      "How to guide teams and organisations through meaningful, sustained transformation.",
    descAr: "كيف توجّه الفرق والمنظمات خلال تحول حقيقي ومستدام.",
    modules: 9,
    durationHours: 7,
    price: 590,
    currency: "SAR",
    level: "Advanced",
    levelAr: "متقدم",
  },
  {
    slug: "coaching-skills",
    titleEn: "Coaching Skills for Managers",
    titleAr: "مهارات التدريب للمدراء",
    descEn:
      "Develop the coaching mindset and tools to unlock your team's full potential.",
    descAr: "طوّر عقلية التدريب وأدواته لإطلاق إمكانات فريقك الكاملة.",
    modules: 8,
    durationHours: 6,
    price: 490,
    currency: "SAR",
    level: "Intermediate",
    levelAr: "متوسط",
  },
];

export function resolveCourse(record: CourseRecord, locale: Locale): Course {
  const ar = locale === "ar";
  return {
    slug: record.slug,
    title: ar ? record.titleAr : record.titleEn,
    description: ar ? record.descAr : record.descEn,
    level: ar ? record.levelAr : record.level,
    modules: record.modules,
    durationHours: record.durationHours,
    price: { amount: record.price, currency: "SAR" },
    videoPlatform: record.videoPlatform,
    thumbnail: record.thumbnail,
    thumbnailAlt: ar
      ? (record.thumbnailAltAr ?? record.titleAr)
      : (record.thumbnailAltEn ?? record.titleEn),
  };
}

function staticCourses(locale: Locale): Course[] {
  return COURSE_RECORDS.map((r) => resolveCourse(r, locale));
}

export async function getCourses(locale: Locale): Promise<Course[]> {
  if (!features.cms) return staticCourses(locale);

  const raw = await sanityClient.fetch<unknown[]>(
    COURSES_QUERY,
    {},
    { next: { tags: ["courses"] } },
  );
  return (raw ?? [])
    .map((doc) => mapCourseDocument(doc, locale))
    .filter((course): course is Course => course !== null);
}

export async function getCourseBySlug(
  locale: Locale,
  slug: string,
): Promise<CourseDetail | null> {
  if (!features.cms) {
    const record = COURSE_RECORDS.find((r) => r.slug === slug);
    return record ? { ...resolveCourse(record, locale), modulesList: [] } : null;
  }

  const raw = await sanityClient.fetch<unknown | null>(
    COURSE_BY_SLUG_QUERY,
    { slug },
    { next: { tags: ["courses"] } },
  );
  return mapCourseDetailDocument(raw, locale);
}

export async function getCourseSlugs(): Promise<string[]> {
  if (!features.cms) return COURSE_RECORDS.map((r) => r.slug);

  const slugs = await sanityClient.fetch<(string | null)[]>(
    COURSE_SLUGS_QUERY,
    {},
    { next: { tags: ["courses"] } },
  );
  return (slugs ?? []).filter((s): s is string => typeof s === "string" && s.length > 0);
}
