import Link from "next/link";
import { studentDisplayName, type Student } from "@/types/student";

export default function CurrentDataSection({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No students yet. Add students from the Students tab to see their IEP data here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Student</th>
            <th className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Grade</th>
            <th className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Classroom</th>
            <th className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Note</th>
            <th className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">IEP goals</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {students.map((student) => {
            const goals = student.goals ?? [];
            return (
              <tr key={student.id} className="text-zinc-900 dark:text-zinc-100">
                <td className="py-3 pr-4 font-medium">
                  <Link
                    href={`/dashboard/students/${student.id}`}
                    className="text-orange-600 hover:underline dark:text-orange-400"
                  >
                    {studentDisplayName(student)}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                  {student.grade ?? "—"}
                </td>
                <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                  {student.classroom ?? "—"}
                </td>
                <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400 max-w-[12rem]">
                  <span className="line-clamp-2">{student.note ?? "—"}</span>
                </td>
                <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400 max-w-[20rem]">
                  {goals.length === 0 ? (
                    "—"
                  ) : (
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      {goals.map((goal, i) => (
                        <li key={i} className="line-clamp-2">
                          {goal}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
