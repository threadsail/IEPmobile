import type { SupabaseClient } from "@supabase/supabase-js";

export type SuggestionStatus = "suggested" | "approved" | "in_progress" | "testing" | "completed";

export type SuggestionRow = {
  id: string;
  user_id: string;
  content: string;
  status: SuggestionStatus;
  created_at: string;
};

export type SuggestionWithMeta = SuggestionRow & {
  upvote_count: number;
  author_name: string | null;
  has_upvoted: boolean;
};

export async function getSuggestionsWithMeta(
  supabase: SupabaseClient,
  currentUserId: string
): Promise<SuggestionWithMeta[]> {
  const { data: suggestions, error: suggestionsError } = await supabase
    .from("suggestions")
    .select("id, user_id, content, status, created_at")
    .order("created_at", { ascending: false });

  if (suggestionsError || !suggestions?.length) {
    return [];
  }

  const ids = suggestions.map((s) => s.id);

  const [{ data: upvotes }, { data: myUpvotes }] = await Promise.all([
    supabase.from("suggestion_upvotes").select("suggestion_id").in("suggestion_id", ids),
    supabase
      .from("suggestion_upvotes")
      .select("suggestion_id")
      .eq("user_id", currentUserId)
      .in("suggestion_id", ids),
  ]);

  const countBySuggestion = new Map<string, number>();
  (upvotes ?? []).forEach((r: { suggestion_id: string }) => {
    countBySuggestion.set(r.suggestion_id, (countBySuggestion.get(r.suggestion_id) ?? 0) + 1);
  });
  const myUpvotedSet = new Set((myUpvotes ?? []).map((r: { suggestion_id: string }) => r.suggestion_id));

  const userIds = [...new Set(suggestions.map((s) => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, first_name, last_name")
    .in("id", userIds);

  const nameByUserId = new Map<string, string>();
  (profiles ?? []).forEach((p: { id: string; full_name?: string | null; first_name?: string | null; last_name?: string | null }) => {
    const name =
      p.full_name?.trim() ||
      [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
      "Someone";
    nameByUserId.set(p.id, name);
  });

  const statusOrder: SuggestionStatus[] = ["suggested", "approved", "in_progress", "testing", "completed"];
  return suggestions.map((s) => ({
    ...s,
    status: statusOrder.includes(s.status as SuggestionStatus) ? (s.status as SuggestionStatus) : "suggested",
    upvote_count: countBySuggestion.get(s.id) ?? 0,
    author_name: nameByUserId.get(s.user_id) ?? "Someone",
    has_upvoted: myUpvotedSet.has(s.id),
  }));
}
