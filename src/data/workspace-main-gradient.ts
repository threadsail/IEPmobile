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
const workspaceMainColumnGradientMd: Record<WorkspaceTabColor, string> = {
  blue:
    "md:bg-gradient-to-br md:from-blue-400/90 md:to-blue-600/90 dark:md:from-blue-700/90 dark:md:to-blue-800/90",
  teal:
    "md:bg-gradient-to-br md:from-teal-400/90 md:to-teal-600/90 dark:md:from-teal-700/90 dark:md:to-teal-800/90",
  orange:
    "md:bg-gradient-to-br md:from-orange-300/90 md:to-orange-500/90 dark:md:from-orange-600/90 dark:md:to-orange-800/90",
  purple:
    "md:bg-gradient-to-br md:from-purple-400/90 md:to-purple-600/90 dark:md:from-purple-700/90 dark:md:to-purple-800/90",
  pink:
    "md:bg-gradient-to-br md:from-pink-400/90 md:to-pink-600/90 dark:md:from-pink-700/90 dark:md:to-pink-800/90",
};

/** Non-tab dashboard routes: same treatment as Home header. */
const workspaceMainColumnGradientDefaultMd =
  "md:bg-gradient-to-br md:from-blue-400/90 md:to-blue-600/90 dark:md:from-blue-700/90 dark:md:to-blue-800/90";

/** Desktop workspace main column gradient (applies at `md` breakpoint and up). */
export function getWorkspaceMainColumnGradientMd(pathname: string | null): string {
  const color = getWorkspaceTabColorForPath(pathname);
  if (!color) return workspaceMainColumnGradientDefaultMd;
  return workspaceMainColumnGradientMd[color];
}
