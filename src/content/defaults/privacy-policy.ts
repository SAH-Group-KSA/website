import type { PrivacyPolicyContent } from "@/content/types";

/**
 * Privacy policy copy, AR + EN.
 *
 * Both locales carry SAH's reviewed legal text (formal PDPL-oriented policy,
 * provided September 2026).
 *
 * Keep section `id`s identical between locales so a deep link survives a
 * language switch. When a tracking tool is added or removed, update the
 * "cookies" section in BOTH locales in the same change.
 */

const LAST_UPDATED_ISO = "2026-09-01";

export const privacyPolicyEn: PrivacyPolicyContent = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  lead: "How SAH Group collects, uses, stores and discloses personal data collected through this website, and how you can exercise your rights.",
  breadcrumbCurrent: "Privacy Policy",
  lastUpdatedIso: LAST_UPDATED_ISO,
  lastUpdatedLabel: "Last updated: September 2026",
  sections: [
    {
      id: "introduction",
      heading: "Introduction",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Development Company, operating under SAH Group (“SAH Group”, “we”, “us” or “our”), respects the privacy of visitors to its website and is committed to handling personal data in accordance with the laws and regulations applicable in the Kingdom of Saudi Arabia, including the Personal Data Protection Law and its Implementing Regulations. This Privacy Policy explains what personal data may be collected through the website, why it is collected and processed, how it may be used, stored and disclosed, and how data subjects may exercise their rights.",
        },
      ],
    },
    {
      id: "scope-and-controller",
      heading: "Scope and Controller",
      blocks: [
        {
          type: "paragraph",
          text: "This Policy applies to the SAH Group website and to forms, registrations and digital interactions managed through the website, unless a separate privacy notice is provided for a specific service, event, initiative, programme or platform.",
        },
        {
          type: "paragraph",
          text: "For personal data collected through this website, the controller is SAH Development Company, operating under SAH Group, Riyadh, Kingdom of Saudi Arabia, unless otherwise stated in a specific notice.",
        },
      ],
    },
    {
      id: "data-we-collect",
      heading: "Personal Data We May Collect",
      blocks: [
        {
          type: "paragraph",
          text: "Depending on how you interact with the website, we may collect the minimum personal data reasonably required for the relevant purpose, including:",
        },
        {
          type: "list",
          items: [
            "Identification and contact information provided directly by you, such as your name, organisation, job title, email address and mobile number.",
            "Information you submit through contact, partnership, event, initiative, programme or community registration forms.",
            "Newsletter or communications preferences where such features are available.",
            "Technical information generated when you use the website, such as IP address, browser type, device information, access logs, pages viewed and similar usage data, depending on the technologies enabled on the website.",
            "Any other information you voluntarily provide in correspondence or requests submitted to SAH Group.",
          ],
        },
        {
          type: "paragraph",
          text: "SAH Group does not intend to collect personal data through the website that is unrelated to a stated purpose or service.",
        },
      ],
    },
    {
      id: "how-we-collect",
      heading: "How We Collect Personal Data",
      blocks: [
        {
          type: "list",
          items: [
            "Directly from you when you complete a form, register for an event or initiative, subscribe to communications, contact us or otherwise submit information through the website.",
            "Automatically through website logs, cookies or similar technologies, to the extent such technologies are enabled and as described in the Cookie Policy.",
          ],
        },
      ],
    },
    {
      id: "purposes",
      heading: "Purposes of Processing",
      blocks: [
        {
          type: "list",
          items: [
            "Responding to enquiries, requests for information, partnership requests and other communications.",
            "Managing registrations for events, initiatives, programmes, communities or services offered by SAH Group.",
            "Sending newsletters, updates, invitations or marketing communications where the required consent or other lawful basis applies.",
            "Operating, maintaining, securing and improving the website and its functionality.",
            "Analysing website performance and usage where analytics tools are enabled and permitted.",
            "Protecting the website, users and SAH Group systems from fraud, misuse, unauthorised access and other security risks.",
            "Complying with applicable legal and regulatory obligations and responding to lawful requests from competent authorities.",
          ],
        },
      ],
    },
    {
      id: "legal-bases",
      heading: "Legal Bases for Processing",
      blocks: [
        {
          type: "paragraph",
          text: "Depending on the relevant activity, SAH Group may process personal data on one or more lawful bases recognised under applicable Saudi laws and regulations, including consent, performance of a contract or steps requested before entering into a contract, compliance with a legal or regulatory obligation, or legitimate interests where permitted and where the applicable requirements and safeguards are satisfied.",
        },
        {
          type: "paragraph",
          text: "Where processing is based on consent, the data subject may withdraw that consent in accordance with applicable law. Withdrawal does not affect processing lawfully carried out before the withdrawal or processing supported by another lawful basis.",
        },
      ],
    },
    {
      id: "sharing",
      heading: "Disclosure and Sharing",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Group does not sell personal data. Personal data may be disclosed or made available, to the extent necessary and lawful, to:",
        },
        {
          type: "list",
          items: [
            "Technology, hosting, security, communications, analytics and operational service providers acting on behalf of SAH Group and subject to appropriate confidentiality and data protection obligations.",
            "Partners or service providers connected with a specific event, programme, initiative or request where such sharing is necessary to provide the relevant service and is consistent with the notice provided to the data subject.",
            "Government, judicial, regulatory or law-enforcement authorities where disclosure is required or permitted by law.",
            "Other parties where the data subject has provided consent and consent is required.",
          ],
        },
      ],
    },
    {
      id: "cross-border-transfers",
      heading: "Transfers or Processing Outside the Kingdom",
      blocks: [
        {
          type: "paragraph",
          text: "Where the operation of the website or a related service requires personal data to be transferred to or processed outside the Kingdom of Saudi Arabia, SAH Group will apply the requirements, safeguards and conditions applicable to cross-border transfers under Saudi law before such transfer or processing takes place.",
        },
      ],
    },
    {
      id: "retention",
      heading: "Retention and Destruction",
      blocks: [
        {
          type: "paragraph",
          text: "Personal data will be retained only for as long as necessary to achieve the purpose for which it was collected, unless a longer period is required or permitted by applicable law. When the applicable retention period ends or the purpose no longer exists, personal data will be securely destroyed, deleted or anonymised in accordance with applicable requirements.",
        },
      ],
    },
    {
      id: "security",
      heading: "Data Security",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Group applies appropriate organisational, administrative and technical measures designed to protect personal data against loss, unauthorised access, unlawful disclosure, alteration, misuse or destruction. Security measures are reviewed and adjusted according to the nature of the data, the processing activities and the associated risks.",
        },
      ],
    },
    {
      id: "rights",
      heading: "Data Subject Rights",
      blocks: [
        {
          type: "paragraph",
          text: "Subject to the conditions, limitations and exceptions set out in applicable law, data subjects may exercise rights including:",
        },
        {
          type: "list",
          items: [
            "The right to be informed about the legal basis and purpose of collecting and processing personal data.",
            "The right to access personal data held by SAH Group.",
            "The right to request a copy of personal data in a clear and readable format, where applicable.",
            "The right to request correction, completion or updating of personal data.",
            "The right to request destruction of personal data when the purpose for retaining it has ended, subject to applicable legal requirements.",
            "The right to withdraw consent where consent is the legal basis for processing, subject to applicable law.",
            "The right to submit a complaint to the competent authority in accordance with applicable law.",
          ],
        },
        {
          type: "paragraph",
          text: "Requests relating to personal data rights may be submitted through the official contact channels published on the SAH Group website. SAH Group may verify the identity of the requester where necessary and will handle requests within the periods required by applicable law.",
        },
      ],
    },
    {
      id: "marketing",
      heading: "Marketing and Communications",
      blocks: [
        {
          type: "paragraph",
          text: "Where SAH Group sends direct marketing or promotional communications using personal contact information, it will obtain and record any consent required by law and provide a clear and simple method for the recipient to stop receiving such communications.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and Similar Technologies",
      blocks: [
        {
          type: "paragraph",
          text: "The website may use cookies and similar technologies to operate website features, remember preferences, protect the website and, where enabled, measure performance or usage. Further information is provided in the Cookie Policy.",
        },
      ],
    },
    {
      id: "external-links",
      heading: "External Links",
      blocks: [
        {
          type: "paragraph",
          text: "The website may include links to third-party websites or platforms. This Privacy Policy does not govern the privacy practices of those third parties. Users should review the applicable privacy notices of third-party websites before submitting personal data to them.",
        },
      ],
    },
    {
      id: "children",
      heading: "Children's Personal Data",
      blocks: [
        {
          type: "paragraph",
          text: "The general SAH Group website is not intended to collect personal data from children. If a specific programme, initiative or service is directed to an age group that requires parental or guardian consent or additional safeguards, SAH Group will apply the relevant legal requirements and provide an appropriate privacy notice for that activity.",
        },
      ],
    },
    {
      id: "changes",
      heading: "Updates to this Policy",
      blocks: [
        {
          type: "paragraph",
          text: "SAH Group may update this Privacy Policy to reflect changes in legal, regulatory, operational or technical requirements. The date of the latest version will be shown on this page, and material changes will be communicated by an appropriate method where required.",
        },
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: [
        {
          type: "paragraph",
          text: "For questions about this Privacy Policy or requests relating to personal data, please use the official contact details published on the SAH Group website.",
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
  lead: "كيف تجمع مجموعة سعة البيانات الشخصية وتستخدمها وتحفظها وتفصح عنها من خلال هذا الموقع، وكيف يمكنك ممارسة حقوقك.",
  breadcrumbCurrent: "سياسة الخصوصية",
  lastUpdatedIso: LAST_UPDATED_ISO,
  lastUpdatedLabel: "آخر تحديث: سبتمبر ٢٠٢٦",
  sections: [
    {
      id: "introduction",
      heading: "مقدمة",
      blocks: [
        {
          type: "paragraph",
          text: "تحترم شركة سعة للتطوير، العاملة تحت مظلة مجموعة سعة («مجموعة سعة» أو «نحن»)، خصوصية زوار موقعها الإلكتروني، وتلتزم بمعالجة البيانات الشخصية وفق الأنظمة واللوائح المعمول بها في المملكة العربية السعودية، بما في ذلك نظام حماية البيانات الشخصية ولائحته التنفيذية. توضح هذه السياسة البيانات الشخصية التي قد يتم جمعها من خلال الموقع، وأسباب جمعها ومعالجتها، وكيفية استخدامها وحفظها والإفصاح عنها، وكيف يمكن لأصحاب البيانات الشخصية ممارسة حقوقهم.",
        },
      ],
    },
    {
      id: "scope-and-controller",
      heading: "نطاق السياسة وجهة التحكم",
      blocks: [
        {
          type: "paragraph",
          text: "تنطبق هذه السياسة على موقع مجموعة سعة الإلكتروني وعلى النماذج وعمليات التسجيل والتفاعلات الرقمية التي تتم من خلال الموقع، ما لم يتم تقديم إشعار خصوصية مستقل لخدمة أو فعالية أو مبادرة أو برنامج أو منصة محددة.",
        },
        {
          type: "paragraph",
          text: "بالنسبة إلى البيانات الشخصية التي يتم جمعها من خلال هذا الموقع، تكون جهة التحكم هي شركة سعة للتطوير، العاملة تحت مظلة مجموعة سعة، الرياض، المملكة العربية السعودية، ما لم يُنص على خلاف ذلك في إشعار خاص.",
        },
      ],
    },
    {
      id: "data-we-collect",
      heading: "البيانات الشخصية التي قد نجمعها",
      blocks: [
        {
          type: "paragraph",
          text: "بحسب طريقة تفاعلك مع الموقع، قد نجمع الحد الأدنى من البيانات الشخصية اللازمة بشكل معقول للغرض المعني، بما في ذلك:",
        },
        {
          type: "list",
          items: [
            "بيانات التعريف والتواصل التي تقدمها مباشرة، مثل الاسم، والجهة، والمسمى الوظيفي، والبريد الإلكتروني، ورقم الجوال.",
            "المعلومات التي تقدمها من خلال نماذج التواصل أو الشراكات أو التسجيل في الفعاليات أو المبادرات أو البرامج أو المجتمعات.",
            "تفضيلات الاشتراك في النشرات أو الرسائل، عند توفر هذه المزايا.",
            "المعلومات التقنية التي يتم إنشاؤها عند استخدام الموقع، مثل عنوان بروتوكول الإنترنت (IP)، ونوع المتصفح، ومعلومات الجهاز، وسجلات الدخول، والصفحات التي تمت زيارتها، وبيانات الاستخدام المشابهة، بحسب التقنيات المفعلة في الموقع.",
            "أي معلومات أخرى تقدمها طوعًا ضمن المراسلات أو الطلبات المرسلة إلى مجموعة سعة.",
          ],
        },
        {
          type: "paragraph",
          text: "لا تهدف مجموعة سعة إلى جمع بيانات شخصية عبر الموقع لا ترتبط بغرض أو خدمة محددة.",
        },
      ],
    },
    {
      id: "how-we-collect",
      heading: "كيفية جمع البيانات الشخصية",
      blocks: [
        {
          type: "list",
          items: [
            "مباشرة منك عند تعبئة نموذج، أو التسجيل في فعالية أو مبادرة، أو الاشتراك في الرسائل، أو التواصل معنا، أو تقديم معلومات عبر الموقع بأي وسيلة أخرى.",
            "تلقائيًا من خلال سجلات الموقع أو ملفات تعريف الارتباط أو التقنيات المشابهة، بالقدر الذي تكون فيه هذه التقنيات مفعلة ووفق ما هو موضح في سياسة ملفات تعريف الارتباط.",
          ],
        },
      ],
    },
    {
      id: "purposes",
      heading: "أغراض المعالجة",
      blocks: [
        {
          type: "list",
          items: [
            "الرد على الاستفسارات وطلبات المعلومات وطلبات الشراكة والمراسلات الأخرى.",
            "إدارة التسجيل في الفعاليات والمبادرات والبرامج والمجتمعات أو الخدمات التي تقدمها مجموعة سعة.",
            "إرسال النشرات والتحديثات والدعوات أو الرسائل التسويقية عند وجود الموافقة المطلوبة أو أي مسوغ نظامي آخر.",
            "تشغيل الموقع وصيانته وحمايته وتحسينه ووظائفه.",
            "تحليل أداء الموقع واستخدامه عند تفعيل أدوات التحليل وبما يكون مسموحًا نظامًا.",
            "حماية الموقع والمستخدمين وأنظمة مجموعة سعة من الاحتيال وسوء الاستخدام والدخول غير المصرح به والمخاطر الأمنية الأخرى.",
            "الالتزام بالمتطلبات النظامية والتنظيمية والاستجابة للطلبات المشروعة الصادرة عن الجهات المختصة.",
          ],
        },
      ],
    },
    {
      id: "legal-bases",
      heading: "المسوغات النظامية للمعالجة",
      blocks: [
        {
          type: "paragraph",
          text: "بحسب النشاط المعني، قد تعالج مجموعة سعة البيانات الشخصية استنادًا إلى واحد أو أكثر من المسوغات النظامية المعترف بها بموجب الأنظمة واللوائح السعودية ذات الصلة، بما في ذلك الموافقة، أو تنفيذ عقد أو اتخاذ خطوات بناءً على طلب صاحب البيانات قبل إبرام عقد، أو الالتزام بمتطلب نظامي أو تنظيمي، أو المصالح المشروعة حيثما كان ذلك مسموحًا ومستوفيًا للمتطلبات والضمانات المنطبقة.",
        },
        {
          type: "paragraph",
          text: "عندما تستند المعالجة إلى الموافقة، يحق لصاحب البيانات الشخصية سحب موافقته وفقًا للأنظمة المعمول بها. ولا يؤثر سحب الموافقة على المعالجة التي تمت بصورة مشروعة قبل السحب أو على المعالجة التي تستند إلى مسوغ نظامي آخر.",
        },
      ],
    },
    {
      id: "sharing",
      heading: "الإفصاح والمشاركة",
      blocks: [
        {
          type: "paragraph",
          text: "لا تبيع مجموعة سعة البيانات الشخصية. وقد يتم الإفصاح عن البيانات الشخصية أو إتاحتها، بالقدر الضروري والمشروع، إلى:",
        },
        {
          type: "list",
          items: [
            "مزودي خدمات التقنية والاستضافة والأمن والاتصالات والتحليلات والتشغيل الذين يعملون لصالح مجموعة سعة، مع خضوعهم لالتزامات مناسبة تتعلق بالسرية وحماية البيانات.",
            "الشركاء أو مزودي الخدمات المرتبطين بفعالية أو برنامج أو مبادرة أو طلب محدد، عندما تكون المشاركة ضرورية لتقديم الخدمة ذات الصلة ومتوافقة مع الإشعار المقدم لصاحب البيانات.",
            "الجهات الحكومية أو القضائية أو التنظيمية أو جهات إنفاذ النظام، عندما يكون الإفصاح مطلوبًا أو مسموحًا به نظامًا.",
            "أطراف أخرى عندما يقدم صاحب البيانات موافقته وكانت الموافقة مطلوبة.",
          ],
        },
      ],
    },
    {
      id: "cross-border-transfers",
      heading: "نقل البيانات أو معالجتها خارج المملكة",
      blocks: [
        {
          type: "paragraph",
          text: "إذا تطلب تشغيل الموقع أو خدمة مرتبطة به نقل البيانات الشخصية إلى خارج المملكة العربية السعودية أو معالجتها خارجها، فستطبق مجموعة سعة المتطلبات والضمانات والشروط النظامية الخاصة بنقل البيانات الشخصية عبر الحدود قبل إجراء ذلك النقل أو المعالجة.",
        },
      ],
    },
    {
      id: "retention",
      heading: "الاحتفاظ بالبيانات وإتلافها",
      blocks: [
        {
          type: "paragraph",
          text: "يتم الاحتفاظ بالبيانات الشخصية فقط للمدة اللازمة لتحقيق الغرض الذي جُمعت من أجله، ما لم تتطلب الأنظمة أو تسمح بمدة أطول. وعند انتهاء مدة الاحتفاظ المنطبقة أو زوال الغرض، يتم إتلاف البيانات الشخصية أو حذفها أو إخفاء هويتها بصورة آمنة وفق المتطلبات النظامية ذات الصلة.",
        },
      ],
    },
    {
      id: "security",
      heading: "أمن البيانات",
      blocks: [
        {
          type: "paragraph",
          text: "تطبق مجموعة سعة تدابير تنظيمية وإدارية وتقنية مناسبة لحماية البيانات الشخصية من الفقد أو الدخول غير المصرح به أو الإفصاح غير المشروع أو التعديل أو سوء الاستخدام أو الإتلاف. وتتم مراجعة التدابير الأمنية وتحديثها بحسب طبيعة البيانات وأنشطة المعالجة والمخاطر المرتبطة بها.",
        },
      ],
    },
    {
      id: "rights",
      heading: "حقوق صاحب البيانات الشخصية",
      blocks: [
        {
          type: "paragraph",
          text: "مع مراعاة الشروط والقيود والاستثناءات التي تحددها الأنظمة المعمول بها، يجوز لأصحاب البيانات الشخصية ممارسة حقوق تشمل:",
        },
        {
          type: "list",
          items: [
            "الحق في العلم بالمسوغ النظامي والغرض من جمع البيانات الشخصية ومعالجتها.",
            "الحق في الوصول إلى البيانات الشخصية التي تحتفظ بها مجموعة سعة.",
            "الحق في طلب نسخة من البيانات الشخصية بصيغة واضحة ومقروءة، متى كان ذلك منطبقًا.",
            "الحق في طلب تصحيح البيانات الشخصية أو إكمالها أو تحديثها.",
            "الحق في طلب إتلاف البيانات الشخصية عند انتهاء الغرض من الاحتفاظ بها، مع مراعاة المتطلبات النظامية المنطبقة.",
            "الحق في سحب الموافقة عندما تكون الموافقة هي المسوغ النظامي للمعالجة، وفقًا للأنظمة المعمول بها.",
            "الحق في تقديم شكوى إلى الجهة المختصة وفقًا للأنظمة المعمول بها.",
          ],
        },
        {
          type: "paragraph",
          text: "يمكن تقديم الطلبات المتعلقة بحقوق البيانات الشخصية عبر قنوات التواصل الرسمية المنشورة في موقع مجموعة سعة. ويجوز لمجموعة سعة التحقق من هوية مقدم الطلب عند الحاجة، وستتم معالجة الطلبات ضمن المدد التي تحددها الأنظمة المعمول بها.",
        },
      ],
    },
    {
      id: "marketing",
      heading: "التسويق والاتصالات",
      blocks: [
        {
          type: "paragraph",
          text: "عندما ترسل مجموعة سعة رسائل تسويقية أو ترويجية مباشرة باستخدام بيانات التواصل الشخصية، فستحصل على أي موافقة مطلوبة نظامًا وتوثقها، كما ستوفر وسيلة واضحة وميسرة لإيقاف تلقي هذه الرسائل.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "ملفات تعريف الارتباط والتقنيات المشابهة",
      blocks: [
        {
          type: "paragraph",
          text: "قد يستخدم الموقع ملفات تعريف الارتباط وتقنيات مشابهة لتشغيل وظائف الموقع، وتذكر التفضيلات، وحماية الموقع، وعند تفعيلها، لقياس الأداء أو الاستخدام. تتوفر معلومات إضافية في سياسة ملفات تعريف الارتباط.",
        },
      ],
    },
    {
      id: "external-links",
      heading: "الروابط الخارجية",
      blocks: [
        {
          type: "paragraph",
          text: "قد يتضمن الموقع روابط إلى مواقع أو منصات تابعة لجهات أخرى. ولا تحكم سياسة الخصوصية هذه ممارسات الخصوصية لدى تلك الجهات. ويُنصح المستخدمون بمراجعة إشعارات الخصوصية الخاصة بالمواقع الخارجية قبل تقديم بيانات شخصية إليها.",
        },
      ],
    },
    {
      id: "children",
      heading: "البيانات الشخصية للأطفال",
      blocks: [
        {
          type: "paragraph",
          text: "لا يستهدف الموقع العام لمجموعة سعة جمع البيانات الشخصية من الأطفال. وإذا كان برنامج أو مبادرة أو خدمة محددة موجهة إلى فئة عمرية تتطلب موافقة ولي الأمر أو الوصي أو ضمانات إضافية، فستطبق مجموعة سعة المتطلبات النظامية ذات الصلة وتوفر إشعار خصوصية مناسب لذلك النشاط.",
        },
      ],
    },
    {
      id: "changes",
      heading: "تحديثات هذه السياسة",
      blocks: [
        {
          type: "paragraph",
          text: "يجوز لمجموعة سعة تحديث سياسة الخصوصية لتعكس التغييرات في المتطلبات النظامية أو التنظيمية أو التشغيلية أو التقنية. وسيظهر تاريخ آخر تحديث على هذه الصفحة، وسيتم الإشعار بالتغييرات الجوهرية بالطريقة المناسبة متى كان ذلك مطلوبًا.",
        },
      ],
    },
    {
      id: "contact",
      heading: "التواصل",
      blocks: [
        {
          type: "paragraph",
          text: "للاستفسارات المتعلقة بسياسة الخصوصية أو الطلبات المتعلقة بالبيانات الشخصية، يرجى استخدام بيانات التواصل الرسمية المنشورة على موقع مجموعة سعة.",
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
