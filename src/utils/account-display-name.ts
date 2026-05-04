/**
 * Display names for accounts: profiles row + Supabase Auth user_metadata (OAuth).
 */

export function isSyntheticProfilesUsername(
  username: string | null | undefined
): boolean {
  if (!username) return false;
  return /^user_[0-9a-f]{8,}$/i.test(username);
}

/** Full display string from Google / Microsoft OAuth (Supabase user_metadata). */
export function fullNameFromUserMetadata(
  meta: Record<string, unknown> | null | undefined
): string | null {
  if (!meta || typeof meta !== "object") return null;
  const pick = (key: string): string | null => {
    const v = meta[key];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const single = pick("full_name") ?? pick("name");
  if (single) return single;
  const given = pick("given_name");
  const family = pick("family_name");
  const joined = [given, family].filter(Boolean).join(" ").trim();
  return joined || null;
}

type ProfileNameFields = {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  username: string | null;
};

export function accountDisplayName(args: {
  profile: ProfileNameFields | null;
  email: string | undefined;
  userMetadata: Record<string, unknown> | null | undefined;
}): string {
  const { profile, email, userMetadata } = args;
  if (profile?.first_name || profile?.last_name) {
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  }
  const fromProfileFull = profile?.full_name?.trim();
  if (fromProfileFull) return fromProfileFull;
  const fromOAuth = fullNameFromUserMetadata(userMetadata ?? undefined);
  if (fromOAuth) return fromOAuth;
  if (profile?.username && !isSyntheticProfilesUsername(profile.username)) {
    return profile.username;
  }
  if (email) return email;
  return "User";
}

/** Short welcome line: real first name, else first word of OAuth full name, else display fallback. */
export function welcomeHeadingName(args: {
  profile: ProfileNameFields | null;
  email: string | undefined;
  userMetadata: Record<string, unknown> | null | undefined;
}): string {
  const first = args.profile?.first_name?.trim();
  if (first) return first;
  const oauthFull = fullNameFromUserMetadata(args.userMetadata ?? undefined);
  if (oauthFull) {
    const token = oauthFull.split(/\s+/)[0]?.trim();
    if (token) return token;
  }
  return accountDisplayName(args);
}
