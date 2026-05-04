/**
 * Tailwind fragments for dashboard pages on md+ (desktop workspace, ≥768px).
 * Profile and marketing routes intentionally do not use these.
 */

/** On lg+: remove colored hero band (no gradient / no tinted strip). */
export const dashboardHeroCorporateXl =
  "md:mt-0 md:-mt-0 md:mb-0 md:rounded-none md:border-0 md:border-b-0 md:bg-transparent md:px-0 md:py-0 md:pb-4 md:text-center md:shadow-none md:[background-image:none] dark:md:bg-transparent dark:md:border-transparent";

/** Main page title on lg+ (centered, larger). */
export const dashboardHeroTitleCorporateXl =
  "md:text-center md:text-3xl md:font-semibold md:tracking-tight md:text-zinc-900 dark:md:text-zinc-100";

/** Secondary line under the title on lg+ (e.g. user or student name). */
export const dashboardHeroSubtitleCorporateXl =
  "md:text-center md:text-base md:font-medium md:text-zinc-600 dark:md:text-zinc-400";

/** Vertical rhythm for dashboard workspace pages (not profile). */
export const dashboardStackSpacing = "space-y-6 md:space-y-4";

export const dashboardPageStack = `w-full ${dashboardStackSpacing}`;

export const dashboardSectionCard =
  "rounded-lg border border-zinc-200/80 bg-white/70 p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60 md:p-4 md:shadow-none md:bg-white dark:md:bg-zinc-950";
