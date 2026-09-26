import type { TermsConditionsContent } from "@/content/types";

/**
 * Terms & Conditions copy, AR + EN.
 *
 * Both locales carry SAH's reviewed legal text (provided September 2026).
 *
 * Keep section `id`s identical between locales so a deep link survives a
 * language switch.
 */

const LAST_UPDATED_ISO = "2026-09-01";

export const termsConditionsEn: TermsConditionsContent = {
  eyebrow: "Legal",
  title: "Terms & Conditions",
  lead: "The terms that govern your access to and use of the SAH Group website.",
  breadcrumbCurrent: "Terms & Conditions",
  lastUpdatedIso: LAST_UPDATED_ISO,
  lastUpdatedLabel: "Last updated: September 2026",
  sections: [
    {
      id: "acceptance",
      heading: "1. Acceptance of Terms",
      blocks: [
        {
          type: "paragraph",
          text: "Access to and use of the SAH Group website are subject to these Terms & Conditions and the laws and regulations applicable in the Kingdom of Saudi Arabia. By using the website, you acknowledge that you have read and agree to these Terms & Conditions together with the Privacy Policy and Cookie Policy, as applicable.",
        },
      ],
    },
    {
      id: "purpose",
      heading: "2. Purpose of the Website",
      blocks: [
        {
          type: "paragraph",
          text: "The website provides information about SAH Group, its companies, initiatives, programmes, communities, events and activities, and may provide channels for enquiries, registration, partnership requests or other communications. Unless expressly stated otherwise, website content does not constitute a binding contractual offer or a commitment by SAH Group to provide any specific service, programme, partnership or opportunity.",
        },
      ],
    },
    {
      id: "permitted-use",
      heading: "3. Permitted Use",
      blocks: [
        {
          type: "paragraph",
          text: "You agree to use the website only for lawful purposes and in a manner that does not damage, disable, interfere with or compromise the website, SAH Group systems, or the rights of SAH Group or any third party. You must not attempt unauthorised access, introduce malicious code, misuse forms or communication channels, or use the website in violation of applicable law, intellectual property rights, privacy rights or other legal rights.",
        },
      ],
    },
    {
      id: "accuracy-availability",
      heading: "4. Accuracy and Availability of Information",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Group aims to keep website information accurate and current. However, programmes, dates, speakers, services, partnerships, opportunities or other content may change. Users should refer to official SAH Group communication channels where confirmation of a specific matter is required.",
        },
      ],
    },
    {
      id: "intellectual-property",
      heading: "5. Intellectual Property",
      blocks: [
        {
          type: "paragraph",
          text: "Unless otherwise stated, intellectual property rights in the website, including its text, layout, design, visual identity, logos, graphics, photographs, videos and other materials, are owned by SAH Group or used under licence from the relevant rights holders. Content may not be copied, reproduced, modified, republished, distributed or commercially exploited except as permitted by law or with prior authorisation from the relevant rights holder.",
        },
      ],
    },
    {
      id: "trademarks",
      heading: "6. Trademarks and Group Brands",
      blocks: [
        {
          type: "paragraph",
          text: "Names, logos, marks and visual identities associated with SAH Group, its companies, initiatives and programmes are the property of their respective rights holders. Access to the website does not grant a licence to use any such mark except as expressly permitted in writing or by applicable law.",
        },
      ],
    },
    {
      id: "external-links",
      heading: "7. External Links",
      blocks: [
        {
          type: "paragraph",
          text: "The website may contain links to third-party websites or platforms for convenience or to provide access to related information or services. The inclusion of a link does not necessarily constitute endorsement of the third party, and SAH Group is not responsible for third-party content, availability, security, terms or privacy practices.",
        },
      ],
    },
    {
      id: "user-submissions",
      heading: "8. User Submissions and Forms",
      blocks: [
        {
          type: "paragraph",
          text: "When submitting information through the website, you confirm that the information is accurate to the best of your knowledge and that you have the right to provide it. You must not submit unlawful material, malicious files, confidential information belonging to another person without authority, or material that infringes third-party rights. Personal data submitted through the website will be processed in accordance with the Privacy Policy.",
        },
      ],
    },
    {
      id: "changes-availability",
      heading: "9. Website Changes and Availability",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Group may update, modify, suspend or discontinue any part of the website or its functionality for maintenance, development, operational, legal or security reasons. The availability of a page, feature or service at a particular time does not create an obligation to maintain it in the same form indefinitely.",
        },
      ],
    },
    {
      id: "limitation-liability",
      heading: "10. Limitation of Liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the extent permitted by applicable law, SAH Group will not be responsible for losses arising solely from misuse of the website, reliance on information that has subsequently changed, technical interruptions beyond its reasonable control, or third-party websites and services that SAH Group does not operate. Nothing in these Terms & Conditions excludes or limits liability that cannot lawfully be excluded or limited.",
        },
      ],
    },
    {
      id: "privacy-personal-data",
      heading: "11. Privacy and Personal Data",
      blocks: [
        {
          type: "paragraph",
          text: "Collection and processing of personal data through the website are governed by the Privacy Policy, which forms an integral part of these Terms & Conditions.",
        },
      ],
    },
    {
      id: "amendments",
      heading: "12. Amendments",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Group may amend these Terms & Conditions when necessary. The updated version will become effective from the date it is published on the website unless another effective date is stated.",
        },
      ],
    },
    {
      id: "governing-law",
      heading: "13. Governing Law and Jurisdiction",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms & Conditions are governed by and interpreted in accordance with the laws and regulations in force in the Kingdom of Saudi Arabia. Any dispute relating to the website or these Terms & Conditions should first be addressed amicably where possible. If it cannot be resolved amicably, it will be subject to the jurisdiction of the competent court in the City of Riyadh, unless applicable law requires otherwise.",
        },
      ],
    },
    {
      id: "contact",
      heading: "14. Contact",
      blocks: [
        {
          type: "paragraph",
          text: "For enquiries relating to these Terms & Conditions, please use the official contact details published on the SAH Group website.",
        },
      ],
    },
  ],
};

