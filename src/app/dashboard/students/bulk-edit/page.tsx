import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  dashboardHeroCorporateXl,
  dashboardHeroSubtitleCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
  dashboardSectionCard,
} from "@/data/dashboard-desktop-section";
import { getStudents } from "../get-students";
import BulkEditStudentsForm from "./BulkEditStudentsForm";

export const dynamic = "force-dynamic";

export default async function BulkEditStudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const students = await getStudents(supabase, user.id);

  return (
    <div className={dashboardPageStack}>
      <section
        className={`-mt-8 rounded-b-xl bg-gradient-to-br from-pink-400/90 to-pink-600/90 px-6 py-4 text-center shadow-lg dark:from-pink-700/90 dark:to-pink-800/90 ${dashboardHeroCorporateXl}`}
      >
        <h1
          className={`text-2xl font-semibold tracking-tight text-black ${dashboardHeroTitleCorporateXl}`}
        >
          Bulk edit students
        </h1>
        <p
          className={`mt-1 text-lg font-medium text-black md:mt-1 ${dashboardHeroSubtitleCorporateXl}`}
        >
          Update names, grade, classroom, notes, and active IEP goals in one table.
        </p>
      </section>

      <section className={dashboardSectionCard}>
        {students.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You don&apos;t have any students on your active roster yet. Add students first, then you
              can bulk edit them here.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/students/new"
                className="inline-flex rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
              >
                Add student
              </Link>
              <Link
                href="/dashboard/students"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                ← Back to students
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Changes replace each student&apos;s profile fields and their <strong>active</strong> IEP
              goals (archived goals are unchanged). Scroll horizontally on small screens.
            </p>
            <div className="mt-6">
              <BulkEditStudentsForm students={students} />
            </div>
          </>
        )}
      </section>

      {students.length > 0 ? (
        <Link
          href="/dashboard/students"
          className="inline-block text-sm font-medium text-pink-600 hover:underline dark:text-pink-400 md:text-zinc-600 md:hover:text-zinc-900 dark:md:text-zinc-400 dark:md:hover:text-zinc-200"
        >
          ← Back to students
        </Link>
      ) : null}
    </div>
  );
}
