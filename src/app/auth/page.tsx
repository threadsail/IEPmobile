import { Suspense } from "react";
import AuthForm from "./AuthForm";

function AuthFallback() {
  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="rounded-xl border border-zinc-200/80 bg-white/90 p-8 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/90">
        <div className="mb-6 flex gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <div className="h-10 flex-1 rounded-md bg-white dark:bg-zinc-700" />
          <div className="h-10 flex-1 rounded-md" />
        </div>
        <div className="space-y-4">
          <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-10 rounded-lg bg-blue-600/80" />
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            ← Back to home
          </span>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm />
    </Suspense>
  );
}
