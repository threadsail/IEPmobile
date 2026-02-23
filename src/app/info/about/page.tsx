export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-16">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          About Us
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Learn more about our company and the people behind IEP mobile.
        </p>
      </header>

      {/* Company info */}
      <section className="rounded-2xl border border-zinc-200/80 bg-white/80 px-6 py-8 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50 sm:px-10 sm:py-10">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Company
        </h2>
        <div className="mt-4 space-y-4 text-zinc-600 dark:text-zinc-400">
          <p className="leading-relaxed">
            <strong className="text-zinc-900 dark:text-zinc-100">IEP mobile</strong> helps teachers and IEP teams manage daily schedules, assigned activities, and student data in one place—so you spend less time on paperwork and more time supporting learners.
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
          {/* Creator 1 */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
            <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80"
                alt=""
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="flex flex-col p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Creator One
              </h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>Credential or degree one</li>
                <li>Credential or degree two</li>
                <li>Years of experience in special education</li>
                <li>Certification or license</li>
              </ul>
            </div>
          </div>

          {/* Creator 2 */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white/80 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/50">
            <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80"
                alt=""
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="flex flex-col p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Creator Two
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
