import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  dashboardHeroCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
  dashboardSectionCard,
} from "@/data/dashboard-desktop-section";
import ArchivedStudentList from "./ArchivedStudentList";
import { classroomsFromStudents } from "./classrooms-from-roster";
import { getArchivedStudents, getStudents } from "./get-students";
import SeedTestStudentsButton from "./SeedTestStudentsButton";
import StudentRosterSection from "./StudentRosterSection";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const students = user ? await getStudents(supabase, user.id) : [];
  const rosterClassrooms = classroomsFromStudents(students);
  const archivedStudents = user ? await getArchivedStudents(supabase, user.id) : [];
  const showTestStudentSeed =
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_SEED_TEST_STUDENTS === "true";

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

      <section className={`${dashboardSectionCard} flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center`}>
        <Link
          href="/dashboard/students/new"
          className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 md:bg-zinc-800 md:hover:bg-zinc-900 dark:md:bg-zinc-700 dark:md:hover:bg-zinc-600"
        >
          <span aria-hidden>+</span>
          Add student
        </Link>
        {user && students.length > 0 ? (
          <Link
            href="/dashboard/students/bulk-edit"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Bulk edit
          </Link>
        ) : null}
        {user && showTestStudentSeed ? (
          <div className="rounded-lg border border-dashed border-amber-300/80 bg-amber-50/60 p-3 dark:border-amber-800/50 dark:bg-amber-950/30">
            <p className="text-xs text-amber-950 dark:text-amber-100/90">
              Dev / test: bulk-add students for the account you&apos;re signed in with. Each has a random
              name and note &quot;Test roster (seeded)&quot;.
            </p>
            <SeedTestStudentsButton />
          </div>
        ) : null}
      </section>

      <section className={dashboardSectionCard}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-base">
          Existing students
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Names A–Z. Click a student for details and goals; filter by classroom above when needed.
        </p>
        <div className="mt-4">
          <Suspense fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading roster…</p>}>
            <StudentRosterSection students={students} classrooms={rosterClassrooms} />
          </Suspense>
        </div>
      </section>

      <section className={dashboardSectionCard}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-base">
          Archived students
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Hidden from your active roster; profile and goals are kept until you restore.
        </p>
        <div className="mt-4">
          <ArchivedStudentList students={archivedStudents} />
        </div>
      </section>
    </div>
  );
}
