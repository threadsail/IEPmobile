import { PUBLIC_PAGES } from "@/lib/public-pages";
import {
  CONTACT_EMAIL,
  SITE_DOMAIN,
  SITE_NAME,
  SUPPORT_EMAIL,
} from "@/lib/site-config";
import { absoluteUrl } from "@/lib/site-url";

const LLMS_SECTIONS = ["Overview", "Features", "Company", "Optional"] as const;

const SITE_SUMMARY = `${SITE_NAME} is a web app for teachers and IEP teams to manage daily schedules, assigned activities, and student progress data in one place.`;

const SITE_CONTEXT = `${SITE_NAME} helps special-education teams keep consistent routines, give aides and support staff clear visibility, and track progress aligned with IEP goals. Available at ${SITE_DOMAIN} for K–12 special education teachers, case managers, aides, and co-teachers.`;

/** Curated markdown for each public page, used in llms-full.txt. */
const PAGE_CONTENT: Record<string, string> = {
  "/": `# Home

${SITE_NAME} — IEP Schedule & Tracking

Simplify IEP management for every student. Daily schedules, assigned activities, and data tracking in one place—so you spend less time on paperwork and more time supporting learners.

## Core capabilities

- **Daily schedules** — Build and manage daily schedules by class or student. Keep routines consistent and visible so everyone knows what's next, and stay aligned with IEP service minutes.
- **Assigned activities** — Assign and track activities tied to IEP goals. See who's working on what, when it's due, and completion status—all in one place for you and your team.
- **Data tracking per student** — Track progress and outcomes for each student. Log data against goals, view trends over time, and pull what you need for progress reports and compliance.

## Built for IEP teams

1. Organize daily schedules by classroom or individual student.
2. Assign activities linked to IEP goals and monitor completion.
3. Track and report progress for each student in one place.

Get started at ${absoluteUrl("/auth")}. View plans at ${absoluteUrl("/pricing")}.`,

  "/pricing": `# Pricing

Choose the plan that works best for your team. Monthly and annual billing available for paid plans.

## Starter — Free

Perfect for getting started.

- One teacher and aide
- Base features
- Email support
- Up to 5 data points per student
- CSV upload

## Basic — $19/month or $190/year (~$16/mo)

Best for growing teams.

- Two teachers and 6 aides
- Advanced features
- Priority support
- Up to 10 data points per student
- API access

## Pro — $39/month or $390/year (~$33/mo)

For large organizations.

- Unlimited teachers and aides
- All features
- 24/7 dedicated support
- Unlimited data points per student
- Custom integrations

Sign up at ${absoluteUrl("/auth?mode=signup")} to select a plan.`,

  "/auth": `# Sign in & sign up

Create a free account or sign in to access your ${SITE_NAME} dashboard.

## Authentication options

- Email and password (sign in or sign up)
- Continue with Google
- Continue with Microsoft (Entra ID / Azure)

New accounts can choose a subscription plan after sign-up. OAuth and email confirmation return through the app's auth callback flow.

Sign up: ${absoluteUrl("/auth?mode=signup")}
Sign in: ${absoluteUrl("/auth")}`,

  "/features/schedule": `# Schedule

Build and manage daily schedules so everyone knows what's next—and stay aligned with IEP service minutes.

## Week view at a glance

Pick any week and see every day side by side. Tap a day to view the full schedule from 7 AM to 4 PM in 30-minute slots. Perfect for planning ahead and sharing with aides and co-teachers.

## Time blocks that match the school day

Each day is broken into 30-minute slots from 7:00 AM to 4:00 PM. Assign activities, pull-out sessions, or notes to specific times so aides and substitutes know exactly what to do and when.

## Align with IEP service minutes

Keep schedules consistent so you can track service minutes over time. Use the same structure across weeks to simplify compliance and progress reporting.`,

  "/features/data": `# Data

Track progress, approve aide-submitted data, and pull what you need for progress reports and compliance.

## One place for all student data

Log and view data for each student in one dashboard. See recent entries, trends, and summaries so you're ready for meetings and progress reports without digging through spreadsheets.

## Approve data from aides

When aides submit student data, it appears in your queue. Review and approve or reject with one tap so you stay in control while your team can log data throughout the day.

## Ready for progress reports and compliance

Export or view data by student and time period. Use the same structure for IEP progress reports and audits so you spend less time formatting and more time supporting learners.`,

  "/features/activities": `# Activities

Assign and track activities tied to IEP goals. See who's working on what—all in one place for you and your team.

## A library of activities at your fingertips

Add custom activities or YouTube-based ones, then browse by popularity or recency. Each activity appears in a clear grid so you can assign the right task to the right student quickly.

## Create activities or link to YouTube

Build your own activity list: add custom activities with a name and description, or add YouTube activities with a link. Sort by popularity or recent so the most-used resources are easy to find.

## Tie activities to goals and schedules

Assign activities to time slots on the schedule and track completion. When you need to report on progress, you'll know which activities were used and when—all aligned to your IEP goals.`,

  "/features/students": `# Students

Keep a clear roster of students. Add notes, then use each student across schedules, activities, and data.

## One roster for your caseload

Add students with a name and optional note (e.g. grade level or case manager). Your student list is the foundation for schedules, activity assignments, and data—so everyone is in one place.

## Quick to add, easy to reference

Add a new student in seconds from the Students area. Once they're in your list, you can assign them to schedule slots, activities, and data entries so everything stays linked to the right learner.

## Built for IEP teams

Teachers and aides see the same student list. Schedules, activities, and data are all organized by student so you can focus on each learner's goals and progress without switching tools.`,

  "/info/about": `# About ${SITE_NAME}

${SITE_NAME} helps teachers and IEP teams manage daily schedules, assigned activities, and student data in one place—so you spend less time on paperwork and more time supporting learners.

We build tools that simplify IEP workflow: consistent routines, clear visibility for aides and support staff, and progress tracking that fits how you already work.

## About the creators

${SITE_NAME} is built by Elizabeth and Jordan—combining special education experience with education technology.`,

  "/info/support": `# Support

Get help from the ${SITE_NAME} team. Send a message through the support form or email directly.

Email: ${SUPPORT_EMAIL}

Support page: ${absoluteUrl("/info/support")}`,

  "/info/contact": `# Contact

Get in touch with the ${SITE_NAME} team.

Email: ${CONTACT_EMAIL}

For product help, visit the Support page: ${absoluteUrl("/info/support")}`,
};

