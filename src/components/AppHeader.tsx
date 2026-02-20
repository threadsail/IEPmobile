import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import NavigationDropdown from "@/components/NavigationDropdown";

const linkClass =
  "flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800";

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
    <header className="relative z-50 border-b bg-white/70 backdrop-blur dark:bg-black/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
              <span className="text-xl font-bold">I</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              IEP
            </span>
            <span className="text-1xl font-bold tracking-tight text-zinc-400 dark:text-zinc-50">
              mobile
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
        </div>

        <nav className="flex items-center justify-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard/schedule" className={linkClass}>
                Schedule
              </Link>
              <Link href="/dashboard/data" className={linkClass}>
                Data
              </Link>
              <Link href="/dashboard/activities" className={linkClass}>
                Activities
              </Link>
              <Link href="/dashboard/students" className={linkClass}>
                Students
              </Link>

            </>
          ) : (
            <>
              <Link href="/" className={linkClass}>
                Link 1
              </Link>
              <Link href="/pricing" className={linkClass}>
                Pricing
              </Link>
              <NavigationDropdown
                label="Info"
                items={[
                  { label: "About", href: "/info/about" },
                  { label: "Contact", href: "/info/contact" },
                  { label: "Support", href: "/info/support" },
                ]}
              />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
