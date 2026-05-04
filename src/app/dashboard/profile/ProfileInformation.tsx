"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";
import type { Profile } from "@/types/profile";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

const rowClass = "flex flex-col gap-0.5 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:py-3";
const displayRowClass =
  "flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 py-2.5 px-3 dark:bg-black/20";
const dtClass = "text-sm font-medium text-zinc-500 dark:text-zinc-400";
const ddClass = "text-sm text-zinc-900 dark:text-zinc-100";
const inputClass =
  "w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-blue-400 dark:focus:ring-blue-400";
const selectClass =
  "w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400";

type ProfileInformationProps = {
  email: string | undefined;
  profile: Profile | null;
  userCreatedAt?: string | null;
  /** When profile name fields are empty (e.g. Google OAuth), show this from auth.user_metadata. */
  oauthFullNameHint?: string | null;
};

export default function ProfileInformation({
  email,
  profile,
  userCreatedAt,
  oauthFullNameHint,
}: ProfileInformationProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfile, {});
  const [editing, setEditing] = useState(false);
  const canEdit = profile?.role !== "Aide";

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
      router.refresh();
    }
  }, [state, router]);

  const fullName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    profile?.full_name?.trim() ||
    oauthFullNameHint?.trim() ||
    "Not set";

  if (!profile) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={displayRowClass}>
          <dt className={dtClass}>Email</dt>
          <dd className={ddClass}>{email ?? "—"}</dd>
        </div>
      </div>
    );
  }

  if (editing && canEdit) {
    return (
      <form action={formAction} className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {state?.error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            {state.error}
          </div>
        ) : null}
        {state?.success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
            Saved.
          </div>
        ) : null}

        <div className={rowClass}>
          <dt className={dtClass}>Email</dt>
          <dd className={ddClass}>{email ?? "—"}</dd>
        </div>
        <div className={rowClass}>
          <dt className={dtClass}>Username</dt>
          <dd className={ddClass}>{profile.username ?? "Not set"}</dd>
        </div>
        <div className={rowClass}>
          <dt className={`${dtClass} pt-1`}>
            <label htmlFor="profile-first-name">First name</label>
          </dt>
          <dd>
            <input
              id="profile-first-name"
              name="first_name"
              type="text"
              maxLength={100}
              placeholder="First name"
              defaultValue={profile.first_name ?? ""}
              className={inputClass}
            />
          </dd>
        </div>
        <div className={rowClass}>
          <dt className={`${dtClass} pt-1`}>
            <label htmlFor="profile-last-name">Last name</label>
          </dt>
          <dd>
            <input
              id="profile-last-name"
              name="last_name"
              type="text"
              maxLength={100}
              placeholder="Last name"
              defaultValue={profile.last_name ?? ""}
              className={inputClass}
            />
          </dd>
        </div>
        <div className={rowClass}>
          <dt className={`${dtClass} pt-1`}>
            <label htmlFor="profile-role">Role</label>
          </dt>
          <dd>
            <select
              id="profile-role"
              name="role"
              className={selectClass}
              defaultValue={profile.role ?? ""}
            >
              <option value="">—</option>
              <option value="Teacher">Teacher</option>
              <option value="Aide">Aide</option>
              <option value="Admin">Admin</option>
            </select>
          </dd>
        </div>
        <div className={rowClass}>
          <dt className={`${dtClass} pt-1`}>
            <label htmlFor="profile-organization-name">Organization</label>
          </dt>
          <dd>
            <input
              id="profile-organization-name"
              name="organization_name"
              type="text"
              maxLength={200}
              placeholder="Organization name (owners only)"
              defaultValue={profile.organization_name ?? ""}
              className={inputClass}
            />
          </dd>
        </div>
        <div className={rowClass}>
          <dt className={dtClass}>Profile created</dt>
          <dd className={ddClass}>{formatDate(profile.created_at ?? userCreatedAt ?? null)}</dd>
        </div>
        <div className={rowClass}>
          <dt className={dtClass}>Last updated</dt>
          <dd className={ddClass}>{formatDate(profile.updated_at ?? null)}</dd>
        </div>
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <dl className="space-y-3">
        <div className={displayRowClass}>
          <dt className={dtClass}>Email</dt>
          <dd className={ddClass}>{email ?? "—"}</dd>
        </div>
        <div className={displayRowClass}>
          <dt className={dtClass}>Username</dt>
          <dd className={ddClass}>{profile.username ?? "Not set"}</dd>
        </div>
        <div className={displayRowClass}>
          <dt className={dtClass}>Name</dt>
          <dd className={ddClass}>{fullName}</dd>
        </div>
        <div className={displayRowClass}>
          <dt className={dtClass}>Role</dt>
          <dd className={ddClass}>
            {profile.role ? (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                {profile.role}
              </span>
            ) : (
              "Not set"
            )}
          </dd>
        </div>
        <div className={displayRowClass}>
          <dt className={dtClass}>Organization</dt>
          <dd className={ddClass}>{profile.organization_name ?? "Not set"}</dd>
        </div>
        <div className={displayRowClass}>
          <dt className={dtClass}>Profile created</dt>
          <dd className={ddClass}>{formatDate(profile.created_at ?? userCreatedAt ?? null)}</dd>
        </div>
        <div className={displayRowClass}>
          <dt className={dtClass}>Last updated</dt>
          <dd className={ddClass}>{formatDate(profile.updated_at ?? null)}</dd>
        </div>
      </dl>
      {canEdit && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Edit
          </button>
        </div>
      )}
    </>
  );
}
