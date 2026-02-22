import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Security and notification preferences.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Preferences</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Settings options will be available here. You can manage security, notifications, and other preferences.
        </p>
      </div>
    </div>
  );
}
