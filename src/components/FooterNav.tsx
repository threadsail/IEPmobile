"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const iconClass = "mx-auto h-5 w-5 shrink-0 transition-[width,height] duration-200 ease-out md:h-6 md:w-6";

type TabColor = "blue" | "teal" | "orange" | "purple" | "pink";

const tabStyles: Record<
  TabColor,
  { active: string; inactive: string }
> = {
  blue: {
    active: "bg-gradient-to-br from-blue-400 to-blue-600 text-white hover:bg-blue-600 dark:bg-blue-600/90 dark:hover:bg-blue-600",
    inactive: "text-zinc-700 hover:bg-white/20 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-black/20 dark:hover:text-blue-500",
  },
  teal: {
    active: "bg-gradient-to-br from-teal-400 to-teal-600 text-white hover:bg-teal-600 dark:bg-teal-600/90 dark:hover:bg-teal-600",
    inactive: "text-zinc-700 hover:bg-white/20 hover:text-teal-600 dark:text-zinc-300 dark:hover:bg-black/20 dark:hover:text-teal-500",
  },
  orange: {
    active: "bg-gradient-to-br from-orange-300 to-orange-500 text-white hover:bg-orange-500 dark:bg-orange-600/90 dark:hover:bg-orange-600",
    inactive: "text-zinc-700 hover:bg-white/20 hover:text-orange-600 dark:text-zinc-300 dark:hover:bg-black/20 dark:hover:text-orange-500",
  },
  purple: {
    active: "bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:bg-purple-600 dark:bg-purple-600/90 dark:hover:bg-purple-600",
    inactive: "text-zinc-700 hover:bg-white/20 hover:text-purple-600 dark:text-zinc-300 dark:hover:bg-black/20 dark:hover:text-purple-500",
  },
  pink: {
    active: "bg-gradient-to-br from-pink-400 to-pink-600 text-white hover:bg-pink-600 dark:bg-pink-600/90 dark:hover:bg-pink-600",
    inactive: "text-zinc-700 hover:bg-white/20 hover:text-pink-600 dark:text-zinc-300 dark:hover:bg-black/20 dark:hover:text-pink-500",
  },
};

const items: { label: string; href: string; color: TabColor; icon: React.ReactNode }[] = [
  {
    label: "Home",
    href: "/dashboard",
    color: "blue",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Schedule",
    href: "/dashboard/schedule",
    color: "teal",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: "Data",
    href: "/dashboard/data",
    color: "orange",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: "Activities",
    href: "/dashboard/activities",
    color: "purple",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    label: "Students",
    href: "/dashboard/students",
    color: "pink",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function FooterNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-center gap-1 transition-[gap] duration-200 ease-out md:gap-2">
      {items.map(({ label, href, color, icon }) => {
        const active = isActive(pathname ?? "", href);
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
            <span className="truncate text-center leading-tight transition-[font-size] duration-200 ease-out">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
