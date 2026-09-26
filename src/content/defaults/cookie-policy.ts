import type { CookiePolicyContent } from "@/content/types";

/**
 * Cookie policy copy, AR + EN.
 *
 * Both locales carry SAH's reviewed legal text (provided September 2026).
 * The "Categories of Cookies We May Use" section was left as a heading only
 * in the source text — the four category descriptions below are standard
 * boilerplate (essential/functional/analytics/marketing) drafted to fill it;
 * confirm wording with SAH before treating it as final.
 *
 * Keep section `id`s identical between locales so a deep link survives a
 * language switch. When a tracking tool is added or removed, this page and
 * the "cookies" section of the Privacy Policy should be reviewed together.
 */

const LAST_UPDATED_ISO = "2026-09-01";

export const cookiePolicyEn: CookiePolicyContent = {
  eyebrow: "Legal",
  title: "Cookie Policy",
  lead: "How SAH Group uses cookies and similar technologies on this website, and your choices.",
  breadcrumbCurrent: "Cookie Policy",
  lastUpdatedIso: LAST_UPDATED_ISO,
  lastUpdatedLabel: "Last updated: September 2026",
  sections: [
    {
      id: "what-are-cookies",
      heading: "1. What Are Cookies?",
      blocks: [
        {
          type: "paragraph",
          text: "Cookies are small text files or identifiers that may be stored on or read from a user's device when visiting a website. Cookies and similar technologies may support website functionality, remember user preferences, protect the website and, depending on the tools enabled, help measure website usage and performance.",
        },
      ],
    },
    {
      id: "categories",
      heading: "2. Categories of Cookies We May Use",
      blocks: [
        {
          type: "table",
          headers: ["Category", "Purpose"],
          rows: [
            [
              "Strictly necessary",
              "Required for core website functionality and security; the website cannot operate properly without them.",
            ],
            [
              "Functional",
              "Remember choices you make, such as language or display preferences, to provide a more personalized experience.",
            ],
            [
              "Performance and analytics",
              "Where enabled, help measure website usage and performance so it can be improved.",
            ],
            [
              "Marketing",
              "Where enabled, used to personalize content or measure the effectiveness of communications.",
            ],
          ],
        },
      ],
    },
    {
      id: "cookies-technologies-used",
      heading: "3. Cookies and Technologies Used on the Website",
      blocks: [
        {
          type: "paragraph",
          text: "The cookies and similar technologies used on the SAH Group website may vary depending on the features and services enabled. Where applicable, the website's cookie preference tool will identify the relevant cookie or technology, provider, purpose, category and duration.",
        },
      ],
    },
    {
      id: "your-choices",
      heading: "4. Your Choices",
      blocks: [
        {
          type: "paragraph",
          text: "Where the website uses non-essential cookies or similar technologies that require consent, users will be provided with an appropriate choice mechanism. Users may also manage or delete cookies through their browser settings. Disabling certain cookies may affect some website functions or preferences.",
        },
      ],
    },
    {
      id: "third-party-technologies",
      heading: "5. Third-Party Technologies",
      blocks: [
        {
          type: "paragraph",
          text: "Some website functions may rely on third-party services, such as analytics, embedded media, maps, forms or social media features. These third parties may use cookies or similar technologies in accordance with their own policies. Where applicable, such technologies will be identified in the cookie preference mechanism or related notice.",
        },
      ],
    },
    {
      id: "changes",
      heading: "6. Changes to this Cookie Policy",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Group may update this Cookie Policy when the technologies used on the website change or when legal or operational requirements are updated. The date of the latest version will be shown on this page.",
        },
      ],
    },
    {
      id: "contact",
      heading: "7. Contact",
      blocks: [
        {
          type: "paragraph",
          text: "For questions about cookies or privacy on the SAH Group website, please use the official contact details published on the website.",
        },
      ],
    },
  ],
};

