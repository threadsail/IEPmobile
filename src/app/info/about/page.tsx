export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-16">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          About Us
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Learn more about our company and the people behind IEP Classroom.
        </p>
      </header>

      {/* Company info */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white/80 px-6 py-8 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50 sm:px-10 sm:py-10">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Company
        </h2>
        <div className="mt-4 space-y-4 text-zinc-600 dark:text-zinc-400">
          <p className="leading-relaxed">
            <strong className="text-zinc-900 dark:text-zinc-100">IEP Classroom</strong> helps teachers and IEP teams manage daily schedules, assigned activities, and student data in one place—so you spend less time on paperwork and more time supporting learners.
          </p>
          <p className="leading-relaxed">
            We build tools that simplify IEP workflow: consistent routines, clear visibility for aides and support staff, and progress tracking that fits how you already work.
          </p>
        </div>
      </section>

      {/* About the creators */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-8">
          About the creators
        </h2>
        <div className="grid gap-10 sm:grid-cols-2">
          {/* Elizabeth – left */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
            <div className="relative flex aspect-square w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <svg className="h-1/2 w-1/2 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex flex-col p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Elizabeth
              </h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>Credential or degree one</li>
                <li>Credential or degree two</li>
                <li>Years of experience in special education</li>
                <li>Certification or license</li>
              </ul>
            </div>
          </div>

          {/* Jordan – right */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
            <div className="relative flex aspect-square w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <svg className="h-1/2 w-1/2 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex flex-col p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Jordan
              </h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>Credential or degree one</li>
                <li>Credential or degree two</li>
                <li>Background in education technology</li>
                <li>Certification or license</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
