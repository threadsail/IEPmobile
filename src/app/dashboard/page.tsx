import Link from "next/link";
import { getProfile } from "./profile/get-profile";
import { getCurrentUser } from "@/utils/auth";

function getDisplayName(
  profile: { first_name: string | null; last_name: string | null; username: string | null } | null,
  email: string | undefined
): string {
  if (profile?.first_name || profile?.last_name) {
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  }
  if (profile?.username) return profile.username;
  if (email) return email;
  return "User";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const displayName = getDisplayName(profile, user?.email);

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Placeholder counts until students and review tables exist
  const studentCount = 0;
  const toDoReviewCount = 0;

  return (
    <div className="w-full space-y-6">
      {/* Welcome color section — flush with header, rounded bottom only */}
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-blue-400/90 to-blue-600/90 px-6 py-4 text-center shadow-lg dark:from-blue-700/90 dark:to-blue-800/90">
        <h1 className="text-lg font-semibold tracking-tight text-black">Welcome</h1>
        <p className="mt-1 text-2xl font-medium text-black">{displayName}</p>
      </section>

      {/* Current date */}
      <p className="text-center text-base text-zinc-600 dark:text-zinc-400 md:text-2xl">{currentDate}</p>

      {/* Two sections side by side */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/students"
          className="flex flex-col items-center justify-center rounded-lg border border-zinc-200/80 bg-white/70 p-6 text-center shadow-sm transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:hover:border-blue-800 dark:hover:bg-zinc-900/80"
        >
          <span className="bg-gradient-to-br from-pink-500 to-pink-700 bg-clip-text text-5xl font-bold tabular-nums text-transparent dark:from-pink-400 dark:to-pink-600">
            {studentCount}
          </span>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Students</h2>
        </Link>

        <Link
          href="/dashboard/data"
          className="flex flex-col items-center justify-center rounded-lg border border-zinc-200/80 bg-white/70 p-6 text-center shadow-sm transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:hover:border-blue-800 dark:hover:bg-zinc-900/80"
        >
          <span className="bg-gradient-to-br from-orange-500 to-amber-600 bg-clip-text text-5xl font-bold tabular-nums text-transparent dark:from-orange-400 dark:to-amber-500">
            {toDoReviewCount}
          </span>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Data Review</h2>
        </Link>
      </div>

      {/* Today's schedule */}
      <section className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Today&apos;s schedule
          </h2>
          <Link
            href="/dashboard/schedule"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View schedule →
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-700">
          {(() => {
            const slots: string[] = [];
            for (let h = 7; h <= 16; h++) {
              slots.push(
                `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`,
                ...(h < 16 ? [`${h > 12 ? h - 12 : h}:30 ${h >= 12 ? "PM" : "AM"}`] : [])
              );
            }
            return slots.map((time) => (
              <div
                key={time}
                className="flex min-h-[2.5rem] items-stretch border-b border-zinc-100 last:border-b-0 dark:border-zinc-700/80"
              >
                <div className="w-20 shrink-0 border-r border-zinc-200 bg-zinc-50/80 px-2 py-1.5 text-right text-xs font-medium tabular-nums text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
                  {time}
                </div>
                <div className="min-h-[2.5rem] flex-1 px-2 py-1.5 text-sm text-zinc-500 dark:text-zinc-400" />
              </div>
            ));
          })()}
        </div>
      </section>
    </div>
  );
}
