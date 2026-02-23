import Link from "next/link";

export default function Home() {
  return (
    <article className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-10 shadow-2xl dark:border-zinc-700/50 sm:px-14 sm:py-12 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-0 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-300">
            IEP Schedule & Tracking
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Simplify IEP management for every student
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-300 sm:text-xl">
            Daily schedules, assigned activities, and data tracking in one place—so you spend less time on paperwork and more time supporting learners.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              Get started
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              View plans
            </Link>
          </div>
        </div>
      </section>

      {/* Value props: Daily schedules, Assigned activities, Data tracking */}
      <section className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
          <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80"
              alt="Daily schedule example—calendar and planner view"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Daily schedules
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Build and manage daily schedules by class or student. Keep routines consistent and visible so everyone knows what’s next—and stay aligned with IEP service minutes.
          </p>
          <Link
            href="/dashboard/schedule"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Schedules →
          </Link>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
          <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
              alt="Assigned activities example—tasks and checklist"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Assigned activities
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Assign and track activities tied to IEP goals. See who’s working on what, when it’s due, and completion status—all in one place for you and your team.
          </p>
          <Link
            href="/dashboard/activities"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Activities →
          </Link>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50 sm:col-span-2 lg:col-span-1">
          <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
              alt="Data tracking example—charts and progress"
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="flex flex-col p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Data tracking per student
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Track progress and outcomes for each student. Log data against goals, view trends over time, and pull what you need for progress reports and compliance.
          </p>
          <Link
            href="/dashboard/data"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Data & reports →
          </Link>
          </div>
        </div>
      </section>

      {/* How it works / benefits */}
      <section className="mt-16 rounded-2xl border border-zinc-200/80 bg-white/80 px-8 py-10 dark:border-zinc-700/50 dark:bg-zinc-900/50 sm:px-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Built for IEP teams
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">1</span>
            <span>Organize daily schedules by classroom or individual student.</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">2</span>
            <span>Assign activities linked to IEP goals and monitor completion.</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">3</span>
            <span>Track and report progress for each student in one place.</span>
          </li>
        </ul>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl border border-zinc-200/80 bg-zinc-100/80 px-8 py-12 text-center dark:border-zinc-700/50 dark:bg-zinc-800/50">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Start managing IEPs with less friction
        </p>
        <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Ready to simplify schedules, activities, and data?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          Create an account to set up daily schedules, assign activities, and track progress for every student.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            Sign up
          </Link>
          <Link
            href="/dashboard/students"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-base font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            View students
          </Link>
        </div>
      </section>
    </article>
  );
}
