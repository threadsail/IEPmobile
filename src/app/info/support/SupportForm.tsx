"use client";

import { useActionState } from "react";
import { submitSupportForm } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-blue-400 dark:focus:ring-blue-400";
const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function SupportForm() {
  const [state, formAction] = useActionState(submitSupportForm, { error: null });

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-800 dark:bg-green-950/40">
        <p className="text-lg font-medium text-green-800 dark:text-green-200">
          Thank you. We’ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full space-y-5">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label htmlFor="support-name" className={labelClass}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="support-name"
          name="name"
          type="text"
          required
          maxLength={200}
          placeholder="Your name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="support-email" className={labelClass}>
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="support-email"
          name="email"
          type="email"
          required
          maxLength={200}
          placeholder="your@email.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="support-subject" className={labelClass}>
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="support-subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          placeholder="Brief subject"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="support-message" className={labelClass}>
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="support-message"
          name="message"
          rows={5}
          required
          maxLength={2000}
          placeholder="How can we help?"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Send message
      </button>
    </form>
  );
}
