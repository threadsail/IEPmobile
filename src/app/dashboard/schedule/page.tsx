import { createClient } from "@/utils/supabase/server";
import { getActivities } from "@/app/dashboard/activities/get-activities";
import {
  dashboardHeroCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
} from "@/data/dashboard-desktop-section";
import { getScheduleEntries } from "./get-schedule-entries";
import { getScheduleRoster } from "./get-schedule-roster";
import ScheduleView from "./ScheduleView";

function getWeekRange(anchor: Date): { from: string; to: string } {
  const d = new Date(anchor);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const toYMD = (x: Date) =>
    x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  return { from: toYMD(start), to: toYMD(end) };
}

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const activities = user ? await getActivities(supabase) : [];
  const anchor = new Date();
  const { from, to } = getWeekRange(anchor);

  let roster: Awaited<ReturnType<typeof getScheduleRoster>> = [];
  let entries: Awaited<ReturnType<typeof getScheduleEntries>> = [];

  if (user) {
    try {
      roster = await getScheduleRoster(supabase);
    } catch {
      roster = [];
    }

    const defaultOwnerId =
      roster.find((m) => m.user_id === user.id)?.user_id ?? roster[0]?.user_id ?? user.id;

    try {
      entries = await getScheduleEntries(supabase, from, to, defaultOwnerId);
    } catch {
      entries = [];
    }
  }

  return (
    <div className={dashboardPageStack}>
      <section
        className={`-mt-8 rounded-b-xl bg-gradient-to-br from-teal-400/90 to-teal-600/90 px-6 py-4 text-center shadow-lg dark:from-teal-700/90 dark:to-teal-800/90 ${dashboardHeroCorporateXl}`}
      >
        <h1
          className={`text-2xl font-semibold tracking-tight text-black ${dashboardHeroTitleCorporateXl}`}
        >
          Schedule
        </h1>
      </section>

      <ScheduleView
        currentUserId={user?.id ?? null}
        roster={Array.isArray(roster) ? roster : []}
        initialEntries={Array.isArray(entries) ? entries : []}
        activities={Array.isArray(activities) ? activities : []}
      />
    </div>
  );
}
