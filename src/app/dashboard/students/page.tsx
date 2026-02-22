import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getStudents } from "./get-students";
import StudentList from "./StudentList";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const students = user ? await getStudents(supabase, user.id) : [];

  return (
    <div className="w-full space-y-6">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-pink-400/90 to-pink-600/90 px-6 py-4 text-center shadow-lg dark:from-pink-700/90 dark:to-pink-800/90">
        <h1 className="text-2xl font-semibold tracking-tight text-black">Students</h1>
      </section>

      <section className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <Link
          href="/dashboard/students/new"
          className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
        >
          <span aria-hidden>+</span>
          Add student
        </Link>
      </section>

      <section className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Existing students</h2>
        <div className="mt-4">
          <StudentList students={students} />
        </div>
      </section>
    </div>
  );
}
