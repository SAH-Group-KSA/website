import type { PrivacyPolicyContent } from "@/content/types";

/**
 * Privacy policy copy, AR + EN.
 *
 * ⚠️ DRAFT — written to be honest and specific about what this site actually
 * loads, but it has not been reviewed by a lawyer. The Saudi PDPL sections in
 * particular should be checked before launch.
 *
 * Keep section `id`s identical between locales so a deep link survives a
 * language switch. When a tracking tool is added or removed, update the
 * "tools" section in BOTH locales in the same change.
 */

const LAST_UPDATED_ISO = "2026-09-21";

export const privacyPolicyEn: PrivacyPolicyContent = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  lead: "How SAH Group collects, uses and protects your information when you use this website.",
  breadcrumbCurrent: "Privacy Policy",
  lastUpdatedIso: LAST_UPDATED_ISO,
  lastUpdatedLabel: "Last updated: 21 September 2026",
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Group is a Saudi group of companies based in Riyadh, Kingdom of Saudi Arabia. This policy covers sah.com.sa and its sub-pages. If you have any question about it, email us at info@sah.com.sa.",
        },
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      blocks: [
        {
          type: "paragraph",
          text: "We collect two kinds of information.",
        },
        {
          type: "paragraph",
          text: "Information you give us. When you fill in a form on this site — a contact request, a discovery session request, a group coaching or programme enquiry, a community application, or a newsletter signup — we collect what you type into it. That is typically your name and email address, and sometimes your phone number, organisation and a message.",
        },
        {
          type: "paragraph",
          text: "Information collected automatically. If you accept cookies, our analytics tools record things like the pages you visit, how long you stay, what you click, the approximate location your visit came from (city level, from your IP address), your device and browser type, your language, and the website or campaign that sent you to us.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and your choice",
      blocks: [
        {
          type: "paragraph",
          text: "Cookies are small files a website stores in your browser. We use them only for analytics — understanding how people use the site so we can improve it.",
        },
        {
          type: "paragraph",
          text: "No analytics or advertising cookie is set, and no tracking script is loaded, until you press “Accept All” on the banner shown on your first visit. If you press “Decline”, none of the tools listed below ever load, and your visit is not recorded by them. The site works exactly the same either way.",
        },
        {
          type: "paragraph",
          text: "We remember your choice in your browser's local storage so we do not ask again on every page. You can change your mind at any time using the cookie settings at the bottom of this page, or by clearing your browser data for this site.",
        },
      ],
    },
    {
      id: "tools",
      heading: "The tools we use",
      blocks: [
        {
          type: "paragraph",
          text: "When you accept cookies, we may load the following. Each is run by a separate company that acts as a data processor for us and has its own privacy policy.",
        },
        {
          type: "list",
          items: [
            "Google Analytics (GA4), by Google — tells us how many people visit, which pages they read, and which channels bring them here. We do not use it to show you adverts.",
            "PostHog — product analytics. It records which elements people click and can capture anonymised session recordings and heatmaps, so we can see where the site is confusing. It does not capture what you type into form fields.",
            "Meta Pixel, by Meta (Facebook and Instagram) — measures whether people who saw one of our adverts on Meta platforms went on to contact us, and lets us reach similar audiences.",
            "LinkedIn Insight Tag, by LinkedIn — the same measurement, for our LinkedIn campaigns.",
            "Zoho PageSense, by Zoho — heatmaps, scroll maps and page testing, to compare which layouts work better.",
            "Zoho SalesIQ, by Zoho — the live chat window, and a record of which pages a visitor viewed so that whoever replies has some context.",
          ],
        },
        {
          type: "paragraph",
          text: "These tools set their own cookies and may transfer data outside Saudi Arabia, including to the European Union and the United States. Where we can choose, we select the European data region.",
        },
      ],
    },
    {
      id: "crm",
      heading: "What happens to form submissions",
      blocks: [
        {
          type: "paragraph",
          text: "When you submit a form, the details go into Zoho CRM, the system our team uses to manage enquiries. Newsletter signups go to Zoho Campaigns. Our team uses these to reply to you and to keep track of the conversation.",
        },
        {
          type: "paragraph",
          text: "If you accepted cookies, we may also attach the campaign or website that brought you to us, so we know which of our efforts are working. If you declined, we do not attach that.",
        },
      ],
    },
    {
      id: "why",
      heading: "Why we are allowed to do this",
      blocks: [
        {
          type: "list",
          items: [
            "For analytics and marketing cookies: your consent, which you give by pressing “Accept All” and can withdraw at any time.",
            "For handling an enquiry you sent us: to take steps you have asked for, and our legitimate interest in running and improving our business.",
            "For newsletters: your consent, given when you subscribe. Every email has an unsubscribe link.",
          ],
        },
      ],
    },
    {
      id: "sharing",
      heading: "Who we share it with",
      blocks: [
        {
          type: "paragraph",
          text: "We do not sell your personal data, and we do not share it with anyone for their own marketing.",
        },
        {
          type: "paragraph",
          text: "We share it only with the service providers named above, who process it on our behalf under contract, and with authorities where the law requires it.",
        },
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      blocks: [
        {
          type: "list",
          items: [
            "Analytics data: retained by each tool under its own schedule, generally between 12 and 26 months.",
            "Enquiries and contact details in our CRM: for as long as we have an active relationship, and up to 3 years afterwards, unless you ask us to delete them sooner.",
            "Newsletter subscriptions: until you unsubscribe.",
          ],
        },
      ],
    },
    {
      id: "rights",
      heading: "Your rights",
      blocks: [
        {
          type: "paragraph",
          text: "Under the Saudi Personal Data Protection Law you can ask us to: tell you what data we hold about you, give you a copy of it, correct anything that is wrong, delete it, or stop using it for a particular purpose. You can also withdraw your consent to cookies at any time.",
        },
        {
          type: "paragraph",
          text: "Email info@sah.com.sa and we will respond. If you are not satisfied with our answer, you may complain to the Saudi Data & AI Authority (SDAIA).",
        },
      ],
    },
    {
      id: "security",
      heading: "Security",
      blocks: [
        {
          type: "paragraph",
          text: "This site is served over an encrypted connection, and access to our CRM is restricted to team members who need it. No system is perfectly secure, but we take reasonable steps to protect your information.",
        },
      ],
    },
    {
      id: "children",
      heading: "Children",
      blocks: [
        {
          type: "paragraph",
          text: "This website is intended for adults. We do not knowingly collect personal data from anyone under 18. If you believe a child has sent us their details, contact us and we will delete them.",
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        {
          type: "paragraph",
          text: "If we add or remove a tracking tool, or change how we use your information, we will update this page and the date at the top. Significant changes will reset the cookie banner so you can make a fresh choice.",
        },
      ],
    },
  ],
  cookieSettings: {
    heading: "Cookie settings",
    body: "You can change your cookie choice at any time. Resetting it will show the banner again on your next page view.",
    resetLabel: "Reset my cookie choice",
    resetConfirmation: "Your choice has been reset. The banner will appear again.",
  },
};

export const privacyPolicyAr: PrivacyPolicyContent = {
  eyebrow: "الشؤون النظامية",
  title: "سياسة الخصوصية",
  lead: "كيف تجمع مجموعة سعة معلوماتك وتستخدمها وتحميها عند استخدامك لهذا الموقع.",
  breadcrumbCurrent: "سياسة الخصوصية",
  lastUpdatedIso: LAST_UPDATED_ISO,
  lastUpdatedLabel: "آخر تحديث: ٢١ سبتمبر ٢٠٢٦",
  sections: [
    {
      id: "who-we-are",
      heading: "من نحن",
      blocks: [
        {
          type: "paragraph",
          text: "مجموعة سعة مجموعة شركات سعودية مقرها الرياض، المملكة العربية السعودية. تغطي هذه السياسة موقع sah.com.sa وصفحاته الفرعية. لأي استفسار بشأنها، راسلنا على info@sah.com.sa.",
        },
      ],
    },
    {
      id: "what-we-collect",
      heading: "ما الذي نجمعه",
      blocks: [
        {
          type: "paragraph",
          text: "نجمع نوعين من المعلومات.",
        },
        {
          type: "paragraph",
          text: "معلومات تقدمها لنا. عند تعبئة أي نموذج في الموقع — طلب تواصل، أو طلب جلسة اكتشاف، أو استفسار عن التدريب الجماعي أو أحد البرامج، أو طلب انضمام للمجتمع، أو اشتراك في النشرة البريدية — نجمع ما تكتبه فيه. ويشمل ذلك عادةً اسمك وبريدك الإلكتروني، وأحيانًا رقم جوالك وجهة عملك ورسالتك.",
        },
        {
          type: "paragraph",
          text: "معلومات تُجمع تلقائيًا. إذا وافقت على ملفات تعريف الارتباط، تسجّل أدوات التحليلات لدينا أمورًا مثل الصفحات التي تزورها، ومدة بقائك، وما تنقر عليه، والموقع التقريبي لزيارتك (على مستوى المدينة، من عنوان IP)، ونوع جهازك ومتصفحك، ولغتك، والموقع أو الحملة التي أتت بك إلينا.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "ملفات تعريف الارتباط وخيارك",
      blocks: [
        {
          type: "paragraph",
          text: "ملفات تعريف الارتباط ملفات صغيرة يخزّنها الموقع في متصفحك. نستخدمها لأغراض التحليلات فقط — أي لفهم كيفية استخدام الموقع بهدف تحسينه.",
        },
        {
          type: "paragraph",
          text: "لا يتم ضبط أي ملف تعريف ارتباط للتحليلات أو الإعلانات، ولا يتم تحميل أي نص برمجي للتتبع، إلا بعد ضغطك على «قبول الكل» في الإشعار الذي يظهر عند زيارتك الأولى. وإذا ضغطت «رفض» فلن تُحمَّل أي من الأدوات المذكورة أدناه إطلاقًا، ولن تُسجَّل زيارتك لديها. ويعمل الموقع بالطريقة نفسها في الحالتين.",
        },
        {
          type: "paragraph",
          text: "نحفظ خيارك في التخزين المحلي بمتصفحك حتى لا نسألك في كل صفحة. ويمكنك تغيير رأيك في أي وقت من خلال إعدادات ملفات تعريف الارتباط أسفل هذه الصفحة، أو بمسح بيانات المتصفح الخاصة بهذا الموقع.",
        },
      ],
    },
    {
      id: "tools",
      heading: "الأدوات التي نستخدمها",
      blocks: [
        {
          type: "paragraph",
          text: "عند موافقتك، قد نُحمّل الأدوات التالية. تُدير كلًّا منها شركة مستقلة تعمل كمعالج للبيانات نيابةً عنا، ولكلٍّ منها سياسة خصوصية خاصة بها.",
        },
        {
          type: "list",
          items: [
            "تحليلات جوجل (GA4) من شركة Google — تُظهر لنا عدد الزوار، والصفحات التي يقرؤونها، والقنوات التي تأتي بهم. ولا نستخدمها لعرض إعلانات عليك.",
            "PostHog — تحليلات المنتج. تسجّل العناصر التي ينقر عليها الزوار، ويمكنها التقاط تسجيلات جلسات مجهّلة وخرائط حرارية، لنرى أين يصبح الموقع مربكًا. ولا تلتقط ما تكتبه داخل حقول النماذج.",
            "بكسل ميتا من شركة Meta (فيسبوك وإنستقرام) — يقيس ما إذا كان من شاهد إعلاناتنا على منصات ميتا قد تواصل معنا لاحقًا، ويتيح لنا الوصول إلى جمهور مشابه.",
            "وسم LinkedIn Insight من لينكدإن — القياس نفسه، لحملاتنا على لينكدإن.",
            "Zoho PageSense من زوهو — خرائط حرارية وخرائط تمرير واختبارات للصفحات، لمقارنة التصاميم الأفضل أداءً.",
            "Zoho SalesIQ من زوهو — نافذة المحادثة المباشرة، وسجل بالصفحات التي زارها الزائر ليكون لدى من يرد عليه سياق كافٍ.",
          ],
        },
        {
          type: "paragraph",
          text: "تضبط هذه الأدوات ملفات تعريف ارتباط خاصة بها، وقد تنقل البيانات خارج المملكة العربية السعودية، بما في ذلك إلى الاتحاد الأوروبي والولايات المتحدة. ومتى ما أتيح لنا الاختيار، نختار نطاق البيانات الأوروبي.",
        },
      ],
    },
    {
      id: "crm",
      heading: "ما الذي يحدث لبيانات النماذج",
      blocks: [
        {
          type: "paragraph",
          text: "عند إرسالك أي نموذج، تنتقل البيانات إلى Zoho CRM، وهو النظام الذي يدير به فريقنا الاستفسارات. أما اشتراكات النشرة البريدية فتنتقل إلى Zoho Campaigns. ويستخدم فريقنا هذين النظامين للرد عليك ومتابعة المحادثة.",
        },
        {
          type: "paragraph",
          text: "وإذا كنت قد وافقت على ملفات تعريف الارتباط، فقد نُرفق أيضًا الحملة أو الموقع الذي أتى بك إلينا، لنعرف أي جهودنا تؤتي ثمارها. وإذا رفضت، فلن نُرفق ذلك.",
        },
      ],
    },
    {
      id: "why",
      heading: "الأساس النظامي لاستخدامنا لبياناتك",
      blocks: [
        {
          type: "list",
          items: [
            "لملفات تعريف الارتباط الخاصة بالتحليلات والتسويق: موافقتك، التي تمنحها بالضغط على «قبول الكل» ويمكنك سحبها في أي وقت.",
            "لمعالجة استفسار أرسلته إلينا: اتخاذ الإجراءات التي طلبتها، ومصلحتنا المشروعة في إدارة أعمالنا وتحسينها.",
            "للنشرات البريدية: موافقتك عند الاشتراك. ويتضمن كل بريد رابطًا لإلغاء الاشتراك.",
          ],
        },
      ],
    },
    {
      id: "sharing",
      heading: "مع من نشاركها",
      blocks: [
        {
          type: "paragraph",
          text: "لا نبيع بياناتك الشخصية، ولا نشاركها مع أي جهة لأغراضها التسويقية.",
        },
        {
          type: "paragraph",
          text: "نشاركها فقط مع مزوّدي الخدمات المذكورين أعلاه، الذين يعالجونها نيابةً عنا بموجب عقد، ومع الجهات المختصة متى ما تطلّب النظام ذلك.",
        },
      ],
    },
    {
      id: "retention",
      heading: "مدة الاحتفاظ بها",
      blocks: [
        {
          type: "list",
          items: [
            "بيانات التحليلات: تحتفظ بها كل أداة وفق جدولها الخاص، وعادةً بين ١٢ و٢٦ شهرًا.",
            "الاستفسارات وبيانات التواصل في نظام إدارة العملاء: طوال فترة العلاقة القائمة، ولمدة تصل إلى ٣ سنوات بعدها، ما لم تطلب حذفها قبل ذلك.",
            "اشتراكات النشرة البريدية: حتى إلغائك للاشتراك.",
          ],
        },
      ],
    },
    {
      id: "rights",
      heading: "حقوقك",
      blocks: [
        {
          type: "paragraph",
          text: "بموجب نظام حماية البيانات الشخصية السعودي، يحق لك أن تطلب منا: إعلامك بالبيانات التي نحتفظ بها عنك، وتزويدك بنسخة منها، وتصحيح أي معلومة غير صحيحة، وحذفها، أو إيقاف استخدامها لغرض معيّن. كما يحق لك سحب موافقتك على ملفات تعريف الارتباط في أي وقت.",
        },
        {
          type: "paragraph",
          text: "راسلنا على info@sah.com.sa وسنرد عليك. وإذا لم تكن راضيًا عن ردنا، فيمكنك تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).",
        },
      ],
    },
    {
      id: "security",
      heading: "الأمان",
      blocks: [
        {
          type: "paragraph",
          text: "يُقدَّم هذا الموقع عبر اتصال مشفّر، والوصول إلى نظام إدارة العملاء لدينا مقصور على أعضاء الفريق الذين يحتاجونه. ولا يوجد نظام آمن تمامًا، لكننا نتخذ خطوات معقولة لحماية معلوماتك.",
        },
      ],
    },
    {
      id: "children",
      heading: "الأطفال",
      blocks: [
        {
          type: "paragraph",
          text: "هذا الموقع موجّه للبالغين. ولا نجمع عن قصد بيانات شخصية لمن هم دون الثامنة عشرة. وإذا كنت تعتقد أن طفلًا أرسل إلينا بياناته، فتواصل معنا وسنحذفها.",
        },
      ],
    },
    {
      id: "changes",
      heading: "التغييرات على هذه السياسة",
      blocks: [
        {
          type: "paragraph",
          text: "إذا أضفنا أداة تتبع أو أزلناها، أو غيّرنا طريقة استخدامنا لمعلوماتك، فسنحدّث هذه الصفحة والتاريخ المذكور في أعلاها. وستؤدي التغييرات الجوهرية إلى إعادة ضبط إشعار ملفات تعريف الارتباط لتتمكن من الاختيار من جديد.",
        },
      ],
    },
  ],
  cookieSettings: {
    heading: "إعدادات ملفات تعريف الارتباط",
    body: "يمكنك تغيير خيارك في أي وقت. وستؤدي إعادة الضبط إلى ظهور الإشعار مجددًا عند تصفحك للصفحة التالية.",
    resetLabel: "إعادة ضبط خياري",
    resetConfirmation: "تمت إعادة ضبط خيارك. سيظهر الإشعار مرة أخرى.",
  },
};
