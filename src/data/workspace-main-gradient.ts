/**
 * Desktop main-column background gradient by active dashboard tab.
 * Kept free of JSX so client components can import it cheaply.
 */

export type WorkspaceTabColor = "blue" | "teal" | "orange" | "purple" | "pink";

const routes: { href: string; color: WorkspaceTabColor }[] = [
  { href: "/dashboard", color: "blue" },
  { href: "/dashboard/schedule", color: "teal" },
  { href: "/dashboard/data", color: "orange" },
  { href: "/dashboard/activities", color: "purple" },
  { href: "/dashboard/students", color: "pink" },
];

function pathMatchesTab(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function getWorkspaceTabColorForPath(pathname: string | null): WorkspaceTabColor | null {
  if (!pathname) return null;
  for (const { href, color } of routes) {
    if (pathMatchesTab(pathname, href)) return color;
  }
  return null;
}

/**
 * Matches mobile dashboard page header gradients (`bg-gradient-to-br` + /90 stops).
 * See e.g. `dashboard/page.tsx`, `schedule/page.tsx`, etc.
 */
const workspaceMainColumnGradientXl: Record<WorkspaceTabColor, string> = {
  blue:
    "xl:bg-gradient-to-br xl:from-blue-400/90 xl:to-blue-600/90 dark:xl:from-blue-700/90 dark:xl:to-blue-800/90",
  teal:
    "xl:bg-gradient-to-br xl:from-teal-400/90 xl:to-teal-600/90 dark:xl:from-teal-700/90 dark:xl:to-teal-800/90",
  orange:
    "xl:bg-gradient-to-br xl:from-orange-300/90 xl:to-orange-500/90 dark:xl:from-orange-600/90 dark:xl:to-orange-800/90",
  purple:
    "xl:bg-gradient-to-br xl:from-purple-400/90 xl:to-purple-600/90 dark:xl:from-purple-700/90 dark:xl:to-purple-800/90",
  pink:
    "xl:bg-gradient-to-br xl:from-pink-400/90 xl:to-pink-600/90 dark:xl:from-pink-700/90 dark:xl:to-pink-800/90",
};

/** Non-tab dashboard routes: same treatment as Home header. */
const workspaceMainColumnGradientDefaultXl =
  "xl:bg-gradient-to-br xl:from-blue-400/90 xl:to-blue-600/90 dark:xl:from-blue-700/90 dark:xl:to-blue-800/90";

export function getWorkspaceMainColumnGradientXl(pathname: string | null): string {
  const color = getWorkspaceTabColorForPath(pathname);
  if (!color) return workspaceMainColumnGradientDefaultXl;
  return workspaceMainColumnGradientXl[color];
}
