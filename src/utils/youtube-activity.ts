import type { Activity } from "@/types/activity";

/** Default card/popup image for activities without a custom image or YouTube thumbnail. */
export const ACTIVITY_DEFAULT_IMAGE_URL = "/activity-paintbrush.svg";

/** True when the saved URL is a Shorts link (vertical video). */
export function isYoutubeShortUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return url.toLowerCase().includes("youtube.com/shorts/");
}

/** Extract YouTube video ID from common URL formats. Returns null if not a valid YouTube URL. */
export function getYoutubeVideoId(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const s = url.trim();
  try {
    if (s.includes("youtube.com/watch?v=") || s.includes("youtube.com/watch?")) {
      const u = new URL(s, "https://www.youtube.com");
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    }
    if (s.includes("youtu.be/")) {
      const u = new URL(s);
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
    if (s.includes("youtube.com/embed/")) {
      const match = s.match(/embed\/([a-zA-Z0-9_-]{11})/);
      return match?.[1] ?? null;
    }
    if (s.includes("youtube.com/shorts/")) {
      const match = s.match(/shorts\/([a-zA-Z0-9_-]{11})/);
      return match?.[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

/** Card thumbnail: stored image_url, else YouTube hq default, else paintbrush logo. */
export function getActivityThumbnailUrl(activity: Activity): string {
  if (activity.image_url?.trim()) return activity.image_url.trim();
  const videoId = getYoutubeVideoId(activity.youtube_url);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return ACTIVITY_DEFAULT_IMAGE_URL;
}

/** Larger images for modals: try maxres first (may 404), then hq, then mq. */
export function getYoutubePosterUrlCandidates(
  youtubeUrl: string | null | undefined
): string[] {
  const id = getYoutubeVideoId(youtubeUrl);
  if (!id) return [];
  return [
    `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
  ];
}

/** Hero image for detail popups: custom image, else YouTube poster fallbacks, else paintbrush logo. */
export function getActivityPopupImageCandidates(activity: Activity): string[] {
  if (activity.image_url?.trim()) return [activity.image_url.trim()];
  const youtube = getYoutubePosterUrlCandidates(activity.youtube_url);
  if (youtube.length > 0) return youtube;
  return [ACTIVITY_DEFAULT_IMAGE_URL];
}
