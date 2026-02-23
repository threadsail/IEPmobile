import SupportForm from "./SupportForm";

export default function SupportPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Support
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Get help from our team. Send us a message below or email us directly.
      </p>

      <div className="mt-10 w-full space-y-6 rounded-2xl border border-zinc-200/80 bg-white/80 px-8 py-8 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Email
          </p>
          <a
            href="mailto:jordan@threadsail.io"
            className="mt-1 inline-block text-lg font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            jordan@threadsail.io
          </a>
        </div>

        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Send a message
          </h2>
          <div className="mt-4 text-left">
            <SupportForm />
          </div>
        </div>
      </div>
    </div>
  );
}
