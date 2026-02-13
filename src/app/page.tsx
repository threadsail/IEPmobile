export default function Home() {
  return (
    <section className="w-full space-y-8">
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
