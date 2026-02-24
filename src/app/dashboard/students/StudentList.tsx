import { studentDisplayName, type Student } from "@/types/student";

export default function StudentList({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No students yet. Add a student above to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {students.map((student) => (
        <li
          key={student.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200/80 bg-white/70 px-4 py-3 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/60"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{studentDisplayName(student)}</p>
            {student.note ? (
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{student.note}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
