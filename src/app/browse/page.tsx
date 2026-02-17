export default function BrowsePage() {
  return (
    <section className="w-full space-y-8">
      {/* Top section: graphic with text inside */}
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-16 shadow-xl dark:border-zinc-700/50 sm:px-12 sm:py-20"
        aria-label="Hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-0 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-indigo-400/10 blur-2xl" />
        <div className="relative text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl">
            Give devices a second life
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-blue-100 sm:text-lg">
            Connect schools with affordable, refurbished tech—and keep equipment
            out of landfills.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse Devices
        </h1>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Find used educational technology from schools and districts. Laptops,
          Chromebooks, tablets, and more—ready for refurbishment or reuse.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <input
          type="search"
          placeholder="Search devices..."
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          aria-label="Search devices"
        />
        <select
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="laptop">Laptops</option>
          <option value="chromebook">Chromebooks</option>
          <option value="tablet">Tablets</option>
          <option value="desktop">Desktops</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-lg border bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60"
          >
            <div className="aspect-video rounded bg-zinc-200 dark:bg-zinc-700" />
            <h3 className="mt-3 font-medium">Device listing {i}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Example device type · Condition and quantity TBD
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
