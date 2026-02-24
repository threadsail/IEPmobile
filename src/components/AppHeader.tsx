import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import NavigationDropdown from "@/components/NavigationDropdown";
import ThemeToggle from "@/components/ThemeToggle";

const linkClass =
  "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800";

export default async function AppHeader() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Supabase unreachable; show guest header
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] backdrop-blur-md dark:bg-black/50 dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex max-w-5xl flex-row items-center justify-between gap-4 px-4 py-2">
        {user ? (
          <div className="order-1 flex min-w-0 flex-1 shrink-0 basis-0 items-center transition-[width,height,font-size] duration-200 ease-out md:order-1">
            <Image src="/pencil-logo.png" alt="" width={48} height={48} className="-mr-0 h-9 w-9 shrink-0 object-contain transition-[width,height] duration-200 ease-out md:h-12 md:w-12" />
            <span className="text-3xl font-bold tracking-tight text-zinc-900 transition-[font-size] duration-200 ease-out dark:text-zinc-50 md:text-4xl">
              IEP
            </span>
            <span className="ml-1 font-[family-name:var(--font-aloja)] text-[10px] font-bold tracking-tight text-zinc-400 transition-[font-size] duration-200 ease-out dark:text-zinc-50 md:text-xs">
              mobile
            </span>
          </div>
        ) : (
        <Link href="/" className="order-1 flex min-w-0 flex-1 shrink-0 basis-0 items-center transition-[width,height,font-size] duration-200 ease-out md:order-1">
            <Image src="/pencil-logo.png" alt="" width={48} height={48} className="-mr-0 h-9 w-9 shrink-0 object-contain transition-[width,height] duration-200 ease-out md:h-12 md:w-12" />
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
  );
}
