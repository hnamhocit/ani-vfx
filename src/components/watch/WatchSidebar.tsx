"use client";

import { Play, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useWatchStore } from "@/store/useWatchStore";

interface RawRecMedia {
  id: number;
  title?: {
    english?: string | null;
    romaji?: string | null;
  };
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
  };
  bannerImage?: string | null;
  averageScore?: number | null;
  format?: string | null;
}

interface RawRecItem {
  mediaRecommendation?: RawRecMedia | null;
}

export function WatchSidebar() {
  const animeId = useWatchStore((s) => s.animeId);
  const recommendations = useWatchStore((s) => s.recommendations) as Array<
    RawRecItem | RawRecMedia
  >;

  const items = useMemo(() => {
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      return [];
    }

    return recommendations
      .map((entry) =>
        "mediaRecommendation" in entry ? entry.mediaRecommendation : entry,
      )
      .filter((rec): rec is RawRecMedia => Boolean(rec?.id && rec.id !== animeId))
      .map((rec) => ({
        id: rec.id,
        title: rec.title?.english || rec.title?.romaji || "Unknown",
        thumbnail:
          rec.bannerImage ||
          rec.coverImage?.extraLarge ||
          rec.coverImage?.large ||
          "",
        score: rec.averageScore ? +(rec.averageScore / 10).toFixed(1) : null,
        format: rec.format === "TV_SHORT" ? "TV" : rec.format || "TV",
      }));
  }, [recommendations, animeId]);

  if (items.length === 0) return null;

  return (
    <aside className="lg:col-span-4 space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <h3 className="font-heading text-base sm:text-xl font-black text-white">
            Đề xuất cho bạn
          </h3>
        </div>
        <span className="text-xs text-zinc-400 font-medium shrink-0">
          Gợi ý tương tự
        </span>
      </div>

      <div className="space-y-3">
        {items.map((rec) => (
          <Link
            key={rec.id}
            href={`/anime/${rec.id}/watch?ep=1`}
            className="group flex gap-3 p-2.5 rounded-2xl bg-[#111320] hover:bg-[#1b1e32] border border-purple-500/15 hover:border-purple-400/50 transition-all shadow-md cursor-pointer"
          >
            <div className="relative w-28 sm:w-32 2xl:w-36 aspect-[16/10] rounded-xl overflow-hidden shrink-0 bg-zinc-900">
              <img
                src={rec.thumbnail}
                alt={rec.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="w-8 h-8 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </span>
              </div>
              {rec.score && (
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-amber-300 font-black text-[10px] flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                  {rec.score}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h4
                  className="font-heading font-bold text-sm xl:text-[15px] text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug"
                  title={rec.title}
                >
                  {rec.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                  {rec.format} • Vietsub FHD
                </p>
              </div>
              <span className="text-[11px] text-purple-400 font-bold pt-1">
                Xem ngay
              </span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
