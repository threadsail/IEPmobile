"use client";

import { useState } from "react";

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string; message?: string };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Could not open billing portal.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No portal URL returned.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md border border-violet-300 bg-white px-3 py-1.5 text-sm font-medium text-violet-800 transition-colors hover:bg-violet-50 disabled:opacity-60 dark:border-violet-600 dark:bg-violet-950/50 dark:text-violet-100 dark:hover:bg-violet-900/40"
      >
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error && (
        <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
