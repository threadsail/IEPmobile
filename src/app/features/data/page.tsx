export default function FeaturesDataPage() {
  return (
    <article className="w-full space-y-16">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-orange-300/90 to-orange-500/90 px-6 py-4 text-center shadow-lg dark:from-orange-600/90 dark:to-orange-800/90">
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Data
        </h1>
        <p className="mx-auto mt-1 max-w-2xl text-sm text-black/90">
          Track progress, approve aide-submitted data, and pull what you need for progress reports and compliance.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            One place for all student data
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Log and view data for each student in one dashboard. See recent entries, trends, and summaries so you’re ready for meetings and progress reports without digging through spreadsheets.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
            alt="Charts and data dashboard"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
              alt="Review and approval workflow"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Approve data from aides
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            When aides submit student data, it appears in your queue. Review and approve or reject with one tap so you stay in control while your team can log data throughout the day.
          </p>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Ready for progress reports and compliance
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Export or view data by student and time period. Use the same structure for IEP progress reports and audits so you spend less time formatting and more time supporting learners.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
          <img
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
            alt="Reports and documents"
            className="h-full w-full object-cover"
          />
        </div>
      </section>
    </article>
  );
}
