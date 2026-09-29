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
 * Sections 3-5 deliberately diverge from SAH's source text, which described a
 * per-cookie preference tool the site does not have: consent is a single
 * accept/decline choice (`ConsentValue` in `src/lib/consent.ts`). Revisit this
 * wording if that banner ever gains per-category toggles.
 *
 * Keep section `id`s identical between locales so a deep link survives a
 * language switch. When a tracking tool is added or removed, this page and
 * the "cookies" section of the Privacy Policy should be reviewed together.
 */

const LAST_UPDATED_ISO = "2026-09-26";

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
          text: "The cookies and similar technologies used on the SAH Group website may vary depending on the features and services enabled. Cookies that are strictly necessary for the website to operate are set when you visit. All other cookies and similar technologies — including those used for performance and analytics, live chat support, and marketing — are loaded only after you accept them through the cookie notice shown on your first visit.",
        },
      ],
    },
    {
      id: "your-choices",
      heading: "4. Your Choices",
      blocks: [
        {
          type: "paragraph",
          text: "On your first visit, a cookie notice lets you accept or decline all non-essential cookies and similar technologies together. If you decline, no analytics, chat or marketing technologies are loaded. You can change your choice at any time through the “Cookie settings” option on the Privacy Policy page, which brings the notice back. You may also manage or delete cookies through your browser settings. Disabling certain cookies may affect some website functions or preferences.",
        },
      ],
    },
    {
      id: "third-party-technologies",
      heading: "5. Third-Party Technologies",
      blocks: [
        {
          type: "paragraph",
          text: "Some website functions may rely on third-party services, such as analytics, live chat, embedded media, maps, forms or social media features. These third parties may use cookies or similar technologies in accordance with their own policies. Where such technologies are not strictly necessary, they are loaded only after you accept cookies through the cookie notice.",
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
          text: "قد تختلف ملفات تعريف الارتباط والتقنيات المشابهة المستخدمة في موقع مجموعة سعة بحسب المزايا والخدمات المفعلة. وتُفعّل ملفات تعريف الارتباط الضرورية لتشغيل الموقع بمجرد زيارته، أما ما عداها من ملفات وتقنيات مشابهة — بما في ذلك المستخدمة لأغراض الأداء والتحليلات، والدردشة المباشرة للدعم، والتسويق — فلا تُحمّل إلا بعد قبولك لها عبر إشعار ملفات تعريف الارتباط الذي يظهر عند زيارتك الأولى.",
        },
      ],
    },
    {
      id: "your-choices",
      heading: "خياراتك",
      blocks: [
        {
          type: "paragraph",
          text: "عند زيارتك الأولى للموقع يظهر إشعار ملفات تعريف الارتباط الذي يتيح لك قبول جميع الملفات غير الضرورية والتقنيات المشابهة أو رفضها مجتمعة. وفي حال الرفض، لا يتم تحميل أي تقنيات للتحليلات أو الدردشة أو التسويق. ويمكنك تغيير خيارك في أي وقت من خلال خيار «إعدادات ملفات تعريف الارتباط» في صفحة سياسة الخصوصية، مما يعيد إظهار الإشعار. كما يمكنك إدارة ملفات تعريف الارتباط أو حذفها من خلال إعدادات المتصفح. وقد يؤثر تعطيل بعض الملفات على بعض وظائف الموقع أو التفضيلات.",
        },
      ],
    },
    {
      id: "third-party-technologies",
      heading: "تقنيات الجهات الخارجية",
      blocks: [
        {
          type: "paragraph",
          text: "قد تعتمد بعض وظائف الموقع على خدمات مقدمة من جهات خارجية، مثل أدوات التحليل أو الدردشة المباشرة أو الوسائط المضمنة أو الخرائط أو النماذج أو مزايا وسائل التواصل الاجتماعي. وقد تستخدم هذه الجهات ملفات تعريف الارتباط أو تقنيات مشابهة وفق سياساتها الخاصة. وعندما لا تكون هذه التقنيات ضرورية لتشغيل الموقع، فلا يتم تحميلها إلا بعد قبولك عبر إشعار ملفات تعريف الارتباط.",
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
