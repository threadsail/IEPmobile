import type { Metadata } from "next";
import Image from "next/image";
import {
  CONTACT_EMAIL,
  COPYRIGHT_LINE,
  PRODUCTION_SITE_URL,
  SITE_NAME,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Coming soon",
  description: `${SITE_NAME} is launching soon. IEP management for teachers and teams.`,
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-6 py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute left-0 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />

      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <Image
            src="/pencil-logo.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
          <div className="flex flex-col items-start leading-none">
            <span className="text-3xl font-bold tracking-tight text-white">IEP</span>
            <span className="font-[family-name:var(--font-aloja)] text-xs font-bold tracking-wide text-blue-200/90">
              Classroom
            </span>
          </div>
        </div>

        <p className="mt-10 text-sm font-medium uppercase tracking-[0.2em] text-blue-300">
          Coming soon
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          We&apos;re getting the classroom ready
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-300">
          {SITE_NAME} helps IEP teams manage schedules, activities, and student
          progress in one place. The site isn&apos;t open yet—we&apos;ll be live
          here soon.
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-10 inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
        >
          {CONTACT_EMAIL}
        </a>

        <p className="mt-16 text-xs text-slate-500">
          <a href={PRODUCTION_SITE_URL} className="hover:text-slate-400 hover:underline">
            {COPYRIGHT_LINE}
          </a>
        </p>
      </main>
    </div>
  );
}
