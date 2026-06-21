import { type NextRequest, NextResponse } from "next/server";
import { shouldShowComingSoon } from "@/lib/coming-soon";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? request.nextUrl.hostname;
  const { pathname } = request.nextUrl;

  if (shouldShowComingSoon(pathname, hostname)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = "/coming-soon";

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", "/coming-soon");

    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
