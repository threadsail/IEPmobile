"use server";

import { createClient } from "@/utils/supabase/server";
import { getScheduleEntries } from "./get-schedule-entries";

export type CreateScheduleEntryState = { error: string | null };
export type UpdateScheduleEntryState = { error: string | null };

export async function createScheduleEntry(
  _prev: CreateScheduleEntryState,
  formData: FormData
): Promise<CreateScheduleEntryState> {
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const activityId = (formData.get("activity_id") as string)?.trim() || null;
  const scheduleDate = (formData.get("schedule_date") as string)?.trim();
  if (!scheduleDate) {
    return { error: "Date is required." };
  }

  const startTime = (formData.get("start_time") as string)?.trim();
  const endTime = (formData.get("end_time") as string)?.trim();
  if (!startTime || !endTime) {
    return { error: "Start and end time are required." };
  }

  const ownerUserId = (formData.get("owner_user_id") as string)?.trim() || null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to add a schedule entry." };
    }

    const { data: id, error } = await supabase.rpc("create_schedule_entry", {
      p_name: name,
      p_activity_id: activityId || null,
      p_schedule_date: scheduleDate,
      p_start_time: startTime,
      p_end_time: endTime,
      p_owner_user_id: ownerUserId,
    });

    if (error) {
      return { error: error.message };
    }
    if (id == null) {
      return { error: "Failed to create schedule entry." };
    }

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }
}

export async function updateScheduleEntry(
  _prev: UpdateScheduleEntryState,
  formData: FormData
): Promise<UpdateScheduleEntryState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) {
    return { error: "Entry ID is required." };
  }
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Name is required." };
  }
  const activityId = (formData.get("activity_id") as string)?.trim() || null;
  const scheduleDate = (formData.get("schedule_date") as string)?.trim();
  if (!scheduleDate) {
    return { error: "Date is required." };
  }
  const startTime = (formData.get("start_time") as string)?.trim();
  const endTime = (formData.get("end_time") as string)?.trim();
  if (!startTime || !endTime) {
    return { error: "Start and end time are required." };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to update a schedule entry." };
    }
    const { data: ok, error } = await supabase.rpc("update_schedule_entry", {
      p_id: id,
      p_name: name,
      p_activity_id: activityId && activityId.trim() ? activityId.trim() : null,
      p_schedule_date: scheduleDate,
      p_start_time: startTime,
      p_end_time: endTime,
    });
    if (error) {
      return { error: error.message };
    }
    if (!ok) {
      return { error: "Failed to update schedule entry." };
    }

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }
}

export async function deleteScheduleEntry(entryId: string): Promise<{ error: string | null }> {
  if (!entryId?.trim()) {
    return { error: "Entry ID is required." };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be signed in to delete a schedule entry." };
    }
    const { data: ok, error } = await supabase.rpc("delete_schedule_entry", { p_id: entryId.trim() });
    if (error) {
      return { error: error.message };
    }
    if (!ok) {
      return { error: "Failed to delete schedule entry." };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { error: message };
  }
  // Schedule entries are refetched client-side; no need to revalidate the route here.
  return { error: null };
}

export async function fetchScheduleEntries(
  dateFrom: string,
  dateTo: string,
  ownerUserId?: string | null
): Promise<{ entries: Awaited<ReturnType<typeof getScheduleEntries>> }> {
  const supabase = await createClient();
  const entries = await getScheduleEntries(supabase, dateFrom, dateTo, ownerUserId);
  return { entries };
}
