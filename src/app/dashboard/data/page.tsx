import { createClient } from "@/utils/supabase/server";
import {
  dashboardHeroCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
  dashboardSectionCard,
} from "@/data/dashboard-desktop-section";
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
    <div className={dashboardPageStack}>
      <section
        className={`-mt-8 rounded-b-xl bg-gradient-to-br from-orange-300/90 to-orange-500/90 px-6 py-4 text-center shadow-lg dark:from-orange-600/90 dark:to-orange-800/90 ${dashboardHeroCorporateXl}`}
      >
        <h1
          className={`text-2xl font-semibold tracking-tight text-black ${dashboardHeroTitleCorporateXl}`}
        >
          Data
        </h1>
      </section>

      <section className={dashboardSectionCard}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 xl:text-base">
          Approve applied student data
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Review and approve or reject student data submitted by aides.
        </p>
        <div className="mt-4">
          <ApprovalSection items={pending} />
        </div>
      </section>

      <section className={dashboardSectionCard}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 xl:text-base">
          Student IEP data
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Grade, classroom, note, and IEP goals per student.
        </p>
        <div className="mt-4">
          <CurrentDataSection students={students} />
        </div>
      </section>
    </div>
  );
}
