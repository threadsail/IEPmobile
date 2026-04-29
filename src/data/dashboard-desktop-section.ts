/**
 * Tailwind fragments for dashboard pages on xl+ (desktop workspace).
 * Profile and marketing routes intentionally do not use these.
 */

/** On xl: remove colored hero band (no gradient / no tinted strip). */
export const dashboardHeroCorporateXl =
  "xl:mt-0 xl:-mt-0 xl:mb-0 xl:rounded-none xl:border-0 xl:border-b-0 xl:bg-transparent xl:px-0 xl:py-0 xl:pb-4 xl:text-center xl:shadow-none xl:[background-image:none] dark:xl:bg-transparent dark:xl:border-transparent";

/** Main page title on xl (centered, larger). */
export const dashboardHeroTitleCorporateXl =
  "xl:text-center xl:text-3xl xl:font-semibold xl:tracking-tight xl:text-zinc-900 dark:xl:text-zinc-100";

/** Secondary line under the title on xl (e.g. user or student name). */
export const dashboardHeroSubtitleCorporateXl =
  "xl:text-center xl:text-base xl:font-medium xl:text-zinc-600 dark:xl:text-zinc-400";

/** Vertical rhythm for dashboard workspace pages (not profile). */
export const dashboardStackSpacing = "space-y-6 xl:space-y-4";

export const dashboardPageStack = `w-full ${dashboardStackSpacing}`;

export const dashboardSectionCard =
  "rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60 xl:p-4 xl:shadow-none xl:bg-white dark:xl:bg-zinc-950";
