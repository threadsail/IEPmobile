import Link from "next/link";
import AddStudentForm from "../AddStudentForm";

export default function NewStudentPage() {
  return (
    <div className="w-full space-y-6">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-pink-400/90 to-pink-600/90 px-6 py-4 text-center shadow-lg dark:from-pink-700/90 dark:to-pink-800/90">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          Add student
        </h1>
      </section>

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <AddStudentForm />
      </div>

      <Link
        href="/dashboard/students"
        className="inline-block text-sm font-medium text-pink-600 hover:underline dark:text-pink-400"
      >
        ← Back to students
      </Link>
    </div>
  );
}
