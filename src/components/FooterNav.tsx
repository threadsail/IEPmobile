"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  dashboardNavItems,
  isDashboardNavActive,
  tabStyles,
} from "@/data/dashboard-nav";

export default function FooterNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-center gap-1 transition-[gap] duration-200 ease-out md:gap-2">
      {dashboardNavItems.map(({ label, href, color, icon }) => {
        const active = isDashboardNavActive(pathname ?? "", href);
        const styles = tabStyles[color];
        return (
          <Link
            key={href}
            href={href}
            className={`flex size-12 flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium transition-[color,background-color,width,height,font-size] duration-200 ease-out md:size-16 md:text-xs ${
              active ? styles.active : styles.inactive
            }`}
          >
            {icon}
            <span className="truncate text-center leading-tight transition-[font-size] duration-200 ease-out">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
