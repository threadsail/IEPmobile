import { OAUTH_NEXT_COOKIE } from "@/constants/oauth-post-login";
import { ensureUserProfileSetup } from "@/lib/ensure-user-profile";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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

function authErrorRedirect(requestUrl: URL, reason?: string) {
  const url = new URL("/auth", requestUrl);
  url.searchParams.set("error", "callback");
  if (reason) {
    url.searchParams.set("reason", reason.slice(0, 200));
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const code = requestUrl.searchParams.get("code");

  const fromCookie = request.cookies.get(OAUTH_NEXT_COOKIE)?.value;
  let decodedCookie: string | null = null;
  if (fromCookie) {
    try {
      decodedCookie = decodeURIComponent(fromCookie);
    } catch {
      decodedCookie = null;
    }
  }

  const nextRaw =
    requestUrl.searchParams.get("next") ?? decodedCookie;
  const next = safeNextPath(nextRaw, requestUrl);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return authErrorRedirect(requestUrl, "Missing Supabase configuration");
  }

  if (!code) {
    return authErrorRedirect(requestUrl, "Missing authorization code");
  }

  const response = NextResponse.redirect(new URL(next, requestUrl));

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return authErrorRedirect(requestUrl, error.message);
    }

    const userId = sessionData.user?.id;
    if (userId) {
      await ensureUserProfileSetup(userId);
    }

    clearOauthNextCookie(response);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Callback failed";
    return authErrorRedirect(requestUrl, message);
  }
}
