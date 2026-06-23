"use client";

import { useState } from "react";
import { dashboardSectionCard } from "@/data/dashboard-desktop-section";
import { studentDisplayName, type Student } from "@/types/student";
import StudentIepGoalsPanel from "./StudentIepGoalsPanel";

type TabId = "profile" | "iep";

type Props = {
  student: Student;
  initialTab?: TabId;
  variant?: "page" | "modal";
};

const tabButtonClass = (active: boolean) =>
  active
    ? "border-pink-600 text-pink-700 dark:border-pink-400 dark:text-pink-300"
    : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

export default function StudentDetailTabs({
  student,
  initialTab = "profile",
  variant = "page",
}: Props) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const name = studentDisplayName(student);

  const tabBar = (
    <div
      className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700"
      role="tablist"
      aria-label="Student details"
    >
      <button
        type="button"
        role="tab"
        aria-selected={tab === "profile"}
        id="student-tab-profile"
        aria-controls="student-panel-profile"
        onClick={() => setTab("profile")}
        className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${tabButtonClass(tab === "profile")}`}
      >
        Profile
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "iep"}
        id="student-tab-iep"
        aria-controls="student-panel-iep"
        onClick={() => setTab("iep")}
        className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${tabButtonClass(tab === "iep")}`}
      >
        IEP
      </button>
    </div>
  );

  const profilePanel = (
    <div
      role="tabpanel"
      id="student-panel-profile"
      aria-labelledby="student-tab-profile"
      hidden={tab !== "profile"}
      className={tab !== "profile" ? "hidden" : undefined}
    >
      <dl className="mt-3 grid grid-cols-1 gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
        <div>
          <dt className="font-medium">Name</dt>
          <dd className="mt-0.5">{name}</dd>
        </div>
        <div>
          <dt className="font-medium">Grade</dt>
          <dd className="mt-0.5">{student.grade || "—"}</dd>
        </div>
        <div>
          <dt className="font-medium">Classroom</dt>
          <dd className="mt-0.5">{student.classroom || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium">Note</dt>
          <dd className="mt-0.5">{student.note || "—"}</dd>
        </div>
      </dl>
    </div>
  );

  const iepPanel = (
    <div
      role="tabpanel"
      id="student-panel-iep"
      aria-labelledby="student-tab-iep"
      hidden={tab !== "iep"}
      className={tab !== "iep" ? "hidden" : undefined}
    >
      <div className={variant === "page" ? "mt-3" : "mt-3 -mx-1"}>
        <StudentIepGoalsPanel student={student} embedded />
      </div>
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="space-y-0">
        {tabBar}
        <div className="pt-4">
          {profilePanel}
          {iepPanel}
        </div>
      </div>
    );
  }

  return (
    <section className={dashboardSectionCard}>
      {tabBar}
      {profilePanel}
      {iepPanel}
    </section>
  );
}
