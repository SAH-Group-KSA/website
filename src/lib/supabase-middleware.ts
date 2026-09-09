import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  const url = env.supabaseUrl();
  const anonKey = env.supabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are not configured");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
