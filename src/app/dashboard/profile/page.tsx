import Link from "next/link";
import FormattedLocalDateTime from "@/components/FormattedLocalDateTime";
import { getProfile } from "./get-profile";
import { parseApiTimestamp } from "@/utils/format-local-datetime";
import { getCurrentUser } from "@/utils/auth";
import type { Profile } from "@/types/profile";
import ProfileInformation from "./ProfileInformation";
import { fullNameFromUserMetadata } from "@/utils/account-display-name";
import { createClient } from "@/utils/supabase/server";
import { getStudents } from "@/app/dashboard/students/get-students";
import { getTotalOrgDataEntriesCount } from "./get-org-data-entries-count";
import TestApplySubscriptionButton from "../purchase/TestApplySubscriptionButton";
import ManageBillingButton from "./ManageBillingButton";

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  basic: "Basic",
  pro: "Pro",
};

const PLAN_PRICES: Record<"basic" | "pro", { monthly: number; annual: number }> = {
  basic: { monthly: 19, annual: 190 },
  pro: { monthly: 39, annual: 390 },
};

function getRenewalIso(profile: Profile | null): string | null {
  if (!profile) return null;
  const end = profile.subscription_period_end;
  if (end) return end;
  const start = profile.subscription_period_start;
  const interval = profile.subscription_interval;
  if (!start || !interval) return null;
  try {
    const d = parseApiTimestamp(start);
    if (interval === "monthly") {
      d.setUTCMonth(d.getUTCMonth() + 1);
    } else if (interval === "annual") {
      d.setUTCFullYear(d.getUTCFullYear() + 1);
    } else {
      return null;
    }
    return d.toISOString();
  } catch {
    return null;
  }
}

