import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Update your account details.
        </p>
      </div>
      <div className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Profile form and settings can be added here.
        </p>
      </div>
    </div>
  );
}
