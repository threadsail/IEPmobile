import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import NavigationDropdown from "@/components/NavigationDropdown";

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
        <Link href="/" className="order-1 flex shrink-0 items-center gap-1.5 md:order-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-sm">
              <span className="text-lg font-bold">I</span>
            </div>
            <span className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              IEP
            </span>
            <span className="font-[family-name:var(--font-aloja)] text-xs font-bold tracking-tight text-zinc-400 dark:text-zinc-50">
              mobile
            </span>
        </Link>

        <nav className="order-2 hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-1 md:order-2 md:flex">
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

        <div className="order-3 flex shrink-0 items-center gap-2 md:order-3">
          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/auth"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
