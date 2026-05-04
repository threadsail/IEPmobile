"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Student } from "@/types/student";
import StudentDetailModal from "./StudentDetailModal";
import StudentList from "./StudentList";

function filterStudentsByClassroom(
  students: Student[],
  classroom: string | null
): Student[] {
  if (classroom == null || classroom === "") {
    return students;
  }
  return students.filter((s) => (s.classroom ?? "").trim() === classroom);
}

const filterBtnBase =
  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950";

export default function StudentRosterSection({
  students,
  classrooms,
}: {
  students: Student[];
  classrooms: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const studentIdFromUrl = searchParams.get("student");

  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!studentIdFromUrl) return;
    const found = students.find((s) => s.id === studentIdFromUrl);
    if (found) {
      setDetailStudent(found);
    } else {
      setDetailStudent(null);
      router.replace(pathname, { scroll: false });
    }
  }, [studentIdFromUrl, students, router, pathname]);

  useEffect(() => {
    setDetailStudent((prev) => {
      if (!prev) return prev;
      const next = students.find((s) => s.id === prev.id);
      return next ?? null;
    });
  }, [students]);

  const closeDetailModal = useCallback(() => {
    setDetailStudent(null);
    if (searchParams.get("student")) {
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const selectStudent = useCallback(
    (s: Student) => {
      setDetailStudent(s);
      if (searchParams.get("student")) {
        router.replace(pathname, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  const filtered = useMemo(
    () => filterStudentsByClassroom(students, selectedClassroom),
    [students, selectedClassroom]
  );

  useEffect(() => {
    setDetailStudent((prev) => {
      if (!prev) return prev;
      const next = students.find((s) => s.id === prev.id);
      return next ?? prev;
    });
  }, [students]);

  const showClassroomFilter = classrooms.length > 0;

  return (
    <div>
      <StudentDetailModal student={detailStudent} onClose={closeDetailModal} />
      {showClassroomFilter ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Filter by classroom
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter students by classroom">
            <button
              type="button"
              aria-pressed={selectedClassroom === null}
              onClick={() => setSelectedClassroom(null)}
              className={`${filterBtnBase} ${
                selectedClassroom === null
                  ? "border-pink-500 bg-pink-500 text-white dark:border-pink-500 dark:bg-pink-600"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-700"
              }`}
            >
              All
            </button>
            {classrooms.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={selectedClassroom === name}
                onClick={() => setSelectedClassroom(name)}
                className={`${filterBtnBase} max-w-full truncate ${
                  selectedClassroom === name
                    ? "border-pink-500 bg-pink-500 text-white dark:border-pink-500 dark:bg-pink-600"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-700"
                }`}
                title={name}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <StudentList
        students={filtered}
        filterActive={selectedClassroom !== null}
        onSelectStudent={selectStudent}
      />
    </div>
  );
}
