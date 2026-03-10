import { createClient } from "@/utils/supabase/server";
import { getActivities, type ActivityFilter } from "./get-activities";
import ActivitiesList from "./ActivitiesList";

type Props = { searchParams: Promise<{ filter?: string }> };

export default async function ActivitiesPage({ searchParams }: Props) {
  const supabase = await createClient();
  const params = await searchParams;
  const filter = (params.filter === "mine" ? "mine" : "org") as ActivityFilter;
  const activities = await getActivities(supabase, filter);

  return (
    <div className="w-full space-y-6">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-purple-400/90 to-purple-600/90 px-6 py-4 text-center shadow-lg dark:from-purple-700/90 dark:to-purple-800/90">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          Activities
        </h1>
      </section>

      <ActivitiesList activities={activities} currentFilter={filter} />

      {activities.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          No activities yet. Add an activity to get started.
        </p>
      ) : null}
    </div>
  );
}