function SubscriptionSection({
  profile,
  isDev,
}: {
  profile: Profile | null;
  isDev: boolean;
}) {
  const raw = profile?.subscription_plan;
  const plan = raw === "starter" || raw === "basic" || raw === "pro" ? raw : "basic";
  const interval = profile?.subscription_interval;
  const role = profile?.role ?? null;
  const isAide = role === "Aide";
  const planLabel = PLAN_LABELS[plan] ?? "Starter";
  const intervalLabel =
    plan !== "starter" && interval
      ? interval === "annual"
        ? "Annual"
        : "Monthly"
      : null;

  const startIso = profile?.subscription_period_start ?? null;
  const renewalIso = getRenewalIso(profile);

  let monthlyPriceLabel: string | null = null;
  if (plan === "starter") {
    monthlyPriceLabel = "$0 / month";
  } else if (plan === "basic" || plan === "pro") {
    const prices = PLAN_PRICES[plan];
    if (interval === "annual") {
      const perMonth = Math.round(prices.annual / 12);
      monthlyPriceLabel = `$${perMonth} / month (billed $${prices.annual}/year)`;
    } else {
      monthlyPriceLabel = `$${prices.monthly} / month`;
    }
  }

  return (
    <div className="rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-purple-50/80 p-6 shadow-md dark:border-violet-800/40 dark:from-violet-950/40 dark:to-purple-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-600 dark:bg-violet-400/20 dark:text-violet-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
            Subscription
          </h2>
          <p className="text-sm text-violet-600/90 dark:text-violet-300/80">
            Your current plan and billing
          </p>
        </div>
      </div>
      <dl className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20">
          <dt className="text-sm font-medium text-violet-700 dark:text-violet-300">
            Current plan
          </dt>
          <dd className="text-sm font-semibold text-violet-900 dark:text-violet-100">
            {planLabel}
            {intervalLabel ? ` (${intervalLabel})` : ""}
          </dd>
        </div>
        {plan !== "starter" && monthlyPriceLabel && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20">
            <dt className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Monthly price
            </dt>
            <dd className="text-sm text-violet-900 dark:text-violet-100">
              {monthlyPriceLabel}
            </dd>
          </div>
        )}
        {startIso && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20">
            <dt className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Start date
            </dt>
            <dd className="text-sm text-violet-900 dark:text-violet-100">
              <FormattedLocalDateTime iso={startIso} dateOnly dateStyle="long" />
            </dd>
          </div>
        )}
        {renewalIso && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20">
            <dt className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Renewal date
            </dt>
            <dd className="text-sm text-violet-900 dark:text-violet-100">
              <FormattedLocalDateTime iso={renewalIso} dateOnly dateStyle="long" />
            </dd>
          </div>
        )}
      </dl>
      {!isAide && (
        <div className="mt-5 border-t border-violet-200/60 pt-4 dark:border-violet-700/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100"
            >
              Downgrade or change plan
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            {profile?.stripe_customer_id ? <ManageBillingButton /> : null}
          </div>
          {isDev && (
            <div className="mt-4 border-t border-dashed border-violet-200/60 pt-4 dark:border-violet-700/40">
              <p className="mb-2 text-xs font-medium text-violet-600/80 dark:text-violet-400/80">
                Development only — test plans without Stripe
              </p>
              <div className="flex flex-wrap gap-2">
                <TestApplySubscriptionButton plan="starter" interval={null} />
                <TestApplySubscriptionButton plan="basic" interval="monthly" />
                <TestApplySubscriptionButton plan="basic" interval="annual" />
                <TestApplySubscriptionButton plan="pro" interval="monthly" />
                <TestApplySubscriptionButton plan="pro" interval="annual" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FeaturesUsageSection({
  profile,
  studentCount,
  dataEntriesCount,
}: {
  profile: Profile | null;
  studentCount: number;
  dataEntriesCount: number;
}) {
  const raw = profile?.subscription_plan;
  const plan = raw === "starter" || raw === "basic" || raw === "pro" ? raw : "basic";
  const interval = profile?.subscription_interval;
  const role = profile?.role ?? null;
  const isTeacherOrAdmin = role === "Teacher" || role === "Admin";

  if (!isTeacherOrAdmin) return null;

  const teacherUsed = 1; // this account
  const aideUsed = 0; // aides not tracked yet in this view
  const studentsUsed = studentCount;
  const dataEntriesUsed = dataEntriesCount;

  let teacherLimit: number | null = null;
  let aideLimit: number | null = null;
  let studentLimit: number | null = null;
  let dataEntryLimit: number | null = null;

  if (plan === "starter") {
    teacherLimit = 1;
    aideLimit = 1;
    studentLimit = 10;
    dataEntryLimit = 50;
  } else if (plan === "basic") {
    teacherLimit = 2;
    aideLimit = 6;
    studentLimit = 50;
    dataEntryLimit = 500;
  } else {
    teacherLimit = null;
    aideLimit = null;
    studentLimit = null;
    dataEntryLimit = null;
  }

  const formatUsage = (used: number, limit: number | null) =>
    limit === null ? `${used} / ∞` : `${used} / ${limit}`;

  const formatStudents = () =>
    studentLimit === null ? `${studentsUsed} / ∞` : `${studentsUsed} / ${studentLimit}`;

  return (
    <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-lime-50/80 p-6 shadow-md dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-lime-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h8.25m-8.25 5.25h16.5" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
            Current features
          </h2>
          <p className="text-sm text-emerald-600/90 dark:text-emerald-300/80">
            Usage toward your plan limits
          </p>
        </div>
      </div>
      <dl className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20">
          <dt className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Teachers
          </dt>
          <dd className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            {formatUsage(teacherUsed, teacherLimit)}
          </dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20">
          <dt className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Aides
          </dt>
          <dd className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            {formatUsage(aideUsed, aideLimit)}
          </dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20">
          <dt className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Students
          </dt>
          <dd className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            {formatStudents()}
          </dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20">
          <dt className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Total data entries
          </dt>
          <dd className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            {formatUsage(dataEntriesUsed, dataEntryLimit)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function SupportSection() {
  return (
    <div className="rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/90 to-cyan-50/80 p-6 shadow-md dark:border-teal-800/40 dark:from-teal-950/40 dark:to-cyan-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-600 dark:bg-teal-400/20 dark:text-teal-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-teal-900 dark:text-teal-100">
            Support
          </h2>
          <p className="text-sm text-teal-600/90 dark:text-teal-300/80">
            Get help or submit a support request
          </p>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-teal-200/60 dark:border-teal-700/40">
        <Link
          href="/info/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
        >
          Support
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-orange-50/80 p-6 shadow-md dark:border-amber-800/40 dark:from-amber-950/40 dark:to-orange-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Contact
          </h2>
          <p className="text-sm text-amber-600/90 dark:text-amber-300/80">
            Reach out with questions or feedback
          </p>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-amber-200/60 dark:border-amber-700/40">
        <Link
          href="/info/contact"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
        >
          Contact
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function SuggestionsSection() {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-gradient-to-br from-zinc-100/90 to-zinc-50/80 p-6 shadow-md dark:border-zinc-700/40 dark:from-zinc-800/40 dark:to-zinc-900/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-400/20 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 .75a8.962 8.962 0 00-6.25 2.738c-.847.828-1.375 1.957-1.375 3.262 0 1.795.782 3.414 2.062 4.587.641.586 1.028 1.325 1.028 2.131v.689c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125v-.689c0-.806.387-1.545 1.028-2.131 1.28-1.173 2.062-2.792 2.062-4.587 0-1.305-.528-2.434-1.375-3.262A8.962 8.962 0 0012 .75z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Suggestions
          </h2>
          <p className="text-sm text-zinc-600/90 dark:text-zinc-400">
            Share ideas and upvote suggestions from others
          </p>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-zinc-200/60 dark:border-zinc-600/40">
        <Link
          href="/dashboard/suggestions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
        >
          Suggestions
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const role = profile?.role ?? null;
  const isTeacherOrAdmin = role === "Teacher" || role === "Admin";
  const isDev = process.env.NODE_ENV === "development";

  let studentCount = 0;
  let dataEntriesCount = 0;
  if (user && isTeacherOrAdmin) {
    const supabase = await createClient();
    const [students, totalDataEntries] = await Promise.all([
      getStudents(supabase, user.id),
      getTotalOrgDataEntriesCount(supabase),
    ]);
    studentCount = students.length;
    dataEntriesCount = totalDataEntries;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-2 md:max-w-6xl">
      {/* Header */}
      <section className="mb-8 flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 py-6 shadow-md">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Profile
        </h1>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {/* Profile information card */}
        <div className="rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 to-indigo-50/80 p-6 shadow-md dark:border-blue-800/40 dark:from-blue-950/40 dark:to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Profile information
              </h2>
              <p className="text-sm text-blue-600/90 dark:text-blue-300/80">
                Name, email, role, and organization
              </p>
            </div>
          </div>
          <div className="mt-5">
            <ProfileInformation
              email={user?.email}
              profile={profile}
              userCreatedAt={user?.created_at}
              oauthFullNameHint={fullNameFromUserMetadata(
                user?.user_metadata as Record<string, unknown> | undefined
              )}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-4 border-t border-blue-200/60 pt-5 dark:border-blue-700/40">
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
            >
              Settings
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </Link>
          </div>
        </div>

        <SubscriptionSection profile={profile} isDev={isDev} />

        {isTeacherOrAdmin && (
          <div className="md:col-span-2">
            <FeaturesUsageSection profile={profile} studentCount={studentCount} dataEntriesCount={dataEntriesCount} />
          </div>
        )}

        <SupportSection />
        <ContactSection />

        <div className="md:col-span-2">
          <SuggestionsSection />
        </div>
      </div>
    </div>
  );
}
