const SCOPE_LABELS: Record<string, string> = {
  openid: "Verify your identity",
  email: "View your email address",
  profile: "View your basic profile",
};

export function formatOAuthScopes(scope: string | null | undefined): string[] {
  if (!scope?.trim()) return [];
  return scope
    .split(/\s+/)
    .filter(Boolean)
    .map((item) => SCOPE_LABELS[item] ?? item);
}
