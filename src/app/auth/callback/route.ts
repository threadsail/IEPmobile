import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/** Only same-origin relative paths (e.g. `/dashboard`) — not full URLs. */
function safeNextPath(next: string | null, requestUrl: URL): string {
  const fallback = "/dashboard";
  if (!next) return fallback;
  const t = next.trim();
  if (t.includes("://") || !t.startsWith("/") || t.startsWith("//")) {
    return fallback;
  }
  try {
    const resolved = new URL(t, requestUrl.origin);
    if (resolved.origin !== requestUrl.origin) return fallback;
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    return path || fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), requestUrl);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl));
      }
    } catch {
      // Network or server error during code exchange
      return NextResponse.redirect(
        new URL("/auth?error=callback", requestUrl)
      );
    }
  }

  return NextResponse.redirect(new URL("/auth?error=callback", requestUrl));
}
