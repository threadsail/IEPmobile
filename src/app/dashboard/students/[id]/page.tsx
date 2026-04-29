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
import { studentDisplayName, type Student } from "@/types/student";
import StudentGoalsArchiveForm from "../StudentGoalsArchiveForm";
import ArchivedGoalsList from "../ArchivedGoalsList";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

function findStudent(students: Student[], id: string): Student | undefined {
  return students.find((s) => s.id === id);
}

export default async function StudentDetailPage({ params }: Params) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const students = await getStudents(supabase, user.id);
  const student = findStudent(students, id);

  if (!student) {
    notFound();
  }

  const name = studentDisplayName(student);
  const goals = student.goals ?? [];
  const archivedGoals = student.archived_goals ?? [];

  return (
    <div className={dashboardPageStack}>
      <section
        className={`-mt-8 rounded-b-xl bg-gradient-to-br from-pink-400/90 to-pink-600/90 px-6 py-4 text-center shadow-lg dark:from-pink-700/90 dark:to-pink-800/90 ${dashboardHeroCorporateXl}`}
      >
        <h1
          className={`text-2xl font-semibold tracking-tight text-black ${dashboardHeroTitleCorporateXl}`}
        >
          Student details
        </h1>
        <p
          className={`mt-1 text-lg font-medium text-black xl:mt-1 ${dashboardHeroSubtitleCorporateXl}`}
        >
          {name}
        </p>
      </section>

      <div className="space-y-4 xl:space-y-3">
        <section className={dashboardSectionCard}>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Profile
          </h2>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
            <div>
              <dt className="font-medium">Name</dt>
              <dd className="mt-0.5">{name}</dd>
            </div>
            <div>
              <dt className="font-medium">Grade</dt>
              <dd className="mt-0.5">{student.grade || "—"}</dd>
            </div>
            <div>
              <dt className="font-medium">Classroom</dt>
              <dd className="mt-0.5">{student.classroom || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-medium">Note</dt>
              <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                {student.note || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className={dashboardSectionCard}>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            IEP goals
          </h2>
          {goals.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No IEP goals added yet for this student.
            </p>
          ) : (
            <StudentGoalsArchiveForm studentId={student.id} goals={goals} />
          )}
        </section>

        <section className={dashboardSectionCard}>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Archived
          </h2>
          {archivedGoals.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No archived goals.
            </p>
          ) : (
            <ArchivedGoalsList studentId={student.id} archivedGoals={archivedGoals} />
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/students/${id}/edit`}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 xl:bg-zinc-800 xl:hover:bg-zinc-900 dark:xl:bg-zinc-700 dark:xl:hover:bg-zinc-600"
          >
            Edit student
          </Link>
          <Link
            href="/dashboard/students"
            className="text-sm font-medium text-pink-600 hover:underline dark:text-pink-400 xl:text-zinc-600 xl:hover:text-zinc-900 dark:xl:text-zinc-400 dark:xl:hover:text-zinc-200"
          >
            ← Back to students
          </Link>
        </div>
      </div>
    </div>
  );
}

