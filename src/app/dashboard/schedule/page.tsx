import { createClient } from "@/utils/supabase/server";
import { getActivities } from "@/app/dashboard/activities/get-activities";
import { getProfile } from "@/app/dashboard/profile/get-profile";
import { getScheduleEntries } from "./get-schedule-entries";
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
  const profile = user ? await getProfile(user.id) : null;
  const activities = user ? await getActivities(supabase) : [];
  const anchor = new Date();
  const { from, to } = getWeekRange(anchor);
  let entries: Awaited<ReturnType<typeof getScheduleEntries>> = [];
  try {
    entries = user ? await getScheduleEntries(supabase, from, to) : [];
  } catch {
    entries = [];
  }
  const canDeleteSchedule =
    profile?.role === "Teacher" || profile?.role === "Admin";

  return (
    <div className="w-full space-y-6">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-teal-400/90 to-teal-600/90 px-6 py-4 text-center shadow-lg dark:from-teal-700/90 dark:to-teal-800/90">
        <h1 className="text-2xl font-semibold tracking-tight text-black">Schedule</h1>
      </section>

      <ScheduleView
        initialEntries={Array.isArray(entries) ? entries : []}
        activities={Array.isArray(activities) ? activities : []}
        canDeleteSchedule={canDeleteSchedule}
      />
    </div>
  );
}
