import Link from "next/link";

export default function NewActivityPage() {
  return (
    <div className="w-full space-y-6">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-purple-400/90 to-purple-600/90 px-6 py-4 text-center shadow-lg dark:from-purple-700/90 dark:to-purple-800/90">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          Add activity
        </h1>
      </section>

      <p className="text-zinc-600 dark:text-zinc-400">
        Add activity form coming soon. Wire this page to create rows in your
        activities table.
      </p>
      <Link
        href="/dashboard/activities"
        className="text-sm font-medium text-purple-600 hover:underline dark:text-purple-400"
      >
        ← Back to activities
      </Link>
    </div>
  );
}
