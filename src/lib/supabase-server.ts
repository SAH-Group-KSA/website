import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

function serverConfig(): { url: string; anonKey: string } {
  const url = env.supabaseUrl();
  const anonKey = env.supabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are not configured");
  }
  return { url, anonKey };
}

export async function createSupabaseServerClient() {
  const { url, anonKey } = serverConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. Proxy refreshes sessions.
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const { url } = serverConfig();
  const serviceRoleKey = env.supabaseServiceRoleKey();
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
