"use client";

import { usePathname } from "next/navigation";
import { getWorkspaceMainColumnGradientMd } from "@/data/workspace-main-gradient";

type Props = {
  children: React.ReactNode;
  /** Server-rendered footers (must be passed from a Server Component). */
  bottom: React.ReactNode;
};

export default function LoggedInWorkspaceArea({ children, bottom }: Props) {
  const pathname = usePathname() ?? "";
  const gradient = getWorkspaceMainColumnGradientMd(pathname || null);
  const isProfileRoute =
    pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile/");
  const workspaceDesktopCorporate = !isProfileRoute;

  const mainBase =
    "mx-auto flex w-full max-w-5xl flex-1 px-4 py-8 pb-20";
  const mainLoggedInXl = workspaceDesktopCorporate
    ? " md:mx-0 md:mb-3 md:mt-0 md:max-w-none md:w-full md:rounded-lg md:border md:border-zinc-200/90 md:bg-white md:px-5 md:py-5 md:shadow-none dark:md:border-zinc-700 dark:md:bg-zinc-900 md:pb-5"
    : " md:mx-0 md:mb-4 md:mt-0 md:max-w-none md:w-full md:rounded-xl md:border md:border-zinc-200/70 md:bg-white/90 md:px-8 md:py-8 md:shadow-sm dark:md:border-zinc-700/80 dark:md:bg-zinc-900/55 md:pb-8";

  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col md:min-h-screen md:w-full md:min-w-0 md:pl-5 md:pr-7 md:pt-3 md:pb-2 ${gradient}`}
    >
      <main className={mainBase + mainLoggedInXl}>{children}</main>
      {bottom}
    </div>
  );
}
