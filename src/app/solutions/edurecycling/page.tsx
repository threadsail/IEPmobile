import Link from "next/link";

export default function EDURecyclingPage() {
  return (
    <div className="w-full space-y-10">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">
          Educational Technology Recycling
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Turn your school corporation’s retired devices into value while
          meeting sustainability and data-security goals. We connect K–12 and
          higher-ed IT with vetted recycling purchasers who buy used educational
          technology in bulk.
        </p>
      </div>

      <section className="space-y-2">
        <div className="aspect-[21/9] w-full overflow-hidden rounded-lg border bg-zinc-200 dark:bg-zinc-800">
          <div className="flex h-full w-full items-center justify-center text-zinc-500 dark:text-zinc-400">
            Hero image (e.g. school tech or recycling facility)
          </div>
        </div>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Optional caption for hero image
        </p>
      </section>

      <section className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
        <h2 className="text-xl font-semibold">How it works</h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          School corporations accumulate large volumes of end-of-life or
          surplus technology: laptops, Chromebooks, tablets, desktops, and
          peripherals. Instead of sending this equipment to generic e-waste
          streams, EDU Recycling connects your district with qualified
          <strong className="text-zinc-900 dark:text-zinc-100">
            {" "}
            recycling purchasers
          </strong>{" "}
          who buy used educational tech for refurbishment, resale, or
          responsible recycling. You receive fair pricing, documented
          chain-of-custody, and proof of secure data destruction—so you meet
          procurement, sustainability, and compliance requirements in one
          program.
        </p>
        <div className="mt-4 space-y-2">
          <div className="aspect-video w-full overflow-hidden rounded-lg border bg-zinc-200 dark:bg-zinc-800">
            <div className="flex h-full w-full items-center justify-center text-zinc-500 dark:text-zinc-400">
              How it works / process image
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Optional caption
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Benefits for school corporations</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          <li className="flex gap-3 rounded-lg border bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60">
            <span className="text-2xl">💰</span>
            <div>
              <span className="font-medium">Recover value</span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Sell old devices in bulk to buyers who specialize in
                educational equipment instead of discarding or low-value
                disposal.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-lg border bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60">
            <span className="text-2xl">🔒</span>
            <div>
              <span className="font-medium">Secure data handling</span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Work with purchasers who provide certified data wipe or
                destruction and chain-of-custody documentation for compliance.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-lg border bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60">
            <span className="text-2xl">♻️</span>
            <div>
              <span className="font-medium">Sustainability & compliance</span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Meet e-waste and environmental goals with transparent,
                auditable recycling and reuse pathways.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-lg border bg-white/70 p-4 shadow-sm dark:bg-zinc-900/60">
            <span className="text-2xl">📦</span>
            <div>
              <span className="font-medium">Simple logistics</span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Bulk pickup and clear processes so your IT and facilities teams
                can plan without extra overhead.
              </p>
            </div>
          </li>
        </ul>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border bg-zinc-200 dark:bg-zinc-800">
              <div className="flex h-full w-full items-center justify-center text-center text-sm text-zinc-500 dark:text-zinc-400">
                Benefits / value image
              </div>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Optional caption
            </p>
          </div>
          <div className="space-y-2">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border bg-zinc-200 dark:bg-zinc-800">
              <div className="flex h-full w-full items-center justify-center text-center text-sm text-zinc-500 dark:text-zinc-400">
                Sustainability / compliance image
              </div>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Optional caption
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Equipment we help you sell</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Recycling purchasers in our network typically buy a wide range of
          educational technology, including:
        </p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {[
            "Laptops & notebooks",
            "Chromebooks",
            "Tablets & iPads",
            "Desktops & all-in-ones",
            "Monitors & displays",
            "Keyboards, mice & peripherals",
            "Cables, chargers & accessories",
            "Network equipment",
          ].map((item) => (
            <li
              key={item}
              className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium shadow-sm dark:bg-zinc-800/80"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2">
          <div className="aspect-[2/1] w-full overflow-hidden rounded-lg border bg-zinc-200 dark:bg-zinc-800">
            <div className="flex h-full w-full items-center justify-center text-zinc-500 dark:text-zinc-400">
              Equipment / devices image (e.g. laptops, Chromebooks, tablets)
            </div>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Optional caption for equipment image
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-white/70 p-6 shadow-sm dark:bg-zinc-900/60">
        <h2 className="text-xl font-semibold">Next steps</h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          If your school corporation is ready to sell old tech to recycling
          purchasers, we can match you with vetted buyers, outline pricing and
          logistics, and help you document data destruction and environmental
          outcomes. Contact us to describe your inventory and timeline.
        </p>
        <Link
          href="/info/contact"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Get in touch
        </Link>
      </section>
    </div>
  );
}
