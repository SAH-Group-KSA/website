import type { ApplyAsCoachContent } from "@/content/types";

/**
 * "Apply as Coach" page copy, AR + EN.
 *
 * Draft copy pending SAH's final text. Option `id`s must match
 * `COACH_SPECIALISATIONS` / `COACH_LANGUAGES` in `src/lib/coach-application.ts`
 * — those ids are what the API route accepts and maps to Zoho picklist values.
 */

export const applyAsCoachEn: ApplyAsCoachContent = {
  title: "Apply as a Coach",
  lead: "Join SAH Group's network of coaches. Tell us about your experience and we'll be in touch about the next steps.",
  breadcrumbCurrent: "Apply as a Coach",
  formTitle: "Coach application",
  formIntro: "Fields marked * are required. It takes about five minutes.",
  form: {
    fullName: "Full name",
    fullNamePlaceholder: "Your full name",
    email: "Email",
    phone: "Mobile number",
    phoneCountry: "Country code",
    phonePlaceholder: "5X XXX XXXX",
    phonePlaceholderIntl: "Mobile number",
    phoneHint: "Choose your country code, then enter your mobile number.",
    city: "City",
    cityPlaceholder: "e.g. Riyadh",
    specialisation: "Coaching specialisation",
    specialisationPlaceholder: "Select a specialisation",
    specialisationOptions: [
      { id: "life", label: "Life coaching" },
      { id: "executive", label: "Executive & leadership coaching" },
      { id: "career", label: "Career coaching" },
      { id: "team", label: "Team coaching" },
      { id: "wellbeing", label: "Wellbeing coaching" },
      { id: "relationships", label: "Relationships & family coaching" },
      { id: "other", label: "Other" },
    ],
    yearsExperience: "Years of coaching experience",
    yearsExperiencePlaceholder: "e.g. 5",
    certifications: "Certifications",
    certificationsPlaceholder: "e.g. ICF PCC, EMCC",
    linkedinUrl: "LinkedIn profile URL",
    linkedinUrlPlaceholder: "https://www.linkedin.com/in/…",
    language: "Preferred coaching language",
    languageOptions: [
      { id: "ar", label: "Arabic" },
      { id: "en", label: "English" },
      { id: "both", label: "Both" },
    ],
    bio: "Short bio or motivation",
    bioPlaceholder:
      "Your coaching approach, the clients you work with, and why you want to join SAH.",
    consent:
      "I agree to be contacted by SAH Group about my application and to the processing of my data as described in the",
    privacyPolicyLink: "Privacy Policy",
    honeypotLabel: "Leave this field empty",
    submit: "Submit application",
    submitting: "Submitting…",
    retry: "Try again",
    successTitle: "Application received",
    successBody:
      "Thank you for applying. Our team will review your application and contact you by email or phone.",
    errors: {
      fullName: "Please enter your full name.",
      email: "Please enter a valid email address.",
      phone: "Please enter a valid mobile number for the selected country code.",
      city: "Please enter your city.",
      specialisation: "Please select a specialisation.",
      yearsExperience: "Please enter a whole number of years between 0 and 60.",
      linkedinUrl: "Please enter a linkedin.com profile URL, or leave it empty.",
      language: "Please choose a coaching language.",
      bio: "Please tell us a little about yourself.",
      consent: "Please confirm your consent to continue.",
      duplicateEmail:
        "We already have an application with this email. If you need to update it, please contact us.",
      duplicatePhone:
        "We already have an application with this mobile number. If you need to update it, please contact us.",
      duplicate:
        "We already have an application with these details. If you need to update it, please contact us.",
    },
  },
};

