"use client";

import { usePathname } from "next/navigation";
import { getWorkspaceMainColumnGradientXl } from "@/data/workspace-main-gradient";

type Props = {
  children: React.ReactNode;
  /** Server-rendered footers (must be passed from a Server Component). */
  bottom: React.ReactNode;
};

export default function LoggedInWorkspaceArea({ children, bottom }: Props) {
  const pathname = usePathname() ?? "";
  const gradient = getWorkspaceMainColumnGradientXl(pathname || null);
  const isProfileRoute =
    pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile/");
  const workspaceDesktopCorporate = !isProfileRoute;

  const mainBase =
    "mx-auto flex w-full max-w-5xl flex-1 px-4 py-8 pb-20";
  const mainLoggedInXl = workspaceDesktopCorporate
    ? " xl:mx-0 xl:mb-3 xl:mt-0 xl:max-w-none xl:w-full xl:rounded-lg xl:border xl:border-zinc-200/90 xl:bg-white xl:px-5 xl:py-5 xl:shadow-none dark:xl:border-zinc-700 dark:xl:bg-zinc-900 xl:pb-5"
    : " xl:mx-0 xl:mb-4 xl:mt-0 xl:max-w-none xl:w-full xl:rounded-xl xl:border xl:border-zinc-200/70 xl:bg-white/90 xl:px-8 xl:py-8 xl:shadow-sm dark:xl:border-zinc-700/80 dark:xl:bg-zinc-900/55 xl:pb-8";

  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col xl:min-h-screen xl:w-full xl:min-w-0 xl:pl-5 xl:pr-7 xl:pt-3 xl:pb-2 ${gradient}`}
    >
      <main className={mainBase + mainLoggedInXl}>{children}</main>
      {bottom}
    </div>
  );
}
