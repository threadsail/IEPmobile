"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const SUGGESTIONS_PATH = "/dashboard/suggestions";

export async function createSuggestion(formData: FormData) {
  const content = formData.get("content");
  if (typeof content !== "string" || !content.trim()) {
    return { error: "Please enter a suggestion." };
  }
  const trimmed = content.trim().slice(0, 2000);
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in to post." };

    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id,
      content: trimmed,
    });
    if (error) return { error: error.message };
  } catch (e) {
    return { error: "Something went wrong. Please try again." };
  }
  revalidatePath(SUGGESTIONS_PATH);
  return { success: true };
}

export async function toggleUpvote(suggestionId: string) {
  if (!suggestionId) return { error: "Invalid suggestion." };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in to upvote." };

    const { data: existing } = await supabase
      .from("suggestion_upvotes")
      .select("suggestion_id")
      .eq("suggestion_id", suggestionId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      await supabase
        .from("suggestion_upvotes")
        .delete()
        .eq("suggestion_id", suggestionId)
        .eq("user_id", user.id);
    } else {
      const { error } = await supabase.from("suggestion_upvotes").insert({
        suggestion_id: suggestionId,
        user_id: user.id,
      });
      if (error) return { error: error.message };
    }
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
  revalidatePath(SUGGESTIONS_PATH);
  return { success: true };
}

/** Use from a form with hidden input name="suggestion_id". */
export async function toggleUpvoteForm(formData: FormData) {
  const id = formData.get("suggestion_id");
  if (typeof id !== "string" || !id) return;
  await toggleUpvote(id);
}

const VALID_STATUSES = ["suggested", "approved", "in_progress", "testing", "completed"] as const;

export async function updateSuggestionStatus(suggestionId: string, status: string) {
  if (!suggestionId || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return { error: "Invalid suggestion or status." };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "You must be signed in." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isSuperadmin = profile?.role === "Superadmin";
    const allowInDev = process.env.NODE_ENV === "development";
    if (!isSuperadmin && !allowInDev) return { error: "Only Superadmin can update suggestion status." };

    const { error } = await supabase
      .from("suggestions")
      .update({ status })
      .eq("id", suggestionId);
    if (error) return { error: error.message };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
  revalidatePath(SUGGESTIONS_PATH);
  return { success: true };
}

/** Use from a form with hidden inputs suggestion_id and status. */
export async function updateSuggestionStatusForm(formData: FormData) {
  const id = formData.get("suggestion_id");
  const status = formData.get("status");
  if (typeof id !== "string" || !id || typeof status !== "string" || !status) return;
  await updateSuggestionStatus(id, status);
}