export function buildLlmsTxt(): string {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_SUMMARY}`,
    "",
    SITE_CONTEXT,
    "",
  ];

  for (const section of LLMS_SECTIONS) {
    const pages = PUBLIC_PAGES.filter((page) => page.llms.section === section);
    if (pages.length === 0 && section !== "Optional") continue;

    lines.push(`## ${section}`, "");

    if (section === "Overview") {
      lines.push(
        `- [Full site content](${absoluteUrl("/llms-full.txt")}): Complete markdown of all public pages for AI context`
      );
    }

    for (const page of pages) {
      lines.push(
        `- [${page.llms.title}](${absoluteUrl(page.path)}): ${page.llms.description}`
      );
    }

    if (section === "Optional") {
      lines.push(
        `- [Sitemap](${absoluteUrl("/sitemap.xml")}): Machine-readable list of public pages`
      );
    }

    lines.push("");
  }

  return lines.join("\n");
}

export function buildLlmsFullTxt(): string {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_SUMMARY}`,
    "",
    SITE_CONTEXT,
    "",
    `Website: ${absoluteUrl("/")}`,
    "",
    "---",
    "",
  ];

  for (const page of PUBLIC_PAGES) {
    const content = PAGE_CONTENT[page.path];
    if (!content) continue;

    lines.push(content, "", `Source: ${absoluteUrl(page.path)}`, "", "---", "");
  }

  return lines.join("\n");
}

export function llmsTextResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
