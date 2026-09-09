"use client";

import { useEffect } from "react";
import { postAuthDestination } from "@/lib/dashboard-availability";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function safeNext(next: string | null): string {
  if (!next) return postAuthDestination(null, "/");
  if (next === "/" || next === "/en") return next;
  if (
    /^\/(?:en\/)?(?:dashboard(?:\/.*)?|auth\/reset-password)$/.test(next)
  ) {
    return postAuthDestination(next, next);
  }
  return postAuthDestination(null, next);
}

function loginPath(next: string): string {
  return next.startsWith("/en/") ? "/en/auth/login" : "/auth/login";
}

function parseHashParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

/**
 * Completes auth redirects that put tokens/errors in the URL hash
 * (server routes cannot read the fragment).
 */
export default function AuthCallbackCompletePage() {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const query = new URLSearchParams(window.location.search);
      const hash = parseHashParams();
      const next = safeNext(query.get("next") ?? hash.get("next"));
      const login = loginPath(next);

      const errorCode =
        hash.get("error_code") ||
        hash.get("error") ||
        query.get("error_code") ||
        query.get("error");
      if (errorCode) {
        const target = new URL(login, window.location.origin);
        target.searchParams.set("error", errorCode);
        if (next.includes("reset-password")) {
          target.searchParams.set("from", "recovery");
        }
        window.location.replace(target.toString());
        return;
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = query.get("code") || hash.get("code");
      const tokenHash = query.get("token_hash") || hash.get("token_hash");
      const type = query.get("type") || hash.get("type");

      try {
        const supabase = createSupabaseBrowserClient();

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type: type as "recovery" | "signup" | "invite" | "magiclink" | "email_change" | "email",
            token_hash: tokenHash,
          });
          if (error) throw error;
        } else {
          const target = new URL(login, window.location.origin);
          target.searchParams.set("error", "otp_expired");
          if (next.includes("reset-password")) {
            target.searchParams.set("from", "recovery");
          }
          window.location.replace(target.toString());
          return;
        }

        if (
          next.includes("/dashboard") ||
          next === "/" ||
          next === "/en"
        ) {
          await fetch("/api/auth/onboard", { method: "POST" });
        }

        if (!cancelled) {
          window.location.replace(next);
        }
      } catch (error) {
        console.error("[auth] Client callback failed:", error);
        if (cancelled) return;
        const target = new URL(login, window.location.origin);
        const message =
          error instanceof Error ? error.message.toLowerCase() : "";
        target.searchParams.set(
          "error",
          message.includes("expired") || message.includes("otp")
            ? "otp_expired"
            : "callback_failed",
        );
        if (next.includes("reset-password")) {
          target.searchParams.set("from", "recovery");
        }
        window.location.replace(target.toString());
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-enter text-center">
        <p className="auth-subtitle" role="status">
          Completing sign-in…
        </p>
      </div>
    </div>
  );
}
