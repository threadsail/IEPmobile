import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import DesktopSidebarNav from "@/components/DesktopSidebarNav";
import NavigationDropdown from "@/components/NavigationDropdown";
import ThemeToggle from "@/components/ThemeToggle";

const linkClass =
  "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800";

const sidebarToggleClass =
  "flex h-9 w-full shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700";

export default function AppHeader({ user }: { user: User | null }) {
  const desktopBrand = (
    <>
      <Image
        src="/pencil-logo.png"
        alt=""
        width={64}
        height={64}
        className="h-14 w-14 shrink-0 object-contain"
      />
      <div className="flex min-w-0 flex-col leading-[0.95]">
        <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          IEP
        </span>
        <span className="-mt-0.5 font-[family-name:var(--font-aloja)] text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400">
          DESKTOP
        </span>
      </div>
    </>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-zinc-200/90 bg-white/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.25)]${user ? " xl:hidden" : ""}`}
      >
        <div className="mx-auto flex max-w-5xl flex-row items-center justify-between gap-4 px-4 py-2">
          {user ? (
            <div className="order-1 flex min-w-0 flex-1 shrink-0 basis-0 items-center transition-[width,height,font-size] duration-200 ease-out md:order-1">
              <Image
                src="/pencil-logo.png"
                alt=""
                width={48}
                height={48}
                className="-mr-0 h-9 w-9 shrink-0 object-contain transition-[width,height] duration-200 ease-out md:h-12 md:w-12"
              />
              <span className="text-3xl font-bold tracking-tight text-zinc-900 transition-[font-size] duration-200 ease-out dark:text-zinc-50 md:text-4xl">
                IEP
              </span>
              <span className="ml-1 font-[family-name:var(--font-aloja)] text-[10px] font-bold tracking-tight text-zinc-400 transition-[font-size] duration-200 ease-out dark:text-zinc-50 md:text-xs">
                mobile
              </span>
            </div>
          ) : (
            <Link
              href="/"
              className="order-1 flex min-w-0 flex-1 shrink-0 basis-0 items-center transition-[width,height,font-size] duration-200 ease-out md:order-1"
            >
              <Image
                src="/pencil-logo.png"
                alt=""
                width={48}
                height={48}
                className="-mr-0 h-9 w-9 shrink-0 object-contain transition-[width,height] duration-200 ease-out md:h-12 md:w-12"
              />
              <span className="text-3xl font-bold tracking-tight text-zinc-900 transition-[font-size] duration-200 ease-out dark:text-zinc-50 md:text-4xl">
                IEP
              </span>
              <span className="ml-1 font-[family-name:var(--font-aloja)] text-[10px] font-bold tracking-tight text-zinc-400 transition-[font-size] duration-200 ease-out dark:text-zinc-50 md:text-xs">
                mobile
              </span>
            </Link>
          )}

          <nav className="order-2 hidden min-w-0 flex-1 basis-0 flex-wrap items-center justify-center gap-1 md:order-2 md:flex">
            {!user && (
              <>
                <NavigationDropdown
                  label="Features"
                  items={[
                    { label: "Schedule", href: "/features/schedule" },
                    { label: "Data", href: "/features/data" },
                    { label: "Activities", href: "/features/activities" },
                    { label: "Students", href: "/features/students" },
                  ]}
                />
                <Link href="/pricing" className={linkClass}>
                  Pricing
                </Link>
                <Link href="/info/about" className={linkClass}>
                  About
                </Link>
              </>
            )}
          </nav>

          <div className="order-3 flex min-w-0 flex-1 shrink-0 basis-0 items-center justify-end gap-2 md:order-3">
            {user ? (
              <>
                <ThemeToggle />
                <Link
                  href="/dashboard/profile"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  aria-label="Profile"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/auth"
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {user ? (
        <aside
          className="hidden h-screen w-56 shrink-0 flex-col border-r border-zinc-200/90 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 xl:flex"
          aria-label="Main navigation"
        >
          <div className="border-b border-zinc-200/90 p-4 dark:border-zinc-800">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md outline-none ring-zinc-400 focus-visible:ring-2"
            >
              {desktopBrand}
            </Link>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 py-3">
            <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto">
              <DesktopSidebarNav loggedIn />
            </div>
          </div>

          <div className="mt-auto space-y-2 border-t border-zinc-200/90 p-3 dark:border-zinc-800">
            <ThemeToggle buttonClassName={sidebarToggleClass} />
            <Link
              href="/dashboard/profile"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Profile"
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile
            </Link>
            <form action={signOut} className="block w-full">
              <button
                type="submit"
                className="w-full rounded-md border border-zinc-300 bg-white py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </form>

            <div className="border-t border-zinc-200/80 pt-3 dark:border-zinc-700/50">
              <div className="flex flex-col items-center gap-1.5 text-center text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">
                <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                  <Link
                    href="/info/support"
                    className="hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
                  >
                    Support
                  </Link>
                  <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                    ·
                  </span>
                  <Link
                    href="/info/contact"
                    className="hover:text-zinc-800 hover:underline dark:hover:text-zinc-200"
                  >
                    Contact
                  </Link>
                </div>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-500">
                  © 2026 IEPmobile @ threadsail.io
                </p>
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
