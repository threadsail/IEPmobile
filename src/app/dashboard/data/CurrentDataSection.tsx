import { studentDisplayName, type Student } from "@/types/student";

export default function CurrentDataSection({ students }: { students: Student[] }) {
  if (students.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No students yet. Add students from the Students tab to see their data here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            <th className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Student</th>
            <th className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Note</th>
            <th className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-300">Current data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {students.map((student) => (
            <tr key={student.id} className="text-zinc-900 dark:text-zinc-100">
              <td className="py-3 pr-4 font-medium">{studentDisplayName(student)}</td>
              <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">
                {student.note ?? "—"}
              </td>
              <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                —
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
