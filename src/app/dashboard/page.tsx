import Link from "next/link";
import LocalTodayDate from "@/components/LocalTodayDate";
import {
  dashboardHeroCorporateXl,
  dashboardHeroSubtitleCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
  dashboardSectionCard,
} from "@/data/dashboard-desktop-section";
import { createClient } from "@/utils/supabase/server";
import { getScheduleEntries } from "@/app/dashboard/schedule/get-schedule-entries";
import { getScheduleRoster } from "@/app/dashboard/schedule/get-schedule-roster";
import { getWeekRange } from "@/utils/schedule-dates";
import { getPendingAppliedData } from "./data/get-pending-applied-data";
import { getProfile } from "./profile/get-profile";
import { getStudents } from "./students/get-students";
import TodaySchedulePanel from "./TodaySchedulePanel";
import { getCurrentUser } from "@/utils/auth";
import {
  accountDisplayName,
  welcomeHeadingName,
} from "@/utils/account-display-name";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const displayName = accountDisplayName({
    profile,
    email: user?.email,
    userMetadata: meta,
  });
  const welcomeName = welcomeHeadingName({
    profile,
    email: user?.email,
    userMetadata: meta,
  });

  let studentCount = 0;
  let toDoReviewCount = 0;
  let scheduleOwnerId: string | null = null;
  let scheduleEntries: Awaited<ReturnType<typeof getScheduleEntries>> = [];
  if (user) {
    const supabase = await createClient();
    const { from, to } = getWeekRange(new Date());
    const [students, pendingReview, roster] = await Promise.all([
      getStudents(supabase, user.id),
      getPendingAppliedData(supabase, user.id),
      getScheduleRoster(supabase).catch(() => [] as Awaited<ReturnType<typeof getScheduleRoster>>),
    ]);
    studentCount = students.length;
    toDoReviewCount = pendingReview.length;
    scheduleOwnerId =
      roster.find((m) => m.user_id === user.id)?.user_id ?? roster[0]?.user_id ?? user.id;
    try {
      scheduleEntries = await getScheduleEntries(supabase, from, to, scheduleOwnerId);
    } catch {
      scheduleEntries = [];
    }
  }

  return (
    <div className={dashboardPageStack}>
      {/* Welcome color section — flush with header, rounded bottom only */}
      <section
        className={`-mt-8 rounded-b-xl bg-gradient-to-br from-blue-400/90 to-blue-600/90 px-6 py-4 text-center shadow-lg dark:from-blue-700/90 dark:to-blue-800/90 ${dashboardHeroCorporateXl}`}
      >
        <h1
          className={`text-lg font-semibold tracking-tight text-black ${dashboardHeroTitleCorporateXl}`}
        >
          Welcome
        </h1>
        <p
          className={`mt-1 text-2xl font-medium text-black md:mt-1 ${dashboardHeroSubtitleCorporateXl}`}
        >
          {welcomeName}
        </p>
      </section>

      <LocalTodayDate className="text-center text-base text-zinc-600 dark:text-zinc-400 md:text-2xl md:text-sm md:text-zinc-500 dark:md:text-zinc-400" />

      {/* Two sections side by side */}
      <div className="grid grid-cols-2 gap-4 md:gap-3">
        <Link
          href="/dashboard/students"
          className="flex flex-col items-center justify-center rounded-lg border border-zinc-200/80 bg-white/70 p-6 text-center shadow-sm transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:hover:border-blue-800 dark:hover:bg-zinc-900/80 md:border-zinc-200 md:p-4 md:shadow-none md:hover:border-zinc-300 dark:md:border-zinc-800 dark:md:bg-zinc-950 dark:md:hover:border-zinc-600"
        >
          <span className="bg-gradient-to-br from-pink-500 to-pink-700 bg-clip-text text-5xl font-bold tabular-nums text-transparent dark:from-pink-400 dark:to-pink-600 md:bg-none md:text-4xl md:text-zinc-900 dark:md:text-zinc-100">
            {studentCount}
          </span>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-base">
            Students
          </h2>
        </Link>

        <Link
          href="/dashboard/data"
          className="flex flex-col items-center justify-center rounded-lg border border-zinc-200/80 bg-white/70 p-6 text-center shadow-sm transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:hover:border-blue-800 dark:hover:bg-zinc-900/80 md:border-zinc-200 md:p-4 md:shadow-none md:hover:border-zinc-300 dark:md:border-zinc-800 dark:md:bg-zinc-950 dark:md:hover:border-zinc-600"
        >
          <span className="bg-gradient-to-br from-orange-500 to-amber-600 bg-clip-text text-5xl font-bold tabular-nums text-transparent dark:from-orange-400 dark:to-amber-500 md:bg-none md:text-4xl md:text-zinc-900 dark:md:text-zinc-100">
            {toDoReviewCount}
          </span>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-base">
            Data Review
          </h2>
        </Link>
      </div>

      {/* Today's schedule */}
      <section
        className={`${dashboardSectionCard} p-3 sm:p-4 md:p-6 md:p-4`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg md:text-base">
            Today&apos;s schedule
          </h2>
          <Link
            href="/dashboard/schedule"
            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400 sm:text-sm md:text-xs md:font-medium md:text-zinc-600 md:no-underline md:hover:text-zinc-900 dark:md:text-zinc-400 dark:md:hover:text-zinc-200"
          >
            View schedule →
          </Link>
        </div>
        <TodaySchedulePanel ownerUserId={scheduleOwnerId} initialEntries={scheduleEntries} />
      </section>
    </div>
  );
}
