export default function FeaturesStudentsPage() {
  return (
    <article className="w-full space-y-16">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-pink-400/90 to-pink-600/90 px-6 py-4 text-center shadow-lg dark:from-pink-700/90 dark:to-pink-800/90">
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          Students
        </h1>
        <p className="mx-auto mt-1 max-w-2xl text-sm text-black/90">
          Keep a clear roster of students. Add notes, then use each student across schedules, activities, and data.
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            One roster for your caseload
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Add students with a name and optional note (e.g. grade level or case manager). Your student list is the foundation for schedules, activity assignments, and data—so everyone is in one place.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
          <img
            src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"
            alt="Classroom and students"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
            <img
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80"
              alt="Students working together"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Quick to add, easy to reference
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Add a new student in seconds from the Students area. Once they’re in your list, you can assign them to schedule slots, activities, and data entries so everything stays linked to the right learner.
          </p>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Built for IEP teams
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Teachers and aides see the same student list. Schedules, activities, and data are all organized by student so you can focus on each learner’s goals and progress without switching tools.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm dark:border-zinc-700/50">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
            alt="Teacher and student"
            className="h-full w-full object-cover"
          />
        </div>
      </section>
    </article>
  );
}
