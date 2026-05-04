import Link from "next/link";
import {
  dashboardHeroCorporateXl,
  dashboardHeroTitleCorporateXl,
  dashboardPageStack,
  dashboardSectionCard,
} from "@/data/dashboard-desktop-section";
import AddActivityForm from "./AddActivityForm";

export default function NewActivityPage() {
  return (
    <div className={dashboardPageStack}>
      <section
        className={`-mt-8 rounded-b-xl bg-gradient-to-br from-purple-400/90 to-purple-600/90 px-6 py-4 text-center shadow-lg dark:from-purple-700/90 dark:to-purple-800/90 ${dashboardHeroCorporateXl}`}
      >
        <h1
          className={`text-2xl font-semibold tracking-tight text-black ${dashboardHeroTitleCorporateXl}`}
        >
          Add activity
        </h1>
      </section>

      <div className={dashboardSectionCard}>
        <AddActivityForm />
      </div>

      <Link
        href="/dashboard/activities"
        className="inline-block text-sm font-medium text-purple-600 hover:underline dark:text-purple-400 md:text-zinc-600 md:hover:text-zinc-900 dark:md:text-zinc-400 dark:md:hover:text-zinc-200"
      >
        ← Back to activities
      </Link>
    </div>
  );
}
