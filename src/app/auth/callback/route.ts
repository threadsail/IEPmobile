import { OAUTH_NEXT_COOKIE } from "@/constants/oauth-post-login";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function clearOauthNextCookie(response: NextResponse) {
  response.cookies.set(OAUTH_NEXT_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
}

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

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(OAUTH_NEXT_COOKIE)?.value;
  let decodedCookie: string | null = null;
  if (fromCookie) {
    try {
      decodedCookie = decodeURIComponent(fromCookie);
    } catch {
      decodedCookie = null;
    }
  }
  const nextRaw = searchParams.get("next") ?? decodedCookie;
  const next = safeNextPath(nextRaw, requestUrl);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const res = NextResponse.redirect(new URL(next, requestUrl));
        clearOauthNextCookie(res);
        return res;
      }
    } catch {
      const res = NextResponse.redirect(
        new URL("/auth?error=callback", requestUrl)
      );
      clearOauthNextCookie(res);
      return res;
    }
  }

  const res = NextResponse.redirect(new URL("/auth?error=callback", requestUrl));
  clearOauthNextCookie(res);
  return res;
}
