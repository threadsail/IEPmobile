export default function FeaturesActivitiesPage() {
  return (
    <article className="w-full space-y-16">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-purple-400/90 to-purple-600/90 px-6 py-4 text-center shadow-lg dark:from-purple-700/90 dark:to-purple-800/90">
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Activities
        </h1>
        <p className="mx-auto mt-1 max-w-2xl text-sm text-black/90">
          Assign and track activities tied to IEP goals. See who’s working on what—all in one place for you and your team.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            A library of activities at your fingertips
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Add custom activities or YouTube-based ones, then browse by popularity or recency. Each activity appears in a clear grid so you can assign the right task to the right student quickly.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
            alt="Activities and tasks"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Collaboration and assignments"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Create activities or link to YouTube
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Build your own activity list: add custom activities with a name and description, or add YouTube activities with a link. Sort by popularity or recent so the most-used resources are easy to find.
          </p>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Tie activities to goals and schedules
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Assign activities to time slots on the schedule and track completion. When you need to report on progress, you’ll know which activities were used and when—all aligned to your IEP goals.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
            alt="Learning and goals"
            className="h-full w-full object-cover"
          />
        </div>
      </section>
    </article>
  );
}
