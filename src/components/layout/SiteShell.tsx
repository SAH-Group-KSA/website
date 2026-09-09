import { getLocale } from "next-intl/server";
import { SkipLink } from "@/components/layout/SkipLink";
import { SiteHeaderServer } from "@/components/layout/SiteHeaderServer";
import { SiteShellClient } from "@/components/layout/SiteShellClient";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { BackToTop } from "@/components/layout/BackToTop";
import { BrandTheme } from "@/components/layout/BrandTheme";
import { ObserveReveals } from "@/components/interactions/ObserveReveals";
import { MotionProviders } from "@/components/interactions/MotionProviders";
import { MainTransition } from "@/components/interactions/MainTransition";
import { getContent } from "@/content";
import type { Locale } from "@/types/locale";

type SiteShellProps = {
  children: React.ReactNode;
};

/**
 * Server shell: loads chrome copy once and passes slices into client islands
 * (header / back-to-top) so the full home JSON never enters the client bundle.
 */
export async function SiteShell({ children }: SiteShellProps) {
  const locale = (await getLocale()) as Locale;
  const content = await getContent(locale);

  return (
    <SiteShellClient
      marketing={
        <MotionProviders>
          <BrandTheme />
          <SkipLink />
          <ScrollProgress />
          <SiteHeaderServer
            nav={content.nav}
            ctaHeader={content.cta.header}
            defaultContactContext={content.contact.defaultContext}
            logoAlt={content.footer.logoAlt}
            megaNav={content.megaNav}
            megaEntities={content.entities.map((entity) => ({
              id: entity.id,
              name: entity.name,
              specialty: entity.specialty,
              color: entity.color,
              logo: entity.logo,
            }))}
            ui={{
              backToHome: content.ui.backToHome,
              primaryNav: content.ui.primaryNav,
              signIn: content.ui.signIn,
              signOut: content.ui.signOut,
              dashboard: content.ui.dashboard,
              editProfile: content.ui.editProfile,
              menuOpen: content.ui.menuOpen,
              menuClose: content.ui.menuClose,
              mobileNav: content.ui.mobileNav,
            }}
          />
          <main id="main" tabIndex={-1}>
            <MainTransition>{children}</MainTransition>
          </main>
          <SiteFooter />
          <BackToTop label={content.ui.backToTop} />
          <ObserveReveals />
        </MotionProviders>
      }
    >
      {children}
    </SiteShellClient>
  );
}
