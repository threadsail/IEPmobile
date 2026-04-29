"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  /** Logged-in desktop: links + copyright live in the sidebar; hide duplicate footer on xl. */
  hideOnDesktop?: boolean;
};

export default function SiteFooter({ hideOnDesktop = false }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer
      className={`border-t border-zinc-200/50 bg-white/60 py-2 text-center text-xs text-zinc-500 backdrop-blur-sm dark:border-zinc-700/30 dark:bg-zinc-900/60 dark:text-zinc-400 ${
        hideOnDesktop ? "xl:hidden" : ""
      } ${
        isHome
          ? "fixed bottom-0 left-0 right-0 z-30 xl:relative xl:z-auto xl:border-zinc-200/50"
          : ""
      }`}
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5">
          <Link href="/info/support" className="hover:text-zinc-700 hover:underline dark:hover:text-zinc-300">
            Support
          </Link>
          <Link href="/info/contact" className="hover:text-zinc-700 hover:underline dark:hover:text-zinc-300">
            Contact
          </Link>
        </div>
        <p className="mt-1">© 2026 IEPmobile @ threadsail.io</p>
      </div>
    </footer>
  );
}
