import Link from "next/link";
import {
  dashboardHeroCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
  dashboardSectionCard,
} from "@/data/dashboard-desktop-section";
import AddStudentForm from "../AddStudentForm";

export default function NewStudentPage() {
  return (
    <div className={dashboardPageStack}>
      <section
        className={`-mt-8 rounded-b-xl bg-gradient-to-br from-pink-400/90 to-pink-600/90 px-6 py-4 text-center shadow-lg dark:from-pink-700/90 dark:to-pink-800/90 ${dashboardHeroCorporateXl}`}
      >
        <h1
          className={`text-2xl font-semibold tracking-tight text-black ${dashboardHeroTitleCorporateXl}`}
        >
          Add student
        </h1>
      </section>

      <div className={dashboardSectionCard}>
        <AddStudentForm />
      </div>

      <Link
        href="/dashboard/students"
        className="inline-block text-sm font-medium text-pink-600 hover:underline dark:text-pink-400 xl:text-zinc-600 xl:hover:text-zinc-900 dark:xl:text-zinc-400 dark:xl:hover:text-zinc-200"
      >
        ← Back to students
      </Link>
    </div>
  );
}
