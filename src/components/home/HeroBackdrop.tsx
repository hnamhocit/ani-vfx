import { useState } from "react";
import type { AniListMediaTitle } from "@/types/anilist";

interface HeroBackdropMedia {
  title?: AniListMediaTitle;
  bannerImage?: string | null;
  coverImage?: { extraLarge?: string | null; large?: string | null };
  trailer?: { id?: string | null; site?: string | null } | null;
}

export function HeroBackdrop({
  anime,
  isActive,
}: {
  anime: HeroBackdropMedia;
  isActive: boolean;
}) {
  const [usePoster, setUsePoster] = useState(false);
  const poster = anime.coverImage?.extraLarge || anime.coverImage?.large;
  const youtubeId = anime.trailer?.site === "youtube" ? anime.trailer.id : null;
  const thumbnail = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : null;
  const source = usePoster ? poster : anime.bannerImage || thumbnail || poster;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"}`}
    >
      <img
        src={source || undefined}
        alt={anime.title?.english || anime.title?.romaji || ""}
        referrerPolicy="no-referrer"
        decoding="async"
        fetchPriority={isActive ? "high" : "low"}
        loading={isActive ? "eager" : "lazy"}
        onError={() => {
          if (poster && source !== poster) setUsePoster(true);
        }}
        className="w-full h-full object-cover object-[center_20%] brightness-100 contrast-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/90 via-45% to-[#0b0c10]/10 md:hidden" />
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/85 via-35% to-transparent to-65%" />
      <div className="hidden md:block absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0c10] to-transparent pointer-events-none" />
    </div>
  );
}
