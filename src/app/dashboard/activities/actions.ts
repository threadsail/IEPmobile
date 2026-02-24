"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CreateActivityState = { error: string | null };

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

  revalidatePath("/dashboard/activities");
  redirect("/dashboard/activities");
}
