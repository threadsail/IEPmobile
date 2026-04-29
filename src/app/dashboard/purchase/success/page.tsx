import Link from "next/link";

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Payment received
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Thanks for subscribing. Your plan usually updates within a few seconds. If anything
          looks off, refresh the dashboard or open billing from your profile.
        </p>
      </div>
      {sessionId && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Reference: <span className="font-mono">{sessionId}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/profile"
          className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View subscription
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
