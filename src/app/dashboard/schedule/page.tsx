import ScheduleView from "./ScheduleView";

export default function SchedulePage() {
  return (
    <div className="w-full space-y-6">
      <section className="-mt-8 rounded-b-xl bg-gradient-to-br from-teal-400/90 to-teal-600/90 px-6 py-4 text-center shadow-lg dark:from-teal-700/90 dark:to-teal-800/90">
        <h1 className="text-2xl font-semibold tracking-tight text-black">Schedule</h1>
      </section>

      <ScheduleView />
    </div>
  );
}