export const applyAsCoachAr: ApplyAsCoachContent = {
  title: "انضم كمدرب",
  lead: "انضم إلى شبكة مدربي مجموعة سعة. أخبرنا عن خبرتك وسنتواصل معك بشأن الخطوات التالية.",
  breadcrumbCurrent: "انضم كمدرب",
  formTitle: "طلب الانضمام كمدرب",
  formIntro: "الحقول المميزة بـ * مطلوبة. يستغرق الطلب نحو خمس دقائق.",
  form: {
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "اسمك الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الجوال",
    phoneCountry: "رمز الدولة",
    phonePlaceholder: "5X XXX XXXX",
    phonePlaceholderIntl: "رقم الجوال",
    phoneHint: "اختر رمز الدولة، ثم أدخل رقم جوالك.",
    city: "المدينة",
    cityPlaceholder: "مثال: الرياض",
    specialisation: "مجال التدريب",
    specialisationPlaceholder: "اختر مجال التدريب",
    specialisationOptions: [
      { id: "life", label: "التدريب الحياتي" },
      { id: "executive", label: "التدريب التنفيذي والقيادي" },
      { id: "career", label: "التدريب المهني" },
      { id: "team", label: "تدريب الفرق" },
      { id: "wellbeing", label: "تدريب جودة الحياة" },
      { id: "relationships", label: "تدريب العلاقات والأسرة" },
      { id: "other", label: "أخرى" },
    ],
    yearsExperience: "سنوات الخبرة في التدريب",
    yearsExperiencePlaceholder: "مثال: 5",
    certifications: "الشهادات",
    certificationsPlaceholder: "مثال: ICF PCC، EMCC",
    linkedinUrl: "رابط الملف الشخصي على LinkedIn",
    linkedinUrlPlaceholder: "https://www.linkedin.com/in/…",
    language: "لغة التدريب المفضلة",
    languageOptions: [
      { id: "ar", label: "العربية" },
      { id: "en", label: "الإنجليزية" },
      { id: "both", label: "كلتاهما" },
    ],
    bio: "نبذة قصيرة أو دافعك للانضمام",
    bioPlaceholder:
      "أسلوبك في التدريب، والعملاء الذين تعمل معهم، ولماذا ترغب في الانضمام إلى سعة.",
    consent:
      "أوافق على تواصل مجموعة سعة معي بشأن طلبي، وعلى معالجة بياناتي وفق ما هو موضح في",
    privacyPolicyLink: "سياسة الخصوصية",
    honeypotLabel: "اترك هذا الحقل فارغاً",
    submit: "إرسال الطلب",
    submitting: "جارٍ الإرسال…",
    retry: "حاول مرة أخرى",
    successTitle: "تم استلام طلبك",
    successBody:
      "شكراً لتقديمك. سيراجع فريقنا طلبك ويتواصل معك عبر البريد الإلكتروني أو الهاتف.",
    errors: {
      fullName: "يرجى إدخال اسمك الكامل.",
      email: "يرجى إدخال بريد إلكتروني صحيح.",
      phone: "يرجى إدخال رقم جوال صحيح لرمز الدولة المختار.",
      city: "يرجى إدخال مدينتك.",
      specialisation: "يرجى اختيار مجال التدريب.",
      yearsExperience: "يرجى إدخال عدد صحيح من السنوات بين 0 و60.",
      linkedinUrl: "يرجى إدخال رابط ملف شخصي على linkedin.com، أو ترك الحقل فارغاً.",
      language: "يرجى اختيار لغة التدريب.",
      bio: "يرجى إخبارنا قليلاً عن نفسك.",
      consent: "يرجى تأكيد موافقتك للمتابعة.",
      duplicateEmail:
        "لدينا طلب مسجّل بهذا البريد الإلكتروني. إذا رغبت في تحديثه، يرجى التواصل معنا.",
      duplicatePhone:
        "لدينا طلب مسجّل برقم الجوال هذا. إذا رغبت في تحديثه، يرجى التواصل معنا.",
      duplicate: "لدينا طلب مسجّل بهذه البيانات. إذا رغبت في تحديثه، يرجى التواصل معنا.",
    },
  },
};
