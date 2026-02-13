import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Account Dashboard
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Manage your account and preferences.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            View and edit your profile information.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Edit profile →
          </Link>
        </div>
        <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
          <h2 className="text-lg font-semibold">Subscription</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Manage your subscription and billing.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View plans →
          </Link>
        </div>
        <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Security and notification preferences.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-zinc-400 dark:text-zinc-500">
            Coming soon
          </span>
        </div>
      </div>

      <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your recent activity will appear here once you start using the
          platform.
        </p>
      </div>
    </div>
  );
}
