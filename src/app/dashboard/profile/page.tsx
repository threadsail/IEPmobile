import Link from "next/link";
import { getProfile } from "./get-profile";
import { getCurrentUser } from "@/utils/auth";
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

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  basic: "Basic",
  pro: "Pro",
};

function SubscriptionSection({ profile }: { profile: Profile | null }) {
  const plan = profile?.subscription_plan ?? "starter";
  const interval = profile?.subscription_interval;
  const planLabel = PLAN_LABELS[plan] ?? "Starter";
  const intervalLabel =
    plan !== "starter" && interval
      ? interval === "annual"
        ? "Annual"
        : "Monthly"
      : null;

  return (
    <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Subscription
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Your current plan and billing.
      </p>
      <dl className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 py-2">
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Current plan
          </dt>
          <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {planLabel}
            {intervalLabel ? ` (${intervalLabel})` : ""}
          </dd>
        </div>
      </dl>
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <Link
          href="/pricing"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}

function SupportSection() {
  return (
    <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Support
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Get help or submit a support request.
      </p>
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <Link
          href="/info/support"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Support
        </Link>
      </div>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Contact
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Reach out with questions or feedback.
      </p>
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <Link
          href="/info/contact"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
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
        <div className="mt-6 flex flex-wrap gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-700">
          <Link
            href="/dashboard/settings"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Settings
          </Link>
        </div>
      </div>

      <SubscriptionSection profile={profile} />

      <SupportSection />

      <ContactSection />
    </div>
  );
}
