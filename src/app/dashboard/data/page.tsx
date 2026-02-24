import { createClient } from "@/utils/supabase/server";
import { getPendingAppliedData } from "./get-pending-applied-data";
import { getStudents } from "@/app/dashboard/students/get-students";
import ApprovalSection from "./ApprovalSection";
import CurrentDataSection from "./CurrentDataSection";

export default async function DataPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pending = user ? await getPendingAppliedData(supabase, user.id) : [];
  const students = user ? await getStudents(supabase, user.id) : [];

  return (
    <div className="w-full space-y-6">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-orange-300/90 to-orange-500/90 px-6 py-4 text-center shadow-lg dark:from-orange-600/90 dark:to-orange-800/90">
        <h1 className="text-2xl font-semibold tracking-tight text-black">Data</h1>
      </section>

      <section className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Approve applied student data
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review and approve or reject student data submitted by aides.
        </p>
        <div className="mt-4">
          <ApprovalSection items={pending} />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Current data for all students
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Latest or approved data per student.
        </p>
        <div className="mt-4">
          <CurrentDataSection students={students} />
        </div>
      </section>
    </div>
  );
}
