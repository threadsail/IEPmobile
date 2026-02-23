export default function FeaturesSchedulePage() {
  return (
    <article className="w-full space-y-16">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-teal-400/90 to-teal-600/90 px-6 py-4 text-center shadow-lg dark:from-teal-700/90 dark:to-teal-800/90">
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Schedule
        </h1>
        <p className="mx-auto mt-1 max-w-2xl text-sm text-black/90">
          Build and manage daily schedules so everyone knows what’s next—and stay aligned with IEP service minutes.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Week view at a glance
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Pick any week and see every day side by side. Tap a day to view the full schedule from 7 AM to 4 PM in 30-minute slots. Perfect for planning ahead and sharing with aides and co-teachers.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
          <img
            src="https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80"
            alt="Calendar and weekly planner"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
              alt="Structured daily timeline"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Time blocks that match the school day
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Each day is broken into 30-minute slots from 7:00 AM to 4:00 PM. Assign activities, pull-out sessions, or notes to specific times so aides and substitutes know exactly what to do and when.
          </p>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Align with IEP service minutes
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Keep schedules consistent so you can track service minutes over time. Use the same structure across weeks to simplify compliance and progress reporting.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
          <img
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
            alt="Organized planning"
            className="h-full w-full object-cover"
          />
        </div>
      </section>
    </article>
  );
}
