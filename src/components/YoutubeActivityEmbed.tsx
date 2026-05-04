"use client";

import { isYoutubeShortUrl } from "@/utils/youtube-activity";

type Props = {
  videoId: string;
  title: string;
  /** Original activity URL — used to pick Shorts (9:16) vs landscape (16:9) framing. */
  youtubeUrl?: string | null;
  className?: string;
};

/** In-modal YouTube player (privacy-enhanced host). Tight max sizes so controls don’t dwarf the picture, especially Shorts. */
export default function YoutubeActivityEmbed({
  videoId,
  title,
  youtubeUrl,
  className,
}: Props) {
  const short = isYoutubeShortUrl(youtubeUrl);
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1`;

  const boxClass = short
    ? "relative mx-auto aspect-[9/16] h-[min(62dvh,580px)] w-auto max-w-[min(280px,88vw)] overflow-hidden rounded-lg bg-black shadow-inner sm:h-[min(66dvh,620px)] sm:max-w-[min(300px,85vw)]"
    : "relative mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-lg bg-black shadow-inner max-h-[min(40dvh,340px)] sm:max-h-[min(46dvh,400px)] lg:max-h-[min(50dvh,460px)]";

  return (
    <div
      className={["flex w-full justify-center", className ?? ""].filter(Boolean).join(" ")}
    >
      <div className={boxClass}>
        <iframe
          className="absolute inset-0 h-full w-full border-0"
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
