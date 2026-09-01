"use client";

import { useActionState } from "react";
import { joinOrganizationAsAide } from "./actions";

type TeamAccessSectionProps = {
  isStaff: boolean;
  inviteCode: string | null;
  inviteUrl: string | null;
};

export default function TeamAccessSection({
  isStaff,
  inviteCode,
  inviteUrl,
}: TeamAccessSectionProps) {
  const [state, formAction, isPending] = useActionState(joinOrganizationAsAide, {
    error: null,
    success: false,
  });

  async function copyInviteLink() {
    if (!inviteUrl || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className="rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-blue-50/80 p-6 shadow-md dark:border-sky-800/40 dark:from-sky-950/40 dark:to-blue-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-600 dark:bg-sky-400/20 dark:text-sky-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-sky-900 dark:text-sky-100">Team access</h2>
          <p className="text-sm text-sky-600/90 dark:text-sky-300/80">
            {isStaff
              ? "Invite aides to view schedules and collaborate"
              : "Join your teacher's account with an invite code"}
          </p>
        </div>
      </div>

      {isStaff ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-sky-800 dark:text-sky-200">
            Share this link with aides. Once they join, they can view schedules created by teachers and admins on
            your account.
          </p>
          {inviteCode && inviteUrl ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="min-w-0 flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100"
              />
              <button
                type="button"
                onClick={copyInviteLink}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
              >
                Copy link
              </button>
            </div>
          ) : (
            <p className="text-sm text-sky-700 dark:text-sky-300">
              Invite link unavailable. Run the latest database migration in Supabase.
            </p>
          )}
        </div>
      ) : (
        <form action={formAction} className="mt-5 space-y-3">
          <p className="text-sm text-sky-800 dark:text-sky-200">
            Enter the invite code from your teacher to link your account and view their schedule.
          </p>
          {state?.error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {state.error}
            </p>
          ) : null}
          {state?.success ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              Linked successfully. Open Schedule to view your teacher&apos;s entries.
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="invite-code"
              name="invite_code"
              type="text"
              required
              placeholder="Invite code"
              className="min-w-0 flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-900 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
            >
              {isPending ? "Joining…" : "Join team"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
