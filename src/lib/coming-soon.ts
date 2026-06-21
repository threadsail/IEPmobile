import { SITE_DOMAIN } from "@/lib/site-config";

/** Public production hosts that show the coming-soon page until launch. */
const COMING_SOON_HOSTS = new Set([SITE_DOMAIN, `www.${SITE_DOMAIN}`]);

/** Paths that stay reachable on production during coming-soon (webhooks, etc.). */
const COMING_SOON_ALLOWED_PREFIXES = ["/coming-soon", "/api/"];

export function isComingSoonHost(hostname: string): boolean {
  if (process.env.COMING_SOON === "false") return false;

  const host = hostname.split(":")[0].toLowerCase();
  return COMING_SOON_HOSTS.has(host);
}

export function shouldShowComingSoon(pathname: string, hostname: string): boolean {
  if (!isComingSoonHost(hostname)) return false;

  return !COMING_SOON_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}
