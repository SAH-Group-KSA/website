import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

function publicConfig(): { url: string; anonKey: string } {
  const url = env.supabaseUrl();
  const anonKey = env.supabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are not configured");
  }
  return { url, anonKey };
}

export function createSupabaseBrowserClient() {
  const { url, anonKey } = publicConfig();
  return createBrowserClient(url, anonKey);
}
