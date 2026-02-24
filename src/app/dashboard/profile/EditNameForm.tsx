"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-blue-400 dark:focus:ring-blue-400";
const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
const selectClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400";

type EditNameFormProps = {
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  organizationName: string | null;
};

export default function EditNameForm({ firstName, lastName, role, organizationName }: EditNameFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfile, {});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
      router.refresh();
    }
  }, [state, router]);

  if (!editing) {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
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

      <div>
        <label htmlFor="profile-first-name" className={labelClass}>
          First name
        </label>
        <input
          id="profile-first-name"
          name="first_name"
          type="text"
          maxLength={100}
          placeholder="First name"
          defaultValue={firstName ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="profile-last-name" className={labelClass}>
          Last name
        </label>
        <input
          id="profile-last-name"
          name="last_name"
          type="text"
          maxLength={100}
          placeholder="Last name"
          defaultValue={lastName ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="profile-role" className={labelClass}>
          Role
        </label>
        <select
          id="profile-role"
          name="role"
          className={selectClass}
          defaultValue={role ?? ""}
        >
          <option value="">—</option>
          <option value="Teacher">Teacher</option>
          <option value="Aide">Aide</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <div>
        <label htmlFor="profile-organization-name" className={labelClass}>
          Organization name
        </label>
        <input
          id="profile-organization-name"
          name="organization_name"
          type="text"
          maxLength={200}
          placeholder="Organization name (if you are the owner)"
          defaultValue={organizationName ?? ""}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Only organization owners can change this.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
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