export const cookiePolicyAr: CookiePolicyContent = {
  eyebrow: "الشؤون النظامية",
  title: "سياسة ملفات تعريف الارتباط",
  lead: "كيف تستخدم مجموعة سعة ملفات تعريف الارتباط والتقنيات المشابهة في هذا الموقع، وخياراتك بشأنها.",
  breadcrumbCurrent: "سياسة ملفات تعريف الارتباط",
  lastUpdatedIso: LAST_UPDATED_ISO,
  lastUpdatedLabel: "آخر تحديث: سبتمبر 2026",
  sections: [
    {
      id: "what-are-cookies",
      heading: "ما هي ملفات تعريف الارتباط؟",
      blocks: [
        {
          type: "paragraph",
          text: "ملفات تعريف الارتباط هي ملفات نصية صغيرة أو معرفات يمكن تخزينها على جهاز المستخدم أو قراءتها منه عند زيارة موقع إلكتروني. وقد تدعم ملفات تعريف الارتباط والتقنيات المشابهة وظائف الموقع، وتذكر تفضيلات المستخدم، وحماية الموقع، وبحسب الأدوات المفعلة، المساعدة في قياس استخدام الموقع وأدائه.",
        },
      ],
    },
    {
      id: "categories",
      heading: "فئات ملفات تعريف الارتباط التي قد نستخدمها",
      blocks: [
        {
          type: "table",
          headers: ["الفئة", "الوصف"],
          rows: [
            [
              "الضرورية",
              "لازمة لتشغيل الوظائف الأساسية للموقع وحمايته؛ ولا يمكن للموقع العمل بشكل سليم دونها.",
            ],
            [
              "الوظيفية",
              "تتذكر الخيارات التي يحددها المستخدم، مثل اللغة أو تفضيلات العرض، لتوفير تجربة أكثر ملاءمة.",
            ],
            [
              "الأداء والتحليلات",
              "تساعد، عند تفعيلها، على قياس استخدام الموقع وأدائه بهدف تحسينه.",
            ],
            [
              "التسويقية",
              "تُستخدم، عند تفعيلها، لتخصيص المحتوى أو قياس فعالية الرسائل التسويقية.",
            ],
          ],
        },
      ],
    },
    {
      id: "cookies-technologies-used",
      heading: "ملفات تعريف الارتباط والتقنيات المستخدمة في الموقع",
      blocks: [
        {
          type: "paragraph",
          text: "قد تختلف ملفات تعريف الارتباط والتقنيات المشابهة المستخدمة في موقع مجموعة سعة بحسب المزايا والخدمات المفعلة. وعند الانطباق، ستوضح أداة تفضيلات ملفات تعريف الارتباط في الموقع اسم ملف تعريف الارتباط أو التقنية ذات الصلة، ومزودها، والغرض منها، وفئتها، ومدتها.",
        },
      ],
    },
    {
      id: "your-choices",
      heading: "خياراتك",
      blocks: [
        {
          type: "paragraph",
          text: "عندما يستخدم الموقع ملفات تعريف ارتباط غير ضرورية أو تقنيات مشابهة تتطلب الموافقة، سيتم توفير آلية مناسبة للاختيار. كما يمكن للمستخدم إدارة ملفات تعريف الارتباط أو حذفها من خلال إعدادات المتصفح. وقد يؤثر تعطيل بعض الملفات على بعض وظائف الموقع أو التفضيلات.",
        },
      ],
    },
    {
      id: "third-party-technologies",
      heading: "تقنيات الجهات الخارجية",
      blocks: [
        {
          type: "paragraph",
          text: "قد تعتمد بعض وظائف الموقع على خدمات مقدمة من جهات خارجية، مثل أدوات التحليل أو الوسائط المضمنة أو الخرائط أو النماذج أو مزايا وسائل التواصل الاجتماعي. وقد تستخدم هذه الجهات ملفات تعريف الارتباط أو تقنيات مشابهة وفق سياساتها الخاصة. وعند الانطباق، سيتم توضيح هذه التقنيات ضمن آلية تفضيلات ملفات تعريف الارتباط أو الإشعار ذي الصلة.",
        },
      ],
    },
    {
      id: "changes",
      heading: "التغييرات على سياسة ملفات تعريف الارتباط",
      blocks: [
        {
          type: "paragraph",
          text: "يجوز لمجموعة سعة تحديث هذه السياسة عند تغير التقنيات المستخدمة في الموقع أو تحديث المتطلبات النظامية أو التشغيلية. وسيظهر تاريخ أحدث إصدار على هذه الصفحة.",
        },
      ],
    },
    {
      id: "contact",
      heading: "التواصل",
      blocks: [
        {
          type: "paragraph",
          text: "للاستفسارات المتعلقة بملفات تعريف الارتباط أو الخصوصية في موقع مجموعة سعة، يرجى استخدام بيانات التواصل الرسمية المنشورة على الموقع.",
        },
      ],
    },
  ],
};
