import { SiteHeader, type SiteHeaderProps } from "@/components/layout/SiteHeader";
import { features } from "@/lib/features";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type Props = Omit<SiteHeaderProps, "isAuthenticated" | "user">;

export async function SiteHeaderServer(props: Props) {
  let isAuthenticated = false;
  let user: SiteHeaderProps["user"] = null;

  if (features.auth) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        isAuthenticated = true;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authUser.id)
          .maybeSingle();
        user = {
          displayName: profile?.full_name ?? "",
          email: authUser.email ?? "",
        };
      }
    } catch (error) {
      console.error("[auth] Header session lookup failed:", error);
    }
  }

  return <SiteHeader {...props} isAuthenticated={isAuthenticated} user={user} />;
}
