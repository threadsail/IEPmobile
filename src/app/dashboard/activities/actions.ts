"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getWeeklyRepeatScheduleDates,
  parseRepeatDays,
} from "@/utils/schedule-repeat";

export type CreateActivityState = { error: string | null };
export type AddActivityToScheduleState = { error: string | null; success: boolean; created: number };

export async function addActivityToSchedule(
  _prev: AddActivityToScheduleState,
  formData: FormData
): Promise<AddActivityToScheduleState> {
  const activityId = (formData.get("activity_id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const scheduleDate = (formData.get("schedule_date") as string)?.trim();
  const startTime = (formData.get("start_time") as string)?.trim();
  const endTime = (formData.get("end_time") as string)?.trim();
  const ownerUserId = (formData.get("owner_user_id") as string)?.trim() || null;
  const repeatWeekly = formData.get("repeat_weekly") === "1";
  const repeatWeeksRaw = Number(formData.get("repeat_weeks"));
  const repeatWeeks =
    Number.isFinite(repeatWeeksRaw) && repeatWeeksRaw >= 1 && repeatWeeksRaw <= 26
      ? Math.round(repeatWeeksRaw)
      : 4;
  const repeatDays = parseRepeatDays(formData);

  if (!activityId) return { error: "Activity is required.", success: false, created: 0 };
  if (!name) return { error: "Name is required.", success: false, created: 0 };
  if (!scheduleDate) return { error: "Date is required.", success: false, created: 0 };
  if (!startTime || !endTime) {
    return { error: "Start and end time are required.", success: false, created: 0 };
  }
  if (endTime <= startTime) {
    return { error: "End time must be after start time.", success: false, created: 0 };
  }
  if (repeatWeekly && repeatDays.length === 0) {
    return { error: "Select at least one day to repeat on.", success: false, created: 0 };
  }

  const dates = repeatWeekly
    ? getWeeklyRepeatScheduleDates(scheduleDate, repeatWeeks, repeatDays)
    : [scheduleDate];
  if (dates.length === 0) {
    return { error: "Invalid date.", success: false, created: 0 };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to add to a schedule.", success: false, created: 0 };
    }

    let created = 0;
    for (const date of dates) {
      const { data: id, error } = await supabase.rpc("create_schedule_entry", {
        p_name: name,
        p_activity_id: activityId,
        p_schedule_date: date,
        p_start_time: startTime,
        p_end_time: endTime,
        p_owner_user_id: ownerUserId,
      });
      if (error) {
        return { error: error.message, success: false, created };
      }
      if (id != null) created += 1;
    }

    revalidatePath("/dashboard/schedule");
    return { error: null, success: true, created };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message, success: false, created: 0 };
  }
}

export async function createActivity(
  _prev: CreateActivityState,
  formData: FormData
): Promise<CreateActivityState> {
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const activityType = (formData.get("activity_type") as string) || "create";
  const description = (formData.get("description") as string)?.trim() || null;
  const youtubeUrl = (formData.get("youtube_url") as string)?.trim() || null;
  const imageUrl = (formData.get("image_url") as string)?.trim() || null;

  if (activityType === "youtube" && !youtubeUrl) {
    return { error: "YouTube URL is required for YouTube activities." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to add an activity." };
    }

    const { data: id, error } = await supabase.rpc("create_activity", {
      p_name: name,
      p_description: description || null,
      p_activity_type: activityType,
      p_youtube_url: activityType === "youtube" ? youtubeUrl : null,
      p_image_url: imageUrl || null,
    });

    if (error) {
      return { error: error.message };
    }
    if (id == null) {
      return { error: "Failed to create activity." };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }

  redirect("/dashboard/activities");
}

export async function toggleActivityUpvote(activityId: string): Promise<{ error: string | null }> {
  if (!activityId?.trim()) return { error: "Activity ID is required." };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in to upvote." };
    const { error } = await supabase.rpc("toggle_activity_upvote", {
      p_activity_id: activityId,
    });
    if (error) return { error: error.message };
    revalidatePath("/dashboard/activities");
    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }
}
