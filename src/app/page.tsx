export default function Home() {
  return (
    <section className="w-full space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Welcome
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Next.js App Router starter
        </h1>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          This is a minimal homepage built with the App Router, TypeScript, and
          Tailwind CSS. Use it as a clean starting point for your next project.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60">
          <h2 className="text-sm font-semibold">Edit the homepage</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Update the content in{" "}
            <code className="rounded bg-zinc-950/5 px-1 py-0.5 text-xs font-mono">
              src/app/page.tsx
            </code>{" "}
            to customize this view.
          </p>
        </div>

        <div className="rounded-lg border bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60">
          <h2 className="text-sm font-semibold">Tweak the layout</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Global structure lives in{" "}
            <code className="rounded bg-zinc-950/5 px-1 py-0.5 text-xs font-mono">
              src/app/layout.tsx
            </code>
            , including the header and footer.
          </p>
        </div>

        <div className="rounded-lg border bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60">
          <h2 className="text-sm font-semibold">Style with Tailwind</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Use utility classes in your components and global styles in{" "}
            <code className="rounded bg-zinc-950/5 px-1 py-0.5 text-xs font-mono">
              src/app/globals.css
            </code>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
