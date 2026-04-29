import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/dashboard/profile/get-profile";
import { dashboardStackSpacing } from "@/data/dashboard-desktop-section";
import { getSuggestionsWithMeta } from "./get-suggestions";
import SuggestionForm from "./SuggestionForm";
import SuggestionList from "./SuggestionList";

export default async function SuggestionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const [supabase, profile] = await Promise.all([
    createClient(),
    getProfile(user.id),
  ]);
  const suggestions = await getSuggestionsWithMeta(supabase, user.id);
  const isSuperadmin = profile?.role === "Superadmin";

  return (
    <div
      className={`mx-auto w-full max-w-2xl px-2 lg:max-w-4xl ${dashboardStackSpacing}`}
    >
      <div>
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to profile
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 xl:text-xl xl:font-semibold">
          Suggestions
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 xl:text-xs">
          Share ideas and upvote suggestions from the community.
        </p>
      </div>

      <section className="rounded-xl border border-yellow-200/80 bg-gradient-to-br from-yellow-50/90 to-amber-50/80 p-6 shadow-md dark:border-yellow-800/40 dark:from-yellow-950/40 dark:to-amber-950/30 xl:rounded-lg xl:border-zinc-200 xl:bg-white xl:p-4 xl:shadow-none dark:xl:border-zinc-800 dark:xl:bg-zinc-950">
        <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 xl:text-base xl:text-zinc-900 dark:xl:text-zinc-100">
          Post a suggestion
        </h2>
        <div className="mt-4">
          <SuggestionForm />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 xl:text-base">
          All suggestions
        </h2>
        <div className="mt-4">
          <SuggestionList suggestions={suggestions} isSuperadmin={isSuperadmin} />
        </div>
      </section>
    </div>
  );
}
