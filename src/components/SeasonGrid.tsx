"use client";

import { Layers } from "lucide-react";
import Link from "next/link";
import type { SeasonInfo } from "@/types/anime";

interface SeasonGridProps {
  seasonList: SeasonInfo[];
  currentAnimeId: number;
  mode?: "detail" | "watch";
}

export function SeasonGrid({
  seasonList,
  currentAnimeId,
  mode = "detail",
}: SeasonGridProps) {
  if (seasonList.length <= 1) return null;

  return (
    <section className="space-y-3.5 sm:space-y-4 p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-[#111320] border border-purple-500/20 shadow-xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-1.5 sm:p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-heading text-base sm:text-lg md:text-xl font-black text-white">
              Các phần phim & Mùa liên quan ({seasonList.length})
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Chuyển đổi nhanh giữa các mùa (Sequel, Prequel & Movie) theo
              MyAnimeList
            </p>
          </div>
        </div>
        <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
          MyAnimeList Seasons
        </span>
      </div>

      {/* Responsive Grid with 100% Equal Heights & Wrap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-1">
        {seasonList.map((season) => {
          const isCurrent =
            season.isCurrent || season.mal_id === currentAnimeId;
          const isUnreleased = Boolean(season.unreleased);

          if (isUnreleased && !isCurrent) {
            return (
              <div
                key={season.mal_id}
                className="flex flex-col justify-between p-3.5 rounded-2xl border bg-zinc-900/40 border-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed h-[96px] w-full"
                title="Season này chưa ra mắt"
              >
                <div className="flex items-center justify-between gap-2 h-6 shrink-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                    {season.relationType}
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-400/80 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Chưa ra mắt
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-400 line-clamp-2 leading-snug h-10 flex items-center mt-auto">
                  {season.title}
                </p>
              </div>
            );
          }

          const targetHref = isCurrent
            ? "#"
            : mode === "watch"
              ? `/anime/${season.mal_id}/watch?ep=1`
              : `/anime/${season.mal_id}`;

          return (
            <Link
              key={season.mal_id}
              href={targetHref}
              className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all h-[96px] w-full ${
                isCurrent
                  ? "bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/50 text-white shadow-lg shadow-purple-600/30"
                  : "bg-[#181a28] hover:bg-[#222538] border-purple-500/20 text-zinc-300 hover:text-white hover:border-purple-400/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2 h-6 shrink-0">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {season.relationType}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Đang xem
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-white line-clamp-2 leading-snug h-10 flex items-center mt-auto">
                {season.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
