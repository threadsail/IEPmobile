import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getProfile } from "./get-profile";
import type { Profile } from "@/types/profile";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function ProfileInfoList({
  email,
  profile,
}: {
  email: string | undefined;
  profile: Profile | null;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Email", value: email ?? "—" },
    { label: "Username", value: profile?.username ?? "Not set" },
    { label: "First name", value: profile?.first_name ?? "Not set" },
    { label: "Last name", value: profile?.last_name ?? "Not set" },
    { label: "Role", value: profile?.role ?? "Not set" },
    {
      label: "Profile created",
      value: formatDate(profile?.created_at ?? null),
    },
    {
      label: "Last updated",
      value: formatDate(profile?.updated_at ?? null),
    },
  ];

  return (
    <dl className="divide-y divide-zinc-200 dark:divide-zinc-700">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-0.5 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:py-3"
        >
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </dt>
          <dd className="text-sm text-zinc-900 dark:text-zinc-100">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getProfile(supabase, user.id) : null;

  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Your account details. This data is stored in Supabase when the
          profiles table is set up.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Profile information
        </h2>
        <div className="mt-4">
          <ProfileInfoList email={user?.email} profile={profile} />
        </div>
      </div>
    </div>
  );
}
