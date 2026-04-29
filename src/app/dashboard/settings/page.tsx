import Link from "next/link";
import { dashboardPageStack, dashboardSectionCard } from "@/data/dashboard-desktop-section";

export default function SettingsPage() {
  return (
    <div className={dashboardPageStack}>
      <div>
        <Link
          href="/dashboard/profile"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 xl:text-zinc-600 xl:hover:text-zinc-900 dark:xl:text-zinc-400 dark:xl:hover:text-zinc-200"
        >
          ← Back
        </Link>
        <div className="xl:pt-1 xl:text-center">
          <h1 className="mt-2 text-3xl font-semibold tracking-tight xl:mt-2 xl:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 xl:text-sm">
            Security and notification preferences.
          </p>
        </div>
      </div>

      <div className={dashboardSectionCard}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 xl:text-base">
          Preferences
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Settings options will be available here. You can manage security, notifications, and other preferences.
        </p>
      </div>
    </div>
  );
}
