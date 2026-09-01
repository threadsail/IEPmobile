"use client";

import { useCallback, useMemo, useState } from "react";
import { ACTIVITY_DEFAULT_IMAGE_URL } from "@/utils/youtube-activity";

type Props = {
  urls: string[];
  alt: string;
  className?: string;
};

/** Shows first URL; on error advances through fallbacks, ending on the paintbrush default. */
export default function ActivityPopupImage({ urls, alt, className }: Props) {
  const [index, setIndex] = useState(0);

  const candidates = useMemo(() => {
    const list = urls.filter(Boolean);
    if (!list.includes(ACTIVITY_DEFAULT_IMAGE_URL)) {
      list.push(ACTIVITY_DEFAULT_IMAGE_URL);
    }
    return list;
  }, [urls]);

  const handleError = useCallback(() => {
    setIndex((i) => (i + 1 < candidates.length ? i + 1 : i));
  }, [candidates.length]);

  const src = candidates[Math.min(index, candidates.length - 1)] ?? ACTIVITY_DEFAULT_IMAGE_URL;
  const isDefault = src === ACTIVITY_DEFAULT_IMAGE_URL;

  return (
    <div className={`mt-3 overflow-hidden rounded-lg ${isDefault ? "bg-zinc-200" : "bg-zinc-100 dark:bg-zinc-800"}`}>
      <img
        src={src}
        alt={alt}
        onError={handleError}
        className={
          className ??
          `w-full object-contain ${isDefault ? "max-h-48 p-4" : "h-auto max-h-64 md:max-h-80"}`
        }
      />
    </div>
  );
}
