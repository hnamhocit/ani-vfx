"use client";

import { Sparkles, Star, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useDetailStore } from "@/store/useDetailStore";

interface RecommendationNode {
  rating?: number;
  mediaRecommendation?: {
    id: number;
    title?: {
      english?: string | null;
      romaji?: string | null;
    };
    coverImage?: {
      extraLarge?: string | null;
      large?: string | null;
    };
    averageScore?: number | null;
    format?: string | null;
    seasonYear?: number | null;
  } | null;
}

export function DetailRecommendationsSection() {
  const recommendations = useDetailStore((s) => s.recommendations) as {
    nodes?: RecommendationNode[];
  } | null;
  const nodes = recommendations?.nodes || [];

  if (nodes.length === 0) return null;

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
          <div>
            <h2 className="font-heading text-lg sm:text-2xl md:text-3xl font-black text-white">
              Gợi ý tương tự
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Các bộ anime được cộng đồng bình chọn có nội dung & phong cách gần
              gũi nhất
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
        {nodes.slice(0, 12).map((node, idx) => {
          const rec = node.mediaRecommendation;
          if (!rec?.id) return null;
          const title = rec.title?.english || rec.title?.romaji || "Unknown";
          const cover =
            rec.coverImage?.extraLarge || rec.coverImage?.large || "";
          const score = rec.averageScore
            ? +(rec.averageScore / 10).toFixed(1)
            : null;
          const votes = node.rating && node.rating > 0 ? node.rating : null;
          const format = rec.format === "TV_SHORT" ? "TV" : rec.format;
          const subMeta = [format, rec.seasonYear].filter(Boolean).join(" • ");

          return (
            <Link
              key={`${rec.id}-${idx}`}
              href={`/anime/${rec.id}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-[#121420] border border-purple-500/20 hover:border-purple-400/70 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-600/25 hover:-translate-y-1.5"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                <img
                  src={cover}
                  alt={title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121420] via-black/15 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                {votes && (
                  <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-extrabold shadow-md">
                    <ThumbsUp className="w-3 h-3 fill-emerald-400/30" />
                    <span>+{votes}</span>
                  </div>
                )}

                {score && (
                  <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-black text-xs font-black shadow-lg shadow-amber-400/30">
                    <Star className="w-3 h-3 fill-black text-black" />
                    <span>{score}</span>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-1.5">
                <p
                  className="text-sm sm:text-base font-extrabold text-white group-hover:text-purple-300 line-clamp-2 transition-colors leading-snug"
                  title={title}
                >
                  {title}
                </p>
                {subMeta && (
                  <span className="text-xs font-semibold text-zinc-400">
                    {subMeta}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
