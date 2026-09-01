"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { NO_AUTOFILL } from "@/constants/form-autocomplete";
import type { Activity } from "@/types/activity";
import type { ScheduleRosterMember } from "@/types/schedule";
import { WEEKDAY_OPTIONS, weekdayFromYmd } from "@/utils/schedule-repeat";
import { addActivityToSchedule } from "./actions";

type Props = {
  activity: Activity;
  roster: ScheduleRosterMember[];
  currentUserId: string | null;
};

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rosterLabel(member: ScheduleRosterMember, currentUserId: string | null): string {
  if (currentUserId && member.user_id === currentUserId) return `${member.display_name} (Me)`;
  return member.display_name;
}

export default function AddActivityToScheduleForm({
  activity,
  roster,
  currentUserId,
}: Props) {
  const editableRoster = useMemo(
    () => roster.filter((m) => m.can_edit),
    [roster]
  );

  const defaultOwnerId =
    editableRoster.find((m) => m.user_id === currentUserId)?.user_id ??
    editableRoster[0]?.user_id ??
    "";

  const [startDate, setStartDate] = useState(todayYmd);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [selectedDays, setSelectedDays] = useState<number[]>(() => {
    const dow = weekdayFromYmd(todayYmd());
    return dow == null ? [] : [dow];
  });

  const [state, formAction, isPending] = useActionState(addActivityToSchedule, {
    error: null,
    success: false,
    created: 0,
  });

  useEffect(() => {
    if (!repeatWeekly) return;
    const dow = weekdayFromYmd(startDate);
    if (dow == null) return;
    setSelectedDays((prev) => (prev.length > 0 ? prev : [dow]));
  }, [startDate, repeatWeekly]);

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  }

  if (editableRoster.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
        You don&apos;t have permission to edit any schedules. Ask your teacher or admin to add
        this activity.
      </p>
    );
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-700">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add to schedule</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Place this activity on a schedule with a time and optional weekly repeat.
      </p>

      {state?.error ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      {state?.success ? (
        <div className="mt-3 space-y-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          <p>
            Added {state.created} schedule {state.created === 1 ? "entry" : "entries"}.
          </p>
          <Link
            href="/dashboard/schedule"
            className="inline-flex font-medium text-emerald-900 underline hover:no-underline dark:text-emerald-100"
          >
            View schedule
          </Link>
        </div>
      ) : (
        <form action={formAction} autoComplete={NO_AUTOFILL} className="mt-4 space-y-3">
          <input type="hidden" name="activity_id" value={activity.id} />
          <input type="hidden" name="name" value={activity.name} />
          {repeatWeekly ? <input type="hidden" name="repeat_weekly" value="1" /> : null}
          {repeatWeekly
            ? selectedDays.map((day) => (
                <input key={day} type="hidden" name="repeat_days" value={String(day)} />
              ))
            : null}

          <div>
            <label
              htmlFor={`schedule-owner-${activity.id}`}
              className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Schedule for
            </label>
            <select
              id={`schedule-owner-${activity.id}`}
              name="owner_user_id"
              required
              defaultValue={defaultOwnerId}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {editableRoster.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {rosterLabel(member, currentUserId)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`schedule-date-${activity.id}`}
              className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Start date
            </label>
            <input
              id={`schedule-date-${activity.id}`}
              name="schedule_date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`schedule-start-${activity.id}`}
                className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Start time
              </label>
              <input
                id={`schedule-start-${activity.id}`}
                name="start_time"
                type="time"
                required
                defaultValue="08:00"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label
                htmlFor={`schedule-end-${activity.id}`}
                className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                End time
              </label>
              <input
                id={`schedule-end-${activity.id}`}
                name="end_time"
                type="time"
                required
                defaultValue="09:00"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-800/40">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={repeatWeekly}
                onChange={(e) => {
                  const on = e.target.checked;
                  setRepeatWeekly(on);
                  if (on) {
                    const dow = weekdayFromYmd(startDate);
                    if (dow != null && selectedDays.length === 0) {
                      setSelectedDays([dow]);
                    }
                  }
                }}
                className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Repeat every week
              </span>
            </label>

            {repeatWeekly ? (
              <>
                <div>
                  <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">Days</p>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_OPTIONS.map(({ value, label }) => {
                      const checked = selectedDays.includes(value);
                      return (
                        <label
                          key={value}
                          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                            checked
                              ? "border-teal-600 bg-teal-600 text-white"
                              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => toggleDay(value)}
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`schedule-weeks-${activity.id}`}
                    className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    For how many weeks
                  </label>
                  <select
                    id={`schedule-weeks-${activity.id}`}
                    name="repeat_weeks"
                    value={repeatWeeks}
                    onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {[2, 4, 6, 8, 12, 16].map((n) => (
                      <option key={n} value={n}>
                        {n} weeks
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isPending || (repeatWeekly && selectedDays.length === 0)}
            className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
          >
            {isPending ? "Adding…" : "Add to schedule"}
          </button>
        </form>
      )}
    </div>
  );
}
