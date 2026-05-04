"use client";

import { useCallback, useState } from "react";

type Props = {
  urls: string[];
  alt: string;
  className?: string;
};

/** Shows first URL; on error advances through YouTube poster fallbacks (maxres → hq → mq). */
export default function ActivityPopupImage({ urls, alt, className }: Props) {
  const [index, setIndex] = useState(0);

  const handleError = useCallback(() => {
    setIndex((i) => {
      if (i + 1 < urls.length) return i + 1;
      return urls.length;
    });
  }, [urls.length]);

  if (urls.length === 0 || index >= urls.length) return null;
  const src = urls[index];
  if (!src) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
      <img
        src={src}
        alt={alt}
        onError={handleError}
        className={className ?? "h-auto max-h-64 w-full object-contain md:max-h-80"}
      />
    </div>
  );
}
