import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getStudents } from "../../get-students";
import { studentDisplayName, type Student } from "@/types/student";
import EditStudentForm from "../../EditStudentForm";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

function findStudent(students: Student[], id: string): Student | undefined {
  return students.find((s) => s.id === id);
}

export default async function EditStudentPage({ params }: Params) {
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

  return (
    <div className="w-full space-y-6">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-pink-400/90 to-pink-600/90 px-6 py-4 text-center shadow-lg dark:from-pink-700/90 dark:to-pink-800/90">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          Edit student
        </h1>
        <p className="mt-1 text-lg font-medium text-black">{name}</p>
      </section>

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <EditStudentForm student={student} />
      </div>

      <Link
        href={`/dashboard/students/${id}`}
        className="inline-block text-sm font-medium text-pink-600 hover:underline dark:text-pink-400"
      >
        ← Back to student details
      </Link>
    </div>
  );
}
