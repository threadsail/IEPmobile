"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  dashboardNavItems,
  desktopNavItemClass,
  isDashboardNavActive,
} from "@/data/dashboard-nav";

const guestLinkClass =
  "block rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100/90 dark:text-zinc-400 dark:hover:bg-zinc-800/60";

export default function DesktopSidebarNav({
  loggedIn,
}: {
  loggedIn: boolean;
}) {
  const pathname = usePathname() ?? "";

  if (loggedIn) {
    return (
      <nav
        className="flex w-full flex-col items-center gap-1"
        aria-label="Dashboard"
      >
        {dashboardNavItems.map(({ label, href, color, icon }) => {
          const active = isDashboardNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={desktopNavItemClass(active, color)}
            >
              <span className="flex shrink-0 [&_svg]:mx-0">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1" aria-label="Site">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
        Features
      </p>
      <Link href="/features/schedule" className={guestLinkClass}>
        Schedule
      </Link>
      <Link href="/features/data" className={guestLinkClass}>
        Data
      </Link>
      <Link href="/features/activities" className={guestLinkClass}>
        Activities
      </Link>
      <Link href="/features/students" className={guestLinkClass}>
        Students
      </Link>
      <Link href="/pricing" className={guestLinkClass}>
        Pricing
      </Link>
      <Link href="/info/about" className={guestLinkClass}>
        About
      </Link>
    </nav>
  );
}
