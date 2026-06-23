import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  dashboardHeroCorporateXl,
  dashboardHeroSubtitleCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
} from "@/data/dashboard-desktop-section";
import { getStudents } from "../get-students";
import { studentDisplayName, type Student } from "@/types/student";
import StudentDetailTabs from "../StudentDetailTabs";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function findStudent(students: Student[], id: string): Student | undefined {
  return students.find((s) => s.id === id);
}

export default async function StudentDetailPage({ params, searchParams }: Params) {
  const { id } = await params;
  const { tab } = await searchParams;
  const initialTab = tab === "iep" ? "iep" : "profile";

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
          className={`mt-1 text-lg font-medium text-black md:mt-1 ${dashboardHeroSubtitleCorporateXl}`}
        >
          {name}
        </p>
      </section>

      <div className="space-y-4 md:space-y-3">
        <StudentDetailTabs student={student} initialTab={initialTab} variant="page" />

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/students/${id}/edit`}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 md:bg-zinc-800 md:hover:bg-zinc-900 dark:md:bg-zinc-700 dark:md:hover:bg-zinc-600"
          >
            Edit student
          </Link>
          <Link
            href="/dashboard/students"
            className="text-sm font-medium text-pink-600 hover:underline dark:text-pink-400 md:text-zinc-600 md:hover:text-zinc-900 dark:md:text-zinc-400 dark:md:hover:text-zinc-200"
          >
            ← Back to students
          </Link>
        </div>
      </div>
    </div>
  );
}
