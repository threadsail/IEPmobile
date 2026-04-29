import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import {
  dashboardHeroCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
  dashboardSectionCard,
} from "@/data/dashboard-desktop-section";
import { getStudents } from "./get-students";
import StudentList from "./StudentList";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const students = user ? await getStudents(supabase, user.id) : [];

  return (
    <div className={dashboardPageStack}>
      <section
        className={`-mt-8 rounded-b-xl bg-gradient-to-br from-pink-400/90 to-pink-600/90 px-6 py-4 text-center shadow-lg dark:from-pink-700/90 dark:to-pink-800/90 ${dashboardHeroCorporateXl}`}
      >
        <h1
          className={`text-2xl font-semibold tracking-tight text-black ${dashboardHeroTitleCorporateXl}`}
        >
          Students
        </h1>
      </section>

      <section className={dashboardSectionCard}>
        <Link
          href="/dashboard/students/new"
          className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 xl:bg-zinc-800 xl:hover:bg-zinc-900 dark:xl:bg-zinc-700 dark:xl:hover:bg-zinc-600"
        >
          <span aria-hidden>+</span>
          Add student
        </Link>
      </section>

      <section className={dashboardSectionCard}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 xl:text-base">
          Existing students
        </h2>
        <div className="mt-4">
          <StudentList students={students} />
        </div>
      </section>
    </div>
  );
}
