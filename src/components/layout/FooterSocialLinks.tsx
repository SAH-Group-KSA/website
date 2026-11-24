import type { SocialNetwork, SocialProfile } from "@/types";
import type { Locale } from "@/types/locale";

/**
 * Accessible names, AR + EN. Kept inline (like the cookie banner's copy)
 * rather than in the content layer: they are fixed brand names, not editable
 * marketing copy, and must survive FEATURE_CMS being on.
 */
const LABELS: Record<Locale, { group: string } & Record<SocialNetwork, string>> = {
  ar: {
    group: "حسابات مجموعة سعة على وسائل التواصل الاجتماعي",
    instagram: "مجموعة سعة على إنستغرام",
    facebook: "مجموعة سعة على فيسبوك",
  },
  en: {
    group: "SAH Group on social media",
    instagram: "SAH Group on Instagram",
    facebook: "SAH Group on Facebook",
  },
};

/** Inline glyphs — no icon library (see CLAUDE.md styling conventions). */
function SocialIcon({ network }: { network: SocialNetwork }) {
  if (network === "instagram") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
    </svg>
  );
}

/** Renders nothing until at least one profile URL is configured. */
export function FooterSocialLinks({
  profiles,
  locale,
}: {
  profiles: SocialProfile[] | undefined;
  locale: Locale;
}) {
  if (!profiles?.length) return null;
  const t = LABELS[locale];

  return (
    <ul className="footer-social" aria-label={t.group}>
      {profiles.map((profile) => (
        <li key={profile.network}>
          <a
            className="footer-social-link"
            href={profile.url}
            target="_blank"
            rel="me noopener noreferrer"
            aria-label={t[profile.network]}
          >
            <SocialIcon network={profile.network} />
          </a>
        </li>
      ))}
    </ul>
  );
}
