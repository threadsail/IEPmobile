import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Contact Us
      </h1>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
        Get in touch with our team. We’re here to help.
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
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Support
          </p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            For product help, visit our{" "}
            <Link href="/info/support" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Support
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
}