export const termsConditionsAr: TermsConditionsContent = {
  eyebrow: "الشؤون النظامية",
  title: "الشروط والأحكام",
  lead: "الشروط التي تحكم دخولك إلى موقع مجموعة سعة واستخدامه له.",
  breadcrumbCurrent: "الشروط والأحكام",
  lastUpdatedIso: LAST_UPDATED_ISO,
  lastUpdatedLabel: "آخر تحديث: سبتمبر 2026",
  sections: [
    {
      id: "acceptance",
      heading: "قبول الشروط",
      blocks: [
        {
          type: "paragraph",
          text: "يخضع الدخول إلى موقع مجموعة سعة واستخدامه لهذه الشروط والأحكام وللأنظمة واللوائح المعمول بها في المملكة العربية السعودية. وباستخدام الموقع، فإنك تقر بأنك قرأت ووافقت على هذه الشروط والأحكام، إلى جانب سياسة الخصوصية وسياسة ملفات تعريف الارتباط، بحسب ما ينطبق.",
        },
      ],
    },
    {
      id: "purpose",
      heading: "غرض الموقع",
      blocks: [
        {
          type: "paragraph",
          text: "يوفر الموقع معلومات عن مجموعة سعة وشركاتها ومبادراتها وبرامجها ومجتمعاتها وفعالياتها وأنشطتها، وقد يتيح قنوات للاستفسارات أو التسجيل أو طلبات الشراكة أو غيرها من وسائل التواصل. وما لم يُذكر صراحة خلاف ذلك، فإن محتوى الموقع لا يشكل عرضًا تعاقديًا ملزمًا أو التزامًا من مجموعة سعة بتقديم خدمة أو برنامج أو شراكة أو فرصة محددة.",
        },
      ],
    },
    {
      id: "permitted-use",
      heading: "الاستخدام المسموح",
      blocks: [
        {
          type: "paragraph",
          text: "توافق على استخدام الموقع للأغراض المشروعة فقط، وبطريقة لا تضر بالموقع أو تعطل وظائفه أو تتداخل معه أو تعرض أنظمة مجموعة سعة أو حقوقها أو حقوق أي طرف ثالث للخطر. كما يجب ألا تحاول الدخول غير المصرح به، أو إدخال برمجيات أو أكواد ضارة، أو إساءة استخدام النماذج أو قنوات التواصل، أو استخدام الموقع بما يخالف الأنظمة المعمول بها أو حقوق الملكية الفكرية أو الخصوصية أو أي حقوق نظامية أخرى.",
        },
      ],
    },
    {
      id: "accuracy-availability",
      heading: "دقة المعلومات وتوفرها",
      blocks: [
        {
          type: "paragraph",
          text: "تسعى مجموعة سعة إلى إبقاء معلومات الموقع دقيقة ومحدثة. ومع ذلك، قد تتغير البرامج أو التواريخ أو المتحدثون أو الخدمات أو الشراكات أو الفرص أو غيرها من المحتويات. وعند الحاجة إلى تأكيد مسألة محددة، يُرجى الرجوع إلى قنوات التواصل الرسمية لمجموعة سعة.",
        },
      ],
    },
    {
      id: "intellectual-property",
      heading: "الملكية الفكرية",
      blocks: [
        {
          type: "paragraph",
          text: "ما لم يُذكر خلاف ذلك، فإن حقوق الملكية الفكرية المتعلقة بالموقع، بما في ذلك النصوص والتخطيط والتصميم والهوية البصرية والشعارات والرسومات والصور ومقاطع الفيديو والمواد الأخرى، مملوكة لمجموعة سعة أو مستخدمة بموجب ترخيص من أصحاب الحقوق المعنيين. ولا يجوز نسخ المحتوى أو إعادة إنتاجه أو تعديله أو إعادة نشره أو توزيعه أو استغلاله تجاريًا إلا وفق ما تسمح به الأنظمة أو بعد الحصول على تصريح مسبق من صاحب الحق المعني.",
        },
      ],
    },
    {
      id: "trademarks",
      heading: "العلامات التجارية وعلامات المجموعة",
      blocks: [
        {
          type: "paragraph",
          text: "تعود ملكية الأسماء والشعارات والعلامات والهويات البصرية المرتبطة بمجموعة سعة وشركاتها ومبادراتها وبرامجها إلى أصحاب الحقوق المعنيين. ولا يمنح الدخول إلى الموقع أي ترخيص لاستخدام أي من هذه العلامات إلا إذا تم السماح بذلك صراحة كتابةً أو بموجب الأنظمة المعمول بها.",
        },
      ],
    },
    {
      id: "external-links",
      heading: "الروابط الخارجية",
      blocks: [
        {
          type: "paragraph",
          text: "قد يحتوي الموقع على روابط لمواقع أو منصات تابعة لجهات أخرى لتسهيل الوصول أو لتوفير معلومات أو خدمات ذات صلة. ولا يعني إدراج أي رابط بالضرورة تأييد الجهة الخارجية، كما لا تتحمل مجموعة سعة مسؤولية محتوى الجهات الخارجية أو توفره أو أمنه أو شروطه أو ممارسات الخصوصية لديه.",
        },
      ],
    },
    {
      id: "user-submissions",
      heading: "المعلومات المقدمة عبر النماذج",
      blocks: [
        {
          type: "paragraph",
          text: "عند تقديم معلومات عبر الموقع، فإنك تقر بأن المعلومات صحيحة حسب علمك وأن لديك الحق في تقديمها. ويجب ألا تقدم مواد غير مشروعة، أو ملفات ضارة، أو معلومات سرية تخص شخصًا آخر دون صلاحية، أو مواد تنتهك حقوق الغير. وتتم معالجة البيانات الشخصية المقدمة عبر الموقع وفقًا لسياسة الخصوصية.",
        },
      ],
    },
    {
      id: "changes-availability",
      heading: "تغييرات الموقع وتوفره",
      blocks: [
        {
          type: "paragraph",
          text: "يجوز لمجموعة سعة تحديث أي جزء من الموقع أو وظائفه أو تعديله أو تعليقه أو إيقافه لأسباب تتعلق بالصيانة أو التطوير أو التشغيل أو المتطلبات النظامية أو الأمنية. ولا يؤدي توفر صفحة أو ميزة أو خدمة في وقت معين إلى نشوء التزام بالإبقاء عليها بالشكل ذاته بصورة دائمة.",
        },
      ],
    },
    {
      id: "limitation-liability",
      heading: "تحديد المسؤولية",
      blocks: [
        {
          type: "paragraph",
          text: "في حدود ما تسمح به الأنظمة المعمول بها، لا تتحمل مجموعة سعة مسؤولية الخسائر الناشئة حصراً عن إساءة استخدام الموقع، أو الاعتماد على معلومات تغيرت لاحقًا، أو الانقطاعات التقنية الخارجة عن نطاق سيطرتها المعقولة، أو مواقع وخدمات الجهات الخارجية التي لا تديرها مجموعة سعة. ولا تستبعد هذه الشروط والأحكام أو تحد من أي مسؤولية لا يجوز نظامًا استبعادها أو تقييدها.",
        },
      ],
    },
    {
      id: "privacy-personal-data",
      heading: "الخصوصية والبيانات الشخصية",
      blocks: [
        {
          type: "paragraph",
          text: "يخضع جمع البيانات الشخصية ومعالجتها من خلال الموقع لسياسة الخصوصية، التي تعد جزءًا مكملًا لهذه الشروط والأحكام.",
        },
      ],
    },
    {
      id: "amendments",
      heading: "التعديلات",
      blocks: [
        {
          type: "paragraph",
          text: "يجوز لمجموعة سعة تعديل هذه الشروط والأحكام عند الحاجة. ويصبح الإصدار المحدث نافذًا من تاريخ نشره على الموقع، ما لم يُحدد تاريخ نفاذ آخر.",
        },
      ],
    },
    {
      id: "governing-law",
      heading: "النظام الواجب التطبيق والاختصاص القضائي",
      blocks: [
        {
          type: "paragraph",
          text: "تخضع هذه الشروط والأحكام وتفسر وفق الأنظمة واللوائح النافذة في المملكة العربية السعودية. ويُسعى أولًا إلى معالجة أي نزاع يتعلق بالموقع أو بهذه الشروط والأحكام وديًا متى كان ذلك ممكنًا. وإذا تعذر حله وديًا، فيخضع لاختصاص المحكمة المختصة في مدينة الرياض، ما لم تقضِ الأنظمة المعمول بها بخلاف ذلك.",
        },
      ],
    },
    {
      id: "contact",
      heading: "التواصل",
      blocks: [
        {
          type: "paragraph",
          text: "للاستفسارات المتعلقة بهذه الشروط والأحكام، يرجى استخدام بيانات التواصل الرسمية المنشورة على موقع مجموعة سعة.",
        },
      ],
    },
  ],
};
