import Link from "next/link";

export default function Home() {
  return (
    <article className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-20 shadow-2xl dark:border-zinc-700/50 sm:px-14 sm:py-28 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-0 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-300">
            EdTech marketplace
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Where used school devices find new classrooms
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-300 sm:text-xl">
            Threadsail connects K–12 districts with buyers who refurbish and
            reuse. List surplus laptops, Chromebooks, and tablets—or browse and
            buy at scale.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              Browse devices
            </Link>
            <Link
              href="/listdevice"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              List a device
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m4-13.5v13.5m4-13.5v13.5m-10.5-18v18" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Buy in bulk
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Source laptops, Chromebooks, and tablets from verified schools and
            districts—ready for refurbishment or deployment.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Sell surplus
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Offload retired devices to vetted buyers. Clear inventory, recover
            value, and support circular use of ed tech.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50 sm:col-span-2 lg:col-span-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Better for the planet
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Extend device life and reduce e-waste. Every device reused is one less
            in a landfill.
          </p>
        </div>
      </section>

      {/* Social proof / CTA strip */}
      <section className="mt-16 rounded-2xl border border-zinc-200/80 bg-zinc-100/80 px-8 py-12 text-center dark:border-zinc-700/50 dark:bg-zinc-800/50">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Ready to get started?
        </p>
        <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Find or list devices in minutes
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          Join schools and buyers already using Threadsail to move ed tech where
          it’s needed.
        </p>
        <div className="mt-8">
          <Link
            href="/browse"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            Browse devices
          </Link>
        </div>
      </section>
    </article>
  );
}
